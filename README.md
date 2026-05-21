# sfs-marketing-and-growth

> Premium marketing and growth tools for modern businesses — AI content generation, A/B testing, and multi-channel automation.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-FFD700?style=for-the-badge&logo=replit&logoColor=black)](https://sfs-marketing-and-growth.replit.app)
[![SmartFlow Systems](https://img.shields.io/badge/SmartFlow-Systems-0a0a0a?style=for-the-badge)](https://github.com/smartflow-systems)

---

## What It Does

sfs-marketing-and-growth is a marketing automation platform for salons, barbershops, and service businesses. The live site presents the product and captures interested leads. A full-featured Flask application (`app.py`) — providing multi-tenant workspace management, Stripe subscription billing, AI social media post generation, email campaigns, social platform integration, A/B content experiments, and booking APIs — is available alongside the Node.js server and is the intended production backend for the complete SaaS product.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | JavaScript (Node.js runtime server) / Python 3 (full Flask application) |
| Runtime | Node.js 18+ (default); Python 3.10+ (Flask app) |
| Framework | Express.js (Node.js server); Flask (Python application) |
| Frontend | Vanilla HTML, CSS (SFS theme), JavaScript — static files from `/public`; Jinja2 templates (Flask app) |
| Database / Storage | JSON flat-files for lead capture (`data/leads.json`); PostgreSQL or SQLite via SQLAlchemy (Flask app) |
| Key packages | express, dotenv (Node.js); Flask, SQLAlchemy, Stripe, Twilio, itsdangerous, OpenAI/Anthropic (Flask app) |

---

## How to Run Locally

**Node.js server (default):**

```bash
# 1. Clone the repo
git clone https://github.com/smartflow-systems/sfs-marketing-and-growth.git
cd sfs-marketing-and-growth

# 2. Install Node.js dependencies
npm install

# 3. Start the Node.js server
npm start
```

The app will be available at `http://localhost:5000`.

**Flask application (full-featured):**

```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env

# Run the Flask app
python app.py
```

The Flask app will be available at `http://localhost:3001`.

---

## Environment Variables

The following variables are documented in `.env.example` for the full Flask application:

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Yes | Flask session signing secret | `random-secret-key` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for subscription billing | `sk_test_abc123` |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key | `pk_test_abc123` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret | `whsec_xyz789` |
| `STRIPE_PRICE_STARTER_MONTHLY` | Yes | Stripe price ID for Starter monthly plan | `price_abc123` |
| `STRIPE_PRICE_FLOWKIT_MONTHLY` | Yes | Stripe price ID for Flow Kit monthly plan | `price_def456` |
| `STRIPE_PRICE_LAUNCHPACK_MONTHLY` | Yes | Stripe price ID for Salon Launch Pack | `price_ghi789` |
| `OPENAI_API_KEY` | No | OpenAI key for AI content generation | `sk-proj-abc123` |
| `ANTHROPIC_API_KEY` | No | Anthropic key (alternative AI provider) | `sk-ant-abc123` |
| `RESEND_API_KEY` | No | Resend API key for email sending | `re_abc123` |
| `PORT` | No | Port for the Node.js server | `5000` |

---

## API Endpoints

The live `server.js` runtime exposes the following endpoints:

| Method | Route | Auth required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check with site name and version |
| `GET` | `/api/health` | No | Health check (API path) |
| `POST` | `/api/leads` | No | Capture a visitor lead (firstName, lastName, email, company, phone, source) |
| `GET` | `/api/leads` | No | List all captured leads |
| `POST` | `/api/stripe/checkout` | No | Stripe checkout — currently a placeholder (returns a contact redirect) |

> The full Flask application in `app.py` exposes a comprehensive set of routes including: tenant and user management, Stripe subscription lifecycle, AI post and email generation, social platform posting and scheduling, A/B content experiments, booking APIs, and admin tools.

---

## How It Connects to SmartFlow Systems

- **Main hub** — [`smartflow-systems/SmartFlowSite`](https://github.com/smartflow-systems/SmartFlowSite) links to this repo's live demo from the product cards on the homepage.
- **Design system** — follows the SFS design system (gold `#FFD700` on dark `#0a0a0a`). See [`sfs-claude-skills`](https://github.com/smartflow-systems/sfs-claude-skills) for the full token reference.
- **Stripe** — Full subscription management in the Flask app: three tiers (Starter, Flow Kit, Salon Launch Pack), checkout sessions, webhook lifecycle handling, and feature gating per plan.
- **Other integrations** — Twilio for SMS; SMTP/Resend for email; OpenAI or Anthropic for AI content generation; Twitter and Instagram APIs for social posting (all in the Flask app).

---

## Live Demo

**https://sfs-marketing-and-growth.replit.app** — Marketing and growth tools landing page with lead capture.

---

## Design System

This repo follows the SmartFlow Systems design system.

- Brand colours: Gold `#FFD700` on dark background `#0a0a0a`
- Typography: Inter (headings), system-ui (body)
- Full token reference and component rules: [`sfs-claude-skills/sfs-design-system/SKILL.md`](https://github.com/smartflow-systems/sfs-claude-skills/blob/main/sfs-design-system/SKILL.md)

---

## Contact

| | |
|---|---|
| Sales enquiries | [sales@smartflowsystems.com](mailto:sales@smartflowsystems.com) |
| Book a demo | [calendly.com/boweazy123](https://calendly.com/boweazy123) |

---

## Part of the SmartFlow Systems Suite

SmartFlow Systems builds automation tools for modern businesses — booking, CRM, e-commerce, AI bots, analytics, and more.

| | |
|---|---|
| Website | [smartflowsystems.replit.app](https://smartflowsystems.replit.app) |
| All repos | [github.com/smartflow-systems](https://github.com/smartflow-systems) |

---

*Built by SmartFlow Systems.*
