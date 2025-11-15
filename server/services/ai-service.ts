/**
 * 🌟 SmartFlow AI Service
 *
 * Powerful AI content generation using OpenAI GPT-4 & Anthropic Claude
 * Part of the SmartFlow Marketing & Growth Platform
 *
 * Features:
 * - Multi-platform social post generation
 * - Platform-specific optimization
 * - Hashtag intelligence
 * - Content scoring & ranking
 * - Tone analysis
 * - Brand voice consistency
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
}) : null;

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface GeneratePostParams {
  topic: string;
  niche: string;
  platform: string;
  tone: string;
  numVariations?: number;
  brandVoice?: string;
  targetAudience?: string;
}

export interface GeneratedPost {
  caption: string;
  hashtags: string[];
  platform: string;
  variationNumber: number;
  score?: number;
  estimatedEngagement?: 'low' | 'medium' | 'high' | 'viral';
  tips?: string[];
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  tone: string;
  readabilityScore: number;
  engagementPotential: number;
  suggestions: string[];
}

export interface HashtagSuggestion {
  hashtag: string;
  relevance: number;
  popularity: 'trending' | 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
}

// ============================================================================
// Platform Configuration
// ============================================================================

const PLATFORM_CONFIG = {
  instagram: {
    maxLength: 2200,
    idealLength: 150,
    hashtagCount: { min: 10, max: 30 },
    tips: [
      'Use line breaks for readability',
      'Include 3-5 emojis naturally',
      'End with a call-to-action',
      'First line should hook attention',
      'Use carousel posts for tutorials'
    ],
    bestTimes: '10am-3pm, 7-9pm',
    contentTypes: ['Photo', 'Carousel', 'Reel', 'Story']
  },
  twitter: {
    maxLength: 280,
    idealLength: 200,
    hashtagCount: { min: 1, max: 2 },
    tips: [
      'Be concise and punchy',
      'Use threads for longer content',
      'Include relevant @mentions',
      'Ask questions to drive replies',
      'Use trending hashtags strategically'
    ],
    bestTimes: '12-1pm, 5-6pm',
    contentTypes: ['Text', 'Image', 'Video', 'Poll']
  },
  linkedin: {
    maxLength: 3000,
    idealLength: 1000,
    hashtagCount: { min: 3, max: 5 },
    tips: [
      'Lead with value or insight',
      'Use professional but conversational tone',
      'Include data or statistics',
      'Ask thought-provoking questions',
      'Tag relevant companies/people'
    ],
    bestTimes: '7-8am, 12pm, 5-6pm',
    contentTypes: ['Article', 'Post', 'Video', 'Document']
  },
  facebook: {
    maxLength: 63206,
    idealLength: 400,
    hashtagCount: { min: 1, max: 3 },
    tips: [
      'Conversational and friendly tone',
      'Encourage sharing and comments',
      'Use images or videos',
      'Create polls for engagement',
      'Go live for maximum reach'
    ],
    bestTimes: '1-4pm, 7-9pm',
    contentTypes: ['Post', 'Photo', 'Video', 'Live', 'Story']
  },
  tiktok: {
    maxLength: 2200,
    idealLength: 100,
    hashtagCount: { min: 3, max: 5 },
    tips: [
      'Use trending sounds and challenges',
      'Hook viewers in first 3 seconds',
      'Keep it authentic and fun',
      'Use text overlays strategically',
      'End with clear CTA'
    ],
    bestTimes: '6-10am, 7-11pm',
    contentTypes: ['Video', 'Duet', 'Stitch', 'Live']
  },
  youtube: {
    maxLength: 5000,
    idealLength: 200,
    hashtagCount: { min: 3, max: 15 },
    tips: [
      'Create clickable title',
      'Front-load keywords',
      'Include timestamps',
      'Add links to resources',
      'Use end screen suggestions'
    ],
    bestTimes: '2-4pm, 6-9pm',
    contentTypes: ['Video', 'Short', 'Live', 'Community Post']
  },
  pinterest: {
    maxLength: 500,
    idealLength: 100,
    hashtagCount: { min: 5, max: 20 },
    tips: [
      'Use vertical images (2:3 ratio)',
      'Include keywords naturally',
      'Create value-focused descriptions',
      'Add relevant boards',
      'Use rich pins when possible'
    ],
    bestTimes: '8-11pm',
    contentTypes: ['Pin', 'Idea Pin', 'Video Pin']
  }
} as const;

// ============================================================================
// Main AI Service Class
// ============================================================================

export class AIService {

  /**
   * 🎨 Generate AI-powered social media posts
   */
  static async generatePosts(params: GeneratePostParams): Promise<GeneratedPost[]> {
    const { numVariations = 3 } = params;
    const provider = this.getAvailableProvider();

    if (!provider) {
      // Fallback to enhanced mock data if no AI provider available
      console.warn('⚠️  No AI provider configured, using enhanced mock generation');
      return this.generateMockPosts(params);
    }

    try {
      if (provider === 'openai' && openai) {
        return await this.generateWithOpenAI(params);
      } else if (provider === 'anthropic' && anthropic) {
        return await this.generateWithAnthropic(params);
      }

      throw new Error('No AI provider available');
    } catch (error: any) {
      console.error('❌ AI generation error:', error.message);

      // Graceful fallback to mock data
      console.log('↩️  Falling back to mock generation');
      return this.generateMockPosts(params);
    }
  }

  /**
   * 🤖 Generate posts using OpenAI GPT-4
   */
  private static async generateWithOpenAI(params: GeneratePostParams): Promise<GeneratedPost[]> {
    if (!openai) throw new Error('OpenAI not configured');

    const { topic, niche, platform, tone, numVariations = 3, brandVoice, targetAudience } = params;
    const config = this.getPlatformConfig(platform);
    const prompt = this.buildPrompt(params);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert social media strategist specializing in ${niche}.
                   Your posts consistently drive high engagement and conversions.
                   You understand platform algorithms and audience psychology.
                   ${brandVoice ? `Brand voice: ${brandVoice}` : ''}
                   ${targetAudience ? `Target audience: ${targetAudience}` : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{"posts":[]}');
    const posts = this.formatPosts(response.posts || [], platform);

    console.log(`✅ Generated ${posts.length} posts with OpenAI (GPT-4)`);
    return posts;
  }

  /**
   * 🧠 Generate posts using Anthropic Claude
   */
  private static async generateWithAnthropic(params: GeneratePostParams): Promise<GeneratedPost[]> {
    if (!anthropic) throw new Error('Anthropic not configured');

    const { topic, niche, platform, tone, brandVoice, targetAudience } = params;
    const prompt = this.buildPrompt(params);

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20250215',
      max_tokens: 4000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: `You are an expert social media strategist specializing in ${niche}.
${brandVoice ? `Brand voice: ${brandVoice}\n` : ''}${targetAudience ? `Target audience: ${targetAudience}\n` : ''}
${prompt}

Return ONLY valid JSON with no markdown, in this exact format:
{
  "posts": [
    {
      "caption": "post text here",
      "hashtags": ["tag1", "tag2"],
      "variationNumber": 1
    }
  ]
}`
        }
      ]
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Extract JSON from response (Claude might include markdown)
    let jsonText = textContent.text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const response = JSON.parse(jsonText);
    const posts = this.formatPosts(response.posts || [], platform);

    console.log(`✅ Generated ${posts.length} posts with Anthropic (Claude)`);
    return posts;
  }

  /**
   * 📝 Build optimized prompt for AI
   */
  private static buildPrompt(params: GeneratePostParams): string {
    const { topic, niche, platform, tone, numVariations = 3 } = params;
    const config = this.getPlatformConfig(platform);

    return `Create ${numVariations} unique, high-engagement ${platform} posts about: "${topic}"

🎯 REQUIREMENTS:
- Platform: ${platform} (${config.contentTypes.join(', ')})
- Niche: ${niche}
- Tone: ${tone}
- Character limit: ${config.maxLength} (ideal: ${config.idealLength})
- Hashtags: ${config.hashtagCount.min}-${config.hashtagCount.max} relevant tags
- Best posting times: ${config.bestTimes}

✨ OPTIMIZATION TIPS:
${config.tips.map(tip => `• ${tip}`).join('\n')}

🎨 CONTENT GUIDELINES:
1. Each variation must be unique and creative
2. Optimize for ${platform} algorithm
3. Target ${niche} audience specifically
4. Use ${tone} tone consistently
5. Include call-to-action when appropriate
6. Add emojis naturally (not excessive)
7. Front-load the hook (first sentence grabs attention)
8. Drive engagement (likes, comments, shares)

📊 RETURN FORMAT (JSON):
{
  "posts": [
    {
      "caption": "the complete post text with emojis and formatting",
      "hashtags": ["tag1", "tag2", "tag3"],
      "variationNumber": 1
    }
  ]
}`;
  }

  /**
   * 🎭 Enhanced mock generation (when AI unavailable)
   */
  private static generateMockPosts(params: GeneratePostParams): GeneratedPost[] {
    const { topic, niche, platform, tone, numVariations = 3 } = params;
    const config = this.getPlatformConfig(platform);

    const posts: GeneratedPost[] = [];
    const toneEmojis = {
      Professional: '💼',
      Casual: '😊',
      Funny: '😂',
      Inspirational: '✨',
      Educational: '📚'
    };

    const emoji = toneEmojis[tone as keyof typeof toneEmojis] || '✨';

    for (let i = 0; i < numVariations; i++) {
      const hooks = [
        `${emoji} Exciting news about ${topic}!`,
        `Did you know? ${topic} is changing the game in ${niche}`,
        `Here's why ${topic} matters for ${niche} professionals`,
        `🔥 Hot take: ${topic} is the future of ${niche}`,
        `Let's talk about ${topic} and what it means for you`
      ];

      const ctas = [
        'What do you think? Drop a comment below! 👇',
        'Share this with someone who needs to see it! 🔄',
        'Save this for later! 🔖',
        'Follow for more insights like this! ➡️',
        'Tag a friend who would love this! 👥'
      ];

      const caption = `${hooks[i % hooks.length]}

This is a demonstration post generated for ${platform} in the ${niche} niche with a ${tone} tone.

Key points:
• Point 1 about ${topic}
• Point 2 about ${topic}
• Point 3 about ${topic}

${ctas[i % ctas.length]}`;

      const hashtags = [
        niche.replace(/[^a-zA-Z]/g, ''),
        platform.toLowerCase(),
        tone.toLowerCase(),
        'marketing',
        'growth',
        'content',
        topic.split(' ')[0]?.toLowerCase() || 'business'
      ].slice(0, Math.min(config.hashtagCount.max, 10));

      posts.push({
        caption,
        hashtags,
        platform,
        variationNumber: i + 1,
        score: this.scorePost(caption, platform),
        estimatedEngagement: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
        tips: config.tips.slice(0, 3)
      });
    }

    return posts;
  }

  /**
   * ✨ Format and score posts
   */
  private static formatPosts(posts: any[], platform: string): GeneratedPost[] {
    return posts.map((post, index) => {
      const score = this.scorePost(post.caption || '', platform);
      const engagement = this.estimateEngagement(score);

      return {
        caption: post.caption || '',
        hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
        platform,
        variationNumber: post.variationNumber || index + 1,
        score,
        estimatedEngagement: engagement,
        tips: this.getPlatformConfig(platform).tips.slice(0, 3)
      };
    });
  }

  /**
   * 📊 Score post quality (0-100)
   */
  private static scorePost(caption: string, platform: string): number {
    let score = 50;
    const config = this.getPlatformConfig(platform);
    const length = caption.length;

    // Length optimization (±15 points)
    if (length >= config.idealLength * 0.8 && length <= config.idealLength * 1.2) {
      score += 15;
    } else if (length > config.maxLength) {
      score -= 20;
    } else if (length < config.idealLength * 0.5) {
      score -= 10;
    }

    // Engagement triggers (+30 points total)
    if (caption.includes('?')) score += 10; // Question
    const ctaWords = ['click', 'link', 'comment', 'share', 'tag', 'follow', 'visit', 'check out', 'swipe'];
    if (ctaWords.some(word => caption.toLowerCase().includes(word))) score += 10; // CTA
    if (caption.includes('\n\n') || caption.includes('\n')) score += 5; // Line breaks
    if (/^[^.!?]+[.!?]/.test(caption)) score += 5; // Strong hook

    // Emoji usage (+10 or -15)
    const emojiCount = (caption.match(/[\u{1F000}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount >= 2 && emojiCount <= 5) score += 10;
    else if (emojiCount > 10) score -= 15;

    // Readability (+5)
    const sentences = caption.split(/[.!?]+/).length;
    const words = caption.split(/\s+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 📈 Estimate engagement potential
   */
  private static estimateEngagement(score: number): 'low' | 'medium' | 'high' | 'viral' {
    if (score >= 90) return 'viral';
    if (score >= 75) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * 🏷️ Generate smart hashtags
   */
  static async generateHashtags(
    topic: string,
    niche: string,
    platform: string,
    count: number = 10
  ): Promise<HashtagSuggestion[]> {
    const provider = this.getAvailableProvider();

    if (!provider) {
      return this.generateMockHashtags(topic, niche, count);
    }

    try {
      const prompt = `Generate ${count} highly relevant, trending hashtags for a ${platform} post about "${topic}" in the ${niche} niche.

Include a mix of:
- Trending hashtags (high volume, high competition)
- Niche-specific hashtags (medium volume, targetted audience)
- Long-tail hashtags (low competition, highly specific)

Return JSON:
{
  "hashtags": [
    {"tag": "hashtagname", "type": "trending|niche|longtail"}
  ]
}`;

      let response: any;

      if (provider === 'openai' && openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 300,
          response_format: { type: 'json_object' }
        });
        response = JSON.parse(completion.choices[0].message.content || '{"hashtags":[]}');
      } else if (provider === 'anthropic' && anthropic) {
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20250215',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        });
        const text = message.content[0].type === 'text' ? message.content[0].text : '{"hashtags":[]}';
        response = JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, ''));
      }

      return (response.hashtags || []).map((h: any) => ({
        hashtag: h.tag,
        relevance: Math.random() * 30 + 70,
        popularity: h.type === 'trending' ? 'trending' as const :
                    h.type === 'niche' ? 'high' as const : 'medium' as const,
        competition: h.type === 'trending' ? 'high' as const :
                     h.type === 'niche' ? 'medium' as const : 'low' as const
      }));
    } catch (error) {
      console.error('Hashtag generation error:', error);
      return this.generateMockHashtags(topic, niche, count);
    }
  }

  /**
   * 🏷️ Mock hashtag generation
   */
  private static generateMockHashtags(topic: string, niche: string, count: number): HashtagSuggestion[] {
    const baseWords = topic.toLowerCase().split(' ').filter(w => w.length > 3);
    const nicheWords = niche.toLowerCase().split(/[&\s]+/).filter(w => w.length > 3);

    const tags = [
      ...baseWords,
      ...nicheWords,
      'marketing',
      'business',
      'growth',
      'strategy',
      'tips',
      'success',
      '2025'
    ].slice(0, count);

    return tags.map((tag, i) => ({
      hashtag: tag.replace(/[^a-z0-9]/gi, ''),
      relevance: 90 - (i * 5),
      popularity: i < 2 ? 'trending' as const : i < 5 ? 'high' as const : 'medium' as const,
      competition: i < 2 ? 'high' as const : i < 5 ? 'medium' as const : 'low' as const
    }));
  }

  /**
   * 🔍 Analyze content
   */
  static async analyzeContent(content: string): Promise<ContentAnalysis> {
    const lowerContent = content.toLowerCase();

    // Sentiment analysis
    const positiveWords = ['great', 'awesome', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'wonderful', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing', 'poor', 'horrible'];

    const positiveCount = positiveWords.filter(w => lowerContent.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    if (negativeCount > positiveCount) sentiment = 'negative';

    // Readability
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));

    // Engagement potential
    const hasQuestion = content.includes('?');
    const hasEmojis = /[\u{1F000}-\u{1F9FF}]/u.test(content);
    const hasCTA = /click|share|comment|tag|follow|visit/i.test(content);
    const engagementPotential = (hasQuestion ? 30 : 0) + (hasEmojis ? 30 : 0) + (hasCTA ? 40 : 0);

    // Suggestions
    const suggestions: string[] = [];
    if (!hasQuestion) suggestions.push('Add a question to drive comments');
    if (!hasEmojis) suggestions.push('Include 2-3 emojis for visual appeal');
    if (!hasCTA) suggestions.push('Add a clear call-to-action');
    if (avgWordsPerSentence > 25) suggestions.push('Break up long sentences for readability');
    if (words < 50) suggestions.push('Consider adding more value/context');

    return {
      sentiment,
      tone: sentiment === 'positive' ? 'Optimistic' : sentiment === 'negative' ? 'Critical' : 'Balanced',
      readabilityScore: Math.round(readabilityScore),
      engagementPotential: Math.round(engagementPotential),
      suggestions
    };
  }

  /**
   * ⚙️ Helper: Get platform configuration
   */
  private static getPlatformConfig(platform: string) {
    const key = platform.toLowerCase() as keyof typeof PLATFORM_CONFIG;
    return PLATFORM_CONFIG[key] || PLATFORM_CONFIG.instagram;
  }

  /**
   * ⚙️ Helper: Get available AI provider
   */
  private static getAvailableProvider(): 'openai' | 'anthropic' | null {
    const preferred = process.env.AI_PROVIDER?.toLowerCase();

    if (preferred === 'openai' && openai) return 'openai';
    if (preferred === 'anthropic' && anthropic) return 'anthropic';
    if (openai) return 'openai';
    if (anthropic) return 'anthropic';

    return null;
  }

  /**
   * 🔍 Check AI service status
   */
  static getStatus() {
    return {
      openai: {
        configured: !!openai,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      },
      anthropic: {
        configured: !!anthropic,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20250215'
      },
      activeProvider: this.getAvailableProvider(),
      fallbackMode: !this.getAvailableProvider()
    };
  }
}
