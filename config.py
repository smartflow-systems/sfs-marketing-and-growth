import os

class Config:
    # Flask
    SECRET_KEY = os.environ.get("SESSION_SECRET", "fallback-secret-key")
    DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///smartflow.db")
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }

    # Stripe Keys
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

    # Stripe Price IDs (to be set in environment)
    STRIPE_PRICE_STARTER_MONTHLY = os.environ.get("STRIPE_PRICE_STARTER_MONTHLY")
    STRIPE_PRICE_FLOWKIT_MONTHLY = os.environ.get("STRIPE_PRICE_FLOWKIT_MONTHLY")
    STRIPE_PRICE_LAUNCHPACK_MONTHLY = os.environ.get("STRIPE_PRICE_LAUNCHPACK_MONTHLY")
    STRIPE_PRICE_STARTER_ONEOFF = os.environ.get("STRIPE_PRICE_STARTER_ONEOFF")
    STRIPE_PRICE_FLOWKIT_ONEOFF = os.environ.get("STRIPE_PRICE_FLOWKIT_ONEOFF")
    STRIPE_PRICE_LAUNCHPACK_ONEOFF = os.environ.get("STRIPE_PRICE_LAUNCHPACK_ONEOFF")

    # Email (optional SMTP for onboarding + invites)
    SMTP_HOST = os.environ.get("SMTP_HOST")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER = os.environ.get("SMTP_USER")
    SMTP_PASS = os.environ.get("SMTP_PASS")
    SMTP_FROM = os.environ.get("SMTP_FROM", "no-reply@smartflowsystems.com")

    # Twilio (optional)
    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")

# Feature gating by plan
FEATURES_BY_PLAN = {
    "starter": ["booking", "basic_ai_bot", "one_template"],
    "flowkit": ["booking", "ai_scheduler", "sms", "portal", "two_templates", "reports"],
    "launchpack": ["booking", "ai_scheduler", "sms", "portal", "reports",
                   "ai_concierge", "analytics", "recovery", "automations", "three_templates", "priority_support"]
}

PLAN_DETAILS = {
    "starter": {
        "name": "Smart Starter",
        "monthly_price": "£49",
        "oneoff_price": "£399",
        "features": ["1-page site", "Stripe deposits", "Calendar sync", "Basic AI FAQ bot"]
    },
    "flowkit": {
        "name": "The Flow Kit", 
        "monthly_price": "£149",
        "oneoff_price": "£999",
        "features": ["AI scheduler", "SMS reminders", "Client portal", "2 templates"]
    },
    "launchpack": {
        "name": "Salon Launch Pack",
        "monthly_price": "£299", 
        "oneoff_price": "£1,999",
        "features": ["AI Concierge + analytics", "Recovery automations", "Priority support", "3 templates"]
    }
}
