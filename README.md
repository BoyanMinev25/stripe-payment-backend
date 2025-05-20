# Stripe Payment Backend

This is a Node.js backend server that handles Stripe payment intents for a React Native application.

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_STRIPE_SECRET_KEY
   PORT=3001
   ```
   Replace `YOUR_ACTUAL_STRIPE_SECRET_KEY` with your Stripe secret key from the Stripe Dashboard.

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
    "currency": "usd" // Currency code
  }
  ```
- **Success Response**:
  ```json
  {
    "paymentIntentClientSecret": "pi_..."
  }
  ```

### Health Check
- **URL**: `/`
- **Method**: `GET`
- **Success Response**:
  ```json
  {
    "status": "Stripe payment server is running"
  }
  ```

## Deployment

1. Choose a hosting service (Heroku, Vercel, AWS, etc.)
2. Configure environment variables on the hosting platform
3. Deploy the application following the hosting provider's instructions
4. Update the API URL in your React Native application to point to the deployed backend 