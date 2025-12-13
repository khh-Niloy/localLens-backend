# Payment URL Configuration Guide

## Required Environment Variables (Lines 31-39 in .env)

Based on the codebase analysis, here are the correct URL configurations:

### Backend URLs (Called by SSL Commerz)
These URLs are called by SSL Commerz payment gateway after payment processing:

```env
SSL_SUCCESS_BACKEND_URL=http://localhost:5000/api/v1/payment/success
SSL_FAIL_BACKEND_URL=http://localhost:5000/api/v1/payment/fail
SSL_CANCEL_BACKEND_URL=http://localhost:5000/api/v1/payment/cancel
```

**For Production:**
```env
SSL_SUCCESS_BACKEND_URL=https://your-backend-domain.com/api/v1/payment/success
SSL_FAIL_BACKEND_URL=https://your-backend-domain.com/api/v1/payment/fail
SSL_CANCEL_BACKEND_URL=https://your-backend-domain.com/api/v1/payment/cancel
```

### Frontend URLs (Where users are redirected)
After processing payment, backend redirects users to these frontend pages:

```env
SSL_SUCCESS_FRONTEND_URL=http://localhost:3000/payment/success
SSL_FAIL_FRONTEND_URL=http://localhost:3000/payment/fail
SSL_CANCEL_FRONTEND_URL=http://localhost:3000/payment/cancel
```

**For Production:**
```env
SSL_SUCCESS_FRONTEND_URL=https://your-frontend-domain.com/payment/success
SSL_FAIL_FRONTEND_URL=https://your-frontend-domain.com/payment/fail
SSL_CANCEL_FRONTEND_URL=https://your-frontend-domain.com/payment/cancel
```

### IPN URL (Instant Payment Notification)
Server-to-server notification URL:

```env
SSL_IPN_URL=http://localhost:5000/api/v1/payment/ipn
```

**For Production:**
```env
SSL_IPN_URL=https://your-backend-domain.com/api/v1/payment/ipn
```

## Payment Flow

1. **User initiates payment** → Frontend calls `/booking/:id/payment`
2. **Backend creates payment** → Calls SSL Commerz API with callback URLs
3. **SSL Commerz processes payment** → Redirects user to backend callback URLs
4. **Backend processes callback** → Updates payment status in database
5. **Backend redirects user** → Sends user to frontend success/fail/cancel page

## URL Structure Verification

### Backend Routes (Registered in `/api/v1/payment`)
- ✅ `/api/v1/payment/success` - GET/POST (handles success callback)
- ✅ `/api/v1/payment/fail` - GET/POST (handles fail callback)
- ✅ `/api/v1/payment/cancel` - GET/POST (handles cancel callback)

### Frontend Pages (Next.js routes)
- ✅ `/payment/success` - Displays success message
- ✅ `/payment/fail` - Displays failure message
- ✅ `/payment/cancel` - Displays cancellation message

## Important Notes

1. **Backend URLs must be publicly accessible** - SSL Commerz needs to reach them
2. **Use HTTPS in production** - Required for secure payment processing
3. **Frontend URLs should match exactly** - Case-sensitive and must include protocol
4. **No trailing slashes** - URLs should not end with `/`
5. **Query parameters are added automatically** - Backend adds `transactionId`, `amount`, and `status`

## Example .env Configuration

```env
# Backend Base URL
PORT=5000
CORS_FRONTEND_URL=http://localhost:3000

# SSL Commerz Backend Callback URLs (called by payment gateway)
SSL_SUCCESS_BACKEND_URL=http://localhost:5000/api/v1/payment/success
SSL_FAIL_BACKEND_URL=http://localhost:5000/api/v1/payment/fail
SSL_CANCEL_BACKEND_URL=http://localhost:5000/api/v1/payment/cancel

# Frontend Redirect URLs (where users land after payment)
SSL_SUCCESS_FRONTEND_URL=http://localhost:3000/payment/success
SSL_FAIL_FRONTEND_URL=http://localhost:3000/payment/fail
SSL_CANCEL_FRONTEND_URL=http://localhost:3000/payment/cancel

# IPN URL (server-to-server notification)
SSL_IPN_URL=http://localhost:5000/api/v1/payment/ipn
```

## Testing

1. **Local Development:**
   - Use `http://localhost:5000` for backend
   - Use `http://localhost:3000` for frontend
   - Ensure both servers are running

2. **Production:**
   - Use your actual domain names
   - Ensure SSL certificates are valid
   - Test with SSL Commerz sandbox first

