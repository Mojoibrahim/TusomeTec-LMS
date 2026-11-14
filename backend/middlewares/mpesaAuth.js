const axios = require('axios');
require('dotenv').config();

const getMpesaAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error('M-Pesa API credentials are not configured');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
            headers: {
                Authorization: `Basic ${auth}`,
            },
            timeout: 10000,
        }
    );

    const accessToken = response.data?.access_token;
    if (typeof accessToken !== 'string' || !accessToken) {
        throw new Error('M-Pesa token response did not contain an access token');
    }

    return accessToken;
};

const generateToken = async (req, res, next) => {
    try {
        req.mpesaToken = await getMpesaAccessToken();
        next();
    } catch (error) {
        console.error("Token error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate M-Pesa token' });
    }
};

module.exports = { generateToken, getMpesaAccessToken };