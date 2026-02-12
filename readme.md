# Backend Integration Guide

This document helps you connect your backend API to the Razorpay payment system.

## Architecture

```
Frontend (React)              Backend (Node/Python/etc)       Razorpay
    |                               |                           |
    |------ Create Account -------> |                           |
    |                               |--- Verify Payment ------> |
    |                               | <----- Verification -------|
    |<---- Success/Error ---------- |                           |
    |                               |--- Save User ------> DB  |
    |                               |--- Send Email ------> Email
```

## Required Backend Endpoints

### 1. Create Account

**Endpoint:** `POST /api/create-account`

**Request:**
```json
{
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "HashedPassword123!", // Hash this on backend!
  "paymentId": "pay_29QQoUBi66xm2f",
  "orderId": "order_9A33XWu170gUtm",
  "signature": "506e40881ab199eef9e2615789d1234567890abc"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "userId": "user_123456",
  "accountDetails": {
    "username": "johndoe123",
    "email": "john@example.com",
    "createdAt": "2024-02-12T10:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/verify-payment`

**Request:**
```json
{
  "orderId": "order_9A33XWu170gUtm",
  "paymentId": "pay_29QQoUBi66xm2f",
  "signature": "506e40881ab199eef9e2615789d1234567890abc"
}
```

**Response (Valid):**
```json
{
  "verified": true,
  "amount": 159,
  "currency": "INR",
  "paymentMethod": "card",
  "timestamp": "2024-02-12T10:30:00Z"
}
```

**Response (Invalid):**
```json
{
  "verified": false,
  "message": "Invalid signature"
}
```

### 3. Check Username Availability

**Endpoint:** `GET /api/check-username?username=johndoe123`

**Response (Available):**
```json
{
  "available": true,
  "username": "johndoe123"
}
```

**Response (Taken):**
```json
{
  "available": false,
  "username": "johndoe123",
  "suggestions": ["johndoe1234", "johndoe_123", "john.doe123"]
}
```

### 4. Send Password Reset Email

**Endpoint:** `POST /api/send-password-reset`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

## Payment Verification Implementation

### Node.js (Express) Example

```javascript
const crypto = require('crypto');

function verifyRazorpayPayment(orderId, paymentId, signature, secretKey) {
  // Create signature
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(body)
    .digest('hex');
  
  // Compare signatures
  return expectedSignature === signature;
}

// In your route handler
app.post('/api/verify-payment', (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  const isValid = verifyRazorpayPayment(
    orderId,
    paymentId,
    signature,
    process.env.RAZORPAY_KEY_SECRET
  );
  
  if (!isValid) {
    return res.status(400).json({ verified: false });
  }
  
  return res.json({ verified: true });
});
```

### Python (Flask) Example

```python
import hmac
import hashlib

def verify_razorpay_payment(order_id, payment_id, signature, secret_key):
    body = f"{order_id}|{payment_id}"
    expected_signature = hmac.new(
        secret_key.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return expected_signature == signature

# In your route
@app.route('/api/verify-payment', methods=['POST'])
def verify_payment():
    data = request.json
    
    is_valid = verify_razorpay_payment(
        data['orderId'],
        data['paymentId'],
        data['signature'],
        os.environ['RAZORPAY_KEY_SECRET']
    )
    
    if not is_valid:
        return {'verified': False}, 400
    
    return {'verified': True}
```

## Account Creation Implementation

### Important Security Points

1. **Hash Passwords**: Always hash passwords on backend
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Verify Payment First**: Always verify Razorpay signature before creating account

3. **Validate Username Format**:
   - 3-20 characters
   - Only alphanumeric, hyphens, underscores
   - Unique in database

4. **Validate Email Format**:
   - Valid email format
   - Verify email matches payment
   - Unique in database

5. **Send Verification Email**:
   ```javascript
   // After account creation
   const emailToken = crypto.randomBytes(32).toString('hex');
   user.emailVerificationToken = emailToken;
   user.save();
   
   // Send email with verification link
   sendEmail({
     to: user.email,
     subject: 'Welcome! Verify Your Email',
     template: 'welcome',
     data: {
       username: user.username,
       verificationLink: `https://yoursite.com/verify/${emailToken}`
     }
   });
   ```

## Database Schema

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  payment_id VARCHAR(100),
  order_id VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Environment Variables (Backend)

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=love_page_creator

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yoursite.com

# Frontend
FRONTEND_URL=https://yourdomain.com
```

## Email Templates

### Welcome Email (After Account Creation)

```html
<h1>Welcome, {{username}}!</h1>
<p>Your account has been created successfully.</p>
<p>Your login credentials are ready to use.</p>
<p>
  <a href="https://yourdomain.com/login">Go to Login Portal</a>
</p>
<p>Your payment of ₹159 has been received and processed.</p>
<p>If you have any questions, contact us at help@valentine.love.tripsat.in</p>
```

### Payment Confirmation Email

```html
<h1>Payment Confirmed!</h1>
<p>Thank you for subscribing, {{username}}!</p>
<p>
  <strong>Payment Details:</strong><br>
  Amount: ₹{{amount}}<br>
  Date: {{timestamp}}<br>
  ID: {{payment_id}}
</p>
<p>You now have access to all premium features.</p>
```

## Error Handling

### Common Scenarios

**1. Payment Verification Fails**
```json
{
  "success": false,
  "error": "payment_verification_failed",
  "message": "Payment signature verification failed. Please contact support."
}
```

**2. Username Already Exists**
```json
{
  "success": false,
  "error": "username_exists",
  "message": "Username is already taken. Try another one."
}
```

**3. Email Already Registered**
```json
{
  "success": false,
  "error": "email_exists",
  "message": "This email is already registered."
}
```

**4. Database Error**
```json
{
  "success": false,
  "error": "server_error",
  "message": "An error occurred. Please try again later."
}
```

## Webhook Handling (Optional)

Razorpay webhooks can confirm payments server-to-server:

```javascript
app.post('/webhooks/razorpay', (req, res) => {
  const { event, payload } = req.body;
  
  if (event === 'payment.authorized') {
    const { payment } = payload;
    // Mark payment as verified
    Payment.findByIdAndUpdate(
      payment.id,
      { status: 'verified' }
    );
  }
  
  res.json({ success: true });
});
```

## Testing the Integration

1. **Test with Frontend:**
   - Use Razorpay test Key ID
   - Use test card numbers
   - Verify successful account creation

2. **Test Backend Endpoints:**
   - Use Postman or cURL
   - Verify signature validation
   - Check database records

3. **Test Error Cases:**
   - Duplicate username
   - Invalid email
   - Bad signature
   - Database errors

## Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database migrations are run
- [ ] HTTPS is enabled
- [ ] Payment verification is working
- [ ] Email notifications are sent
- [ ] Logging is configured
- [ ] Error handling is in place
- [ ] Database backups are configured
- [ ] Rate limiting is implemented
- [ ] CORS is properly configured

## Support

For Razorpay integration issues:
- Check [Razorpay Documentation](https://razorpay.com/docs/)
- Review [Payment Integration Guide](./RAZORPAY_SETUP.md)
- Contact: help@valentine.love.tripsat.in
