const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    merchantRequestID: { type: String, required: true },
    checkoutRequestID: { type: String, required: true },
    resultCode: { type: Number },
    resultDesc: { type: String },
    amount: { type: Number },
    mpesaReceiptNumber: { type: String },
    phoneNumber: { type: String},
    transactionDate: { type: Date},
    status: { type: String, enum: ['pending', 'successful', 'failed'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);