import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'SmartFlow Systems <notifications@smartflowsystems.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

/**
 * Email Service
 *
 * Handles transactional emails for:
 * - Authentication (welcome, password reset)
 * - Subscriptions (upgrade, downgrade, payment failed)
 * - Scheduled posts (reminders)
 * - Analytics (weekly digest)
 * - Templates (purchase confirmations)
 */

class EmailService {
  /**
   * Send an email using Resend
   */
  async send({ to, subject, html }: EmailTemplate): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email send:', subject);
      return;
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Welcome email when user registers
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const displayName = name || email.split('@')[0];

    await this.send({
      to: email,
      subject: '🎉 Welcome to SmartFlow Systems!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); padding: 40px; text-align: center; }
              .header h1 { margin: 0; color: #0a0a0a; font-size: 32px; }
              .content { padding: 40px; }
              .content h2 { color: #d4af37; margin-top: 0; }
              .content p { line-height: 1.6; color: #cccccc; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .features { margin: 30px 0; }
              .feature { display: flex; align-items: start; margin: 20px 0; }
              .feature-icon { font-size: 24px; margin-right: 12px; }
              .feature-text { flex: 1; }
              .footer { text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid rgba(212, 175, 55, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Welcome to SmartFlow Systems</h1>
              </div>
              <div class="content">
                <h2>Hey ${displayName}!</h2>
                <p>We're thrilled to have you join SmartFlow Systems - your all-in-one marketing automation suite.</p>

                <div class="features">
                  <div class="feature">
                    <div class="feature-icon">🔗</div>
                    <div class="feature-text">
                      <strong>UTM Link Builder</strong><br>
                      Create trackable links with auto-generated QR codes
                    </div>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-text">
                      <strong>AI Content Generator</strong><br>
                      Generate engaging posts with AI assistance
                    </div>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                      <strong>Unified Analytics</strong><br>
                      Track performance across all your campaigns
                    </div>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-text">
                      <strong>Template Marketplace</strong><br>
                      Browse and download campaign templates
                    </div>
                  </div>
                </div>

                <div class="cta">
                  <a href="${CLIENT_URL}/dashboard" class="button">Get Started →</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #888888;">
                  You're currently on the <strong>Free</strong> tier. Upgrade to Pro or Enterprise to unlock advanced features and higher limits.
                </p>
              </div>
              <div class="footer">
                <p>SmartFlow Systems | Marketing Automation Suite</p>
                <p>Need help? Reply to this email or visit our support center</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }

  /**
   * Subscription upgraded notification
   */
  async sendSubscriptionUpgraded(email: string, tier: string): Promise<void> {
    const tierDetails: Record<string, { name: string; features: string[] }> = {
      pro: {
        name: 'Pro',
        features: ['Unlimited UTM links', 'Advanced analytics', 'Priority support', 'Custom branding'],
      },
      enterprise: {
        name: 'Enterprise',
        features: ['White-label solution', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
      },
    };

    const details = tierDetails[tier] || { name: tier, features: [] };

    await this.send({
      to: email,
      subject: `🚀 Welcome to ${details.name}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); padding: 40px; text-align: center; }
              .header h1 { margin: 0; color: #0a0a0a; font-size: 32px; }
              .content { padding: 40px; }
              .content h2 { color: #d4af37; margin-top: 0; }
              .content p { line-height: 1.6; color: #cccccc; }
              .feature-list { list-style: none; padding: 0; margin: 20px 0; }
              .feature-list li { padding: 10px 0; padding-left: 30px; position: relative; color: #cccccc; }
              .feature-list li:before { content: '✓'; position: absolute; left: 0; color: #d4af37; font-weight: bold; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid rgba(212, 175, 55, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎊 Subscription Upgraded!</h1>
              </div>
              <div class="content">
                <h2>You're now on ${details.name}</h2>
                <p>Your subscription has been successfully upgraded. You now have access to:</p>

                <ul class="feature-list">
                  ${details.features.map(f => `<li>${f}</li>`).join('')}
                </ul>

                <div class="cta">
                  <a href="${CLIENT_URL}/dashboard" class="button">Explore Your New Features →</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #888888;">
                  Your next billing date will be shown in your account settings.
                </p>
              </div>
              <div class="footer">
                <p>SmartFlow Systems | Marketing Automation Suite</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }

  /**
   * Payment failed notification
   */
  async sendPaymentFailed(email: string, tier: string): Promise<void> {
    await this.send({
      to: email,
      subject: '⚠️ Payment Failed - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px; text-align: center; }
              .header h1 { margin: 0; color: #ffffff; font-size: 32px; }
              .content { padding: 40px; }
              .content h2 { color: #ef4444; margin-top: 0; }
              .content p { line-height: 1.6; color: #cccccc; }
              .warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid rgba(212, 175, 55, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Payment Failed</h1>
              </div>
              <div class="content">
                <h2>We couldn't process your payment</h2>
                <p>Your recent payment for the <strong>${tier}</strong> subscription failed.</p>

                <div class="warning-box">
                  <p style="margin: 0; color: #ffffff;"><strong>Action Required</strong></p>
                  <p style="margin: 10px 0 0 0;">Please update your payment method to continue enjoying your subscription benefits. If we don't receive payment within 7 days, your account will be downgraded to the Free tier.</p>
                </div>

                <p><strong>Common reasons for failed payments:</strong></p>
                <ul style="color: #cccccc;">
                  <li>Insufficient funds</li>
                  <li>Expired card</li>
                  <li>Card issuer declined the transaction</li>
                  <li>Incorrect billing information</li>
                </ul>

                <div class="cta">
                  <a href="${CLIENT_URL}/settings/billing" class="button">Update Payment Method →</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #888888;">
                  Questions? Contact our support team - we're here to help!
                </p>
              </div>
              <div class="footer">
                <p>SmartFlow Systems | Marketing Automation Suite</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }

  /**
   * Scheduled post reminder (1 hour before)
   */
  async sendScheduledPostReminder(email: string, postTitle: string, scheduledFor: Date, platforms: string[]): Promise<void> {
    await this.send({
      to: email,
      subject: '⏰ Scheduled Post Coming Up',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; }
              .header h1 { margin: 0; color: #ffffff; font-size: 32px; }
              .content { padding: 40px; }
              .content h2 { color: #d4af37; margin-top: 0; }
              .content p { line-height: 1.6; color: #cccccc; }
              .post-preview { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; padding: 20px; margin: 20px 0; }
              .platforms { display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0; }
              .platform-badge { background: rgba(100, 102, 241, 0.2); color: #a5b4fc; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid rgba(212, 175, 55, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Post Scheduled Soon</h1>
              </div>
              <div class="content">
                <h2>Your post is scheduled in 1 hour</h2>

                <div class="post-preview">
                  <p style="margin: 0 0 10px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Post Title</p>
                  <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${postTitle}</p>

                  <p style="margin: 20px 0 10px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Scheduled For</p>
                  <p style="margin: 0; color: #d4af37; font-size: 16px;">${scheduledFor.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>

                  <p style="margin: 20px 0 10px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Platforms</p>
                  <div class="platforms">
                    ${platforms.map(p => `<span class="platform-badge">${p}</span>`).join('')}
                  </div>
                </div>

                <p>Want to make any last-minute changes? Head to your dashboard to edit or reschedule.</p>

                <div class="cta">
                  <a href="${CLIENT_URL}/posts" class="button">View Post →</a>
                </div>
              </div>
              <div class="footer">
                <p>SmartFlow Systems | Marketing Automation Suite</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }

  /**
   * Weekly analytics digest
   */
  async sendWeeklyDigest(
    email: string,
    stats: {
      totalClicks: number;
      totalPosts: number;
      totalEngagement: number;
      topCampaign: string;
      weekOverWeekGrowth: number;
    }
  ): Promise<void> {
    const growthColor = stats.weekOverWeekGrowth >= 0 ? '#10b981' : '#ef4444';
    const growthSymbol = stats.weekOverWeekGrowth >= 0 ? '↑' : '↓';

    await this.send({
      to: email,
      subject: '📊 Your Weekly SmartFlow Digest',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); padding: 40px; text-align: center; }
              .header h1 { margin: 0; color: #0a0a0a; font-size: 32px; }
              .content { padding: 40px; }
              .content h2 { color: #d4af37; margin-top: 0; }
              .content p { line-height: 1.6; color: #cccccc; }
              .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
              .stat-card { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; padding: 20px; text-align: center; }
              .stat-value { font-size: 32px; font-weight: bold; color: #d4af37; margin: 10px 0; }
              .stat-label { font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; }
              .growth-badge { display: inline-block; background: ${growthColor}20; color: ${growthColor}; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid rgba(212, 175, 55, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Weekly Digest</h1>
              </div>
              <div class="content">
                <h2>Here's how your campaigns performed this week</h2>

                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-label">Total Clicks</div>
                    <div class="stat-value">${stats.totalClicks.toLocaleString()}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Posts Created</div>
                    <div class="stat-value">${stats.totalPosts}</div>
                  </div>
                  <div class="stat-card" style="grid-column: 1 / -1;">
                    <div class="stat-label">Total Engagement</div>
                    <div class="stat-value">${stats.totalEngagement.toLocaleString()}</div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <div class="growth-badge">${growthSymbol} ${Math.abs(stats.weekOverWeekGrowth)}% vs last week</div>
                </div>

                <p style="margin-top: 30px;"><strong>🏆 Top Campaign:</strong> ${stats.topCampaign}</p>

                <div class="cta">
                  <a href="${CLIENT_URL}/analytics" class="button">View Full Analytics →</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #888888;">
                  Want to change your email preferences? Visit your account settings.
                </p>
              </div>
              <div class="footer">
                <p>SmartFlow Systems | Marketing Automation Suite</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }

  /**
   * Template purchase confirmation
   */
  async sendTemplatePurchase(email: string, templateName: string, amount: number): Promise<void> {
    await this.send({
      to: email,
      subject: '✅ Template Purchase Confirmed',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 40px; text-align: center; }
              .header h1 { margin: 0; color: #ffffff; font-size: 32px; }
              .content { padding: 40px; }
              .content h2 { color: #d4af37; margin-top: 0; }
              .content p { line-height: 1.6; color: #cccccc; }
              .purchase-details { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 8px; padding: 20px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { color: #888888; }
              .detail-value { color: #ffffff; font-weight: 600; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid rgba(212, 175, 55, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Purchase Successful!</h1>
              </div>
              <div class="content">
                <h2>Your template is ready to use</h2>
                <p>Thank you for your purchase! Your new template has been added to your account.</p>

                <div class="purchase-details">
                  <div class="detail-row">
                    <span class="detail-label">Template</span>
                    <span class="detail-value">${templateName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">${amount === 0 ? 'Free' : `$${(amount / 100).toFixed(2)}`}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <p>Start using your template right away to create stunning campaigns!</p>

                <div class="cta">
                  <a href="${CLIENT_URL}/templates" class="button">View My Templates →</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #888888;">
                  A receipt has been sent to your email for your records.
                </p>
              </div>
              <div class="footer">
                <p>SmartFlow Systems | Marketing Automation Suite</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }
}

export const emailService = new EmailService();
