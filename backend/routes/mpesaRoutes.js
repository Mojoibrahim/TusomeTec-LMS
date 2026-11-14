const express = require('express');
const router = express.Router();
const { generateToken } = require('../middlewares/mpesaAuth');
const { stkPush, stkCallback } = require('../controllers/mpesaController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/stkpush', protect, generateToken, stkPush);
router.post('/callback', stkCallback);

module.exports = router;