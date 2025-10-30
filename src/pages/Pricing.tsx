import { Check, Zap, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    features: [
      'All 6 growth tools',
      '100 AI generations per month',
      '5 link-in-bio pages',
      'Basic analytics',
      'Email support',
      '14-day free trial',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    features: [
      'Everything in Starter',
      'Unlimited AI generations',
      'Unlimited link-in-bio pages',
      'Advanced analytics & reporting',
      'Custom branding',
      'Priority support',
      'API access',
      'Team collaboration (5 seats)',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    features: [
      'Everything in Pro',
      'Unlimited team seats',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee (99.9% uptime)',
      'White-label options',
      'Custom training',
      'Priority feature requests',
    ],
    highlighted: false,
  },
]

const faqs = [
  {
    question: 'Can I switch plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex) and debit cards through Stripe.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Pay annually and get 2 months free (save 17%). Contact us for annual pricing.',
  },
  {
    question: 'What happens after my trial ends?',
    answer: 'Your trial lasts 14 days. After that, you\'ll be charged automatically unless you cancel. No credit card required to start.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely! Cancel anytime from your dashboard. No questions asked, no cancellation fees.',
  },
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@smartflow.systems?subject=Enterprise Plan Inquiry'
      return
    }

    setLoading(planId)

    try {
      // In production, this would call your backend to create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback: redirect to a generic signup page
      alert('Checkout is not configured yet. This is a demo.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="text-center fade-in-up">
            <div className="badge" style={{ marginBottom: '1.5rem' }}>
              <Zap size={14} />
              Simple Pricing
            </div>
            <h1 className="text-gold-gradient" style={{ marginBottom: '1.5rem' }}>
              Choose Your Growth Plan
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--sf-muted)',
                maxWidth: '600px',
                margin: '0 auto 2rem',
                lineHeight: 1.7,
              }}
            >
              Start with a 14-day free trial. No credit card required. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.25rem',
              }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`btn ${billingCycle === 'monthly' ? 'btn-gold' : 'btn-ghost'}`}
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`btn ${billingCycle === 'annual' ? 'btn-gold' : 'btn-ghost'}`}
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
              >
                Annual
                <span className="badge" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section">
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`glass-card fade-in-up stagger-${index + 1}`}
                style={{
                  ...(plan.highlighted
                    ? {
                        borderColor: 'var(--sf-gold)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 20px 40px rgba(255, 215, 0, 0.2)',
                      }
                    : {}),
                }}
              >
                {plan.highlighted && (
                  <div
                    className="badge"
                    style={{
                      marginBottom: '1rem',
                      background: 'var(--sf-gold-grad)',
                      color: 'var(--sf-black)',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>
                  {plan.name}
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  {plan.monthlyPrice ? (
                    <>
                      <div className="text-gold-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                        ${billingCycle === 'annual' ? Math.floor(plan.monthlyPrice * 0.83) : plan.monthlyPrice}
                      </div>
                      <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>
                        per month{billingCycle === 'annual' && ', billed annually'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gold-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                        Custom
                      </div>
                      <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>contact us</div>
                    </>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                        color: 'var(--sf-muted)',
                      }}
                    >
                      <Check size={18} style={{ color: 'var(--sf-gold)', marginTop: '0.125rem', flexShrink: 0 }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  className={`btn ${plan.highlighted ? 'btn-gold pulse-on-hover' : 'btn-ghost'}`}
                  style={{ width: '100%' }}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Processing...
                    </>
                  ) : plan.id === 'enterprise' ? (
                    'Contact Sales'
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section" style={{ background: 'rgba(255, 215, 0, 0.02)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <h2 className="text-gold-gradient text-center" style={{ marginBottom: '2rem' }}>
            Feature Comparison
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th>Pro</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>UTM Builder & QR Generator</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Link-in-Bio Pages</td>
                  <td>5 pages</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>AI Post Generator</td>
                  <td>100/month</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Campaign Calendar</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>OG Image Generator</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Analytics</td>
                  <td>Basic</td>
                  <td>Advanced</td>
                  <td>Advanced + Custom</td>
                </tr>
                <tr>
                  <td>Custom Branding</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>API Access</td>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Team Seats</td>
                  <td>1</td>
                  <td>5</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Email</td>
                  <td>Priority</td>
                  <td>Dedicated Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="text-gold-gradient text-center" style={{ marginBottom: '2rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className={`glass-card fade-in-up stagger-${i + 1}`}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>
                  {faq.question}
                </h3>
                <p style={{ color: 'var(--sf-muted)', lineHeight: 1.6, margin: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
