import stripe
import logging
from config import Config

def create_checkout_session(price_id: str, mode: str, success_url: str, cancel_url: str, customer_email: str = None, metadata: dict = None):
    """Create a Stripe checkout session"""
    try:
        session = stripe.checkout.Session.create(
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode=mode,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            metadata=metadata or {},
            automatic_tax={'enabled': True},
        )
        return session
    except Exception as e:
        logging.error(f"Failed to create checkout session: {str(e)}")
        raise

def get_customer_subscriptions(customer_id: str):
    """Get all subscriptions for a customer"""
    try:
        subscriptions = stripe.Subscription.list(customer=customer_id)
        return subscriptions
    except Exception as e:
        logging.error(f"Failed to get subscriptions for customer {customer_id}: {str(e)}")
        return None

def cancel_subscription(subscription_id: str):
    """Cancel a subscription"""
    try:
        subscription = stripe.Subscription.delete(subscription_id)
        return subscription
    except Exception as e:
        logging.error(f"Failed to cancel subscription {subscription_id}: {str(e)}")
        raise
