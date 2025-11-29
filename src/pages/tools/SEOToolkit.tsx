import { useState } from 'react'
import { Search, TrendingUp, Link2, FileSearch, AlertCircle, CheckCircle2 } from 'lucide-react'

interface KeywordData {
  keyword: string
  volume: number
  difficulty: number
  cpc: string
  trend: 'up' | 'down' | 'stable'
}

interface AuditIssue {
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export default function SEOToolkit() {
  const [activeTab, setActiveTab] = useState<'keywords' | 'audit' | 'backlinks'>('keywords')
  const [keywordInput, setKeywordInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [auditResults, setAuditResults] = useState<AuditIssue[]>([])
  const [loading, setLoading] = useState(false)

  const searchKeywords = () => {
    if (!keywordInput) return

    setLoading(true)

    // Mock data - in production, integrate with SEMrush, Ahrefs, or Google Keyword Planner
    setTimeout(() => {
      setKeywords([
        { keyword: keywordInput, volume: 12500, difficulty: 45, cpc: '$2.30', trend: 'up' },
        { keyword: `${keywordInput} tool`, volume: 8900, difficulty: 38, cpc: '$1.85', trend: 'up' },
        { keyword: `best ${keywordInput}`, volume: 6700, difficulty: 52, cpc: '$2.90', trend: 'stable' },
        { keyword: `${keywordInput} software`, volume: 5400, difficulty: 41, cpc: '$2.15', trend: 'down' },
        { keyword: `${keywordInput} online`, volume: 4200, difficulty: 35, cpc: '$1.65', trend: 'up' },
      ])
      setLoading(false)
    }, 1500)
  }

  const runAudit = () => {
    if (!urlInput) return

    setLoading(true)

    // Mock audit results
    setTimeout(() => {
      setAuditResults([
        {
          type: 'error',
          title: 'Missing Meta Description',
          description: '5 pages are missing meta descriptions',
          impact: 'high'
        },
        {
          type: 'warning',
          title: 'Slow Page Speed',
          description: 'Average load time is 4.2s (should be under 3s)',
          impact: 'high'
        },
        {
          type: 'error',
          title: 'Broken Links',
          description: '12 broken internal links detected',
          impact: 'medium'
        },
        {
          type: 'warning',
          title: 'Missing Alt Tags',
          description: '23 images missing alt text',
          impact: 'medium'
        },
        {
          type: 'info',
          title: 'Mobile Friendly',
          description: 'Site passes mobile-friendly test',
          impact: 'low'
        },
        {
          type: 'warning',
          title: 'H1 Tags',
          description: '3 pages have multiple H1 tags',
          impact: 'medium'
        },
      ])
      setLoading(false)
    }, 2000)
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
            <Search size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">SEO Toolkit</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Keyword research, site audits, and backlink analysis - all in one place
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
          {([
            { id: 'keywords', label: 'Keyword Research', icon: TrendingUp },
            { id: 'audit', label: 'Site Audit', icon: FileSearch },
            { id: 'backlinks', label: 'Backlinks', icon: Link2 },
          ] as const).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 2rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--sf-gold)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--sf-gold)' : 'var(--sf-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Keyword Research Tab */}
        {activeTab === 'keywords' && (
          <div>
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>Search Keywords</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter a keyword (e.g., 'marketing automation')"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchKeywords()}
                  style={{ flex: 1 }}
                />
                <button onClick={searchKeywords} className="btn btn-gold" disabled={loading || !keywordInput}>
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {keywords.length > 0 && (
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Keyword Results</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--sf-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                          Keyword
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--sf-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                          Search Volume
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--sf-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                          Difficulty
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--sf-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                          CPC
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--sf-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map((kw, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '1rem', color: 'white' }}>{kw.keyword}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: 'white' }}>{kw.volume.toLocaleString()}/mo</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div
                              className="badge"
                              style={{
                                background: kw.difficulty < 40 ? 'rgba(34, 197, 94, 0.1)' : kw.difficulty < 60 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: kw.difficulty < 40 ? '#22c55e' : kw.difficulty < 60 ? '#fbbf24' : '#ef4444',
                                display: 'inline-block'
                              }}
                            >
                              {kw.difficulty}/100
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--sf-gold)' }}>{kw.cpc}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <TrendingUp
                              size={18}
                              style={{
                                color: kw.trend === 'up' ? '#22c55e' : kw.trend === 'down' ? '#ef4444' : 'var(--sf-muted)',
                                transform: kw.trend === 'down' ? 'rotate(180deg)' : kw.trend === 'stable' ? 'rotate(90deg)' : 'none',
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Site Audit Tab */}
        {activeTab === 'audit' && (
          <div>
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>Audit Your Website</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="url"
                  className="input"
                  placeholder="Enter your website URL (e.g., https://example.com)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && runAudit()}
                  style={{ flex: 1 }}
                />
                <button onClick={runAudit} className="btn btn-gold" disabled={loading || !urlInput}>
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <FileSearch size={18} />
                      Run Audit
                    </>
                  )}
                </button>
              </div>
            </div>

            {auditResults.length > 0 && (
              <div>
                <div className="grid md:grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                  <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                      {auditResults.filter(r => r.type === 'error').length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#ef4444' }}>Errors</div>
                  </div>
                  <div className="glass-card" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>
                      {auditResults.filter(r => r.type === 'warning').length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#fbbf24' }}>Warnings</div>
                  </div>
                  <div className="glass-card" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.5rem' }}>
                      {auditResults.filter(r => r.type === 'info').length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#22c55e' }}>Passed</div>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Issues Found</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {auditResults.map((issue, index) => {
                      const Icon = issue.type === 'error' ? AlertCircle : issue.type === 'warning' ? AlertCircle : CheckCircle2
                      const color = issue.type === 'error' ? '#ef4444' : issue.type === 'warning' ? '#fbbf24' : '#22c55e'

                      return (
                        <div
                          key={index}
                          style={{
                            padding: '1rem',
                            background: `rgba(${issue.type === 'error' ? '239, 68, 68' : issue.type === 'warning' ? '251, 191, 36' : '34, 197, 94'}, 0.05)`,
                            border: `1px solid rgba(${issue.type === 'error' ? '239, 68, 68' : issue.type === 'warning' ? '251, 191, 36' : '34, 197, 94'}, 0.2)`,
                            borderRadius: '0.5rem',
                            display: 'flex',
                            gap: '1rem',
                          }}
                        >
                          <Icon size={24} style={{ color, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <div style={{ color: 'white', fontWeight: 600 }}>{issue.title}</div>
                              <div
                                className="badge"
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.125rem 0.5rem',
                                  background: issue.impact === 'high' ? 'rgba(239, 68, 68, 0.2)' : issue.impact === 'medium' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                }}
                              >
                                {issue.impact} impact
                              </div>
                            </div>
                            <div style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>{issue.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backlinks Tab */}
        {activeTab === 'backlinks' && (
          <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
            <Link2 size={48} style={{ color: 'var(--sf-gold)', opacity: 0.3, margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>Backlink Analysis Coming Soon</h3>
            <p style={{ color: 'var(--sf-muted)' }}>
              Track and analyze your backlink profile with domain authority, anchor text distribution, and more
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
