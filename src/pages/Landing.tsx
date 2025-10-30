import { Link } from 'react-router-dom'
import {
  Zap,
  Link2,
  Sparkles,
  Calendar,
  Image,
  QrCode,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: Link2,
    title: 'UTM & Link Builder',
    description: 'Generate trackable campaign links with QR codes. Know exactly where your traffic comes from.',
  },
  {
    icon: QrCode,
    title: 'Link-in-Bio Page',
    description: 'Beautiful glass-morphic landing page with auto-fetched OG images. One link, infinite possibilities.',
  },
  {
    icon: Sparkles,
    title: 'AI Post Generator',
    description: 'Generate engaging posts, captions, and hashtags tailored to your niche. Save hours of content creation.',
  },
  {
    icon: Calendar,
    title: 'Campaign Calendar',
    description: 'Import campaigns from CSV and visualize them in a beautiful calendar view. Never miss a launch.',
  },
  {
    icon: Image,
    title: 'OG Image Generator',
    description: 'Create stunning Open Graph images with your brand presets. Stand out in every share.',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Track KPIs and growth metrics with Plausible integration. Data-driven decisions made easy.',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Director',
    company: 'TechFlow Inc',
    quote: 'SmartFlow Growth cut our campaign setup time by 70%. The AI post generator alone is worth the price.',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Founder',
    company: 'GrowthLabs',
    quote: 'Finally, growth tools that actually look premium and work flawlessly. The ROI was immediate.',
  },
  {
    name: 'Emily Watson',
    role: 'Content Lead',
    company: 'Creative Studios',
    quote: 'The link-in-bio feature replaced three separate tools for us. Beautiful design and super fast.',
  },
]

const faqs = [
  {
    question: 'How does the AI post generator work?',
    answer: 'Our AI analyzes your niche and brand voice to generate engaging posts, captions, and relevant hashtags. You can customize tone, length, and platform (Instagram, Twitter, LinkedIn, etc.).',
  },
  {
    question: 'Can I use my own branding?',
    answer: 'Absolutely! The OG image generator and link-in-bio pages support custom brand presets with your colors, fonts, and logos.',
  },
  {
    question: 'What analytics are included?',
    answer: 'We integrate with Plausible Analytics for privacy-friendly tracking. Track clicks, conversions, top campaigns, and UTM performance in a beautiful dashboard.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Start with our 14-day free trial. No credit card required. Cancel anytime.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund you—no questions asked.',
  },
]

const stats = [
  { value: '10K+', label: 'Campaigns Created' },
  { value: '500+', label: 'Happy Customers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Customer Rating' },
]

export default function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="text-center fade-in-up">
            <div className="badge" style={{ marginBottom: '2rem' }}>
              <Zap size={14} />
              Premium Growth Tools
            </div>
            <h1 className="text-gold-gradient" style={{ marginBottom: '1.5rem' }}>
              Turn Marketing Chaos
              <br />
              Into Growth Flow
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'var(--sf-muted)',
                maxWidth: '700px',
                margin: '0 auto 2.5rem',
                lineHeight: 1.7,
              }}
            >
              All-in-one growth toolkit with UTM builders, AI content generation, campaign calendars,
              and stunning OG images. Built for modern marketers who demand premium quality.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/pricing" className="btn btn-gold pulse-on-hover" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Start Free Trial
                <ArrowRight size={20} />
              </Link>
              <a href="#features" className="btn btn-ghost" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Explore Tools
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginTop: '4rem', maxWidth: '900px', margin: '4rem auto 0' }}>
              {stats.map((stat, i) => (
                <div key={i} className={`glass-card text-center fade-in-up stagger-${i + 1}`}>
                  <div className="text-gold-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section" style={{ background: 'rgba(255, 215, 0, 0.02)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="text-gold-gradient">Trusted by Growth Teams</h2>
            <p style={{ color: 'var(--sf-muted)', marginTop: '1rem' }}>
              Join hundreds of marketers accelerating their growth
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className={`glass-card fade-in-up stagger-${i + 1}`}>
                <div style={{ fontSize: '2rem', color: 'var(--sf-gold)', opacity: 0.3 }}>"</div>
                <p style={{ color: 'var(--sf-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  {testimonial.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--sf-gold-grad)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: 'var(--sf-black)',
                    }}
                  >
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'white' }}>{testimonial.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section" style={{ scrollMarginTop: '5rem' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="text-gold-gradient">Everything You Need to Grow</h2>
            <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
              Six powerful tools, one seamless experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className={`glass-card hover-elevate fade-in-up stagger-${i + 1}`}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.5rem',
                      background: 'rgba(255, 215, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={24} style={{ color: 'var(--sf-gold)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--sf-muted)', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/pricing" className="btn btn-gold">
              Get Started Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section" style={{ background: 'rgba(255, 215, 0, 0.02)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="text-gold-gradient">Simple, Transparent Pricing</h2>
            <p style={{ color: 'var(--sf-muted)', marginTop: '1rem' }}>
              Start free, upgrade when you're ready
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Starter */}
            <div className="glass-card fade-in-up stagger-1">
              <div className="badge" style={{ marginBottom: '1rem' }}>Starter</div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="text-gold-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                  $29
                </div>
                <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>per month</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {['All 6 growth tools', '100 AI generations/mo', 'Basic analytics', 'Email support'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--sf-muted)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--sf-gold)' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="btn btn-ghost" style={{ width: '100%' }}>
                Start Free Trial
              </Link>
            </div>

            {/* Pro - Highlighted */}
            <div className="glass-card fade-in-up stagger-2" style={{ borderColor: 'var(--sf-gold)', transform: 'scale(1.05)' }}>
              <div className="badge" style={{ marginBottom: '1rem', background: 'var(--sf-gold-grad)', color: 'var(--sf-black)' }}>
                Most Popular
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="text-gold-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                  $79
                </div>
                <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>per month</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {['Everything in Starter', 'Unlimited AI generations', 'Advanced analytics', 'Custom branding', 'Priority support'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--sf-muted)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--sf-gold)' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="btn btn-gold pulse-on-hover" style={{ width: '100%' }}>
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-card fade-in-up stagger-3">
              <div className="badge" style={{ marginBottom: '1rem' }}>Enterprise</div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="text-gold-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                  Custom
                </div>
                <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>contact us</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'White-label options'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--sf-muted)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--sf-gold)' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@smartflow.systems" className="btn btn-ghost" style={{ width: '100%' }}>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="text-gold-gradient">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className={`glass-card fade-in-up stagger-${i + 1}`}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>
                  {faq.question}
                </h3>
                <p style={{ color: 'var(--sf-muted)', lineHeight: 1.6, margin: 0 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ background: 'rgba(255, 215, 0, 0.02)' }}>
        <div className="container">
          <div className="glass-card text-center" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem' }}>
            <h2 className="text-gold-gradient" style={{ marginBottom: '1rem' }}>
              Ready to Accelerate Your Growth?
            </h2>
            <p style={{ color: 'var(--sf-muted)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join hundreds of marketers using SmartFlow Growth to create better campaigns, faster.
              Start your 14-day free trial—no credit card required.
            </p>
            <Link to="/pricing" className="btn btn-gold pulse-on-hover" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
