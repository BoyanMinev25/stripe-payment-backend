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
    const { amount, currency, customerId } = req.body;
    
    // Log request for debugging (avoid in production for sensitive data)
    console.log('Received payment intent request:', { amount, currency, customerId });
    
    let customer;
    let ephemeralKey;
    
    // Create or retrieve customer
    if (customerId) {
      // Retrieve existing customer
      try {
        customer = await stripe.customers.retrieve(customerId);
      } catch (error) {
        console.log('Customer not found, creating new one');
        customer = await stripe.customers.create({
          metadata: {
            app: 'iris-health-guide'
          }
        });
      }
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        metadata: {
          app: 'iris-health-guide'
        }
      });
    }
    
    // Create ephemeral key for the customer
    ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-12-18.acacia' } // Use the latest API version
    );
    
    // Create a PaymentIntent with Apple Pay support
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      payment_method_types: ['card'], // Temporarily disable Apple Pay until it's properly configured
      metadata: {
        app: 'iris-health-guide'
      },
      // Optional: Add statement descriptor for clearer bank statements
      statement_descriptor_suffix: 'IRIS AI'
    });
    
    // Send the client secret and other necessary data to the client
    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      ephemeralKeySecret: ephemeralKey.secret,
      customerId: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY // Optional: send if needed
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.type,
      code: error.code 
    });
  }
});

// Webhook endpoint to handle successful payments (optional but recommended)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Here you can update your database, send emails, etc.
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      // Handle failed payment
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Stripe payment server is running',
    version: '1.1.1',
    features: ['card_payments', 'customer_management'] // Apple Pay temporarily disabled
  });
});

// Test route to verify Apple Pay configuration
app.get('/apple-pay-check', async (req, res) => {
  try {
    // This endpoint helps verify your Apple Pay configuration
    const applePayDomains = await stripe.applePayDomains.list({ limit: 10 });
    
    res.json({
      message: 'Apple Pay configuration check',
      registeredDomains: applePayDomains.data,
      tips: [
        'Ensure merchant ID is configured in Apple Developer Account',
        'Verify payment processing certificate is active',
        'Check that live API keys are being used in production'
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      tip: 'Make sure you have registered your domain for Apple Pay in Stripe Dashboard'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Stripe payment endpoint available at: https://stripe-payment-backend-h99h.onrender.com/`);
  console.log('Apple Pay support: Temporarily disabled (enable in Stripe Dashboard first)');
}); 