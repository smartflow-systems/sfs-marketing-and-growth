import { useState } from 'react'
import { Calendar as CalendarIcon, Upload, Download, Plus, X } from 'lucide-react'
import Papa from 'papaparse'

interface Campaign {
  id: string
  name: string
  date: Date
  platform: string
  status: 'planned' | 'active' | 'completed'
  description?: string
}

const sampleCSV = `name,date,platform,status,description
Summer Sale Launch,2025-06-01,Instagram,planned,Big summer sale announcement
Email Newsletter,2025-06-05,Email,planned,Monthly newsletter campaign
Product Demo Webinar,2025-06-10,LinkedIn,planned,Live product demonstration
Blog Post Release,2025-06-15,Website,planned,New feature announcement`

export default function CampaignCalendar() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Launch Campaign',
      date: new Date(2025, 5, 15),
      platform: 'Instagram',
      status: 'planned',
      description: 'Product launch announcement',
    },
  ])
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    date: '',
    platform: '',
    description: '',
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const importedCampaigns: Campaign[] = results.data
          .filter((row: any) => row.name && row.date)
          .map((row: any) => ({
            id: Date.now().toString() + Math.random(),
            name: row.name,
            date: new Date(row.date),
            platform: row.platform || 'Other',
            status: (row.status || 'planned') as Campaign['status'],
            description: row.description,
          }))

        setCampaigns([...campaigns, ...importedCampaigns])
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        alert('Error parsing CSV file')
      },
    })
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'campaign-template.csv'
    link.href = url
    link.click()
  }

  const handleAddCampaign = () => {
    if (!newCampaign.name || !newCampaign.date) return

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      date: new Date(newCampaign.date),
      platform: newCampaign.platform || 'Other',
      status: 'planned',
      description: newCampaign.description,
    }

    setCampaigns([...campaigns, campaign])
    setNewCampaign({ name: '', date: '', platform: '', description: '' })
    setShowAddForm(false)
  }

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter((c) => c.id !== id))
  }

  // Calendar view helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getCampaignsForDate = (date: Date) => {
    return campaigns.filter(
      (c) =>
        c.date.getDate() === date.getDate() &&
        c.date.getMonth() === date.getMonth() &&
        c.date.getFullYear() === date.getFullYear()
    )
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedMonth)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const statusColors = {
    planned: 'rgba(255, 215, 0, 0.2)',
    active: 'rgba(0, 200, 100, 0.2)',
    completed: 'rgba(100, 100, 100, 0.2)',
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
            <CalendarIcon size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">Campaign Calendar</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Plan and visualize your marketing campaigns
          </p>
        </div>

        {/* Toolbar */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-gold"
              >
                <Plus size={18} />
                Add Campaign
              </button>

              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                <Upload size={18} />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <button onClick={handleDownloadTemplate} className="btn btn-ghost">
                <Download size={18} />
                CSV Template
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('calendar')}
                className={`btn ${viewMode === 'calendar' ? 'btn-gold' : 'btn-ghost'}`}
                style={{ padding: '0.5rem 1rem' }}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-gold' : 'btn-ghost'}`}
                style={{ padding: '0.5rem 1rem' }}
              >
                List
              </button>
            </div>
          </div>

          {/* Add Campaign Form */}
          {showAddForm && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>New Campaign</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  className="input"
                  placeholder="Campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
                <input
                  type="date"
                  className="input"
                  value={newCampaign.date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Platform (e.g., Instagram)"
                  value={newCampaign.platform}
                  onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Description (optional)"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button onClick={handleAddCampaign} className="btn btn-gold">
                  Add Campaign
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="glass-card">
            {/* Month Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="btn btn-ghost"
              >
                ← Prev
              </button>
              <h2 className="text-gold-gradient" style={{ fontSize: '1.5rem' }}>
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h2>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="btn btn-ghost"
              >
                Next →
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'rgba(255, 215, 0, 0.1)' }}>
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--sf-gold)',
                  }}
                >
                  {day}
                </div>
              ))}

              {/* Empty cells before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    background: 'rgba(13, 13, 13, 0.5)',
                    minHeight: '100px',
                  }}
                />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
                const dayCampaigns = getCampaignsForDate(date)
                const isToday = new Date().toDateString() === date.toDateString()

                return (
                  <div
                    key={day}
                    style={{
                      background: isToday ? 'rgba(255, 215, 0, 0.05)' : 'rgba(13, 13, 13, 0.8)',
                      padding: '0.5rem',
                      minHeight: '100px',
                      border: isToday ? '1px solid var(--sf-gold)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)', marginBottom: '0.5rem' }}>
                      {day}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {dayCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          style={{
                            background: statusColors[campaign.status],
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            color: 'white',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={campaign.name}
                        >
                          {campaign.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>All Campaigns ({campaigns.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {campaigns
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((campaign) => (
                  <div
                    key={campaign.id}
                    style={{
                      background: statusColors[campaign.status],
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ color: 'white', margin: 0 }}>{campaign.name}</h4>
                        <span
                          className="badge"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {campaign.platform}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                            color: 'var(--sf-gold)',
                          }}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                        {campaign.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {campaign.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)', marginTop: '0.25rem' }}>
                          {campaign.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="btn btn-ghost"
                      style={{ padding: '0.5rem' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}

              {campaigns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sf-muted)' }}>
                  No campaigns yet. Add your first campaign or import from CSV.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
