# SmartFlow Growth - Marketing & Growth Tools MVP

> Premium growth toolkit with UTM builders, AI content generation, campaign calendars, and stunning OG images. Built for modern marketers who demand premium quality.

![SmartFlow Growth](https://via.placeholder.com/1200x600/0D0D0D/FFD700?text=SmartFlow+Growth)

## ✨ Features

### 🎯 Growth Tools (All 6 Included)

1. **UTM Builder & QR Generator** - Create trackable campaign links with beautiful QR codes
2. **Link-in-Bio Page** - Beautiful glass-morphic landing pages with auto-fetched OG images
3. **AI Post Generator** - Generate engaging posts, captions, and hashtags tailored to your niche
4. **Campaign Calendar** - Import campaigns from CSV and visualize in calendar view
5. **OG Image Generator** - Create stunning Open Graph images with brand presets
6. **Analytics Dashboard** - Track KPIs and growth metrics (coming soon)

### 💎 Premium Features

- **SmartFlow Glass Design** - Stunning glassmorphism with circuit board animations
- **Conversion-Focused Landing** - Hero, social proof, features, pricing, FAQs, CTAs
- **Stripe Integration** - Monthly subscriptions with coupon/referral support
- **Responsive & Mobile-First** - Beautiful on all devices
- **Type-Safe** - Built with TypeScript for reliability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ (for Flask backend)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/smartflow-systems/sfs-marketing-and-growth.git
   cd sfs-marketing-and-growth
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Stripe keys and other configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
sfs-marketing-and-growth/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Main layout with nav & footer
│   │   └── GlassCard.tsx        # Reusable glass card component
│   ├── pages/
│   │   ├── Landing.tsx          # Landing page with conversion elements
│   │   ├── Pricing.tsx          # Pricing tiers with Stripe integration
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Success.tsx          # Post-checkout success page
│   │   └── tools/
│   │       ├── UTMBuilder.tsx
│   │       ├── LinkInBio.tsx
│   │       ├── AIPostGenerator.tsx
│   │       ├── CampaignCalendar.tsx
│   │       └── OGImageGenerator.tsx
│   ├── effects/
│   │   └── circuit-background.ts  # Animated circuit canvas
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # Entry point
│   ├── sfs-premium-theme.css     # SmartFlow theme tokens
│   └── index.css                 # Global styles & animations
├── public/
│   └── assets/brand/             # Logo assets
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🎨 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router** - Client-side routing

### Styling
- **Custom CSS** - SmartFlow premium theme with CSS variables
- **Glass-morphism** - Backdrop blur effects
- **Circuit Animation** - Canvas-based background

### Libraries
- **QRCode** - QR code generation
- **html2canvas** - Image generation from DOM
- **Papa Parse** - CSV parsing
- **Lucide React** - Icon library
- **Stripe.js** - Payment processing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Stripe (required for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API URL (if using separate backend)
VITE_API_URL=http://localhost:5000
```

## 📦 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎯 Usage

### For Users

1. **Start Free Trial** - No credit card required
2. **Choose Your Tools** - Access all 6 growth tools
3. **Generate Content** - Use AI to create posts and images
4. **Track Campaigns** - Build UTM links and monitor performance
5. **Upgrade When Ready** - Flexible monthly or annual billing

## 🎨 Design System

### Colors
- **Primary**: `#FFD700` (Gold)
- **Background**: `#0D0D0D` (Deep Black)
- **Secondary**: `#3B2F2F` (Brown)
- **Accent**: `#E6C200` (Gold-2)

### Typography
- **Primary Font**: Inter (300-800)
- **Monospace**: JetBrains Mono

### Components
- `.glass-card` - Primary glass-morphic card
- `.btn-gold` - Primary CTA button
- `.text-gold-gradient` - Gold gradient text
- `.badge` - Small label badge

## 📈 Roadmap

- [ ] Advanced analytics with Plausible integration
- [ ] Team collaboration features
- [ ] API access for Pro plans
- [ ] Custom domain for link-in-bio pages
- [ ] A/B testing for campaigns
- [ ] Email automation integrations

## 💬 Support

- **Email**: support@smartflow.systems
- **Documentation**: [docs.smartflow.systems](https://docs.smartflow.systems)

---

**Made with ⚡ by [SmartFlow Systems](https://smartflow.systems)**
# Trigger index
