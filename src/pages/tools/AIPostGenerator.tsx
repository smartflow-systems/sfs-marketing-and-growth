import { useState } from 'react'
import { Sparkles, Copy, CheckCircle2, RefreshCw } from 'lucide-react'

interface GeneratedPost {
  caption: string
  hashtags: string[]
  platform: string
}

const niches = [
  'Tech & SaaS',
  'E-commerce',
  'Fitness & Wellness',
  'Finance & Investing',
  'Food & Beverage',
  'Fashion & Beauty',
  'Real Estate',
  'Marketing & Advertising',
  'Travel & Lifestyle',
  'Education & Coaching',
]

const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok']

const tones = ['Professional', 'Casual', 'Funny', 'Inspirational', 'Educational']

export default function AIPostGenerator() {
  const [niche, setNiche] = useState('Tech & SaaS')
  const [platform, setPlatform] = useState('Instagram')
  const [tone, setTone] = useState('Professional')
  const [topic, setTopic] = useState('')
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Simulated AI generation (in production, this would call an OpenAI/Anthropic API)
  const generatePost = async () => {
    if (!topic) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call

    // Generate mock posts based on inputs
    const posts: GeneratedPost[] = []

    // Example generations
    if (platform === 'Instagram') {
      posts.push({
        caption: `${topic}\n\nWe're excited to share this with our community! 🚀\n\nWhat are your thoughts? Drop a comment below! 👇`,
        hashtags: generateHashtags(niche, platform),
        platform,
      })
    } else if (platform === 'Twitter') {
      posts.push({
        caption: `Just launched: ${topic}\n\nHere's what makes it special 🧵`,
        hashtags: generateHashtags(niche, platform),
        platform,
      })
    } else if (platform === 'LinkedIn') {
      posts.push({
        caption: `I'm thrilled to announce ${topic}.\n\nAfter months of development, we've created something truly special. Here's what we learned along the way:\n\n1. ${tone} approach matters\n2. Community feedback is invaluable\n3. Innovation requires patience\n\nWhat challenges are you solving in ${niche}?`,
        hashtags: generateHashtags(niche, platform),
        platform,
      })
    }

    // Add 2 more variations
    posts.push({
      caption: generateVariation(topic, platform, tone, 1),
      hashtags: generateHashtags(niche, platform),
      platform,
    })

    posts.push({
      caption: generateVariation(topic, platform, tone, 2),
      hashtags: generateHashtags(niche, platform),
      platform,
    })

    setGeneratedPosts(posts)
    setLoading(false)
  }

  const generateHashtags = (niche: string, platform: string): string[] => {
    const hashtagSets: Record<string, string[]> = {
      'Tech & SaaS': ['#SaaS', '#TechStartup', '#B2B', '#ProductLaunch', '#Innovation', '#TechNews', '#Startup', '#DigitalTransformation'],
      'E-commerce': ['#Ecommerce', '#OnlineShopping', '#Retail', '#ShopSmall', '#OnlineBusiness', '#DropShipping', '#EcommerceTips'],
      'Fitness & Wellness': ['#Fitness', '#Wellness', '#HealthyLiving', '#WorkoutMotivation', '#FitnessGoals', '#HealthyLifestyle'],
      'Finance & Investing': ['#Finance', '#Investing', '#PersonalFinance', '#WealthBuilding', '#FinancialFreedom', '#MoneyTips'],
      'Food & Beverage': ['#Foodie', '#FoodPhotography', '#Cooking', '#FoodLovers', '#Delicious', '#FoodBlogger'],
      'Fashion & Beauty': ['#Fashion', '#Beauty', '#Style', '#OOTD', '#BeautyBlogger', '#FashionInspo'],
      'Real Estate': ['#RealEstate', '#Property', '#HomeForSale', '#RealEstateInvesting', '#DreamHome'],
      'Marketing & Advertising': ['#Marketing', '#DigitalMarketing', '#GrowthHacking', '#ContentMarketing', '#MarketingTips'],
      'Travel & Lifestyle': ['#Travel', '#Wanderlust', '#TravelBlogger', '#Lifestyle', '#Adventure', '#TravelPhotography'],
      'Education & Coaching': ['#Education', '#Learning', '#Coaching', '#PersonalDevelopment', '#SelfImprovement'],
    }

    const baseHashtags = hashtagSets[niche] || []

    // Adjust count based on platform
    const count = platform === 'Twitter' ? 3 : platform === 'Instagram' ? 8 : 5

    return baseHashtags.slice(0, count)
  }

  const generateVariation = (topic: string, _platform: string, tone: string, variation: number): string => {
    const variations = {
      1: `${topic} is here! 🎉\n\nWe've been working hard on this and can't wait for you to try it.\n\n${tone} vibes only. Let's grow together!`,
      2: `Quick update: ${topic}\n\nThis is a game-changer for ${niche}. Here's why...`,
    }
    return variations[variation as keyof typeof variations] || variations[1]
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
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
            <Sparkles size={32} style={{ color: 'var(--sf-gold)' }} />
          </div>
          <h1 className="text-gold-gradient">AI Post Generator</h1>
          <p style={{ color: 'var(--sf-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
            Generate engaging social media posts with AI-powered captions and hashtags
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="glass-card" style={{ position: 'sticky', top: '6rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Post Settings</h3>

              {/* Niche */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Your Niche
                </label>
                <select className="input" value={niche} onChange={(e) => setNiche(e.target.value)}>
                  {niches.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Platform
                </label>
                <select className="input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
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

              {/* Topic */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--sf-muted)' }}>
                  Topic / Announcement
                </label>
                <textarea
                  className="input"
                  placeholder="e.g., our new product launch, latest blog post, company milestone"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                onClick={generatePost}
                className="btn btn-gold"
                style={{ width: '100%' }}
                disabled={loading || !topic}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Posts
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Posts Section */}
          <div className="lg:col-span-2">
            {generatedPosts.length === 0 ? (
              <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
                <Sparkles size={48} style={{ color: 'var(--sf-gold)', opacity: 0.3, margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>No posts generated yet</h3>
                <p style={{ color: 'var(--sf-muted)' }}>
                  Fill in the settings and click "Generate Posts" to create AI-powered content
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {generatedPosts.map((post, index) => (
                  <div key={index} className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div className="badge">
                        Variation {index + 1}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleCopy(`${post.caption}\n\n${post.hashtags.join(' ')}`, `post-${index}`)}
                          className="btn btn-ghost"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          {copied === `post-${index}` ? (
                            <>
                              <CheckCircle2 size={16} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Caption */}
                    <div
                      style={{
                        background: 'rgba(255, 215, 0, 0.03)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '1rem',
                        whiteSpace: 'pre-wrap',
                        color: 'white',
                        lineHeight: 1.7,
                      }}
                    >
                      {post.caption}
                    </div>

                    {/* Hashtags */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sf-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        HASHTAGS
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {post.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(255, 215, 0, 0.1)',
                              border: '1px solid rgba(255, 215, 0, 0.3)',
                              borderRadius: '0.375rem',
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.875rem',
                              color: 'var(--sf-gold)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Regenerate Button */}
                <button onClick={generatePost} className="btn btn-ghost" style={{ width: '100%' }}>
                  <RefreshCw size={18} />
                  Generate New Variations
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card" style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'white' }}>How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Niche-Specific</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Our AI understands your industry and generates relevant content with appropriate hashtags.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Platform-Optimized</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Each post is tailored to the platform's best practices and character limits.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--sf-gold)', marginBottom: '0.5rem' }}>Multiple Variations</h4>
              <p style={{ color: 'var(--sf-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Get 3 different variations to choose from, or regenerate for more options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
