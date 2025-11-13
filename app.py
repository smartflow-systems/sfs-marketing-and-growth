import os
import json
import uuid
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import and_
from werkzeug.middleware.proxy_fix import ProxyFix
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import stripe
from apscheduler.schedulers.background import BackgroundScheduler
from flask_socketio import SocketIO
from flask_cors import CORS

from config import Config, FEATURES_BY_PLAN, PLAN_DETAILS

# Configure logging
logging.basicConfig(level=logging.DEBUG)


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.config["SFS_BUILD"] = __import__("time").strftime("%Y-%m-%d %H:%M:%S")
app.config["TEMPLATES_AUTO_RELOAD"] = True
try:
    app.jinja_env.cache = {}
except Exception:
    pass
app.secret_key = os.environ.get("SESSION_SECRET", "fallback-secret")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = Config.SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = Config.SQLALCHEMY_ENGINE_OPTIONS

# Initialize the app with the extension
db.init_app(app)

# Initialize Stripe
stripe.api_key = Config.STRIPE_SECRET_KEY

# Initialize CORS for WebSocket support
CORS(app, resources={r"/socket.io/*": {"origins": "*"}})

# Initialize SocketIO for real-time features
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=False
)

# Initialize WebSocket manager
from websocket_manager import init_websocket_manager
websocket_manager = init_websocket_manager(socketio)

# Token serializer for invitations
signer = URLSafeTimedSerializer(app.secret_key)

with app.app_context():
    # Import models to ensure tables are created
    from models import Tenant, User, Membership, Invitation, AuditLog, NotificationSettings, Booking, ReminderLog
    # SFS: moved to init_db(); was: # SFS: moved to init_db(); was: db.create_all()

# Import utilities
from onboarding import send_email_smtp, onboarding_email
from stripe_utils import create_checkout_session


# Helper functions
def get_current_user():
    """For demo purposes, create/return a default user and tenant"""
    user_id = session.get('user_id')
    if not user_id:
        # Create demo user if none exists
        from models import User, Tenant, Membership
        u = User.query.filter_by(email="demo@smartflowsystems.com").first()
        if not u:
            u = User(id=str(uuid.uuid4()),
                     email="demo@smartflowsystems.com",
                     name="Demo User")
            db.session.add(u)
            db.session.commit()

        t = Tenant.query.filter_by(owner_user_id=u.id).first()
        if not t:
            t = Tenant(id=str(uuid.uuid4()),
                       name="Demo Workspace",
                       owner_user_id=u.id,
                       plan="starter")
            db.session.add(t)
            db.session.commit()

            m = Membership(tenant_id=t.id,
                           user_id=u.id,
                           role="owner",
                           invited_at=datetime.utcnow(),
                           activated_at=datetime.utcnow())
            db.session.add(m)
            db.session.commit()

        session['user_id'] = u.id
        session['tenant_id'] = t.id
        return u, t
    else:
        from models import User, Tenant
        u = User.query.get(user_id)
        t = Tenant.query.get(session.get('tenant_id'))
        return u, t


def seat_limit_for_plan(plan: str) -> int:
    return {"starter": 2, "flowkit": 5, "launchpack": 15}.get(plan, 2)


def tenant_active_seats(tenant_id: str) -> int:
    from models import Membership
    return Membership.query.filter_by(tenant_id=tenant_id).count()


def log_action(tenant_id,
               actor_user_id,
               action,
               target_type,
               target_id,
               metadata=None):
    from models import AuditLog
    rec = AuditLog(tenant_id=tenant_id,
                   actor_user_id=actor_user_id,
                   action=action,
                   target_type=target_type,
                   target_id=target_id,
                   event_data=json.dumps(metadata or {}))
    db.session.add(rec)
    db.session.commit()


def has_feature_access(plan: str, feature: str) -> bool:
    return feature in FEATURES_BY_PLAN.get(plan, [])


def get_or_create_notif_settings(tenant_id: str):
    from models import NotificationSettings
    s = NotificationSettings.query.get(tenant_id)
    if not s:
        s = NotificationSettings(tenant_id=tenant_id)
        db.session.add(s)
        db.session.commit()
    return s


def notif_ok(tenant_id: str, channel: str) -> bool:
    s = get_or_create_notif_settings(tenant_id)
    if channel == "email":
        return bool(s.email_enabled)
    if channel == "sms":
        has_keys = bool(Config.TWILIO_ACCOUNT_SID and Config.TWILIO_AUTH_TOKEN
                        and Config.TWILIO_PHONE_NUMBER)
        return bool(s.sms_enabled and has_keys)
    return False


# Routes
@app.route("/")
def home():
    return render_template("landing.html")


@app.route("/pricing")
def pricing():
    return render_template("pricing.html", plans=PLAN_DETAILS)


@app.route("/checkout")
def checkout():
    plan = request.args.get('plan', 'starter')
    mode = request.args.get('mode', 'monthly')

    if plan not in PLAN_DETAILS:
        flash("Invalid plan selected", "error")
        return redirect(url_for('pricing'))

    # Get the appropriate price ID from config
    price_id_key = f"STRIPE_PRICE_{plan.upper()}_{mode.upper()}"
    price_id = getattr(Config, price_id_key, None)

    if not price_id:
        flash("Payment configuration not found", "error")
        return redirect(url_for('pricing'))

    try:
        user, tenant = get_current_user()

        # Determine the domain for success/cancel URLs
        domain = request.host_url.rstrip('/')

        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription' if mode == 'monthly' else 'payment',
            success_url=f'{domain}/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{domain}/pricing',
            customer_email=user.email,
            metadata={
                'user_id': user.id,
                'tenant_id': tenant.id,
                'plan': plan,
                'mode': mode
            })

        return redirect(checkout_session.url, code=303)

    except Exception as e:
        logging.error(f"Checkout error: {str(e)}")
        flash("Error creating checkout session", "error")
        return redirect(url_for('pricing'))


@app.route("/success")
def success():
    session_id = request.args.get('session_id')
    if session_id:
        try:
            checkout_session = stripe.checkout.Session.retrieve(session_id)
            plan = checkout_session.metadata.get('plan', 'starter')

            # Update tenant plan
            user, tenant = get_current_user()
            tenant.plan = plan
            if checkout_session.customer:
                tenant.stripe_customer_id = checkout_session.customer
            if checkout_session.subscription:
                tenant.stripe_subscription_id = checkout_session.subscription

            db.session.commit()

            # Log the upgrade
            log_action(tenant.id, user.id, "plan_upgrade", "tenant", tenant.id,
                       {
                           "new_plan": plan,
                           "session_id": session_id
                       })

            flash(f"Successfully upgraded to {PLAN_DETAILS[plan]['name']}!",
                  "success")

        except Exception as e:
            logging.error(f"Success page error: {str(e)}")
            flash(
                "Payment processed, but there was an error updating your account",
                "warning")

    return render_template("success.html")


@app.route("/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header,
                                               Config.STRIPE_WEBHOOK_SECRET)
    except ValueError:
        logging.error("Invalid payload")
        return "Invalid payload", 400
    except stripe.error.SignatureVerificationError:
        logging.error("Invalid signature")
        return "Invalid signature", 400

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session_data = event['data']['object']
        # Additional webhook processing can be added here
        logging.info(f"Checkout completed: {session_data['id']}")

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # Handle subscription cancellation
        from models import Tenant
        tenant = Tenant.query.filter_by(
            stripe_subscription_id=subscription['id']).first()
        if tenant:
            tenant.plan = "starter"  # Downgrade to free plan
            db.session.commit()
            logging.info(f"Subscription cancelled for tenant: {tenant.id}")

    return "Success", 200


@app.route("/feature/<name>")
def feature_access(name):
    """Demo endpoint to check feature access"""
    user, tenant = get_current_user()
    has_access = has_feature_access(tenant.plan, name)

    return jsonify({
        "feature":
        name,
        "plan":
        tenant.plan,
        "has_access":
        has_access,
        "message":
        f"Feature '{name}' is {'available' if has_access else 'not available'} on the {tenant.plan} plan"
    })


@app.route("/admin")
def admin():
    """Admin interface for user management"""
    user, tenant = get_current_user()

    # Check if user has admin rights
    from models import Membership
    membership = Membership.query.filter_by(tenant_id=tenant.id,
                                            user_id=user.id).first()
    if not membership or membership.role not in ['owner', 'admin']:
        flash("Access denied", "error")
        return redirect(url_for('home'))

    # Get all users and invitations for this tenant
    from models import User, Invitation
    memberships = db.session.query(
        Membership,
        User).join(User).filter(Membership.tenant_id == tenant.id).all()
    invitations = Invitation.query.filter_by(tenant_id=tenant.id,
                                             status='pending').all()

    return render_template("admin.html",
                           tenant=tenant,
                           memberships=memberships,
                           invitations=invitations,
                           seat_limit=seat_limit_for_plan(tenant.plan),
                           current_seats=tenant_active_seats(tenant.id))


@app.route("/admin/invite", methods=["POST"])
def invite_user():
    """Invite a new user to the tenant"""
    user, tenant = get_current_user()

    # Check permissions
    from models import Membership
    membership = Membership.query.filter_by(tenant_id=tenant.id,
                                            user_id=user.id).first()
    if not membership or membership.role not in ['owner', 'admin']:
        flash("Access denied", "error")
        return redirect(url_for('admin'))

    email = request.form.get('email')
    role = request.form.get('role', 'staff')

    if not email:
        flash("Email is required", "error")
        return redirect(url_for('admin'))

    # Check seat limit
    if tenant_active_seats(tenant.id) >= seat_limit_for_plan(tenant.plan):
        flash("Seat limit reached for your plan", "error")
        return redirect(url_for('admin'))

    # Create invitation
    from models import Invitation
    token = signer.dumps({
        'email': email,
        'tenant_id': tenant.id,
        'role': role
    })
    expires_at = datetime.utcnow() + timedelta(days=7)

    invitation = Invitation(id=str(uuid.uuid4()),
                            tenant_id=tenant.id,
                            email=email,
                            role=role,
                            token=token,
                            expires_at=expires_at,
                            inviter_user_id=user.id)

    db.session.add(invitation)
    db.session.commit()

    # Send invitation email
    try:
        invite_url = url_for('accept_invitation', token=token, _external=True)
        subject = f"Invitation to join {tenant.name} on SmartFlow Systems"
        body = f"""
        You've been invited to join {tenant.name} on SmartFlow Systems.
        
        Click here to accept: {invite_url}
        
        This invitation expires in 7 days.
        
        Best regards,
        SmartFlow Systems Team
        """

        send_email_smtp(email, subject, body)
        flash(f"Invitation sent to {email}", "success")

    except Exception as e:
        logging.error(f"Failed to send invitation email: {str(e)}")
        flash(f"Invitation created but email failed to send to {email}",
              "warning")

    log_action(tenant.id, user.id, "user_invited", "invitation", invitation.id,
               {
                   "email": email,
                   "role": role
               })

    return redirect(url_for('admin'))


@app.route("/accept/<token>")
def accept_invitation(token):
    """Accept an invitation"""
    try:
        data = signer.loads(token, max_age=7 * 24 * 3600)  # 7 days
        email = data['email']
        tenant_id = data['tenant_id']
        role = data['role']

        from models import Invitation, User, Membership, Tenant

        # Find the invitation
        invitation = Invitation.query.filter_by(token=token,
                                                status='pending').first()
        if not invitation:
            flash("Invalid or expired invitation", "error")
            return redirect(url_for('home'))

        # Create or find user
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(id=str(uuid.uuid4()),
                        email=email,
                        name=email.split('@')[0])
            db.session.add(user)

        # Create membership
        membership = Membership(tenant_id=tenant_id,
                                user_id=user.id,
                                role=role,
                                invited_at=invitation.created_at,
                                activated_at=datetime.utcnow())
        db.session.add(membership)

        # Mark invitation as accepted
        invitation.status = 'accepted'

        db.session.commit()

        # Set session
        session['user_id'] = user.id
        session['tenant_id'] = tenant_id

        tenant = Tenant.query.get(tenant_id)
        flash(f"Welcome to {tenant.name}!", "success")

        log_action(tenant_id, user.id, "invitation_accepted", "membership",
                   f"{tenant_id}:{user.id}")

        return redirect(url_for('admin'))

    except SignatureExpired:
        flash("Invitation has expired", "error")
        return redirect(url_for('home'))
    except BadSignature:
        flash("Invalid invitation link", "error")
        return redirect(url_for('home'))


@app.route("/admin/suspend/<user_id>", methods=["POST"])
def suspend_user(user_id):
    """Suspend a user"""
    user, tenant = get_current_user()

    # Check permissions
    from models import Membership, User
    membership = Membership.query.filter_by(tenant_id=tenant.id,
                                            user_id=user.id).first()
    if not membership or membership.role not in ['owner', 'admin']:
        flash("Access denied", "error")
        return redirect(url_for('admin'))

    target_user = User.query.get(user_id)
    if target_user:
        target_user.status = 'suspended'
        db.session.commit()

        flash(f"User {target_user.email} has been suspended", "success")
        log_action(tenant.id, user.id, "user_suspended", "user", user_id)

    return redirect(url_for('admin'))


@app.route("/admin/reactivate/<user_id>", methods=["POST"])
def reactivate_user(user_id):
    """Reactivate a suspended user"""
    user, tenant = get_current_user()

    # Check permissions
    from models import Membership, User
    membership = Membership.query.filter_by(tenant_id=tenant.id,
                                            user_id=user.id).first()
    if not membership or membership.role not in ['owner', 'admin']:
        flash("Access denied", "error")
        return redirect(url_for('admin'))

    target_user = User.query.get(user_id)
    if target_user:
        target_user.status = 'active'
        db.session.commit()

        flash(f"User {target_user.email} has been reactivated", "success")
        log_action(tenant.id, user.id, "user_reactivated", "user", user_id)

    return redirect(url_for('admin'))


# Booking API endpoints
@app.route("/api/tenants/<tenant_id>/bookings", methods=["POST"])
def create_booking(tenant_id):
    """Create a booking (demo)"""
    data = request.get_json() or {}
    name = data.get("customer_name", "Walk-in")
    email = data.get("customer_email")
    phone = data.get("customer_phone")
    start_at_iso = data.get(
        "start_at")  # ISO 8601, e.g. "2025-08-17T15:30:00Z"
    if not start_at_iso:
        return ("start_at (ISO) required", 400)
    try:
        start_at = datetime.fromisoformat(start_at_iso.replace(
            "Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        return ("Invalid start_at format", 400)

    from models import Booking
    b = Booking(id=str(uuid.uuid4())[:12],
                tenant_id=tenant_id,
                customer_name=name,
                customer_email=email,
                customer_phone=phone,
                start_at=start_at,
                status="confirmed")
    db.session.add(b)
    db.session.commit()
    return {"ok": True, "booking_id": b.id}


@app.route("/api/tenants/<tenant_id>/bookings", methods=["GET"])
def list_bookings(tenant_id):
    """List upcoming bookings for tenant (next 72h)"""
    from models import Booking
    now = datetime.utcnow()
    rows = (Booking.query.filter(Booking.tenant_id == tenant_id,
                                 Booking.start_at >= now,
                                 Booking.status == "confirmed").order_by(
                                     Booking.start_at.asc()).limit(50).all())
    out = []
    for b in rows:
        out.append({
            "id": b.id,
            "customer_name": b.customer_name,
            "email": b.customer_email,
            "phone": b.customer_phone,
            "start_at": b.start_at.isoformat() + "Z",
            "status": b.status
        })
    return out


@app.route("/settings/notifications", methods=["GET", "POST"])
def notification_settings():
    """Configure notification settings for the tenant"""
    user, tenant = get_current_user()

    if request.method == "POST":
        data = request.get_json() if request.is_json else request.form
        email_enabled = bool(data.get("email_enabled"))
        sms_enabled = bool(data.get("sms_enabled"))
        reminder_hours = int(data.get("reminder_hours_before", 24))

        from models import NotificationSettings
        settings = NotificationSettings.query.get(tenant.id)
        if not settings:
            settings = NotificationSettings(tenant_id=tenant.id)
            db.session.add(settings)

        settings.email_enabled = email_enabled
        settings.sms_enabled = sms_enabled
        settings.reminder_hours_before = reminder_hours
        settings.updated_at = datetime.utcnow()

        db.session.commit()

        if request.is_json:
            return {"ok": True, "message": "Settings updated"}
        else:
            flash("Notification settings updated successfully", "success")
            return redirect(url_for('notification_settings'))

    # GET request - show current settings
    settings = get_or_create_notif_settings(tenant.id)

    if request.is_json:
        return {
            "email_enabled": settings.email_enabled,
            "sms_enabled": settings.sms_enabled,
            "reminder_hours_before": settings.reminder_hours_before
        }
    else:
        # Return a simple form for testing
        return f"""
        <h2>Notification Settings for {tenant.name}</h2>
        <form method="POST">
            <label><input type="checkbox" name="email_enabled" {'checked' if settings.email_enabled else ''}> Email Reminders</label><br>
            <label><input type="checkbox" name="sms_enabled" {'checked' if settings.sms_enabled else ''}> SMS Reminders</label><br>
            <label>Hours before appointment: <input type="number" name="reminder_hours_before" value="{settings.reminder_hours_before}"></label><br>
            <button type="submit">Save Settings</button>
        </form>
        <a href="/admin">Back to Admin</a>
        """

# AI Content Generation API endpoints
@app.route("/api/ai/status", methods=["GET"])
def ai_status():
    """Check if AI services are available"""
    from ai_service import get_ai_generator
    generator = get_ai_generator()
    return {
        "available": generator.is_available(),
        "provider": os.environ.get("AI_PROVIDER", "anthropic"),
        "has_openai": generator.openai_client is not None,
        "has_anthropic": generator.anthropic_client is not None
    }

@app.route("/api/ai/generate-posts", methods=["POST"])
def generate_ai_posts():
    """Generate social media posts using AI"""
    from ai_service import get_ai_generator

    data = request.get_json() or {}
    topic = data.get("topic", "").strip()
    niche = data.get("niche", "Tech & SaaS")
    platform = data.get("platform", "Instagram")
    tone = data.get("tone", "Professional")
    num_variations = int(data.get("num_variations", 3))

    # Validation
    if not topic:
        return {"error": "Topic is required"}, 400

    if platform not in ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok']:
        return {"error": "Invalid platform"}, 400

    if tone not in ['Professional', 'Casual', 'Funny', 'Inspirational', 'Educational']:
        return {"error": "Invalid tone"}, 400

    try:
        generator = get_ai_generator()
        posts = generator.generate_social_posts(
            topic=topic,
            niche=niche,
            platform=platform,
            tone=tone,
            num_variations=min(num_variations, 5)  # Max 5 variations
        )

        # Convert to JSON-serializable format
        posts_data = [
            {
                "caption": post.caption,
                "hashtags": post.hashtags,
                "platform": post.platform,
                "variation_number": post.variation_number
            }
            for post in posts
        ]

        return {
            "ok": True,
            "posts": posts_data,
            "is_ai_generated": generator.is_available()
        }

    except Exception as e:
        logger.error(f"AI post generation error: {e}", exc_info=True)
        return {"error": f"Generation failed: {str(e)}"}, 500

@app.route("/api/ai/generate-email", methods=["POST"])
def generate_ai_email():
    """Generate email campaign content using AI"""
    from ai_service import get_ai_generator

    data = request.get_json() or {}
    subject = data.get("subject", "").strip()
    audience = data.get("audience", "customers")
    goal = data.get("goal", "engagement")
    tone = data.get("tone", "Professional")

    if not subject:
        return {"error": "Subject is required"}, 400

    try:
        generator = get_ai_generator()
        email_content = generator.generate_email_content(
            subject=subject,
            audience=audience,
            goal=goal,
            tone=tone
        )

        return {
            "ok": True,
            "email": email_content,
            "is_ai_generated": generator.is_available()
        }

    except Exception as e:
        logger.error(f"AI email generation error: {e}", exc_info=True)
        return {"error": f"Generation failed: {str(e)}"}, 500

# Social Media Scheduling API endpoints
@app.route("/api/social/post", methods=["POST"])
def post_to_social():
    """Post immediately to social media platform"""
    from social_media_scheduler import get_social_scheduler

    data = request.get_json() or {}
    platform = data.get("platform")
    content = data.get("content", "").strip()
    media_urls = data.get("media_urls", [])

    if not platform or platform not in ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok']:
        return {"error": "Invalid platform"}, 400

    if not content:
        return {"error": "Content is required"}, 400

    try:
        scheduler = get_social_scheduler()
        result = scheduler.post_immediately(platform, content, media_urls)

        return {
            "ok": result.get("success", False),
            "result": result
        }

    except Exception as e:
        logger.error(f"Social media post error: {e}", exc_info=True)
        return {"error": f"Post failed: {str(e)}"}, 500

@app.route("/api/social/schedule", methods=["POST"])
def schedule_social_post():
    """Schedule a post for later"""
    from social_media_scheduler import get_social_scheduler
    from datetime import datetime

    user, tenant = get_current_user()

    data = request.get_json() or {}
    platform = data.get("platform")
    content = data.get("content", "").strip()
    media_urls = data.get("media_urls", [])
    scheduled_at_iso = data.get("scheduled_at")

    if not all([platform, content, scheduled_at_iso]):
        return {"error": "Platform, content, and scheduled_at are required"}, 400

    try:
        scheduled_at = datetime.fromisoformat(scheduled_at_iso.replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        return {"error": "Invalid scheduled_at format. Use ISO 8601"}, 400

    try:
        scheduler = get_social_scheduler(db.session)
        post = scheduler.schedule_post(
            tenant_id=tenant.id,
            platform=platform,
            content=content,
            media_urls=media_urls,
            scheduled_at=scheduled_at
        )

        return {
            "ok": True,
            "post": {
                "id": post.id,
                "platform": post.platform,
                "status": post.status,
                "scheduled_at": post.scheduled_at.isoformat() + "Z"
            }
        }

    except Exception as e:
        logger.error(f"Social media schedule error: {e}", exc_info=True)
        return {"error": f"Schedule failed: {str(e)}"}, 500

@app.route("/api/social/platforms/status", methods=["GET"])
def social_platforms_status():
    """Check which social media platforms are configured"""
    from social_media_scheduler import SocialMediaAPI

    api = SocialMediaAPI()

    return {
        "twitter": api.twitter_api is not None,
        "facebook": api.meta_access_token is not None,
        "instagram": api.meta_access_token is not None and os.environ.get("INSTAGRAM_ACCOUNT_ID") is not None,
        "linkedin": api.linkedin_access_token is not None,
        "tiktok": False  # Not yet implemented
    }

# A/B Testing API endpoints
@app.route("/api/experiments", methods=["POST"])
def create_experiment():
    """Create a new A/B test experiment"""
    from ab_testing import get_ab_testing_manager, ExperimentType

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    experiment_type = data.get("type", "custom")
    variant_names = data.get("variant_names", [])
    variant_descriptions = data.get("variant_descriptions", [])
    traffic_allocation = data.get("traffic_allocation")
    minimum_sample_size = data.get("minimum_sample_size", 100)
    confidence_level = data.get("confidence_level", 0.95)

    if not name:
        return {"error": "Experiment name is required"}, 400

    if len(variant_names) < 2:
        return {"error": "At least 2 variants required"}, 400

    if len(variant_names) != len(variant_descriptions):
        return {"error": "Variant names and descriptions must match"}, 400

    try:
        manager = get_ab_testing_manager()
        experiment = manager.create_experiment(
            name=name,
            description=description,
            experiment_type=ExperimentType(experiment_type),
            variant_names=variant_names,
            variant_descriptions=variant_descriptions,
            traffic_allocation=traffic_allocation,
            minimum_sample_size=minimum_sample_size,
            confidence_level=confidence_level
        )

        return {
            "ok": True,
            "experiment": experiment.to_dict()
        }

    except Exception as e:
        logger.error(f"Create experiment error: {e}", exc_info=True)
        return {"error": f"Failed to create experiment: {str(e)}"}, 500

@app.route("/api/experiments", methods=["GET"])
def list_experiments():
    """List all experiments, optionally filtered by status"""
    from ab_testing import get_ab_testing_manager, ExperimentStatus

    status_param = request.args.get("status")
    status_filter = ExperimentStatus(status_param) if status_param else None

    try:
        manager = get_ab_testing_manager()
        experiments = manager.list_experiments(status=status_filter)

        return {
            "ok": True,
            "experiments": [exp.to_dict() for exp in experiments]
        }

    except Exception as e:
        logger.error(f"List experiments error: {e}", exc_info=True)
        return {"error": f"Failed to list experiments: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>", methods=["GET"])
def get_experiment(experiment_id):
    """Get a specific experiment by ID"""
    from ab_testing import get_ab_testing_manager

    try:
        manager = get_ab_testing_manager()
        experiment = manager.get_experiment(experiment_id)

        return {
            "ok": True,
            "experiment": experiment.to_dict()
        }

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Get experiment error: {e}", exc_info=True)
        return {"error": f"Failed to get experiment: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>/start", methods=["POST"])
def start_experiment(experiment_id):
    """Start running an experiment"""
    from ab_testing import get_ab_testing_manager

    try:
        manager = get_ab_testing_manager()
        experiment = manager.start_experiment(experiment_id)

        return {
            "ok": True,
            "experiment": experiment.to_dict()
        }

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Start experiment error: {e}", exc_info=True)
        return {"error": f"Failed to start experiment: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>/pause", methods=["POST"])
def pause_experiment(experiment_id):
    """Pause a running experiment"""
    from ab_testing import get_ab_testing_manager

    try:
        manager = get_ab_testing_manager()
        experiment = manager.pause_experiment(experiment_id)

        return {
            "ok": True,
            "experiment": experiment.to_dict()
        }

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Pause experiment error: {e}", exc_info=True)
        return {"error": f"Failed to pause experiment: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>/complete", methods=["POST"])
def complete_experiment(experiment_id):
    """Complete an experiment and determine winner"""
    from ab_testing import get_ab_testing_manager

    try:
        manager = get_ab_testing_manager()
        experiment = manager.complete_experiment(experiment_id)

        return {
            "ok": True,
            "experiment": experiment.to_dict()
        }

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Complete experiment error: {e}", exc_info=True)
        return {"error": f"Failed to complete experiment: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>/results", methods=["GET"])
def get_experiment_results(experiment_id):
    """Get detailed results and analysis for an experiment"""
    from ab_testing import get_ab_testing_manager

    try:
        manager = get_ab_testing_manager()
        results = manager.get_results(experiment_id)

        return {
            "ok": True,
            **results
        }

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Get results error: {e}", exc_info=True)
        return {"error": f"Failed to get results: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>/impression", methods=["POST"])
def record_impression(experiment_id):
    """Record an impression (visitor saw a variant)"""
    from ab_testing import get_ab_testing_manager

    data = request.get_json() or {}
    variant_id = data.get("variant_id")

    if not variant_id:
        return {"error": "variant_id is required"}, 400

    try:
        manager = get_ab_testing_manager()
        manager.record_impression(experiment_id, variant_id)

        return {"ok": True}

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Record impression error: {e}", exc_info=True)
        return {"error": f"Failed to record impression: {str(e)}"}, 500

@app.route("/api/experiments/<experiment_id>/conversion", methods=["POST"])
def record_conversion(experiment_id):
    """Record a conversion for a variant"""
    from ab_testing import get_ab_testing_manager

    data = request.get_json() or {}
    variant_id = data.get("variant_id")
    revenue = data.get("revenue", 0.0)

    if not variant_id:
        return {"error": "variant_id is required"}, 400

    try:
        manager = get_ab_testing_manager()
        manager.record_conversion(experiment_id, variant_id, revenue)

        return {"ok": True}

    except ValueError as e:
        return {"error": str(e)}, 404
    except Exception as e:
        logger.error(f"Record conversion error: {e}", exc_info=True)
        return {"error": f"Failed to record conversion: {str(e)}"}, 500

# Google Calendar OAuth API endpoints
@app.route("/api/calendar/authorize", methods=["GET"])
def google_calendar_authorize():
    """Initiate Google Calendar OAuth flow"""
    try:
        from google_calendar import get_calendar_manager
        import secrets

        user, tenant = get_current_user()

        # Generate CSRF state token
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state
        session['oauth_user_id'] = user.id

        manager = get_calendar_manager()
        if not manager:
            return {"error": "Google Calendar not configured"}, 500

        auth_url = manager.get_authorization_url(state)

        return {
            "ok": True,
            "authorization_url": auth_url
        }

    except ImportError:
        return {"error": "Google Calendar dependencies not installed"}, 500
    except Exception as e:
        logger.error(f"Calendar auth error: {e}", exc_info=True)
        return {"error": f"Authorization failed: {str(e)}"}, 500

@app.route("/oauth/google/callback", methods=["GET"])
def google_calendar_callback():
    """Handle Google OAuth callback"""
    try:
        from google_calendar import get_calendar_manager

        # Verify state token
        state = request.args.get('state')
        stored_state = session.get('oauth_state')
        user_id = session.get('oauth_user_id')

        if not state or state != stored_state:
            return {"error": "Invalid state token"}, 400

        if not user_id:
            return {"error": "No user in session"}, 400

        # Get authorization code
        code = request.args.get('code')
        if not code:
            error = request.args.get('error')
            return {"error": f"Authorization failed: {error}"}, 400

        # Exchange code for tokens
        manager = get_calendar_manager()
        if not manager:
            return {"error": "Google Calendar not configured"}, 500

        credentials = manager.handle_oauth_callback(code, user_id)

        # Clear session
        session.pop('oauth_state', None)
        session.pop('oauth_user_id', None)

        # Redirect to success page
        return redirect(url_for('dashboard') + '?calendar_connected=true')

    except ImportError:
        return {"error": "Google Calendar dependencies not installed"}, 500
    except Exception as e:
        logger.error(f"Calendar callback error: {e}", exc_info=True)
        return {"error": f"Callback failed: {str(e)}"}, 500

@app.route("/api/calendar/status", methods=["GET"])
def google_calendar_status():
    """Check if user has connected Google Calendar"""
    try:
        from google_calendar import get_calendar_manager

        user, tenant = get_current_user()

        manager = get_calendar_manager()
        if not manager:
            return {"ok": True, "connected": False, "available": False}

        credentials = manager.get_credentials(user.id)

        return {
            "ok": True,
            "connected": credentials is not None,
            "available": True
        }

    except ImportError:
        return {"ok": True, "connected": False, "available": False}
    except Exception as e:
        logger.error(f"Calendar status error: {e}", exc_info=True)
        return {"error": f"Status check failed: {str(e)}"}, 500

@app.route("/api/calendar/disconnect", methods=["POST"])
def google_calendar_disconnect():
    """Disconnect Google Calendar"""
    try:
        from google_calendar import get_calendar_manager

        user, tenant = get_current_user()

        manager = get_calendar_manager()
        if manager:
            manager.revoke_access(user.id)

        return {"ok": True}

    except ImportError:
        return {"error": "Google Calendar dependencies not installed"}, 500
    except Exception as e:
        logger.error(f"Calendar disconnect error: {e}", exc_info=True)
        return {"error": f"Disconnect failed: {str(e)}"}, 500

@app.route("/api/calendar/events", methods=["GET"])
def list_calendar_events():
    """List Google Calendar events"""
    from google_calendar import get_calendar_manager
    from datetime import datetime, timedelta

    try:
        user, tenant = get_current_user()

        manager = get_calendar_manager()
        if not manager:
            return {"error": "Google Calendar not configured"}, 500

        # Get time range from query params
        days_ahead = int(request.args.get('days_ahead', 30))
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(days=days_ahead)

        events = manager.list_events(
            user_id=user.id,
            start_time=start_time,
            end_time=end_time
        )

        return {
            "ok": True,
            "events": [
                {
                    "id": event.id,
                    "summary": event.summary,
                    "description": event.description,
                    "start": event.start.isoformat(),
                    "end": event.end.isoformat(),
                    "attendees": event.attendees,
                    "location": event.location,
                    "status": event.status
                }
                for event in events
            ]
        }

    except ImportError:
        return {"error": "Google Calendar dependencies not installed"}, 500
    except Exception as e:
        logger.error(f"List events error: {e}", exc_info=True)
        return {"error": f"Failed to list events: {str(e)}"}, 500

@app.route("/api/calendar/events", methods=["POST"])
def create_calendar_event():
    """Create Google Calendar event"""
    from google_calendar import get_calendar_manager
    from datetime import datetime

    try:
        user, tenant = get_current_user()

        data = request.get_json() or {}
        summary = data.get("summary", "").strip()
        start_iso = data.get("start")
        end_iso = data.get("end")
        description = data.get("description", "")
        attendees = data.get("attendees", [])
        location = data.get("location")

        if not summary or not start_iso or not end_iso:
            return {"error": "summary, start, and end are required"}, 400

        # Parse datetimes
        start = datetime.fromisoformat(start_iso.replace("Z", "+00:00")).replace(tzinfo=None)
        end = datetime.fromisoformat(end_iso.replace("Z", "+00:00")).replace(tzinfo=None)

        manager = get_calendar_manager()
        if not manager:
            return {"error": "Google Calendar not configured"}, 500

        event = manager.create_event(
            user_id=user.id,
            summary=summary,
            start=start,
            end=end,
            description=description,
            attendees=attendees,
            location=location
        )

        if not event:
            return {"error": "Failed to create event"}, 500

        return {
            "ok": True,
            "event": {
                "id": event.id,
                "summary": event.summary,
                "start": event.start.isoformat(),
                "end": event.end.isoformat()
            }
        }

    except ImportError:
        return {"error": "Google Calendar dependencies not installed"}, 500
    except Exception as e:
        logger.error(f"Create event error: {e}", exc_info=True)
        return {"error": f"Failed to create event: {str(e)}"}, 500

def _send_booking_reminders():
    """Background job to send booking reminders"""
    with app.app_context():
        try:
            from models import Tenant, Booking, ReminderLog
            now = datetime.utcnow()
            # Scan all tenants that have settings (fallback to demo-tenant if none)
            tenant_ids = [t.id for t in Tenant.query.all()]
            for tid in tenant_ids:
                s = get_or_create_notif_settings(tid)
                hours = int(s.reminder_hours_before or 24)

                # Window: appointments that start between (now + hours) and (now + hours + 5min)
                win_start = now + timedelta(hours=hours)
                win_end = win_start + timedelta(minutes=5)

                candidates = (Booking.query.filter(
                    Booking.tenant_id == tid, Booking.status == "confirmed",
                    Booking.start_at >= win_start, Booking.start_at
                    < win_end).all())
                for b in candidates:
                    # Email
                    if notif_ok(tid, "email") and b.customer_email:
                        already = ReminderLog.query.filter_by(
                            booking_id=b.id, channel="email",
                            kind="before").first()
                        if not already:
                            body = f"Reminder: {b.customer_name}, you have an appointment at {b.start_at}."
                            try:
                                send_email_smtp(b.customer_email,
                                                "Appointment reminder", body)
                                db.session.add(
                                    ReminderLog(tenant_id=tid,
                                                booking_id=b.id,
                                                channel="email",
                                                kind="before"))
                                db.session.commit()
                                print(f"[reminder] email sent for {b.id}")
                            except Exception as e:
                                print("[reminder] email error:", e)

                    # SMS
                    if notif_ok(tid, "sms") and b.customer_phone:
                        already = ReminderLog.query.filter_by(
                            booking_id=b.id, channel="sms",
                            kind="before").first()
                        if not already:
                            msg = f"Reminder: your appointment is at {b.start_at}."
                            try:
                                from onboarding import send_twilio_message
                                ok = send_twilio_message(b.customer_phone, msg)
                                if ok:
                                    db.session.add(
                                        ReminderLog(tenant_id=tid,
                                                    booking_id=b.id,
                                                    channel="sms",
                                                    kind="before"))
                                    db.session.commit()
                                    print(f"[reminder] sms sent for {b.id}")
                            except Exception as e:
                                print("[reminder] sms error:", e)
        except Exception as e:
            print("[scheduler] loop error:", e)


# Initialize APScheduler
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(_send_booking_reminders,
                  "interval",
                  minutes=5,
                  id="reminders_every_5m",
                  replace_existing=True)
try:
    scheduler.start()
    print("[scheduler] Started booking reminders scheduler")
except Exception as e:
    print("[scheduler] start error:", e)


@app.after_request
def add_no_cache(resp):
    resp.headers[
        "Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"

    # Security: Configure CORS with allowed origins from environment
    allowed_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")
    resp.headers.setdefault("Access-Control-Allow-Origin", allowed_origin)
    return resp



# ---- DB init at startup (non-fatal if DB down) ----
def init_db():
    from sqlalchemy.exc import OperationalError
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("DB ready ✅ using %s", Config.SQLALCHEMY_DATABASE_URI)

# SFS NOTE: could not find app = Flask(...); appended DB block at end
# ---- DB config (SQLite fallback) ----
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import OperationalError

DB_URL = os.getenv("DATABASE_URL", "sqlite:///sfs.db")
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}


# ---- DB init at startup (non-fatal if DB down) ----
def init_db():
    with app.app_context():
        try:
            # SFS: moved to init_db(); was: # SFS: moved to init_db(); was: db.create_all()
            app.logger.info("DB ready ✅ using %s", DB_URL)
        except OperationalError as e:
            app.logger.warning("DB unavailable, running degraded: %s", e)


# ---- simple DB health endpoint ----
@app.get("/health/db")
def db_health():
    try:
        db.session.execute(db.text("SELECT 1"))
        return {"ok": True, "db": str(DB_URL)}, 200
    except Exception as e:
        return {"ok": False, "error": str(e)}, 503


# ---- DB init at startup (non-fatal if DB down) ----
def init_db():
    with app.app_context():
        try:
            # SFS: moved to init_db(); was: # SFS: moved to init_db(); was: db.create_all()
            app.logger.info("DB ready ✅ using %s", DB_URL)
        except OperationalError as e:
            app.logger.warning("DB unavailable, running degraded: %s", e)


# ---- DB init at startup (non-fatal if DB down) ----
def init_db():
    with app.app_context():
        try:
            # SFS: moved to init_db(); was: db.create_all()
            app.logger.info("DB ready ✅ using %s", DB_URL)

        except OperationalError as e:
            app.logger.warning("DB unavailable, running degraded: %s", e)
