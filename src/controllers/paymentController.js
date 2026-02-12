const { verifyPaymentSignature, getPaymentDetails } = require('../utils/razorpay');
const { validatePaymentData } = require('../utils/validation');

/**
 * Verify Razorpay payment
 * POST /api/verify-payment
 */
async function verifyPayment(req, res, next) {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Validate input
    const validation = validatePaymentData({ orderId, paymentId, signature });
    if (!validation.valid) {
      return res.status(400).json({
        verified: false,
        message: validation.error
      });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({
        verified: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(paymentId);

    return res.json({
      verified: true,
      amount: paymentDetails.amount / 100, // Convert from paise to main currency
      currency: paymentDetails.currency,
      paymentMethod: paymentDetails.method,
      status: paymentDetails.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check order status
 * POST /api/order-status
 */
async function checkOrderStatus(req, res, next) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Note: You would fetch from Razorpay or your database
    // This is a placeholder - implement based on your needs
    return res.json({
      success: true,
      orderId: orderId,
      message: 'Order status check successful'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyPayment,
  checkOrderStatus
};
