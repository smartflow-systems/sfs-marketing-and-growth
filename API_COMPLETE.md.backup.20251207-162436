# Marketing & Growth - Complete API Implementation

## 🎉 Implementation Complete!

**Status**: Production-ready full-stack SaaS platform
**Total API Endpoints**: 50+
**Database Tables**: 12
**Features**: Authentication, Campaigns, UTM Links, AI Posts, Bio Pages, Templates, Stripe Integration

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Campaigns API](#campaigns-api)
4. [UTM Links API](#utm-links-api)
5. [AI Posts API](#ai-posts-api)
6. [Bio Pages API](#bio-pages-api)
7. [Templates API](#templates-api)
8. [Webhooks](#webhooks)
9. [Frontend Integration](#frontend-integration)
10. [Revenue Features](#revenue-features)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secure string
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `OPENAI_API_KEY` - OpenAI API key (optional)

### 3. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Development

```bash
# Run both frontend and backend
npm run dev:all

# Or separately:
npm run dev        # Frontend (port 5173)
npm run dev:server # Backend (port 3001)
```

### 5. Test the API

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Authentication

### Endpoints

#### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "free",
    "subscriptionStatus": "active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Authenticate and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "subscriptionTier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "subscriptionTier": "free",
  "subscriptionStatus": "active",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### PATCH /api/auth/me
Update user profile.

**Request:**
```json
{
  "name": "John Smith"
}
```

---

## Campaigns API

All campaign endpoints require authentication.

### Endpoints

#### GET /api/campaigns
List all campaigns for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "Summer Sale 2025",
    "description": "Q2 summer campaign",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "budget": 500000,
    "status": "active",
    "metadata": { "target": "millennials" },
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

#### POST /api/campaigns
Create a new campaign.

**Request:**
```json
{
  "name": "Black Friday 2025",
  "description": "End of year sale campaign",
  "startDate": "2025-11-24",
  "endDate": "2025-11-30",
  "budget": 1000000,
  "status": "draft",
  "metadata": {
    "channels": ["social", "email", "ads"]
  }
}
```

#### GET /api/campaigns/:id
Get campaign details with related data (UTM links, posts, events).

**Response:**
```json
{
  "id": 1,
  "name": "Summer Sale 2025",
  "...": "...",
  "utmLinks": [...],
  "aiPosts": [...],
  "events": [...]
}
```

#### GET /api/campaigns/:id/analytics
Get comprehensive campaign analytics.

**Response:**
```json
{
  "campaign": {...},
  "analytics": {
    "totalUtmLinks": 15,
    "totalClicks": 1247,
    "totalPosts": 23,
    "scheduledPosts": 8,
    "events": 156,
    "eventsByType": {
      "utm_click": 1247,
      "post_scheduled": 23,
      "bio_page_view": 89
    }
  },
  "recentEvents": [...]
}
```

---

## UTM Links API

Track campaign performance with UTM parameters and QR codes.

### Endpoints

#### POST /api/utm
Create a UTM tracking link with auto-generated QR code.

**Request:**
```json
{
  "url": "https://example.com/product",
  "utmSource": "facebook",
  "utmMedium": "social",
  "utmCampaign": "summer_sale",
  "utmTerm": "shoes",
  "utmContent": "banner_ad",
  "campaignId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "campaignId": 1,
  "url": "https://example.com/product?utm_source=facebook&utm_medium=social...",
  "shortCode": "a1b2c3d4",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "clicks": 0,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### GET /api/utm
List all UTM links (optionally filter by campaign).

**Query Parameters:**
- `campaignId` (optional) - Filter by campaign

#### GET /api/utm/go/:shortCode
Public redirect endpoint that tracks clicks.

**Example:**
```
GET /api/utm/go/a1b2c3d4
→ Redirects to full URL and increments click count
```

#### GET /api/utm/:id/analytics
Get detailed analytics for a specific link.

**Response:**
```json
{
  "link": {...},
  "totalClicks": 1247,
  "recentClicks": [...],
  "clicksByDate": {
    "2025-01-15": 145,
    "2025-01-16": 198,
    "2025-01-17": 156
  }
}
```

---

## AI Posts API

Generate and manage AI-powered social media content.

### Endpoints

#### POST /api/posts/generate
Generate AI content for social media.

**Request:**
```json
{
  "platform": "instagram",
  "niche": "fitness",
  "tone": "motivational",
  "prompt": "Create a post about morning workouts",
  "campaignId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "campaignId": 1,
  "platform": "instagram",
  "niche": "fitness",
  "tone": "motivational",
  "content": "🌅 Rise and grind! Your morning workout sets the tone...",
  "hashtags": "#fitness #morningmotivation #workout",
  "prompt": "Create a post about morning workouts",
  "isFavorite": false,
  "isScheduled": false,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### GET /api/posts
List AI-generated posts (with filters).

**Query Parameters:**
- `campaignId` - Filter by campaign
- `platform` - Filter by platform (instagram, facebook, twitter, linkedin)
- `isFavorite` - Filter favorites only

#### POST /api/posts/:id/schedule
Schedule a post for future publishing.

**Request:**
```json
{
  "scheduledFor": "2025-01-20T09:00:00Z"
}
```

#### PATCH /api/posts/:id
Update post content or metadata.

**Request:**
```json
{
  "content": "Updated content...",
  "hashtags": "#new #hashtags",
  "isFavorite": true
}
```

#### GET /api/posts/scheduled/upcoming
Get all scheduled posts sorted by date.

---

## Bio Pages API

Create link-in-bio landing pages.

### Endpoints

#### POST /api/bio
Create a new bio page.

**Request:**
```json
{
  "slug": "johndoe",
  "title": "John Doe - Fitness Coach",
  "bio": "Helping you achieve your fitness goals",
  "avatarUrl": "https://example.com/avatar.jpg",
  "theme": "dark",
  "links": [
    {
      "title": "Book a Session",
      "url": "https://example.com/book",
      "icon": "calendar"
    },
    {
      "title": "Free Guide",
      "url": "https://example.com/guide",
      "icon": "download"
    }
  ],
  "socialLinks": {
    "instagram": "johndoe",
    "twitter": "johndoe"
  }
}
```

#### GET /api/bio/:slug
Public endpoint to view a bio page (tracks views).

**Example:**
```
GET /api/bio/johndoe
```

#### GET /api/bio/my-pages
Get all bio pages for the authenticated user.

#### PATCH /api/bio/:id
Update bio page content.

#### GET /api/bio/:id/analytics
Get view analytics for a bio page.

**Response:**
```json
{
  "page": {...},
  "totalViews": 1543,
  "recentViews": [...],
  "viewsByDate": {
    "2025-01-15": 89,
    "2025-01-16": 156
  }
}
```

#### GET /api/bio/check-slug/:slug
Check if a slug is available (public endpoint).

**Response:**
```json
{
  "available": true,
  "slug": "johndoe"
}
```

---

## Templates API

Browse and purchase marketplace templates.

### Endpoints

#### GET /api/templates
Browse available templates.

**Query Parameters:**
- `type` - Filter by type (campaign, post, utm, bio)
- `category` - Filter by category
- `featured` - Show only featured templates

**Response:**
```json
[
  {
    "id": 1,
    "type": "campaign",
    "name": "E-commerce Launch Template",
    "description": "Complete campaign for product launches",
    "category": "ecommerce",
    "price": 2900,
    "downloads": 156,
    "rating": 5,
    "ratingCount": 23,
    "isFeatured": true,
    "preview": "https://example.com/preview.jpg"
  }
]
```

#### GET /api/templates/:id
Get template details.

#### POST /api/templates/:id/purchase
Purchase a template.

**For free templates:**
Returns the template immediately.

**For paid templates:**
Returns Stripe checkout session URL.

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "sessionUrl": "https://checkout.stripe.com/c/pay/..."
}
```

#### GET /api/templates/my-purchases/all
List purchased templates.

#### POST /api/templates
Create a new template (for creators).

#### POST /api/templates/:id/rate
Rate a purchased template (1-5 stars).

---

## Webhooks

### Stripe Webhooks

**Endpoint:** `/api/webhooks/stripe`

**Supported Events:**
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription canceled
- `checkout.session.completed` - Payment completed
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

**Setup:**
1. Configure webhook in Stripe Dashboard
2. Set webhook URL: `https://yourdomain.com/api/webhooks/stripe`
3. Add `STRIPE_WEBHOOK_SECRET` to `.env`

---

## Frontend Integration

### 1. Wrap App with AuthProvider

```tsx
// src/main.tsx or src/App.tsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use Auth Hook in Components

```tsx
import { useAuth } from './context/AuthContext';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Subscription: {user.subscriptionTier}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Protect Routes

```tsx
import { RequireAuth, RequireSubscription } from './context/AuthContext';

// Require any authenticated user
function ProtectedPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

// Require specific subscription tier
function PremiumFeature() {
  return (
    <RequireSubscription tiers={['pro', 'enterprise']}>
      <AdvancedAnalytics />
    </RequireSubscription>
  );
}
```

### 4. Use API Client

```tsx
import { api } from './services/api';

async function createCampaign(data) {
  try {
    const campaign = await api.createCampaign(data);
    console.log('Campaign created:', campaign);
  } catch (error) {
    console.error('Failed to create campaign:', error);
  }
}

async function generatePost() {
  const post = await api.generatePost({
    platform: 'instagram',
    niche: 'fitness',
    tone: 'motivational',
    prompt: 'Morning workout motivation'
  });
  return post;
}
```

---

## Revenue Features

### Subscription Tiers

**Free Tier** (Default)
- 5 campaigns
- 20 UTM links/month
- 10 AI generations/month
- 1 bio page
- Basic analytics

**Pro Tier** ($49/month)
- Unlimited campaigns
- Unlimited UTM links
- 500 AI generations/month
- 5 bio pages
- Advanced analytics
- Priority support

**Enterprise Tier** ($199/month)
- Everything in Pro
- Unlimited AI generations
- 20 bio pages
- API access
- White-label options
- Team workspaces

### Template Marketplace

**Revenue Model:**
- Creators earn 70% of sales
- Platform takes 30% commission
- Templates priced $9-$99

**Payment Flow:**
1. User purchases template
2. Stripe processes payment
3. Webhook creates purchase record
4. Creator receives payout

### Usage Tracking

All API calls are tracked via `analyticsEvents` table:
- Feature usage patterns
- Popular tools
- User engagement metrics
- Revenue attribution

---

## API Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (subscription required)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

(TODO: Implement express-rate-limit)

Suggested limits:
- Free tier: 100 requests/hour
- Pro tier: 1000 requests/hour
- Enterprise tier: 10,000 requests/hour

---

## Next Steps

1. **Production Deploy**
   - Set up Neon PostgreSQL production database
   - Configure production environment variables
   - Deploy to Vercel/Railway/Render
   - Set up Stripe production keys

2. **Additional Features**
   - Email notifications (SendGrid/Resend)
   - PDF report generation
   - Google Sheets integration
   - Calendar view for scheduled posts
   - Bulk operations for campaigns

3. **Unified API Gateway**
   - Connect all SFS projects
   - Shared authentication
   - Cross-project analytics

4. **Mobile App**
   - React Native app
   - Push notifications
   - Offline mode

---

## Support

- Documentation: See BACKEND_IMPLEMENTATION.md
- API Testing: Use Postman collection (TODO: create)
- Issues: GitHub Issues
- Contact: support@smartflowsystems.com

---

**Built with:**
- Express.js
- PostgreSQL + Drizzle ORM
- Stripe
- JWT Authentication
- React + TypeScript
- OpenAI (optional)

**License:** MIT
