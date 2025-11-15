/**
 * 🔥 Enhanced AI Post Generator - SICK Edition
 *
 * Beautiful, production-ready AI content generation
 * with real-time quality preview and SFS Family Theme
 */

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Heart,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  Zap,
  Target,
  MessageSquare,
  Hash,
  Wand2,
  BarChart3,
  CheckCircle2,
  Star
} from 'lucide-react';
import {
  SFSCard,
  SFSButton,
  SFSBadge,
  ScoreCircle,
  SFSProgressBar,
  SFSInput,
  SFSSelect,
  LoadingSpinner,
  EmptyState,
  SFSAlert,
  StatCard
} from '../../components/SFSComponents';

interface GeneratedPost {
  id?: number;
  caption: string;
  hashtags: string[];
  hashtagArray?: string[];
  platform: string;
  score?: number;
  estimatedEngagement?: 'low' | 'medium' | 'high' | 'viral';
  tips?: string[];
  variationNumber?: number;
}

interface PostMetadata {
  generated: number;
  provider?: string | null;
  model?: string;
  subscriptionTier?: string;
  maxVariations?: number;
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
  'Health & Medical',
  'Sports & Recreation'
];

const platforms = [
  { value: 'instagram', label: '📸 Instagram', color: 'from-purple-600 to-pink-600' },
  { value: 'twitter', label: '🐦 Twitter/X', color: 'from-blue-400 to-blue-600' },
  { value: 'linkedin', label: '💼 LinkedIn', color: 'from-blue-600 to-blue-800' },
  { value: 'facebook', label: '👍 Facebook', color: 'from-blue-500 to-blue-700' },
  { value: 'tiktok', label: '🎵 TikTok', color: 'from-black to-cyan-500' },
  { value: 'youtube', label: '▶️ YouTube', color: 'from-red-600 to-red-700' },
  { value: 'pinterest', label: '📌 Pinterest', color: 'from-red-500 to-red-600' }
];

const tones = [
  { value: 'Professional', label: '💼 Professional', desc: 'Polished and authoritative' },
  { value: 'Casual', label: '😊 Casual', desc: 'Friendly and approachable' },
  { value: 'Funny', label: '😂 Funny', desc: 'Humorous and entertaining' },
  { value: 'Inspirational', label: '✨ Inspirational', desc: 'Motivating and uplifting' },
  { value: 'Educational', label: '📚 Educational', desc: 'Informative and teaching' }
];

export default function AIPostGeneratorEnhanced() {
  const [niche, setNiche] = useState('Tech & SaaS');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('Professional');
  const [topic, setTopic] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [numVariations, setNumVariations] = useState(3);

  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Stats
  const [stats, setStats] = useState({
    totalGenerated: 0,
    avgScore: 0,
    viralPosts: 0
  });

  // Calculate stats when posts change
  useEffect(() => {
    if (generatedPosts.length > 0) {
      const totalScore = generatedPosts.reduce((sum, post) => sum + (post.score || 0), 0);
      const viralCount = generatedPosts.filter(post => post.estimatedEngagement === 'viral').length;

      setStats({
        totalGenerated: generatedPosts.length,
        avgScore: Math.round(totalScore / generatedPosts.length),
        viralPosts: viralCount
      });
    }
  }, [generatedPosts]);

  const generatePosts = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic,
          platform,
          niche,
          tone,
          numVariations,
          brandVoice: brandVoice || undefined,
          targetAudience: targetAudience || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate posts');
      }

      if (data.success && data.posts) {
        setGeneratedPosts(data.posts);
        setMetadata(data.metadata);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (post: GeneratedPost, index: number) => {
    const text = `${post.caption}\n\n${(post.hashtagArray || post.hashtags).map(h => `#${h.replace('#', '')}`).join(' ')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(index);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleFavorite = (index: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(index)) {
        newFavorites.delete(index);
      } else {
        newFavorites.add(index);
      }
      return newFavorites;
    });
  };

  const downloadPost = (post: GeneratedPost, index: number) => {
    const text = `${post.caption}\n\n${(post.hashtagArray || post.hashtags).map(h => `#${h.replace('#', '')}`).join(' ')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-${platform}-${index + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedPlatform = platforms.find(p => p.value === platform);

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/40 backdrop-blur-xl">
            <Sparkles className="w-6 h-6 text-[#FFD700]" />
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#FFD700] via-[#FFED4E] to-[#FFA500] bg-clip-text text-transparent">
              AI Post Generator
            </h1>
            <Wand2 className="w-6 h-6 text-[#FFD700]" />
          </div>
          <p className="text-[#F5F5DC]/70 text-lg">
            Create viral-worthy social content in seconds with AI ✨
          </p>
          {metadata && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <SFSBadge variant="premium" icon={<Zap className="w-4 h-4" />}>
                {metadata.provider === 'openai' ? '🤖 GPT-4' : metadata.provider === 'anthropic' ? '🧠 Claude' : '✨ AI'}
              </SFSBadge>
              <SFSBadge variant="info">
                {metadata.subscriptionTier?.toUpperCase()} Plan
              </SFSBadge>
            </div>
          )}
        </div>

        {/* Stats Row (only show if posts generated) */}
        {generatedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Posts Generated"
              value={stats.totalGenerated}
              icon={<MessageSquare className="w-6 h-6" />}
              trend="up"
            />
            <StatCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              change={stats.avgScore - 60}
              icon={<BarChart3 className="w-6 h-6" />}
              trend={stats.avgScore >= 75 ? 'up' : 'neutral'}
            />
            <StatCard
              title="Viral Potential"
              value={stats.viralPosts}
              icon={<TrendingUp className="w-6 h-6" />}
              trend={stats.viralPosts > 0 ? 'up' : 'neutral'}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <SFSCard variant="premium" className="sticky top-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-[#FFD700]" />
                    <label className="text-sm font-bold text-[#F5F5DC]">Topic *</label>
                  </div>
                  <SFSInput
                    type="text"
                    placeholder="e.g., Launching our new AI feature..."
                    value={topic}
                    onChange={setTopic}
                    error={error}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-5 h-5 text-[#FFD700]" />
                    <label className="text-sm font-bold text-[#F5F5DC]">Platform *</label>
                  </div>
                  <SFSSelect
                    options={platforms.map(p => ({ value: p.value, label: p.label }))}
                    value={platform}
                    onChange={setPlatform}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-[#FFD700]" />
                    <label className="text-sm font-bold text-[#F5F5DC]">Niche *</label>
                  </div>
                  <SFSSelect
                    options={niches.map(n => ({ value: n, label: n }))}
                    value={niche}
                    onChange={setNiche}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-[#FFD700]" />
                    <label className="text-sm font-bold text-[#F5F5DC]">Tone *</label>
                  </div>
                  <SFSSelect
                    options={tones.map(t => ({ value: t.value, label: t.label }))}
                    value={tone}
                    onChange={setTone}
                  />
                  <p className="mt-1 text-xs text-[#F5F5DC]/50">
                    {tones.find(t => t.value === tone)?.desc}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#F5F5DC]">Variations</label>
                    <span className="text-sm text-[#FFD700]">{numVariations}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={metadata?.maxVariations || 10}
                    value={numVariations}
                    onChange={(e) => setNumVariations(parseInt(e.target.value))}
                    className="w-full h-2 bg-black/60 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${(numVariations / (metadata?.maxVariations || 10)) * 100}%, rgba(0,0,0,0.6) ${(numVariations / (metadata?.maxVariations || 10)) * 100}%, rgba(0,0,0,0.6) 100%)`
                    }}
                  />
                </div>

                {/* Advanced Options */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-[#FFD700] flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Advanced Options
                  </summary>
                  <div className="mt-4 space-y-4">
                    <SFSInput
                      type="text"
                      placeholder="Brand voice (optional)"
                      value={brandVoice}
                      onChange={setBrandVoice}
                    />
                    <SFSInput
                      type="text"
                      placeholder="Target audience (optional)"
                      value={targetAudience}
                      onChange={setTargetAudience}
                    />
                  </div>
                </details>

                <SFSButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  onClick={generatePosts}
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {loading ? 'Generating...' : 'Generate Posts'}
                </SFSButton>
              </div>
            </SFSCard>
          </div>

          {/* Right Column - Generated Posts */}
          <div className="lg:col-span-2">
            {generatedPosts.length === 0 && !loading ? (
              <SFSCard variant="elevated" className="h-full">
                <EmptyState
                  icon={<Sparkles className="w-12 h-12" />}
                  title="Ready to create amazing content?"
                  description="Fill in the form and click 'Generate Posts' to create AI-powered social media content that drives engagement."
                  action={
                    <SFSButton onClick={generatePosts} icon={<Wand2 className="w-5 h-5" />}>
                      Start Creating
                    </SFSButton>
                  }
                />
              </SFSCard>
            ) : loading ? (
              <SFSCard variant="elevated" className="h-full">
                <div className="flex flex-col items-center justify-center py-20">
                  <LoadingSpinner size="lg" className="mb-6" />
                  <p className="text-xl font-bold text-[#FFD700] mb-2">Crafting your perfect posts...</p>
                  <p className="text-[#F5F5DC]/60">This will only take a few seconds ✨</p>
                </div>
              </SFSCard>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <SFSAlert variant="success" title="Posts Generated!">
                  Created {generatedPosts.length} variations for {selectedPlatform?.label}. Pick your favorite or schedule them all!
                </SFSAlert>

                {/* Generated Posts Grid */}
                {generatedPosts.map((post, index) => (
                  <SFSCard
                    key={index}
                    variant={favorites.has(index) ? 'premium' : 'elevated'}
                    hover
                    className="relative overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <SFSBadge variant="gold">
                          #{index + 1}
                        </SFSBadge>
                        <SFSBadge variant={
                          post.estimatedEngagement === 'viral' ? 'premium' :
                          post.estimatedEngagement === 'high' ? 'success' :
                          post.estimatedEngagement === 'medium' ? 'warning' : 'info'
                        }>
                          {post.estimatedEngagement === 'viral' && '🔥 '}
                          {post.estimatedEngagement === 'high' && '✨ '}
                          {post.estimatedEngagement === 'medium' && '👍 '}
                          {post.estimatedEngagement?.toUpperCase() || 'GOOD'}
                        </SFSBadge>
                      </div>
                      <ScoreCircle score={post.score || 75} size="sm" showLabel={false} />
                    </div>

                    {/* Post Content */}
                    <div className="mb-4 p-4 bg-black/40 rounded-xl border border-[#FFD700]/10">
                      <p className="text-[#F5F5DC] whitespace-pre-wrap leading-relaxed">
                        {post.caption}
                      </p>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(post.hashtagArray || post.hashtags || []).slice(0, 10).map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-sm font-medium bg-[#FFD700]/10 text-[#FFD700] rounded-full border border-[#FFD700]/30"
                        >
                          #{tag.replace('#', '')}
                        </span>
                      ))}
                      {(post.hashtagArray || post.hashtags || []).length > 10 && (
                        <span className="px-3 py-1 text-sm font-medium text-[#F5F5DC]/60">
                          +{(post.hashtagArray || post.hashtags || []).length - 10} more
                        </span>
                      )}
                    </div>

                    {/* Tips */}
                    {post.tips && post.tips.length > 0 && (
                      <div className="mb-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                        <p className="text-xs font-semibold text-cyan-400 mb-2">💡 Pro Tips:</p>
                        <ul className="space-y-1">
                          {post.tips.map((tip, i) => (
                            <li key={i} className="text-xs text-cyan-300/80 flex items-start gap-2">
                              <span className="text-cyan-400">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Score Details */}
                    <div className="mb-4">
                      <SFSProgressBar
                        value={post.score || 75}
                        label="Quality Score"
                        variant="animated"
                        size="sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <SFSButton
                        variant={copiedId === index ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => copyToClipboard(post, index)}
                        icon={copiedId === index ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      >
                        {copiedId === index ? 'Copied!' : 'Copy'}
                      </SFSButton>

                      <SFSButton
                        variant={favorites.has(index) ? "primary" : "outline"}
                        size="sm"
                        onClick={() => toggleFavorite(index)}
                        icon={<Heart className={favorites.has(index) ? "w-4 h-4 fill-current" : "w-4 h-4"} />}
                      >
                        {favorites.has(index) ? 'Favorited' : 'Favorite'}
                      </SFSButton>

                      <SFSButton
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPost(post, index)}
                        icon={<Download className="w-4 h-4" />}
                      >
                        Download
                      </SFSButton>

                      <SFSButton
                        variant="ghost"
                        size="sm"
                        icon={<Calendar className="w-4 h-4" />}
                      >
                        Schedule
                      </SFSButton>
                    </div>
                  </SFSCard>
                ))}

                {/* Generate More Button */}
                <SFSButton
                  variant="secondary"
                  fullWidth
                  onClick={generatePosts}
                  icon={<RefreshCw className="w-5 h-5" />}
                  loading={loading}
                >
                  Generate More Variations
                </SFSButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
