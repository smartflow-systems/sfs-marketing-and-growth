"""
Email Campaign Management System
Handles email campaign creation, scheduling, and sending
"""

import os
import logging
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
import json

logger = logging.getLogger(__name__)

# Models will be added to models.py
# This module provides business logic for campaigns


@dataclass
class EmailTemplate:
    """Represents an email template"""
    id: str
    name: str
    subject_line: str
    preview_text: str
    html_content: str
    variables: List[str]  # e.g., ["first_name", "company_name"]
    category: str  # e.g., "newsletter", "promotion", "announcement"
    created_at: datetime
    updated_at: datetime


@dataclass
class Campaign:
    """Represents an email campaign"""
    id: str
    tenant_id: str
    name: str
    template_id: Optional[str]
    subject_line: str
    preview_text: str
    html_content: str
    recipient_list_id: Optional[str]
    scheduled_at: Optional[datetime]
    status: str  # draft, scheduled, sending, sent, cancelled
    sent_count: int
    opened_count: int
    clicked_count: int
    bounced_count: int
    created_at: datetime
    updated_at: datetime


class EmailCampaignManager:
    """Manages email campaigns and templates"""

    # Beautiful HTML email templates
    DEFAULT_TEMPLATES = {
        "welcome": {
            "name": "Welcome Email",
            "subject_line": "Welcome to {{company_name}}! 🎉",
            "preview_text": "Let's get you started on your journey",
            "category": "onboarding",
            "variables": ["first_name", "company_name"],
            "html_content": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #0D0D0D; }
        .container { max-width: 600px; margin: 0 auto; background: #1A1A1A; }
        .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #0D0D0D; margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; color: #E0E0E0; }
        .content h2 { color: #FFD700; font-size: 22px; margin-top: 0; }
        .content p { line-height: 1.7; font-size: 16px; color: #B0B0B0; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { background: #FFD700; color: #0D0D0D; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
        .footer { background: #0D0D0D; padding: 30px; text-align: center; color: #666; font-size: 12px; }
        .footer a { color: #FFD700; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}!</h1>
        </div>
        <div class="content">
            <h2>Hey {{first_name}}, welcome aboard! 🚀</h2>
            <p>We're thrilled to have you join our community. You're now part of something special.</p>
            <p>Here's what you can do next:</p>
            <ul style="line-height: 2; color: #B0B0B0;">
                <li>Complete your profile setup</li>
                <li>Explore our powerful features</li>
                <li>Join our community forum</li>
            </ul>
            <div class="cta">
                <a href="{{dashboard_url}}">Get Started Now</a>
            </div>
            <p>Have questions? Just hit reply - we're here to help!</p>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Email Preferences</a></p>
        </div>
    </div>
</body>
</html>
            """
        },

        "newsletter": {
            "name": "Monthly Newsletter",
            "subject_line": "📬 Your Monthly Update from {{company_name}}",
            "preview_text": "What's new this month? Find out inside!",
            "category": "newsletter",
            "variables": ["first_name", "company_name"],
            "html_content": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #F5F5F5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #0D0D0D; padding: 30px; text-align: center; border-top: 4px solid #FFD700; }
        .header h1 { color: #FFD700; margin: 0; font-size: 24px; }
        .content { padding: 40px 30px; }
        .article { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #E0E0E0; }
        .article:last-child { border-bottom: none; }
        .article h3 { color: #0D0D0D; font-size: 20px; margin-top: 0; }
        .article p { color: #666; line-height: 1.6; }
        .article a { color: #FFD700; text-decoration: none; font-weight: 600; }
        .footer { background: #0D0D0D; padding: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 Monthly Newsletter</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333;">Hey {{first_name}},</p>
            <p style="color: #666; line-height: 1.7;">Here's what's been happening at {{company_name}} this month...</p>

            <div class="article">
                <h3>Feature Update: AI-Powered Analytics</h3>
                <p>We've just launched our new AI analytics dashboard that gives you insights in real-time.</p>
                <a href="#">Learn more →</a>
            </div>

            <div class="article">
                <h3>Customer Spotlight</h3>
                <p>See how businesses like yours are crushing their goals with our platform.</p>
                <a href="#">Read the story →</a>
            </div>

            <div class="article">
                <h3>Upcoming Webinar</h3>
                <p>Join us next week for a deep dive into growth marketing strategies.</p>
                <a href="#">Save your spot →</a>
            </div>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
            <p><a href="{{unsubscribe_url}}" style="color: #FFD700; text-decoration: none;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
            """
        },

        "promotion": {
            "name": "Special Offer",
            "subject_line": "🎉 Exclusive Offer: {{discount}}% OFF",
            "preview_text": "Limited time only - don't miss out!",
            "category": "promotion",
            "variables": ["first_name", "discount", "code"],
            "html_content": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #0D0D0D; }
        .container { max-width: 600px; margin: 0 auto; background: #1A1A1A; }
        .hero { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 60px 30px; text-align: center; }
        .hero h1 { color: #0D0D0D; margin: 0; font-size: 36px; font-weight: 800; }
        .hero .discount { font-size: 64px; font-weight: 900; color: #0D0D0D; margin: 20px 0; }
        .content { padding: 40px 30px; text-align: center; color: #E0E0E0; }
        .code-box { background: rgba(255, 215, 0, 0.1); border: 2px dashed #FFD700; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .code-box .code { font-size: 24px; font-weight: 700; color: #FFD700; font-family: monospace; letter-spacing: 2px; }
        .cta a { background: #FFD700; color: #0D0D0D; padding: 18px 50px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; display: inline-block; margin: 20px 0; }
        .footer { background: #0D0D0D; padding: 30px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>EXCLUSIVE OFFER</h1>
            <div class="discount">{{discount}}% OFF</div>
            <p style="color: #0D0D0D; font-size: 18px; font-weight: 600; margin: 0;">Limited Time Only!</p>
        </div>
        <div class="content">
            <h2 style="color: #FFD700; font-size: 24px;">Hey {{first_name}}! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.7; color: #B0B0B0;">We're giving you an exclusive {{discount}}% discount - just for being awesome!</p>

            <div class="code-box">
                <p style="color: #999; font-size: 12px; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 1px;">Your Code</p>
                <div class="code">{{code}}</div>
            </div>

            <p style="color: #B0B0B0;">Use this code at checkout to claim your discount.</p>

            <div class="cta">
                <a href="{{shop_url}}">Shop Now →</a>
            </div>

            <p style="font-size: 14px; color: #666;">Offer expires in 48 hours ⏰</p>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
            <p><a href="{{unsubscribe_url}}" style="color: #FFD700; text-decoration: none;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
            """
        },

        "abandoned_cart": {
            "name": "Abandoned Cart Reminder",
            "subject_line": "You left something behind... 🛒",
            "preview_text": "Complete your purchase and save!",
            "category": "ecommerce",
            "variables": ["first_name", "cart_items", "cart_total"],
            "html_content": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #F5F5F5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { padding: 30px; background: #0D0D0D; text-align: center; }
        .header h1 { color: #FFD700; margin: 0; font-size: 24px; }
        .content { padding: 40px 30px; }
        .cart-item { border: 1px solid #E0E0E0; border-radius: 8px; padding: 20px; margin-bottom: 15px; display: flex; align-items: center; }
        .total { background: #F9F9F9; padding: 20px; border-radius: 8px; font-size: 20px; font-weight: 700; text-align: right; margin: 20px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { background: #FFD700; color: #0D0D0D; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
        .footer { background: #0D0D0D; padding: 30px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Your Cart is Waiting</h1>
        </div>
        <div class="content">
            <p style="font-size: 18px; color: #333;">Hey {{first_name}},</p>
            <p style="color: #666; line-height: 1.7;">Looks like you left some great items in your cart. Complete your purchase now!</p>

            <div style="margin: 30px 0;">
                {{cart_items}}
            </div>

            <div class="total">
                Total: {{cart_total}}
            </div>

            <div class="cta">
                <a href="{{cart_url}}">Complete Your Purchase</a>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">Still deciding? We're here to help! Reply to this email with any questions.</p>
        </div>
        <div class="footer">
            <p>© 2025 {{company_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            """
        }
    }

    @classmethod
    def get_default_templates(cls) -> Dict[str, Dict]:
        """Get all default email templates"""
        return cls.DEFAULT_TEMPLATES

    @staticmethod
    def render_template(html_content: str, variables: Dict[str, str]) -> str:
        """
        Render email template with variables

        Args:
            html_content: HTML template with {{variable}} placeholders
            variables: Dict of variable_name: value

        Returns:
            Rendered HTML with variables replaced
        """
        rendered = html_content
        for key, value in variables.items():
            placeholder = f"{{{{{key}}}}}"
            rendered = rendered.replace(placeholder, str(value))
        return rendered

    @staticmethod
    def calculate_metrics(campaign_id: str, db_session) -> Dict[str, any]:
        """
        Calculate campaign metrics

        Returns dict with:
        - sent_count
        - opened_count
        - clicked_count
        - open_rate
        - click_rate
        """
        # In production, this would query an EmailEvent table
        # For now, return placeholder metrics
        return {
            "sent_count": 0,
            "opened_count": 0,
            "clicked_count": 0,
            "bounced_count": 0,
            "open_rate": 0.0,
            "click_rate": 0.0,
            "bounce_rate": 0.0
        }


# Campaign sending logic
def send_campaign_emails(campaign_id: str, db_session, smtp_config: Dict):
    """
    Send campaign emails to all recipients

    This would be called by a background worker
    """
    from onboarding import send_email_smtp

    logger.info(f"Starting to send campaign {campaign_id}")

    # In production:
    # 1. Get campaign from DB
    # 2. Get recipient list
    # 3. Loop through recipients
    # 4. Render template for each
    # 5. Send via SMTP
    # 6. Track events (sent, opened, clicked)
    # 7. Update campaign status

    # This is a placeholder implementation
    pass
