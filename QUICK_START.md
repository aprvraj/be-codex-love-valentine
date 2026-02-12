# Be Love Backend - Quick Start Guide

## What's Included

✅ **Node.js + Express Backend**
- Vercel-ready serverless configuration
- All API endpoints from README implemented
- Payment verification with Razorpay
- User account creation with validation
- CORS enabled for frontend integration

✅ **Project Structure**
```
be-love page/
├── api/
│   └── index.js                 # Main Express app entry point
├── src/
│   ├── controllers/
│   │   ├── authController.js    # Account creation & user management
│   │   └── paymentController.js # Payment verification
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handling
│   ├── routes/
│   │   └── api.js               # API route definitions
│   └── utils/
│       ├── razorpay.js          # Razorpay helper functions
│       └── validation.js        # Input validation
├── package.json                 # Dependencies
├── vercel.json                  # Vercel configuration
├── .env.example                 # Template for environment variables
├── .gitignore                   # Git ignore file
├── DEPLOYMENT.md                # Deployment guide
└── QUICK_START.md              # This file
```

---

## Getting Started (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env` and add:
- Razorpay API keys from https://dashboard.razorpay.com
- Database credentials (or skip if not using DB yet)
- Frontend URL

### 3. Run Locally
```bash
npm run dev
```

Visit: http://localhost:5000/health

---

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| POST | `/api/create-account` | Create new user account after payment |
| GET | `/api/check-username` | Check if username is available |
| POST | `/api/verify-payment` | Verify Razorpay payment signature |
| POST | `/api/send-password-reset` | Send password reset email |

---

## Deploy to Vercel (3 Steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect GitHub to Vercel
- Go to https://vercel.com
- Click "New Project"
- Select your GitHub repo

### 3. Add Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:
```
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_URL=https://yourfrontend.com
NODE_ENV=production
```

Done! Your backend is live at: `https://your-project.vercel.app`

---

## Frontend Integration Example

```javascript
// Example: Create Account
const response = await fetch('https://your-backend.vercel.app/api/create-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe123',
    email: 'john@example.com',
    password: 'SecurePass123!',
    paymentId: razorpayResponse.razorpay_payment_id,
    orderId: razorpayResponse.razorpay_order_id,
    signature: razorpayResponse.razorpay_signature
  })
});

const data = await response.json();
if (data.success) {
  console.log('Account created!', data.userId);
}
```

---

## Important Security Notes

⚠️ **Before Going Live**:
1. Never commit `.env` file with secrets
2. Use strong `JWT_SECRET` (generate: `openssl rand -base64 32`)
3. Enable HTTPS only (automatic on Vercel)
4. Add rate limiting to prevent brute force
5. Verify all email addresses
6. Implement proper database (not simulated)
7. Add unit tests for all endpoints

---

## Next: Database Setup

Currently, the backend uses **simulated storage** for testing. To use a real database:

### Option 1: Local MySQL
1. Install MySQL: https://dev.mysql.com/downloads/
2. Create database from schema in `DEPLOYMENT.md`
3. Update `src/models/` files to use actual DB queries

### Option 2: Cloud Database (Recommended for Vercel)
- **PlanetScale** (free MySQL): https://planetscale.com
- **MongoDB Atlas** (free): https://www.mongodb.com/cloud/atlas
- **Supabase** (free PostgreSQL): https://supabase.com

---

## Troubleshooting

**Q: Getting CORS errors?**
A: Update `FRONTEND_URL` in .env to match your frontend domain

**Q: Payment verification fails?**
A: Ensure `RAZORPAY_KEY_SECRET` is correct and matches live/test keys

**Q: Getting database errors?**
A: Current version doesn't require DB. For real DB, update controllers to query database.

---

## Learn More

- [Full Deployment Guide](./DEPLOYMENT.md) - Detailed setup instructions
- [Razorpay Docs](https://razorpay.com/docs/) - Payment integration
- [Express.js Docs](https://expressjs.com/) - Backend framework
- [Vercel Docs](https://vercel.com/docs) - Deployment platform

---

## Support

For issues:
1. Check `DEPLOYMENT.md` troubleshooting section
2. Review error logs in Vercel dashboard
3. Test endpoints with cURL (examples in `DEPLOYMENT.md`)

**Happy coding! 🚀**
