import { Link } from 'react-router-dom'
import { Link2, Sparkles, Calendar, Image, QrCode, TrendingUp, ArrowRight, Zap } from 'lucide-react'

const tools = [
  {
    icon: Link2,
    title: 'UTM Builder',
    description: 'Create trackable campaign links with QR codes',
    path: '/tools/utm-builder',
    color: '#FFD700',
  },
  {
    icon: QrCode,
    title: 'Link-in-Bio',
    description: 'Build beautiful link landing pages',
    path: '/tools/link-in-bio',
    color: '#E6C200',
  },
  {
    icon: Sparkles,
    title: 'AI Post Generator',
    description: 'Generate engaging social media content',
    path: '/tools/ai-post-generator',
    color: '#FFD700',
  },
  {
    icon: Calendar,
    title: 'Campaign Calendar',
    description: 'Plan and visualize your campaigns',
    path: '/tools/campaign-calendar',
    color: '#E6C200',
  },
  {
    icon: Image,
    title: 'OG Image Generator',
    description: 'Create stunning social share images',
    path: '/tools/og-image-generator',
    color: '#FFD700',
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Track your growth metrics',
    path: '#',
    color: '#E6C200',
    comingSoon: true,
  },
]

const recentActivity = [
  { action: 'Created UTM link for Summer Campaign', time: '2 hours ago' },
  { action: 'Generated 3 AI posts for Instagram', time: '5 hours ago' },
  { action: 'Downloaded OG image for blog post', time: '1 day ago' },
]

const stats = [
  { label: 'Links Created', value: '47', change: '+12%' },
  { label: 'AI Generations', value: '83', change: '+28%' },
  { label: 'Campaigns Planned', value: '12', change: '+4' },
  { label: 'Images Generated', value: '29', change: '+15%' },
]

export default function Dashboard() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="text-gold-gradient" style={{ marginBottom: '0.5rem' }}>
            Welcome Back!
          </h1>
          <p style={{ color: 'var(--sf-muted)', fontSize: '1.125rem' }}>
            Here's what's happening with your growth tools
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '3rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className={`glass-card fade-in-up stagger-${i + 1}`}>
              <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)', marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div className="text-gold-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: stat.change.startsWith('+') ? '#90EE90' : 'var(--sf-muted)',
                    fontWeight: 600,
                  }}
                >
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tools Grid */}
          <div className="lg:col-span-2">
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your Tools</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tools.map((tool, i) => {
                const Icon = tool.icon
                return (
                  <Link
                    key={i}
                    to={tool.path}
                    className={`glass-card hover-elevate fade-in-up stagger-${i + 1}`}
                    style={{
                      textDecoration: 'none',
                      position: 'relative',
                      opacity: tool.comingSoon ? 0.6 : 1,
                    }}
                    onClick={(e) => {
                      if (tool.comingSoon) {
                        e.preventDefault()
                        alert('Coming soon!')
                      }
                    }}
                  >
                    {tool.comingSoon && (
                      <div
                        className="badge"
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        Soon
                      </div>
                    )}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '0.5rem',
                        background: `rgba(255, 215, 0, 0.1)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <Icon size={24} style={{ color: tool.color }} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>
                      {tool.title}
                    </h3>
                    <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      {tool.description}
                    </p>
                    {!tool.comingSoon && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sf-gold)', fontSize: '0.875rem' }}>
                        Open tool
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Recent Activity */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.125rem' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivity.map((activity, i) => (
                  <div key={i}>
                    <div style={{ color: 'white', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {activity.action}
                    </div>
                    <div style={{ color: 'var(--sf-muted)', fontSize: '0.75rem' }}>{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div
              className="glass-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                borderColor: 'var(--sf-gold)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '0.5rem',
                  background: 'var(--sf-gold-grad)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Zap size={24} style={{ color: 'var(--sf-black)' }} />
              </div>
              <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Upgrade to Pro</h3>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                Get unlimited AI generations, advanced analytics, and priority support.
              </p>
              <Link to="/pricing" className="btn btn-gold" style={{ width: '100%' }}>
                View Plans
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
