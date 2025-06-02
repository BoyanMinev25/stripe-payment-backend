# Stripe Payment Backend for Iris AI

This is a Node.js backend server that handles Stripe payment intents with Apple Pay support for the Iris AI React Native application.

## Features

- ✅ Apple Pay support
- ✅ Card payment processing
- ✅ Customer management with ephemeral keys
- ✅ Webhook handling for payment confirmations
- ✅ CORS enabled for mobile app access

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_STRIPE_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_STRIPE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   PORT=3001
   ```
   
   **Important**: For production with Apple Pay, you MUST use live keys (starting with `sk_live_` and `pk_live_`), not test keys.

## Apple Pay Configuration Checklist

Before Apple Pay will work, ensure you have completed these steps:

1. **Apple Developer Account**:
   - ✅ Created merchant identifier: `merchant.com.consulting.iris`
   - ✅ Added Apple Pay capability to your App ID
   - ✅ Created and downloaded payment processing certificate
   - ✅ Uploaded certificate to Stripe Dashboard

2. **Stripe Dashboard**:
   - ✅ Uploaded Apple Pay certificate
   - ✅ Registered your domain (if using web)
   - ✅ Using LIVE API keys (not test keys)

3. **Mobile App**:
   - ✅ Added Apple Pay entitlement
   - ✅ Using correct merchant identifier
   - ✅ Testing on real device (not simulator)

## Running the Server

### Development
```
npm run dev
```

### Production
```
npm start
```

## API Endpoints

### Create Payment Intent
- **URL**: `/create-payment-intent`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "amount": 1000,  // Amount in smallest currency unit (e.g., cents)
    "currency": "eur", // Currency code
    "customerId": "cus_xxx" // Optional: existing customer ID
  }
  ```
- **Success Response**:
  ```json
  {
    "paymentIntentClientSecret": "pi_xxx_secret_xxx",
    "ephemeralKeySecret": "ek_xxx_secret_xxx",
    "customerId": "cus_xxx",
    "publishableKey": "pk_live_xxx"
  }
  ```

### Health Check
- **URL**: `/`
- **Method**: `GET`
- **Success Response**:
  ```json
  {
    "status": "Stripe payment server is running",
    "version": "1.1.0",
    "features": ["apple_pay", "card_payments", "customer_management"]
  }
  ```

### Apple Pay Configuration Check
- **URL**: `/apple-pay-check`
- **Method**: `GET`
- **Success Response**:
  ```json
  {
    "message": "Apple Pay configuration check",
    "registeredDomains": [...],
    "tips": [...]
  }
  ```

### Webhook Endpoint
- **URL**: `/webhook`
- **Method**: `POST`
- **Headers**: Must include `stripe-signature`
- **Purpose**: Handles payment confirmations and failures

## Setting Up Webhooks

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret and add to `.env`

## Deployment on Render.com

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Configure environment variables in Render dashboard
4. Deploy!

## Troubleshooting Apple Pay

If Apple Pay is not showing:

1. **Check API Keys**: Ensure you're using LIVE keys, not test keys
2. **Device**: Test on real iPhone with Apple Pay configured
3. **Region**: Device region must support Apple Pay
4. **Certificate**: Verify Apple Pay certificate is active in Stripe Dashboard
5. **Test Endpoint**: Visit `/apple-pay-check` to verify configuration

## Support

For issues, check:
- Stripe Dashboard logs
- Server console logs
- Apple Developer Console
- Device console logs (Xcode) 