const express = require('express');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Auth endpoints
router.post('/create-account', authController.createAccount);
router.get('/check-username', authController.checkUsernameAvailability);
router.post('/send-password-reset', authController.sendPasswordReset);

// Payment endpoints
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/order-status', paymentController.checkOrderStatus);

module.exports = router;
