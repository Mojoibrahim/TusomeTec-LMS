const axios = require('axios');
const moment = require('moment');
const Transaction = require('../models/Transaction');
const { getMpesaAccessToken } = require('../middlewares/mpesaAuth');

const mpesaApiUrl = 'https://sandbox.safaricom.co.ke';

// 1. Initiate STK Push
exports.stkPush = async (req, res) => {
    const { phone, amount } = req.body || {};
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    const numericAmount = typeof amount === 'number'
        ? amount
        : typeof amount === 'string' && /^\d+$/.test(amount)
            ? Number(amount)
            : NaN;

    if (!Number.isSafeInteger(numericAmount) || numericAmount < 1) {
        return res.status(400).json({ error: 'Amount must be a positive whole number' });
    }
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
        return res.status(400).json({ error: 'Enter a valid Kenyan mobile number in 254XXXXXXXXX format' });
    }

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !passkey || !callbackUrl) {
        return res.status(503).json({ error: 'M-Pesa payment configuration is incomplete' });
    }
    
    try {
        // Timestamp must be YYYYMMDDHHmmss format
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
        const response = await axios.post(
            `${mpesaApiUrl}/mpesa/stkpush/v1/processrequest`,
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: numericAmount,
                PartyA: normalizedPhone,
                PartyB: shortcode,
                PhoneNumber: normalizedPhone,
                CallBackURL: callbackUrl,
                AccountReference: 'SandboxTest',
                TransactionDesc: 'Test Payment'
            },
            {
                headers: {
                    Authorization: `Bearer ${req.mpesaToken}`,
                },
                timeout: 10000,
            }
        );

        const { MerchantRequestID, CheckoutRequestID, ResponseCode } = response.data;
        if (String(ResponseCode) !== '0' || !MerchantRequestID || !CheckoutRequestID) {
            return res.status(502).json({ error: 'M-Pesa did not accept the payment request' });
        }

        try {
            await Transaction.create({
                merchantRequestID: MerchantRequestID,
                checkoutRequestID: CheckoutRequestID,
                amount: numericAmount,
                phoneNumber: normalizedPhone,
                status: 'pending'
            });
        } catch (error) {
            console.error('Error recording pending M-Pesa request:', error);
            return res.status(500).json({ error: 'Payment request was accepted but could not be recorded' });
        }

        res.status(200).json({
            message: "STK Push initiated successfully.",
            data: response.data
        });
    } catch (error) {
        console.error("STK Push error:", error.response?.data || error.message);
        res.status(500).json({ error: 'STK Push failed' });
    }
};

// 2. Handle Callback Webhook
exports.stkCallback = async (req, res) => {
    const callbackData = req.body?.Body?.stkCallback;
    const merchantRequestID = callbackData?.MerchantRequestID;
    const checkoutRequestID = callbackData?.CheckoutRequestID;

    if (typeof merchantRequestID !== 'string' || typeof checkoutRequestID !== 'string') {
        return res.status(400).send('Invalid callback payload');
    }

    try {
        const transaction = await Transaction.findOne({ merchantRequestID, checkoutRequestID });
        if (!transaction) {
            console.warn('Received M-Pesa callback for an unknown payment request');
            return res.status(404).send('Payment request not found');
        }

        if (transaction.status !== 'pending') {
            return res.status(200).send('Callback already processed');
        }

        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        if (!shortcode || !passkey) {
            return res.status(503).send('M-Pesa verification is not configured');
        }

        const accessToken = await getMpesaAccessToken();
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
        const response = await axios.post(
            `${mpesaApiUrl}/mpesa/stkpushquery/v1/query`,
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                timeout: 10000,
            }
        );

        const verification = response.data;
        if (
            !verification ||
            String(verification.ResponseCode) !== '0' ||
            verification.CheckoutRequestID !== checkoutRequestID ||
            (verification.MerchantRequestID && verification.MerchantRequestID !== merchantRequestID)
        ) {
            throw new Error('M-Pesa verification response did not match the pending payment');
        }

        const providerResultCode = verification.ResultCode;
        const validResultCode = (typeof providerResultCode === 'number' && Number.isInteger(providerResultCode)) ||
            (typeof providerResultCode === 'string' && /^-?\d+$/.test(providerResultCode));
        if (!validResultCode) {
            throw new Error('M-Pesa verification response did not include a valid result code');
        }

        const resultCode = Number(providerResultCode);
        const update = {
            status: resultCode === 0 ? 'successful' : 'failed',
            resultCode
        };
        if (typeof verification.ResultDesc === 'string') {
            update.resultDesc = verification.ResultDesc;
        }

        await Transaction.updateOne(
            { _id: transaction._id, status: 'pending' },
            { $set: update }
        );

        return res.status(200).send('Callback verified');
    } catch (error) {
        console.error('M-Pesa callback verification failed:', error.response?.data || error.message);
        return res.status(502).send('Unable to verify payment callback');
    }
};