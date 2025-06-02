# Deployment Guide - Apple Pay Support

This guide walks you through deploying the updated backend with Apple Pay support to Render.com.

## Prerequisites

- [ ] Apple Developer account with Apple Pay configured
- [ ] Stripe account with live API keys
- [ ] Apple Pay certificate uploaded to Stripe Dashboard
- [ ] Backend code pushed to GitHub

## Step 1: Update Environment Variables on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your service: `stripe-payment-backend-h99h`
3. Go to "Environment" tab
4. Update/Add these environment variables:

```
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET (optional)
PORT=3001
```

⚠️ **IMPORTANT**: You MUST use `sk_live_` keys, not `sk_test_` keys for Apple Pay to work!

## Step 2: Deploy the Updated Code

### Option A: Automatic Deploy (if connected to GitHub)
1. Commit and push your changes to GitHub
2. Render will automatically deploy

### Option B: Manual Deploy
1. In Render Dashboard, click "Manual Deploy"
2. Select "Deploy latest commit"

## Step 3: Verify Deployment

1. Check deployment logs for any errors
2. Visit your health check endpoint:
   ```
   https://stripe-payment-backend-h99h.onrender.com/
   ```
   Should return:
   ```json
   {
     "status": "Stripe payment server is running",
     "version": "1.1.0",
     "features": ["apple_pay", "card_payments", "customer_management"]
   }
   ```

3. Test Apple Pay configuration:
   ```
   https://stripe-payment-backend-h99h.onrender.com/apple-pay-check
   ```

## Step 4: Update Mobile App

1. Ensure your app.json includes Apple Pay entitlements:
   ```json
   "entitlements": {
     "com.apple.developer.in-app-payments": ["merchant.com.consulting.iris"]
   }
   ```

2. Build a new version:
   ```bash
   eas build --platform ios --profile production
   ```

3. Submit to TestFlight for testing

## Step 5: Configure Webhooks (Optional but Recommended)

1. In Stripe Dashboard, go to Webhooks
2. Add endpoint:
   ```
   https://stripe-payment-backend-h99h.onrender.com/webhook
   ```
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
4. Copy webhook secret and update environment variable

## Testing Apple Pay

### Requirements:
- ✅ Real iPhone device (not simulator)
- ✅ Apple Pay configured with at least one card
- ✅ Device region supports Apple Pay
- ✅ Using TestFlight or App Store build
- ✅ Live Stripe API keys

### Expected Behavior:
When user taps "Buy" in the pricing screen:
1. Payment sheet appears
2. Apple Pay option is visible at the top
3. User can select Apple Pay or enter card details
4. Payment processes successfully

## Troubleshooting

### Apple Pay Not Showing:

1. **Check Live Keys**: Verify you're using `sk_live_` not `sk_test_`
2. **Check Logs**: 
   ```bash
   # In Render dashboard, check logs for errors
   ```
3. **Verify Certificate**: Check Stripe Dashboard > Apple Pay
4. **Test Device**: Ensure testing on real device with Apple Pay configured
5. **Region**: Device must be in Apple Pay supported region

### Payment Failing:

1. Check server logs for specific error messages
2. Verify PaymentIntent is created with correct parameters
3. Check Stripe Dashboard > Payments for failed attempts

## Monitoring

Set up monitoring in Render:
1. Health checks: `/`
2. Alerts for failures
3. Log retention for debugging

## Support Contacts

- Stripe Support: dashboard.stripe.com/support
- Apple Developer: developer.apple.com/contact
- Render Support: render.com/support 