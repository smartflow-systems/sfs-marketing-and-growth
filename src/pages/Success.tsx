import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

export default function Success() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In production, verify the session with your backend
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSession(data)
          setLoading(false)
        })
        .catch(() => {
          // Fallback for demo
          setSession({ customer_email: 'demo@example.com' })
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="glass-card text-center" style={{ padding: '3rem 2rem' }}>
          {/* Success Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(0, 200, 100, 0.1)',
              border: '2px solid rgba(0, 200, 100, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
            }}
          >
            <CheckCircle2 size={48} style={{ color: '#90EE90' }} className="checkmark" />
          </div>

          {/* Success Message */}
          <h1 className="text-gold-gradient" style={{ marginBottom: '1rem' }}>
            Welcome to SmartFlow Growth!
          </h1>
          <p style={{ color: 'var(--sf-muted)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Your subscription is active. Let's get you started with your growth tools.
          </p>

          {session?.customer_email && (
            <div
              style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)', marginBottom: '0.25rem' }}>
                Confirmation sent to:
              </div>
              <div style={{ color: 'var(--sf-gold)', fontWeight: 600 }}>{session.customer_email}</div>
            </div>
          )}

          {/* Next Steps */}
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>What's Next?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Check your email for your receipt and account details',
                'Explore all 6 growth tools in your dashboard',
                'Generate your first AI-powered social media posts',
                'Create trackable campaign links with QR codes',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--sf-gold-grad)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--sf-black)',
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ color: 'var(--sf-muted)', margin: 0, lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-gold pulse-on-hover">
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
            <Link to="/tools/ai-post-generator" className="btn btn-ghost">
              <Sparkles size={18} />
              Try AI Generator
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="glass-card text-center" style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>Need Help Getting Started?</h3>
          <p style={{ color: 'var(--sf-muted)', marginBottom: '1rem' }}>
            Our support team is here to help you make the most of SmartFlow Growth.
          </p>
          <a href="mailto:support@smartflow.systems" className="btn btn-ghost">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
