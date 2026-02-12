const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Signature from frontend
 * @returns {boolean} - True if signature is valid
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Get payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise} - Payment details
 */
async function getPaymentDetails(paymentId) {
  try {
    return await razorpayInstance.payments.fetch(paymentId);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

/**
 * Create order in Razorpay
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code
 * @returns {Promise} - Order details
 */
async function createOrder(amount, currency = 'INR') {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`
    };
    
    return await razorpayInstance.orders.create(options);
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

module.exports = {
  verifyPaymentSignature,
  getPaymentDetails,
  createOrder,
  razorpayInstance
};
