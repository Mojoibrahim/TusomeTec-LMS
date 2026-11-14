const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
let pendingTransaction;
let providerResponse;
let queryCalls;
let savedUpdate;
const transactionModel = {
    findOne: async () => pendingTransaction,
    updateOne: async (filter, update) => {
        savedUpdate = { filter, update };
        return { modifiedCount: 1 };
    }
};
const axios = {
    post: async (url, body) => {
        queryCalls.push({ url, body });
        return { data: providerResponse };
    }
};

Module._load = function(request, parent, isMain) {
    if (request === 'axios') return axios;
    if (request === 'moment') return () => ({ format: () => '20261114120000' });
    if (request === '../models/Transaction') return transactionModel;
    if (request === '../middlewares/mpesaAuth') {
        return { getMpesaAccessToken: async () => 'test-access-token' };
    }
    return originalLoad.call(this, request, parent, isMain);
};

const { stkCallback, stkPush } = require('../controllers/mpesaController');
Module._load = originalLoad;

process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_PASSKEY = 'test-passkey';

function createResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('callback metadata cannot override Daraja-verified payment status', async () => {
    pendingTransaction = { _id: 'transaction-1', status: 'pending' };
    providerResponse = {
        ResponseCode: '0',
        MerchantRequestID: 'merchant-1',
        CheckoutRequestID: 'checkout-1',
        ResultCode: '1032',
        ResultDesc: 'Request cancelled by user'
    };
    queryCalls = [];
    savedUpdate = null;
    const response = createResponse();

    await stkCallback({
        body: {
            Body: {
                stkCallback: {
                    MerchantRequestID: 'merchant-1',
                    CheckoutRequestID: 'checkout-1',
                    ResultCode: 0,
                    CallbackMetadata: {
                        Item: [
                            { Name: 'Amount', Value: 999999 },
                            { Name: 'PhoneNumber', Value: 254700000000 },
                            { Name: 'MpesaReceiptNumber', Value: 'FORGED' }
                        ]
                    }
                }
            }
        }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(queryCalls.length, 1);
    assert.equal(queryCalls[0].body.CheckoutRequestID, 'checkout-1');
    assert.deepEqual(savedUpdate.update.$set, {
        status: 'failed',
        resultCode: 1032,
        resultDesc: 'Request cancelled by user'
    });
});

test('callback for an unknown payment request is rejected without querying Daraja', async () => {
    pendingTransaction = null;
    queryCalls = [];
    savedUpdate = null;
    const response = createResponse();

    await stkCallback({
        body: {
            Body: {
                stkCallback: {
                    MerchantRequestID: 'unknown-merchant',
                    CheckoutRequestID: 'unknown-checkout',
                    ResultCode: 0
                }
            }
        }
    }, response);

    assert.equal(response.statusCode, 404);
    assert.equal(queryCalls.length, 0);
    assert.equal(savedUpdate, null);
});

test('STK push rejects invalid amounts and phone numbers before calling M-Pesa', async () => {
    queryCalls = [];
    const invalidRequests = [
        { phone: '254708374149', amount: '1.5' },
        { phone: 'not-a-phone', amount: 1 }
    ];

    for (const body of invalidRequests) {
        const response = createResponse();
        await stkPush({ body, mpesaToken: 'test-access-token' }, response);
        assert.equal(response.statusCode, 400);
    }

    assert.equal(queryCalls.length, 0);
});

test('STK push route requires authentication before M-Pesa token generation', () => {
    const registeredRoutes = [];
    const protect = () => {};
    const generateToken = () => {};
    const stkPushHandler = () => {};
    const stkCallbackHandler = () => {};
    const express = {
        Router: () => ({
            post: (path, ...handlers) => registeredRoutes.push({ path, handlers })
        })
    };

    Module._load = function(request, parent, isMain) {
        if (request === 'express') return express;
        if (request === '../middlewares/mpesaAuth') return { generateToken };
        if (request === '../controllers/mpesaController') {
            return { stkPush: stkPushHandler, stkCallback: stkCallbackHandler };
        }
        if (request === '../middlewares/authMiddleware') return { protect };
        return originalLoad.call(this, request, parent, isMain);
    };

    const routePath = require.resolve('../routes/mpesaRoutes');
    delete require.cache[routePath];
    try {
        require(routePath);
    } finally {
        Module._load = originalLoad;
        delete require.cache[routePath];
    }

    const stkPushRoute = registeredRoutes.find((route) => route.path === '/stkpush');
    assert.ok(stkPushRoute);
    assert.equal(stkPushRoute.handlers[0], protect);
    assert.equal(stkPushRoute.handlers[1], generateToken);
});
