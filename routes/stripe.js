/**
 * SmartFlow Systems - MarketFlow Pro
 * Stripe Checkout & Subscription Management Routes
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Load pricing config
const pricingConfig = require('../../stripe-products-config.json').marketflow;

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout session for subscription
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier, userId, email } = req.body;

    if (!tier || !userId || !email) {
      return res.status(400).json({
        error: 'Missing required fields: tier, userId, email'
      });
    }

    // Find the pricing tier
    const pricingTier = pricingConfig.products.find(p => p.tier === tier);
    if (!pricingTier) {
      return res.status(400).json({ error: 'Invalid pricing tier' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricingTier.price_id,
          quantity: 1
        }
      ],
      customer_email: email,
      client_reference_id: userId,
      subscription_data: {
        trial_period_days: pricingTier.trial_days || 0,
        metadata: {
          userId: userId,
          tier: tier,
          app: 'marketflow'
        }
      },
      metadata: {
        userId: userId,
        tier: tier,
        app: 'marketflow'
      },
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing?canceled=true`
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * GET /api/stripe/customer-portal
 * Create a customer portal session for subscription management
 */
router.get('/customer-portal', async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Customer portal error:', error);
    res.status(500).json({
      error: 'Failed to create customer portal session',
      message: error.message
    });
  }
});

// ============================================================================
// Webhook Event Handlers
// ============================================================================

async function handleCheckoutComplete(session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const tier = session.metadata?.tier;

  console.log('Checkout completed:', { userId, tier, sessionId: session.id });

  // TODO: Update user record in database
  // - Set subscription status to 'active' or 'trialing'
  // - Store Stripe customer ID
  // - Store subscription ID
  // - Set tier limits
  // - Send welcome email

  // Example:
  // await db.users.update({
  //   where: { id: userId },
  //   data: {
  //     stripeCustomerId: session.customer,
  //     subscriptionStatus: 'active',
  //     subscriptionTier: tier,
  //     subscriptionId: session.subscription
  //   }
  // });
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  console.log('Subscription created:', { userId, tier, subscriptionId: subscription.id });

  // TODO: Update database with subscription details
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata?.userId;

  console.log('Subscription updated:', { userId, subscriptionId: subscription.id });

  // TODO: Handle subscription changes (upgrade/downgrade, quantity changes)
  // - Update tier limits
  // - Prorate charges
  // - Send notification email
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.userId;

  console.log('Subscription deleted:', { userId, subscriptionId: subscription.id });

  // TODO: Handle cancellation
  // - Set subscription status to 'canceled'
  // - Downgrade to free tier
  // - Send cancellation email
  // - Schedule data retention/deletion
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', { invoiceId: invoice.id, amount: invoice.amount_paid });

  // TODO: Handle successful payment
  // - Send receipt email
  // - Update billing records
  // - Log transaction
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', { invoiceId: invoice.id, attempt: invoice.attempt_count });

  // TODO: Handle payment failure
  // - Send dunning email
  // - Notify user to update payment method
  // - If max attempts reached, suspend subscription
}

module.exports = router;
