import { useState, useEffect } from 'react'
import { Mail, Send, Eye, Clock, Copy, CheckCircle2 } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject_line: string
  preview_text: string
  category: string
}

export default function EmailCampaignBuilder() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [audience, setAudience] = useState('customers')
  const [goal, setGoal] = useState('engagement')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'campaigns'>('create')

  const audiences = ['All Customers', 'New Signups', 'Active Users', 'Inactive Users', 'Premium Members']
  const goals = ['Engagement', 'Conversions', 'Awareness', 'Retention', 'Upsell']
  const tones = ['Professional', 'Casual', 'Friendly', 'Urgent', 'Educational']

  // Load default templates
  useEffect(() => {
    const defaultTemplates = [
      { id: 'welcome', name: 'Welcome Email', subject_line: 'Welcome to {{company_name}}!', preview_text: 'Let\'s get started', category: 'onboarding' },
      { id: 'newsletter', name: 'Monthly Newsletter', subject_line: 'Your Monthly Update', preview_text: 'What\'s new this month', category: 'newsletter' },
      { id: 'promotion', name: 'Special Offer', subject_line: 'Exclusive Offer: {{discount}}% OFF', preview_text: 'Limited time only', category: 'promotion' },
      { id: 'abandoned_cart', name: 'Abandoned Cart', subject_line: 'You left something behind...', preview_text: 'Complete your purchase', category: 'ecommerce' },
    ]
    setTemplates(defaultTemplates)
  }, [])

  const generateEmailContent = async () => {
    if (!subject) return

    setLoading(true)

    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          audience,
          goal,
          tone,
        }),
      })

      const data = await response.json()

      if (data.ok && data.email) {
        setGeneratedEmail(data.email)
      }
    } catch (error) {
      console.error('Email generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '1rem',
              background: 'rgba(255, 215, 0, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Mail size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">Email Campaign Builder</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Create, manage, and send professional email campaigns powered by AI
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
          {(['create', 'templates', 'campaigns'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--sf-gold)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--sf-gold)' : 'var(--sf-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'all 0.3s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Create Campaign Tab */}
        {activeTab === 'create' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Settings Panel */}
            <div>
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Campaign Settings</h3>

                {/* Template Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                    Start with Template (Optional)
                  </label>
                  <select className="input" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                    <option value="">Start from scratch</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                    Campaign Subject / Theme
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., New product launch, Weekly newsletter"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Audience */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                    Target Audience
                  </label>
                  <select className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>
                    {audiences.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Goal */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                    Campaign Goal
                  </label>
                  <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
                    {goals.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tone */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                    Tone
                  </label>
                  <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
                    {tones.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={generateEmailContent}
                  className="btn btn-gold"
                  style={{ width: '100%' }}
                  disabled={loading || !subject}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Generate Email Content
                    </>
                  )}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'white', fontSize: '0.875rem' }}>CAMPAIGN PERFORMANCE</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.25rem' }}>Open Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sf-gold)' }}>24.5%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.25rem' }}>Click Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--sf-gold)' }}>3.2%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.25rem' }}>Sent</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>1,234</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.25rem' }}>Engaged</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>302</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div>
              {generatedEmail ? (
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'white', margin: 0 }}>Generated Content</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" onClick={() => setGeneratedEmail(null)}>
                        ✕ Clear
                      </button>
                      <button className="btn btn-gold" style={{ fontSize: '0.875rem' }}>
                        <Send size={16} />
                        Send Campaign
                      </button>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      SUBJECT LINE
                    </div>
                    <div style={{
                      background: 'rgba(255, 215, 0, 0.05)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{generatedEmail.subject_line}</span>
                      <button
                        onClick={() => copyToClipboard(generatedEmail.subject_line)}
                        style={{ background: 'none', border: 'none', color: 'var(--sf-gold)', cursor: 'pointer' }}
                      >
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Preview Text */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      PREVIEW TEXT
                    </div>
                    <div style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>
                      {generatedEmail.preview_text}
                    </div>
                  </div>

                  {/* HTML Preview */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      EMAIL BODY
                    </div>
                    <div
                      style={{
                        background: 'white',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        maxHeight: '500px',
                        overflow: 'auto',
                      }}
                      dangerouslySetInnerHTML={{ __html: generatedEmail.body_html }}
                    />
                  </div>
                </div>
              ) : (
                <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
                  <Mail size={48} style={{ color: 'var(--sf-gold)', opacity: 0.3, margin: '0 auto 1rem' }} />
                  <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>No content generated yet</h3>
                  <p style={{ color: 'var(--sf-muted)' }}>
                    Fill in the campaign settings and click "Generate Email Content" to create AI-powered email copy
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="glass-card">
                <div className="badge" style={{ marginBottom: '1rem' }}>
                  {template.category}
                </div>
                <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{template.name}</h3>
                <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {template.subject_line}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.875rem' }}>
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    className="btn btn-gold"
                    style={{ flex: 1, fontSize: '0.875rem' }}
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setActiveTab('create')
                    }}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Recent Campaigns</h3>
            <div style={{ color: 'var(--sf-muted)', textAlign: 'center', padding: '3rem 0' }}>
              <Clock size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>No campaigns yet. Create your first campaign to get started!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
