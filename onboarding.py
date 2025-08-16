import smtplib
import logging
from email.mime.text import MIMEText
from config import Config

def send_email_smtp(to_email: str, subject: str, body: str):
    """Send email using SMTP configuration"""
    if not (Config.SMTP_HOST and Config.SMTP_USER and Config.SMTP_PASS):
        logging.warning("SMTP not configured; skipping email.")
        return False
    
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = Config.SMTP_FROM
        msg["To"] = to_email
        
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.SMTP_USER, Config.SMTP_PASS)
            server.sendmail(Config.SMTP_FROM, [to_email], msg.as_string())
        
        logging.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def onboarding_email(plan: str) -> str:
    """Generate onboarding email content based on plan"""
    plan_name = {
        'starter': 'Smart Starter',
        'flowkit': 'Flow Kit', 
        'launchpack': 'Salon Launch Pack'
    }.get(plan, plan.title())
    
    return f"""Welcome to SmartFlow Systems! 🎉

Congratulations on choosing the {plan_name} plan.

Your premium black and gold booking system is ready to help grow your business.

Next steps:
1) Connect your Google Calendar for seamless scheduling
2) Customize your brand colors (we've set up black & gold as default)
3) Set up SMS reminders for your clients
4) Configure your client portal

Need help getting started? Our support team is here to help.

Best regards,
The SmartFlow Systems Team

---
SmartFlow Systems - Bookings that sell for you.
"""

def send_twilio_message(to_phone_number: str, message: str) -> bool:
    """Send SMS message using Twilio"""
    if not (Config.TWILIO_ACCOUNT_SID and Config.TWILIO_AUTH_TOKEN and Config.TWILIO_PHONE_NUMBER):
        logging.warning("Twilio not configured; skipping SMS.")
        return False
    
    try:
        from twilio.rest import Client
        
        client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=message,
            from_=Config.TWILIO_PHONE_NUMBER,
            to=to_phone_number
        )
        
        logging.info(f"SMS sent successfully to {to_phone_number}, SID: {message.sid}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send SMS to {to_phone_number}: {str(e)}")
        return False
