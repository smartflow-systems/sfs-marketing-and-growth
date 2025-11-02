# Email Notifications & Campaign Calendar

This document covers the email notification system and campaign calendar features added to SmartFlow Marketing & Growth.

## Table of Contents

- [Email Notification System](#email-notification-system)
- [Campaign Calendar](#campaign-calendar)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)

---

## Email Notification System

### Overview

The email notification system uses **Resend** (a modern alternative to SendGrid) to send beautiful, branded transactional emails to users.

### Features

✅ **Welcome Email** - Sent when users register
✅ **Subscription Upgraded** - Sent when users upgrade to Pro or Enterprise
✅ **Payment Failed** - Sent when subscription payment fails
✅ **Scheduled Post Reminder** - Sent 1 hour before a post is scheduled
✅ **Weekly Analytics Digest** - Sent every Monday at 9 AM with weekly stats
✅ **Template Purchase Confirmation** - Sent when users purchase templates

### Email Templates

All emails feature:
- 🎨 Branded design matching SFS gold/dark theme
- 📱 Mobile-responsive HTML
- 🔗 Call-to-action buttons
- 📊 Inline data visualizations

### Scheduled Tasks

The system runs two background jobs using **node-cron**:

#### 1. Post Reminders (Every 15 minutes)
```typescript
// Checks for posts scheduled in the next hour
// Sends reminder email if not already sent
// Tracks reminder in analytics_events table
```

#### 2. Weekly Digest (Mondays at 9 AM)
```typescript
// Calculates weekly stats:
// - Total clicks
// - Posts created
// - Total engagement
// - Week-over-week growth %
// - Top performing campaign
```

### Email Service API

Located at: `server/services/email.ts`

```typescript
import { emailService } from '../services/email';

// Welcome email
await emailService.sendWelcomeEmail(email, name);

// Subscription upgraded
await emailService.sendSubscriptionUpgraded(email, 'pro');

// Payment failed
await emailService.sendPaymentFailed(email, tier);

// Post reminder
await emailService.sendScheduledPostReminder(
  email,
  postTitle,
  scheduledDate,
  ['Twitter', 'LinkedIn']
);

// Weekly digest
await emailService.sendWeeklyDigest(email, {
  totalClicks: 1234,
  totalPosts: 45,
  totalEngagement: 5678,
  topCampaign: 'Q4 Product Launch',
  weekOverWeekGrowth: 15
});

// Template purchase
await emailService.sendTemplatePurchase(email, templateName, amountInCents);
```

### Integration Points

**1. User Registration** (`server/routes/auth.ts`)
```typescript
// After user creation
emailService.sendWelcomeEmail(newUser.email, newUser.name).catch(err => {
  console.error('Failed to send welcome email:', err);
});
```

**2. Subscription Webhooks** (`server/routes/webhooks.ts`)
```typescript
// After subscription update
if (tier !== 'free' && subscription.status === 'active') {
  emailService.sendSubscriptionUpgraded(user.email, tier);
}

// After payment failure
emailService.sendPaymentFailed(user.email, user.subscriptionTier);
```

**3. Template Purchases** (`server/routes/webhooks.ts`)
```typescript
// After checkout completion
emailService.sendTemplatePurchase(user.email, template.name, amount);
```

**4. Scheduled Tasks** (`server/services/scheduled-tasks.ts`)
```typescript
// Automatically runs:
// - Post reminders every 15 minutes
// - Weekly digests every Monday at 9 AM
```

---

## Campaign Calendar

### Overview

A visual calendar interface for managing all scheduled content and campaign events across your marketing campaigns.

### Features

✅ **Multiple Event Types**
- 📝 Scheduled Posts (Draft, Scheduled, Sent)
- 📅 Calendar Events (Deadlines, Launches, Milestones)
- 🔗 UTM Link Campaigns

✅ **Interactive Views**
- 📆 Month View
- 📅 Week View
- 📋 Day View
- 📃 Agenda View

✅ **Color-Coded Events**
- Gray - Draft Posts
- Blue - Scheduled Posts
- Green - Sent Posts
- Purple - Calendar Events
- Gold - UTM Link Campaigns

✅ **Event Management**
- Click events to view details
- Edit event information
- Delete events
- Filter by campaign

### Component Location

Frontend: `src/pages/CampaignCalendar.tsx`

### Usage

```tsx
import CampaignCalendar from './pages/CampaignCalendar';

// In your router
<Route path="/calendar" element={<CampaignCalendar />} />
```

### Event Data Structure

```typescript
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'post' | 'utm_link' | 'calendar_event';
  status?: string;
  platforms?: string[];
  campaignId?: number;
  campaignName?: string;
  description?: string;
  resource?: any; // Original event data
}
```

### API Endpoints

**Get All Calendar Events**
```http
GET /api/calendar
GET /api/calendar?campaignId=123
GET /api/calendar?startDate=2024-01-01&endDate=2024-12-31
```

**Create Calendar Event**
```http
POST /api/calendar
Content-Type: application/json

{
  "campaignId": 1,
  "title": "Product Launch",
  "description": "Release new feature",
  "startDate": "2024-02-15T10:00:00Z",
  "endDate": "2024-02-15T12:00:00Z",
  "eventType": "launch",
  "metadata": {}
}
```

**Update Calendar Event**
```http
PATCH /api/calendar/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "startDate": "2024-02-16T10:00:00Z"
}
```

**Delete Calendar Event**
```http
DELETE /api/calendar/:id
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd SFS-Marketing-and-Growth
npm install resend node-cron @types/node-cron react-big-calendar date-fns
```

### 2. Configure Environment Variables

Add to `.env`:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=SmartFlow Systems <notifications@smartflowsystems.com>

# Client URL for email links
CLIENT_URL=http://localhost:5173
```

### 3. Get Resend API Key

1. Sign up at https://resend.com
2. Verify your domain (or use their test domain)
3. Create an API key
4. Add to `.env` file

### 4. Start the Server

```bash
# Development (with scheduled tasks)
npm run dev:server

# Production
npm run build && npm start
```

You should see:
```
🚀 Marketing & Growth API server running on port 3001
🕐 Starting scheduled tasks...
✅ Scheduled tasks started
```

### 5. Test Email Sending

**Option A: Register a new user**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Option B: Trigger Stripe webhook**
Use Stripe CLI to forward webhooks to localhost:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

### 6. View Calendar

Navigate to `http://localhost:5173/calendar` in your browser.

---

## API Reference

### Email Service Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `sendWelcomeEmail` | `email: string, name?: string` | Welcome email for new users |
| `sendSubscriptionUpgraded` | `email: string, tier: string` | Subscription upgrade notification |
| `sendPaymentFailed` | `email: string, tier: string` | Payment failure alert |
| `sendScheduledPostReminder` | `email: string, postTitle: string, scheduledFor: Date, platforms: string[]` | 1-hour post reminder |
| `sendWeeklyDigest` | `email: string, stats: WeeklyStats` | Weekly analytics summary |
| `sendTemplatePurchase` | `email: string, templateName: string, amount: number` | Purchase confirmation |

### Calendar API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar` | GET | Get all calendar events |
| `/api/calendar` | POST | Create calendar event |
| `/api/calendar/:id` | GET | Get single event |
| `/api/calendar/:id` | PATCH | Update event |
| `/api/calendar/:id` | DELETE | Delete event |

### Calendar Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `campaignId` | number | Filter by campaign |
| `startDate` | string (ISO) | Start of date range |
| `endDate` | string (ISO) | End of date range |

---

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` in `.env`
2. **Check Domain**: Ensure sending domain is verified in Resend dashboard
3. **Check Logs**: Look for email errors in server console
4. **Test Mode**: Resend allows 100 free emails/day in test mode

```bash
# Check if email service is configured
curl http://localhost:3001/health
```

### Calendar Not Loading

1. **Check Authentication**: Ensure user is logged in
2. **Check API**: Verify `/api/calendar` endpoint responds
3. **Check Console**: Look for errors in browser console
4. **Check Data**: Ensure calendar events exist in database

```bash
# Test calendar endpoint
curl http://localhost:3001/api/calendar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scheduled Tasks Not Running

1. **Check Server Logs**: Ensure "Scheduled tasks started" appears
2. **Check Time Zone**: Cron uses server time zone
3. **Manual Trigger**: Comment out cron schedule and call functions directly for testing

```typescript
// Test scheduled tasks manually
import { scheduledTasksService } from './services/scheduled-tasks';
await scheduledTasksService['checkUpcomingPosts'](); // Private method - test only
```

---

## Performance Considerations

### Email Delivery

- Emails are sent asynchronously (non-blocking)
- Failed emails are logged but don't block API responses
- Resend has 99.99% uptime SLA

### Scheduled Tasks

- Post reminders run every 15 minutes (low overhead)
- Weekly digests run once per week
- Both use database queries with proper indexes
- Consider scaling to separate worker service for 10,000+ users

### Calendar Performance

- Calendar loads all events for selected date range
- Consider pagination for users with 1000+ events
- Event filtering happens client-side after API fetch
- Uses React.memo and useCallback to prevent unnecessary re-renders

---

## Future Enhancements

### Email System
- [ ] Email preferences (opt-out of specific types)
- [ ] Email templates editor
- [ ] A/B testing for email content
- [ ] Email analytics (open rates, click rates)
- [ ] Custom email triggers via webhooks

### Calendar
- [ ] Drag-and-drop event rescheduling
- [ ] Create events by clicking calendar slots
- [ ] Recurring events
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Team collaboration (shared calendars)
- [ ] Event reminders (push notifications)

---

## Support

For issues or questions:
- Check server logs: `npm run dev:server`
- Check browser console for frontend errors
- Verify environment variables are set correctly
- Ensure database migrations are up to date

## Related Documentation

- [Backend Implementation Guide](./BACKEND_IMPLEMENTATION.md)
- [Complete API Reference](./API_COMPLETE.md)
- [Database Schema](./db/schema.ts)
- [Resend Documentation](https://resend.com/docs)
- [React Big Calendar Docs](https://jquense.github.io/react-big-calendar/)
