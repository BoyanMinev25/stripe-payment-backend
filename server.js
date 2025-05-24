require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
// Serve .well-known directory statically
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Routes
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Log request for debugging (avoid in production for sensitive data)
    console.log('Received payment intent request:', { amount, currency });
    
    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    
    // Send the client secret to the client
    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Stripe payment server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Stripe payment endpoint available at: https://stripe-payment-backend-h99h.onrender.com/`);
}); 