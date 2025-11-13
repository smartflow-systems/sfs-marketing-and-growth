# 🚀 SmartFlow Systems - Marketing & Growth Platform

A **powerhouse** SaaS platform combining multi-tenant booking management, AI-powered marketing tools, and comprehensive growth features.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.2-61dafb.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.2-blue.svg)](https://typescriptlang.org)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)

---

## ✨ Features

### 🎯 Core Business Features

#### Multi-Tenant Booking System
- **Role-Based Access Control**: Owner, Admin, Staff, Analyst roles
- **Invitation System**: Token-based user invitations with expiration
- **Audit Logging**: Track all actions across tenants
- **Automated Reminders**: Email & SMS notifications via APScheduler
- **Seat Management**: Plan-based user limits

#### Subscription & Billing
- **Stripe Integration**: Full subscription lifecycle management
- **Three Pricing Tiers**:
  - **Smart Starter** (£49/mo): 2 seats, basic features
  - **Flow Kit** (£149/mo): 5 seats, advanced features
  - **Salon Launch Pack** (£299/mo): 15 seats, premium features
- **Flexible Billing**: Monthly or one-time payments
- **Webhook Handling**: Real-time subscription updates

### 🤖 AI-Powered Marketing Tools

#### 1. AI Post Generator ✅
- **Real AI Integration**: OpenAI GPT-4 & Anthropic Claude support
- **Multi-Platform**: Instagram, Twitter, LinkedIn, Facebook, TikTok
- **Smart Optimization**: Platform-specific character limits and best practices
- **Niche-Specific**: 10+ industry templates
- **Tone Control**: Professional, Casual, Funny, Inspirational, Educational
- **Multiple Variations**: Generate 3+ unique posts per request
- **Auto Hashtags**: Industry-relevant hashtag suggestions

**Location**: `/tools/ai-post-generator`

#### 2. Email Campaign Builder ✅
- **AI-Powered Content**: Generate compelling email copy with AI
- **Professional Templates**: 4 pre-built, responsive HTML templates
  - Welcome Email
  - Monthly Newsletter
  - Promotional Offer
  - Abandoned Cart
- **Campaign Management**: Create, schedule, and track campaigns
- **Performance Metrics**: Open rates, click rates, engagement tracking
- **Audience Segmentation**: Target specific customer groups
- **Variable Replacement**: Dynamic content with {{placeholders}}

**Location**: `/tools/email-campaigns`

#### 3. UTM Builder & QR Generator ✅
- **Campaign Tracking**: Build UTM-tagged URLs
- **QR Code Generation**: Instant QR codes with custom colors
- **Quick Presets**: Instagram, Facebook, Email, Google Ads
- **Download Options**: PNG QR codes
- **Real-time Preview**: See links as you build them

**Location**: `/tools/utm-builder`

#### 4. Link-in-Bio Page Builder ✅
- **Professional Landing Pages**: Create Linktree-style pages
- **OG Image Fetching**: Automatic preview images
- **Glass Design**: Premium aesthetic
- **Multi-Link Management**: Add unlimited links

**Location**: `/tools/link-in-bio`

#### 5. Campaign Calendar ✅
- **CSV Import**: Bulk import campaign data
- **Visual Planning**: Calendar view of campaigns
- **Campaign Organization**: Plan content strategy

**Location**: `/tools/campaign-calendar`

#### 6. OG Image Generator ✅
- **Social Share Images**: Create Open Graph images
- **Brand Presets**: Pre-configured templates
- **html2canvas Integration**: Export high-quality PNGs

**Location**: `/tools/og-image-generator`

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - UI library
- **TypeScript 5.2** - Type safety
- **Vite 7.1** - Lightning-fast build tool
- **React Router 6.20** - Client-side routing
- **Zustand 4.4** - State management
- **Lucide React** - Icon library

### Backend
- **Flask 3.1** - Python web framework
- **SQLAlchemy 2.0** - ORM
- **PostgreSQL** - Primary database (SQLite fallback)
- **APScheduler 3.10** - Background jobs
- **Gunicorn 23.0** - Production WSGI server

### AI & Integrations
- **OpenAI GPT-4** - AI content generation
- **Anthropic Claude Sonnet 4.5** - Advanced AI
- **Stripe 12.4** - Payment processing
- **Twilio 9.7** - SMS notifications
- **Google Calendar API** - Calendar integration

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for dev)

### 1. Clone Repository
```bash
git clone https://github.com/smartflow-systems/sfs-marketing-and-growth.git
cd sfs-marketing-and-growth
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Configuration section below)

### 3. Install Dependencies

**Backend**:
```bash
pip install -e .
```

**Frontend**:
```bash
npm install
```

### 4. Initialize Database
```bash
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### 5. Run Development Servers

**Terminal 1 - Backend**:
```bash
python main.py
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
npm run dev
# Runs on http://localhost:3000
```

### 6. Access the App
Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Essential Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/smartflow
# Or use SQLite for development:
# DATABASE_URL=sqlite:///smartflow.db

# Flask Session Secret
SESSION_SECRET=your-secret-key-change-in-production

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI APIs (choose one or both)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
AI_PROVIDER=anthropic  # or "openai"

# SMTP (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

See `.env.example` for complete configuration options.

---

## 📁 Project Structure

```
sfs-marketing-and-growth/
├── src/                          # React Frontend
│   ├── pages/
│   │   ├── Landing.tsx          # Homepage
│   │   ├── Pricing.tsx          # Pricing page
│   │   ├── Dashboard.tsx        # User dashboard
│   │   └── tools/               # Growth tools
│   │       ├── AIPostGenerator.tsx
│   │       ├── EmailCampaignBuilder.tsx
│   │       ├── UTMBuilder.tsx
│   │       ├── LinkInBio.tsx
│   │       ├── CampaignCalendar.tsx
│   │       └── OGImageGenerator.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── GlassCard.tsx
│   └── App.tsx
│
├── app.py                        # Main Flask application
├── models.py                     # SQLAlchemy models
├── config.py                     # Configuration
├── ai_service.py                 # AI integration module
├── email_campaigns.py            # Email campaign management
├── onboarding.py                 # Email/SMS utilities
├── stripe_utils.py               # Stripe helpers
│
├── pyproject.toml                # Python dependencies
├── package.json                  # Node dependencies
├── vite.config.ts                # Vite configuration
├── .env.example                  # Environment template
└── README.md                     # This file
```

---

## 📡 API Documentation

### AI Endpoints

#### Generate Social Posts
```http
POST /api/ai/generate-posts
Content-Type: application/json

{
  "topic": "Launching our new product",
  "niche": "Tech & SaaS",
  "platform": "LinkedIn",
  "tone": "Professional",
  "num_variations": 3
}
```

**Response**:
```json
{
  "ok": true,
  "is_ai_generated": true,
  "posts": [
    {
      "caption": "I'm thrilled to announce...",
      "hashtags": ["#SaaS", "#TechStartup", "#Innovation"],
      "platform": "LinkedIn",
      "variation_number": 1
    }
  ]
}
```

#### Generate Email Campaign
```http
POST /api/ai/generate-email
Content-Type: application/json

{
  "subject": "New Feature Launch",
  "audience": "Active Users",
  "goal": "Engagement",
  "tone": "Professional"
}
```

#### Check AI Status
```http
GET /api/ai/status
```

---

## 🐳 Deployment

### Production Build

#### 1. Build Frontend
```bash
npm run build
```

#### 2. Configure Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### 3. Set Production Environment Variables
```bash
export FLASK_ENV=production
export DATABASE_URL=postgresql://...
export STRIPE_SECRET_KEY=sk_live_...
```

---

## 🎨 Design System

### Color Palette
- **Primary Gold**: `#FFD700`
- **Dark Background**: `#0D0D0D`
- **Dark Card**: `#1A1A1A`
- **Muted Text**: `#B0B0B0`

### Components
- **Glass Cards**: Frosted glass effect with backdrop blur
- **Gold Gradients**: Subtle gold-to-orange gradients
- **Circuit Background**: Animated canvas effect
- **Responsive Grid**: Mobile-first design

---

## 📈 Roadmap

### Phase 1: Foundation ✅
- [x] Multi-tenant booking system
- [x] Stripe integration
- [x] Email/SMS notifications
- [x] AI post generator
- [x] Email campaign builder
- [x] UTM builder & QR generator
- [x] Link-in-bio builder

### Phase 2: Advanced Features 🚧
- [ ] Social media scheduling & automation
- [ ] Analytics dashboard
- [ ] SEO toolkit
- [ ] A/B testing framework
- [ ] Customer journey mapping
- [ ] Influencer management
- [ ] Google Calendar full integration

### Phase 3: Scale & Polish
- [ ] Redis caching
- [ ] WebSocket real-time updates
- [ ] Comprehensive testing
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

- **Email**: support@smartflowsystems.com
- **Documentation**: [docs.smartflowsystems.com](https://docs.smartflowsystems.com)

---

**Built with ❤️ by SmartFlow Systems**

Making marketing automation accessible to everyone.
# Trigger index
