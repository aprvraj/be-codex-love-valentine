# Backend Deployment Guide

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your actual values:
# - Razorpay API keys
# - Database credentials
# - Email credentials
# - JWT secret
```

### 3. Run Development Server
```bash
npm run dev
```

Server will run on `http://localhost:5000` with nodemon auto-reload.

---

## Vercel Deployment

### Prerequisites
- GitHub account with your repository
- Vercel account (https://vercel.com)
- Your backend code pushed to GitHub

### Step 1: Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository

### Step 2: Configure Project Settings
1. **Framework Preset**: Choose "Other" (since it's a Node.js server)
2. **Build Command**: Leave empty or use `npm run build`
3. **Output Directory**: Leave empty
4. **Install Command**: `npm install`
5. **Start Command**: `node api/index.js`

### Step 3: Add Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`:
   ```
   RAZORPAY_KEY_ID=your_key
   RAZORPAY_KEY_SECRET=your_secret
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   FRONTEND_URL=https://yourdomain.com
   JWT_SECRET=your_secret_key
   NODE_ENV=production
   ```

### Step 4: Deploy
1. Click "Deploy" button
2. Vercel will automatically deploy when you push to the main/master branch

### Verify Deployment
```bash
# Check health endpoint (replace with your Vercel URL)
curl https://your-project.vercel.app/health
```

---

## API Endpoints

### Base URL
- **Local**: `http://localhost:5000`
- **Production (Vercel)**: `https://your-project.vercel.app`

### Available Endpoints

#### 1. Create Account
```
POST /api/create-account
Content-Type: application/json

{
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "paymentId": "pay_XXXXX",
  "orderId": "order_XXXXX",
  "signature": "signature_string"
}
```

#### 2. Check Username Availability
```
GET /api/check-username?username=johndoe123
```

#### 3. Verify Payment
```
POST /api/verify-payment
Content-Type: application/json

{
  "orderId": "order_XXXXX",
  "paymentId": "pay_XXXXX",
  "signature": "signature_string"
}
```

#### 4. Send Password Reset
```
POST /api/send-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 5. Health Check
```
GET /health
```

---

## Database Setup

### MySQL Database Schema
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS be_love_db;
USE be_love_db;

-- Users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  payment_id VARCHAR(100),
  order_id VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);

-- Payments table
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL,
  razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(20),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

### Local MySQL Setup
1. Install MySQL: https://dev.mysql.com/downloads/
2. Create database:
   ```sql
   mysql -u root -p < schema.sql
   ```

### Cloud Database Options
- **Amazon RDS**: https://aws.amazon.com/rds/
- **Google Cloud SQL**: https://cloud.google.com/sql
- **DigitalOcean Managed Database**: https://www.digitalocean.com/products/managed-databases/
- **PlanetScale**: https://planetscale.com/ (Free MySQL-compatible database)

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `RAZORPAY_KEY_ID` | Razorpay public key | `rzp_live_XXXXX` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | `XXXXX` |
| `DB_HOST` | Database hostname | `localhost` or `db.example.com` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `be_love_db` |
| `EMAIL_SERVICE` | Email provider | `gmail` or `sendgrid` |
| `EMAIL_USER` | Email account | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email password/app password | `your_app_password` |
| `EMAIL_FROM` | From email address | `noreply@yourdomain.com` |
| `FRONTEND_URL` | Frontend domain | `https://yourdomain.com` |
| `JWT_SECRET` | JWT signing secret | `random_secret_string` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `PORT` | Server port (local only) | `5000` |
| `NODE_ENV` | Environment type | `production` or `development` |

---

## Testing with cURL

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test Check Username
```bash
curl "http://localhost:5000/api/check-username?username=testuser"
```

### Test Create Account
```bash
curl -X POST http://localhost:5000/api/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "paymentId": "pay_test123",
    "orderId": "order_test123",
    "signature": "test_signature"
  }'
```

### Test Verify Payment
```bash
curl -X POST http://localhost:5000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_test123",
    "paymentId": "pay_test123",
    "signature": "test_signature"
  }'
```

---

## Troubleshooting

### Issue: 500 Internal Server Error
- Check environment variables are set correctly
- Check database connection
- Check logs in Vercel dashboard

### Issue: CORS Error
- Ensure `FRONTEND_URL` is set correctly
- Check that frontend domain matches `FRONTEND_URL` in environment

### Issue: Payment Verification Fails
- Verify `RAZORPAY_KEY_SECRET` is correct
- Ensure signature calculation matches frontend
- Check order/payment IDs are correct

### Issue: Database Connection Error
- Verify database credentials
- Check database is running
- For cloud database: verify IP whitelist/firewall rules

---

## Next Steps

1. **Implement Database Connection**: Replace simulated database in controllers with actual MySQL queries
2. **Add Email Functionality**: Implement actual email sending for verification and password reset
3. **Add JWT Authentication**: Implement user login and token-based auth
4. **Add Input Rate Limiting**: Prevent brute force attacks
5. **Add Request Validation**: More strict validation on all endpoints
6. **Setup Logging**: Implement proper logging system for debugging
7. **Add Unit Tests**: Write tests for all endpoints
