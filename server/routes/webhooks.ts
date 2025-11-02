import { Router, raw } from 'express';
import Stripe from 'stripe';
import { db } from '../../db';
import { users, templatePurchases, templates, analyticsEvents } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { emailService } from '../services/email';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Stripe webhook endpoint (needs raw body)
router.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || !endpointSecret) {
    return res.status(400).send('Webhook signature missing');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle subscription update
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by stripe customer ID
  const [user] = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Map Stripe price to subscription tier
  const priceId = subscription.items.data[0]?.price.id;
  let tier = 'free';

  // TODO: Map your actual Stripe price IDs
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    tier = 'pro';
  } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    tier = 'enterprise';
  }

  // Update user subscription
  await db.update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionTier: tier,
      subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Track analytics
  await db.insert(analyticsEvents).values({
    userId: user.id,
    eventType: 'subscription_updated',
    eventData: {
      subscriptionId: subscription.id,
      tier,
      status: subscription.status,
    },
  });

  // Send upgrade email notification
  if (tier !== 'free' && subscription.status === 'active') {
    emailService.sendSubscriptionUpgraded(user.email, tier).catch(err => {
      console.error('Failed to send subscription upgrade email:', err);
    });
  }

  console.log(`Subscription updated for user ${user.id}: ${tier}`);
}

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const [user] = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Downgrade to free tier
  await db.update(users)
    .set({
      stripeSubscriptionId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Track analytics
  await db.insert(analyticsEvents).values({
    userId: user.id,
    eventType: 'subscription_canceled',
    eventData: {
      subscriptionId: subscription.id,
    },
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

// Handle checkout session completed (for one-time purchases like templates)
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, templateId } = session.metadata || {};

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // If this is a template purchase
  if (templateId) {
    const [template] = await db.select()
      .from(templates)
      .where(eq(templates.id, parseInt(templateId)))
      .limit(1);

    if (!template) {
      console.error('Template not found:', templateId);
      return;
    }

    // Create purchase record
    await db.insert(templatePurchases).values({
      userId: parseInt(userId),
      templateId: parseInt(templateId),
      amount: session.amount_total || 0,
      stripePaymentId: session.payment_intent as string || null,
    });

    // Increment downloads
    await db.update(templates)
      .set({ downloads: (template.downloads || 0) + 1 })
      .where(eq(templates.id, parseInt(templateId)));

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: parseInt(userId),
      eventType: 'template_purchased',
      eventData: {
        templateId,
        templateName: template.name,
        amount: session.amount_total,
      },
    });

    // Get user email for notification
    const [purchaseUser] = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (purchaseUser) {
      emailService.sendTemplatePurchase(
        purchaseUser.email,
        template.name,
        session.amount_total || 0
      ).catch(err => {
        console.error('Failed to send template purchase email:', err);
      });
    }

    console.log(`Template ${templateId} purchased by user ${userId}`);
  }

  // If this is a subscription checkout (customer.subscription.created will handle the update)
  if (session.mode === 'subscription' && session.customer) {
    // Update customer ID if not set
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (user && !user.stripeCustomerId) {
      await db.update(users)
        .set({
          stripeCustomerId: session.customer as string,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)));
    }
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const [user] = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Track analytics
  await db.insert(analyticsEvents).values({
    userId: user.id,
    eventType: 'payment_succeeded',
    eventData: {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
    },
  });

  console.log(`Payment succeeded for user ${user.id}: ${invoice.amount_paid} ${invoice.currency}`);
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const [user] = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Track analytics
  await db.insert(analyticsEvents).values({
    userId: user.id,
    eventType: 'payment_failed',
    eventData: {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
    },
  });

  console.log(`Payment failed for user ${user.id}`);

  // Send payment failed email notification
  emailService.sendPaymentFailed(user.email, user.subscriptionTier || 'free').catch(err => {
    console.error('Failed to send payment failed email:', err);
  });
}

export default router;
