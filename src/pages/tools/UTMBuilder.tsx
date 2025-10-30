import { useState, useEffect } from 'react'
import { Copy, Download, Link2, CheckCircle2 } from 'lucide-react'
import QRCode from 'qrcode'

interface UTMParams {
  url: string
  source: string
  medium: string
  campaign: string
  term: string
  content: string
}

export default function UTMBuilder() {
  const [params, setParams] = useState<UTMParams>({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  })
  const [generatedURL, setGeneratedURL] = useState('')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [copied, setCopied] = useState(false)

  // Common presets
  const presets = [
    { name: 'Instagram Post', source: 'instagram', medium: 'social', campaign: '' },
    { name: 'Facebook Ad', source: 'facebook', medium: 'cpc', campaign: '' },
    { name: 'Email Newsletter', source: 'newsletter', medium: 'email', campaign: '' },
    { name: 'Twitter Bio', source: 'twitter', medium: 'social', campaign: '' },
    { name: 'LinkedIn Post', source: 'linkedin', medium: 'social', campaign: '' },
  ]

  useEffect(() => {
    buildURL()
  }, [params])

  useEffect(() => {
    if (generatedURL) {
      generateQRCode(generatedURL)
    }
  }, [generatedURL])

  const buildURL = () => {
    if (!params.url) {
      setGeneratedURL('')
      return
    }

    try {
      const url = new URL(params.url)

      if (params.source) url.searchParams.set('utm_source', params.source)
      if (params.medium) url.searchParams.set('utm_medium', params.medium)
      if (params.campaign) url.searchParams.set('utm_campaign', params.campaign)
      if (params.term) url.searchParams.set('utm_term', params.term)
      if (params.content) url.searchParams.set('utm_content', params.content)

      setGeneratedURL(url.toString())
    } catch (e) {
      setGeneratedURL('')
    }
  }

  const generateQRCode = async (url: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0D0D0D',
          light: '#FFD700',
        },
      })
      setQrCodeDataURL(qrDataURL)
    } catch (error) {
      console.error('QR Code generation error:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedURL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.download = `qr-code-${params.campaign || 'link'}.png`
    link.href = qrCodeDataURL
    link.click()
  }

  const applyPreset = (preset: typeof presets[0]) => {
    setParams({
      ...params,
      source: preset.source,
      medium: preset.medium,
      campaign: preset.campaign || params.campaign,
    })
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '1200px' }}>
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
            <Link2 size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">UTM Builder & QR Generator</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Create trackable campaign links with beautiful QR codes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Campaign Details</h3>

              {/* Presets */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Quick Presets
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Website URL *
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://example.com"
                  value={params.url}
                  onChange={(e) => setParams({ ...params, url: e.target.value })}
                />
              </div>

              {/* Source */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Campaign Source *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., instagram, newsletter, google"
                  value={params.source}
                  onChange={(e) => setParams({ ...params, source: e.target.value })}
                />
              </div>

              {/* Medium */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Campaign Medium *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., social, email, cpc"
                  value={params.medium}
                  onChange={(e) => setParams({ ...params, medium: e.target.value })}
                />
              </div>

              {/* Campaign Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Campaign Name *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., summer_sale, product_launch"
                  value={params.campaign}
                  onChange={(e) => setParams({ ...params, campaign: e.target.value })}
                />
              </div>

              {/* Term (optional) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Campaign Term (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., running+shoes"
                  value={params.term}
                  onChange={(e) => setParams({ ...params, term: e.target.value })}
                />
              </div>

              {/* Content (optional) */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Campaign Content (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., banner_ad, text_link"
                  value={params.content}
                  onChange={(e) => setParams({ ...params, content: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            {/* Generated URL */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>Generated Link</h3>
              {generatedURL ? (
                <>
                  <div
                    style={{
                      background: 'rgba(255, 215, 0, 0.05)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      marginBottom: '1rem',
                      wordBreak: 'break-all',
                      fontSize: '0.875rem',
                      color: 'var(--sf-gold)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {generatedURL}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="btn btn-gold"
                    style={{ width: '100%' }}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy Link
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--sf-muted)' }}>
                  Fill in the required fields to generate your tracking link
                </div>
              )}
            </div>

            {/* QR Code */}
            {qrCodeDataURL && (
              <div className="glass-card text-center">
                <h3 style={{ marginBottom: '1rem', color: 'white' }}>QR Code</h3>
                <div
                  style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'inline-block',
                  }}
                >
                  <img src={qrCodeDataURL} alt="QR Code" style={{ display: 'block', maxWidth: '100%' }} />
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="btn btn-ghost"
                  style={{ width: '100%' }}
                >
                  <Download size={18} />
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card" style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white' }}>What are UTM parameters?</h3>
          <p style={{ color: 'var(--sf-muted)', marginBottom: '1rem', lineHeight: 1.7 }}>
            UTM parameters are tags you add to URLs to track campaign performance in analytics tools like Google Analytics or Plausible.
          </p>
          <div className="grid md:grid-cols-3 gap-4" style={{ marginTop: '1.5rem' }}>
            <div>
              <strong style={{ color: 'var(--sf-gold)', fontSize: '0.875rem' }}>utm_source</strong>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Where traffic comes from (e.g., google, newsletter)
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--sf-gold)', fontSize: '0.875rem' }}>utm_medium</strong>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Marketing medium (e.g., cpc, email, social)
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--sf-gold)', fontSize: '0.875rem' }}>utm_campaign</strong>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Specific campaign name (e.g., summer_sale)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
