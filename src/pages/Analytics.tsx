import { useState, useEffect } from 'react'
import { TrendingUp, Users, MousePointer, DollarSign, BarChart3, Eye, Clock, Target } from 'lucide-react'

interface Metric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: any
}

interface ChartData {
  label: string
  value: number
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    // In production, fetch real data from API
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = () => {
    // Mock data - replace with actual API calls
    setMetrics([
      {
        label: 'Total Visitors',
        value: '12,345',
        change: '+12.5%',
        trend: 'up',
        icon: Users
      },
      {
        label: 'Conversions',
        value: '1,234',
        change: '+8.2%',
        trend: 'up',
        icon: Target
      },
      {
        label: 'Revenue',
        value: '$45,678',
        change: '+15.3%',
        trend: 'up',
        icon: DollarSign
      },
      {
        label: 'Avg. Session',
        value: '3m 45s',
        change: '-2.1%',
        trend: 'down',
        icon: Clock
      },
      {
        label: 'Page Views',
        value: '45,678',
        change: '+18.7%',
        trend: 'up',
        icon: Eye
      },
      {
        label: 'Click Rate',
        value: '3.2%',
        change: '+0.5%',
        trend: 'up',
        icon: MousePointer
      },
      {
        label: 'Bounce Rate',
        value: '42.3%',
        change: '-3.2%',
        trend: 'up',
        icon: TrendingUp
      },
      {
        label: 'Active Campaigns',
        value: '12',
        change: '+2',
        trend: 'up',
        icon: BarChart3
      }
    ])

    // Mock chart data
    setChartData([
      { label: 'Mon', value: 1234 },
      { label: 'Tue', value: 1456 },
      { label: 'Wed', value: 1678 },
      { label: 'Thu', value: 1890 },
      { label: 'Fri', value: 2123 },
      { label: 'Sat', value: 1987 },
      { label: 'Sun', value: 1765 }
    ])
  }

  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '1400px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
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
              <BarChart3 size={32} style={{ color: 'var(--sf-gold)' }} />
            </div>
            <h1 className="text-gold-gradient">Analytics Dashboard</h1>
            <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
              Track your growth and performance metrics in real-time
            </p>
          </div>

          {/* Time Range Selector */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? 'btn btn-gold' : 'btn btn-ghost'}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {range === '24h' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '3rem' }}>
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.75rem',
                      background: 'rgba(255, 215, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={24} style={{ color: 'var(--sf-gold)' }} />
                  </div>
                  <div
                    className="badge"
                    style={{
                      background: metric.trend === 'up' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: metric.trend === 'up' ? '#22c55e' : '#ef4444',
                      border: `1px solid ${metric.trend === 'up' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}
                  >
                    {metric.change}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)', marginBottom: '0.5rem' }}>
                  {metric.label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{metric.value}</div>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6" style={{ marginBottom: '3rem' }}>
          {/* Visitor Trend Chart */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Visitor Trend</h3>
            <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              {chartData.map((item, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${(item.value / maxValue) * 100}%`,
                      background: 'linear-gradient(180deg, var(--sf-gold) 0%, rgba(255, 215, 0, 0.3) 100%)',
                      borderRadius: '0.375rem 0.375rem 0 0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, var(--sf-gold) 0%, var(--sf-gold) 100%)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, var(--sf-gold) 0%, rgba(255, 215, 0, 0.3) 100%)'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sources */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Traffic Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { source: 'Organic Search', percentage: 45, color: '#22c55e' },
                { source: 'Direct', percentage: 25, color: '#3b82f6' },
                { source: 'Social Media', percentage: 18, color: '#a855f7' },
                { source: 'Referral', percentage: 12, color: '#f59e0b' },
              ].map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'white', fontSize: '0.875rem' }}>{item.source}</span>
                    <span style={{ color: 'var(--sf-gold)', fontSize: '0.875rem', fontWeight: 600 }}>{item.percentage}%</span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background: item.color,
                        borderRadius: '999px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Conversion Funnel</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
            {[
              { stage: 'Visitors', count: 12345, percentage: 100 },
              { stage: 'Sign Ups', count: 3456, percentage: 28 },
              { stage: 'Trials', count: 1234, percentage: 10 },
              { stage: 'Customers', count: 456, percentage: 3.7 },
            ].map((funnel, index) => (
              <div key={index} style={{ flex: 1, position: 'relative' }}>
                <div
                  style={{
                    background: `linear-gradient(135deg, rgba(255, 215, 0, ${0.8 - index * 0.15}) 0%, rgba(255, 215, 0, ${0.4 - index * 0.1}) 100%)`,
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    transform: `scaleX(${1 - index * 0.15})`,
                    transformOrigin: 'top',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)', marginBottom: '0.5rem' }}>{funnel.stage}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                    {funnel.count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--sf-gold)', fontWeight: 600 }}>{funnel.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
