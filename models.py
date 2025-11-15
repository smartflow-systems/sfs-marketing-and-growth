from database import db
from datetime import datetime
import uuid
from sqlalchemy import UniqueConstraint

class Tenant(db.Model):
    __tablename__ = "tenants"
    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    owner_user_id = db.Column(db.String(64), index=True)
    plan = db.Column(db.String(50), default="starter")
    stripe_customer_id = db.Column(db.String(128), unique=True, index=True)
    stripe_subscription_id = db.Column(db.String(128), unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, index=True, nullable=False)
    name = db.Column(db.String(200))
    status = db.Column(db.String(20), default="active")  # active|suspended|deleted
    stripe_customer_id = db.Column(db.String(128), unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Membership(db.Model):
    __tablename__ = "memberships"
    tenant_id = db.Column(db.String(64), db.ForeignKey("tenants.id"), primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey("users.id"), primary_key=True)
    role = db.Column(db.String(20), default="staff")  # owner|admin|staff|analyst
    invited_at = db.Column(db.DateTime)
    activated_at = db.Column(db.DateTime)

class Invitation(db.Model):
    __tablename__ = "invitations"
    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(64), db.ForeignKey("tenants.id"))
    email = db.Column(db.String(255), index=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)
    token = db.Column(db.String(512), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending|accepted|expired
    inviter_user_id = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.String(64), index=True)
    actor_user_id = db.Column(db.String(64), index=True)
    action = db.Column(db.String(64))
    target_type = db.Column(db.String(64))
    target_id = db.Column(db.String(64))
    event_data = db.Column(db.Text)  # JSON string (lightweight)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NotificationSettings(db.Model):
    __tablename__ = "notification_settings"
    tenant_id = db.Column(db.String(64), db.ForeignKey("tenants.id"), primary_key=True)
    email_enabled = db.Column(db.Boolean, default=True)
    sms_enabled = db.Column(db.Boolean, default=False)
    reminder_hours_before = db.Column(db.Integer, default=24)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Booking(db.Model):
    __tablename__ = "bookings"
    id = db.Column(db.String(64), primary_key=True)
    tenant_id = db.Column(db.String(64), db.ForeignKey("tenants.id"), index=True)
    customer_name = db.Column(db.String(200))
    customer_email = db.Column(db.String(255))
    customer_phone = db.Column(db.String(40))
    start_at = db.Column(db.DateTime, index=True)  # appointment start (UTC)
    status = db.Column(db.String(20), default="confirmed")  # confirmed|cancelled|completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ReminderLog(db.Model):
    __tablename__ = "reminder_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.String(64), index=True)
    booking_id = db.Column(db.String(64), index=True)
    channel = db.Column(db.String(10))  # email|sms
    kind = db.Column(db.String(20), default="before")  # before|after
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint('booking_id','channel','kind', name='uix_booking_channel_kind'),)
