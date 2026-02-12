const validator = require('validator');

/**
 * Validate username format
 * - 3-20 characters
 * - Only alphanumeric, hyphens, underscores
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'Username must be between 3 and 20 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }

  return { valid: true };
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || !validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character'
    };
  }

  return { valid: true };
}

/**
 * Validate payment data
 */
function validatePaymentData(data) {
  const { orderId, paymentId, signature } = data;

  if (!orderId || !validator.isLength(orderId, { min: 1 })) {
    return { valid: false, error: 'Invalid order ID' };
  }

  if (!paymentId || !validator.isLength(paymentId, { min: 1 })) {
    return { valid: false, error: 'Invalid payment ID' };
  }

  if (!signature || !validator.isLength(signature, { min: 1 })) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

module.exports = {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePaymentData
};
