# SmartFlow Systems - Quick Reference

## Developer Info
**Name:** boweazy (Garet) | **Org:** SmartFlow Systems | **GitHub:** smartflow-systems | **Total Repos:** 26

---

## Quick Repo Lookup

### 🎯 Core Platform
- **SmartFlowSite** - Main site | Node.js | https://github.com/smartflow-systems/SmartFlowSite
- **sfs-core-services** - Shared infrastructure | https://github.com/smartflow-systems/sfs-core-services
- **sfs-white-label-dashboard** - Multi-tenant admin | https://github.com/smartflow-systems/sfs-white-label-dashboard
- **sfs-business-suite** - All-in-one business tools | https://github.com/smartflow-systems/sfs-business-suite

### 📊 Data & Analytics
- **SFSDataQueryEngine** - AI natural language → SQL | TypeScript/React/OpenAI | https://github.com/smartflow-systems/SFSDataQueryEngine
- **DataScrapeInsights** - Web scraping + analysis | React/Node.js | https://github.com/smartflow-systems/DataScrapeInsights
- **sfs-analytics-engine** - Business intelligence | https://github.com/smartflow-systems/sfs-analytics-engine

### 📱 Social & Marketing
- **SocialScaleBooster** - Social media automation | Node.js/React | https://github.com/smartflow-systems/SocialScaleBooster
- **SocialScaleBoosterAIbot** - No-code bot builder | TypeScript/Freemium | https://github.com/smartflow-systems/SocialScaleBoosterAIbot
- **sfs-marketing-and-growth** - Booking + marketing platform | Python/FastAPI | https://github.com/smartflow-systems/sfs-marketing-and-growth
- **sfs-marketing-toolkit** - Marketing automation | https://github.com/smartflow-systems/sfs-marketing-toolkit

### 💼 Business Management
- **SFSAPDemoCRM** - CRM demo | Node.js | https://github.com/smartflow-systems/SFSAPDemoCRM
- **Barber-booker-tempate-v1** - Booking system | Full-stack | https://github.com/smartflow-systems/Barber-booker-tempate-v1
- **sfs-project-manager** - Project tracking | https://github.com/smartflow-systems/sfs-project-manager
- **sfs-invoice-billing** - Invoicing | https://github.com/smartflow-systems/sfs-invoice-billing

### 🎨 Content & Media
- **sfs-video-platform** - Video hosting | https://github.com/smartflow-systems/sfs-video-platform
- **sfs-knowledge-base** - Documentation hub | https://github.com/smartflow-systems/sfs-knowledge-base
- **sfs-comms-hub** - Communications | https://github.com/smartflow-systems/sfs-comms-hub
- **WebsiteBuilder** - Website builder (WIP) | React | https://github.com/smartflow-systems/WebsiteBuilder

### 🛠️ Developer Tools
- **codegpt** - AI code assistant showcase | Node.js | https://github.com/smartflow-systems/codegpt
- **sfs-embed-sdk** - Embeddable widgets | https://github.com/smartflow-systems/sfs-embed-sdk
- **sfs-url-shortener** - URL shortener | https://github.com/smartflow-systems/sfs-url-shortener
- **SFSPersonalVPN** - VPN infrastructure | https://github.com/smartflow-systems/SFSPersonalVPN

### 🤖 AI & Other
- **AICompanionBot** - AI assistant | https://github.com/smartflow-systems/AICompanionBot
- **sfs-brand-assets** - Brand guidelines | https://github.com/smartflow-systems/sfs-brand-assets
- **demo-repository** - Testing space | https://github.com/smartflow-systems/demo-repository

---

## Tech Stack Cheat Sheet

**Frontend:** React 18/19, TypeScript, Tailwind CSS, Radix UI
**Backend:** Node.js (Express), Python (FastAPI), Prisma ORM
**Databases:** SQLite (dev), PostgreSQL (prod)
**AI/ML:** OpenAI GPT-4, LangChain, ChromaDB
**Payments:** Stripe, Stripe Connect
**Deployment:** Replit, GitHub Actions
**Auth:** JWT, OAuth, RBAC

---

## SFS Standards (CRITICAL)

### Theme 🎨
**ALWAYS use brown/black/gold color palette** - This is the SmartFlow Systems signature

### CI/CD
- GitHub Actions workflows required
- Health endpoint: `GET /health → {"ok":true}`
- Replit deployment standard

### Environment Variables
`SFS_PAT`, `REPLIT_TOKEN`, `SFS_SYNC_URL`

### Database
Prisma ORM | SQLite (dev) | PostgreSQL (prod)

### Authentication
JWT tokens | RBAC: Admin, Staff, Analyst, Owner

### Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Build production
npm run health       # Health check
git push origin main # Deploy
```

---

## Project Status

**Production:** SmartFlowSite, sfs-marketing-and-growth, SFSDataQueryEngine, DataScrapeInsights, SocialScaleBooster, SocialScaleBoosterAIbot, Barber-booker-tempate-v1, SFSAPDemoCRM

**In Development:** WebsiteBuilder, sfs-white-label-dashboard

**Templates:** codegpt, demo-repository

---

## Local Workspace
Primary: `/home/garet/SFS/`

---

## When Working on SFS Projects

✅ Maintain brown/black/gold theme
✅ Configure GitHub Actions CI/CD
✅ Test Replit deployment
✅ Implement proper authentication
✅ Consider cross-project integration
✅ Update README with badges

---

**Last Updated:** 2025-11-19
