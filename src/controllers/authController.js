const bcrypt = require('bcryptjs');
const { validateUsername, validateEmail, validatePassword, validatePaymentData } = require('../utils/validation');
const { verifyPaymentSignature } = require('../utils/razorpay');

// Simulated database - Replace with actual database implementation
const users = new Map();

/**
 * Create Account
 * POST /api/create-account
 */
async function createAccount(req, res, next) {
  try {
    const { username, email, password, paymentId, orderId, signature } = req.body;

    // 1. Validate payment data
    const paymentValidation = validatePaymentData({ orderId, paymentId, signature });
    if (!paymentValidation.valid) {
      return res.status(400).json({
        success: false,
        message: paymentValidation.error
      });
    }

    // 2. Verify Razorpay payment signature
    const isValidPayment = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValidPayment) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // 3. Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({
        success: false,
        message: usernameValidation.error
      });
    }

    // 4. Check if username already exists
    if (users.has(username.toLowerCase())) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
        suggestions: generateUsernameSuggestions(username)
      });
    }

    // 5. Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error
      });
    }

    // 6. Check if email already exists
    const emailExists = Array.from(users.values()).some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // 7. Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error
      });
    }

    // 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Create user object
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      paymentId: paymentId,
      orderId: orderId,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 10. Save user (simulated - replace with DB save)
    users.set(username.toLowerCase(), user);

    // 11. TODO: Send verification email
    // await sendVerificationEmail(user.email, userId);

    // 12. Return success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      userId: userId,
      accountDetails: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check username availability
 * GET /api/check-username?username=johndoe123
 */
async function checkUsernameAvailability(req, res, next) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Validate username format
    const validation = validateUsername(username);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const isAvailable = !users.has(username.toLowerCase());

    if (isAvailable) {
      return res.json({
        available: true,
        username: username
      });
    } else {
      return res.json({
        available: false,
        username: username,
        suggestions: generateUsernameSuggestions(username)
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Send password reset email
 * POST /api/send-password-reset
 */
async function sendPasswordReset(req, res, next) {
  try {
    const { email } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error
      });
    }

    // Check if user exists
    const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      console.log(`Password reset requested for non-existent email: ${email}`);
    } else {
      // TODO: Generate reset token and send email
      // const resetToken = generateResetToken();
      // user.resetToken = resetToken;
      // await sendPasswordResetEmail(user.email, resetToken);
      console.log(`Password reset email sent to: ${email}`);
    }

    return res.json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate username suggestions
 * @param {string} username - Original username
 * @returns {array} - Array of suggestions
 */
function generateUsernameSuggestions(username) {
  const suggestions = [];
  
  // Suggestion 1: Add number
  suggestions.push(`${username}${Math.floor(Math.random() * 1000)}`);
  
  // Suggestion 2: Replace vowels
  suggestions.push(username.replace(/[aeiou]/gi, function(match) {
    const replacements = { a: '4', e: '3', i: '1', o: '0', u: '9' };
    return replacements[match.toLowerCase()] || match;
  }));
  
  // Suggestion 3: Add underscore
  suggestions.push(`${username}_${Math.floor(Math.random() * 100)}`);

  return suggestions.filter(s => !users.has(s.toLowerCase()));
}

module.exports = {
  createAccount,
  checkUsernameAvailability,
  sendPasswordReset
};
