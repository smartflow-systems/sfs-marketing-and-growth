import { useState, useRef } from 'react'
import { Image as ImageIcon, Download, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'

interface Template {
  id: string
  name: string
  width: number
  height: number
}

const templates: Template[] = [
  { id: 'og', name: 'Open Graph (1200×630)', width: 1200, height: 630 },
  { id: 'twitter', name: 'Twitter Card (1200×675)', width: 1200, height: 675 },
  { id: 'linkedin', name: 'LinkedIn (1200×627)', width: 1200, height: 627 },
  { id: 'instagram', name: 'Instagram Post (1080×1080)', width: 1080, height: 1080 },
]

const brandPresets = {
  smartflow: {
    name: 'SmartFlow',
    background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)',
    accentColor: '#FFD700',
    textColor: '#FFFFFF',
    secondaryColor: '#3B2F2F',
  },
  dark: {
    name: 'Dark Mode',
    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
    accentColor: '#FFD700',
    textColor: '#FFFFFF',
    secondaryColor: '#333333',
  },
  light: {
    name: 'Light Mode',
    background: 'linear-gradient(135deg, #F5F5DC 0%, #FFFFFF 100%)',
    accentColor: '#E6C200',
    textColor: '#0D0D0D',
    secondaryColor: '#3B2F2F',
  },
  gradient: {
    name: 'Gold Gradient',
    background: 'linear-gradient(135deg, #FFD700 0%, #E6C200 100%)',
    accentColor: '#0D0D0D',
    textColor: '#0D0D0D',
    secondaryColor: '#3B2F2F',
  },
}

export default function OGImageGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0])
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof brandPresets>('smartflow')
  const [title, setTitle] = useState('SmartFlow Growth')
  const [subtitle, setSubtitle] = useState('Marketing & Growth Tools for Modern Businesses')
  const [showLogo, setShowLogo] = useState(true)
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const preset = brandPresets[selectedPreset]

  const handleGenerateImage = async () => {
    if (!canvasRef.current) return

    setGenerating(true)

    try {
      // Wait a bit for rendering
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        width: selectedTemplate.width,
        height: selectedTemplate.height,
      })

      // Download image
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${selectedTemplate.id}-${Date.now()}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Error generating image. Please try again.')
    } finally {
      setGenerating(false)
    }
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
            <ImageIcon size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">OG Image Generator</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Create stunning Open Graph images with your brand presets
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="glass-card" style={{ position: 'sticky', top: '6rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Image Settings</h3>

              {/* Template Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Template Size
                </label>
                <select
                  className="input"
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const template = templates.find((t) => t.id === e.target.value)
                    if (template) setSelectedTemplate(template)
                  }}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Preset */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Brand Preset
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {Object.entries(brandPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPreset(key as keyof typeof brandPresets)}
                      className={`btn ${selectedPreset === key ? 'btn-gold' : 'btn-ghost'}`}
                      style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Title
                </label>
                <textarea
                  className="input"
                  placeholder="Your title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Subtitle */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Subtitle
                </label>
                <textarea
                  className="input"
                  placeholder="Your subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Show Logo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>Show Logo</span>
                </label>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateImage}
                className="btn btn-gold"
                style={{ width: '100%' }}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'white', margin: 0 }}>Preview</h3>
                <div className="badge">
                  {selectedTemplate.width} × {selectedTemplate.height}
                </div>
              </div>

              {/* Canvas Preview */}
              <div
                style={{
                  background: 'rgba(13, 13, 13, 0.5)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  ref={canvasRef}
                  style={{
                    width: selectedTemplate.width,
                    height: selectedTemplate.height,
                    maxWidth: '100%',
                    background: preset.background,
                    borderRadius: '0.5rem',
                    padding: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    position: 'relative',
                    transform: 'scale(0.5)',
                    transformOrigin: 'center',
                  }}
                >
                  {/* Logo */}
                  {showLogo && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '3rem',
                        left: '4rem',
                        width: '80px',
                        height: '80px',
                        borderRadius: '1rem',
                        background: `linear-gradient(135deg, ${preset.accentColor}, ${preset.secondaryColor})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: preset.textColor,
                      }}
                    >
                      <Sparkles size={48} />
                    </div>
                  )}

                  {/* Title */}
                  <h1
                    style={{
                      fontSize: selectedTemplate.height > 700 ? '5rem' : '4rem',
                      fontWeight: 800,
                      color: preset.textColor,
                      marginBottom: '2rem',
                      lineHeight: 1.1,
                      maxWidth: '90%',
                    }}
                  >
                    {title || 'Your Title Here'}
                  </h1>

                  {/* Subtitle */}
                  {subtitle && (
                    <p
                      style={{
                        fontSize: '2rem',
                        color: preset.textColor,
                        opacity: 0.8,
                        lineHeight: 1.5,
                        maxWidth: '80%',
                      }}
                    >
                      {subtitle}
                    </p>
                  )}

                  {/* Accent Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '12px',
                      background: preset.accentColor,
                    }}
                  />

                  {/* Branding */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '3rem',
                      right: '4rem',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: preset.textColor,
                      opacity: 0.6,
                    }}
                  >
                    SmartFlow Growth
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.75rem' }}>Pro Tips</h4>
              <ul style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
                <li>Keep titles short and punchy (max 60 characters)</li>
                <li>Use high contrast between background and text</li>
                <li>Open Graph images appear when you share links on social media</li>
                <li>Different platforms may crop images differently—leave important content in the center</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card" style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white' }}>Why OG Images Matter</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Higher Click-Through</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Posts with custom OG images get up to 3x more engagement on social media.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Brand Consistency</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Use your brand colors and fonts to maintain a consistent look across all shares.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Professional Look</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Stand out from generic link previews with custom-designed social cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
