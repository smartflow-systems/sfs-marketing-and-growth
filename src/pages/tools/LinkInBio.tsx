import { useState } from 'react'
import { Plus, X, ExternalLink, Save, Eye } from 'lucide-react'

interface Link {
  id: string
  title: string
  url: string
  thumbnail?: string
  description?: string
}

export default function LinkInBio() {
  const [links, setLinks] = useState<Link[]>([
    {
      id: '1',
      title: 'SmartFlow Systems',
      url: 'https://smartflow.systems',
      thumbnail: 'https://via.placeholder.com/400x200/0D0D0D/FFD700?text=SmartFlow',
      description: 'Premium automation solutions',
    },
  ])
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const fetchOGImage = async (url: string): Promise<{ thumbnail?: string; description?: string }> => {
    // In a real implementation, this would call a backend endpoint
    // that uses a service like opengraph.io or a headless browser to fetch OG tags
    // For now, we'll simulate with a placeholder

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    setLoading(false)

    // Simulated response
    return {
      thumbnail: `https://via.placeholder.com/400x200/0D0D0D/FFD700?text=${encodeURIComponent(new URL(url).hostname)}`,
      description: `Learn more at ${new URL(url).hostname}`,
    }
  }

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) return

    try {
      const ogData = await fetchOGImage(newLink.url)
      const link: Link = {
        id: Date.now().toString(),
        title: newLink.title,
        url: newLink.url,
        ...ogData,
      }
      setLinks([...links, link])
      setNewLink({ title: '', url: '' })
    } catch (error) {
      console.error('Error fetching OG data:', error)
      // Add link anyway without thumbnail
      const link: Link = {
        id: Date.now().toString(),
        title: newLink.title,
        url: newLink.url,
      }
      setLinks([...links, link])
      setNewLink({ title: '', url: '' })
    }
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const bioPageURL = `https://smartflow.bio/your-username`

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
            <ExternalLink size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">Link-in-Bio Builder</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Create a stunning link page with auto-fetched OG images
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div>
            {/* Add New Link */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Add New Link</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Link Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., My Latest Blog Post"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  URL
                </label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://example.com/article"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>

              <button
                onClick={handleAddLink}
                className="btn btn-gold"
                style={{ width: '100%' }}
                disabled={loading || !newLink.title || !newLink.url}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Fetching preview...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Link
                  </>
                )}
              </button>
            </div>

            {/* Current Links */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'white', margin: 0 }}>Your Links</h3>
                <span className="badge">{links.length} links</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {links.map((link) => (
                  <div
                    key={link.id}
                    style={{
                      background: 'rgba(255, 215, 0, 0.03)',
                      border: '1px solid rgba(255, 215, 0, 0.15)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    {link.thumbnail && (
                      <img
                        src={link.thumbnail}
                        alt={link.title}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '0.375rem',
                          border: '1px solid rgba(255, 215, 0, 0.2)',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                        {link.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sf-gold)', marginBottom: '0.25rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        {link.url}
                      </div>
                      {link.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                          {link.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="btn btn-ghost"
                      style={{ padding: '0.5rem' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}

                {links.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--sf-muted)' }}>
                    No links yet. Add your first link above!
                  </div>
                )}
              </div>

              {links.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-gold" style={{ flex: 1 }}>
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                  >
                    <Eye size={18} />
                    {previewMode ? 'Edit Mode' : 'Preview'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="glass-card" style={{ position: 'sticky', top: '6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'white', margin: 0 }}>Live Preview</h3>
                <div className="badge">
                  <ExternalLink size={12} />
                  Public Page
                </div>
              </div>

              {/* Bio Page Preview */}
              <div
                style={{
                  background: 'rgba(13, 13, 13, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  minHeight: '500px',
                }}
              >
                {/* Profile Section */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'var(--sf-gold-grad)',
                      margin: '0 auto 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--sf-black)',
                    }}
                  >
                    SF
                  </div>
                  <h2 className="text-gold-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    Your Name
                  </h2>
                  <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem' }}>
                    Your bio goes here
                  </p>
                </div>

                {/* Links Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card hover-elevate"
                      style={{
                        textDecoration: 'none',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      {link.thumbnail && (
                        <img
                          src={link.thumbnail}
                          alt={link.title}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '0.375rem',
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                          {link.title}
                        </div>
                        {link.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)' }}>
                            {link.description}
                          </div>
                        )}
                      </div>
                      <ExternalLink size={18} style={{ color: 'var(--sf-gold)' }} />
                    </a>
                  ))}

                  {links.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sf-muted)' }}>
                      Your links will appear here
                    </div>
                  )}
                </div>
              </div>

              {/* Share URL */}
              {links.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                    Your Bio Page URL
                  </label>
                  <div
                    style={{
                      background: 'rgba(255, 215, 0, 0.05)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--sf-gold)',
                      fontFamily: 'JetBrains Mono, monospace',
                      textAlign: 'center',
                    }}
                  >
                    {bioPageURL}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card" style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white' }}>Why Link-in-Bio?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>One Link, Everything</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Perfect for Instagram, TikTok, Twitter bios. Share all your important links in one beautiful page.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Auto OG Images</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                We automatically fetch Open Graph images from your links for a rich, visual experience.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Premium Design</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Glass-morphic design with the SmartFlow aesthetic. Your links never looked this good.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
