# ⚡ Quick Start: Real AI Content Generation

## 🎯 Goal
Replace placeholder AI with real OpenAI GPT-4 & Anthropic Claude integration in **1 week**.

---

## 📋 Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Get Anthropic API key from https://console.anthropic.com/
- [ ] Add keys to `.env` file
- [ ] Install additional packages if needed
- [ ] Test API connectivity

### Phase 2: Core AI Service (Days 2-3)
- [ ] Create `/server/services/ai-service.ts`
- [ ] Implement OpenAI integration
- [ ] Implement Anthropic integration
- [ ] Add error handling & fallbacks
- [ ] Add token usage tracking
- [ ] Add content moderation

### Phase 3: Integration (Days 4-5)
- [ ] Update `/server/routes/posts.ts` to use real AI
- [ ] Add platform-specific optimizations
- [ ] Implement hashtag generation
- [ ] Add image generation (DALL-E)
- [ ] Test all platforms (Instagram, Twitter, LinkedIn, etc.)

### Phase 4: Enhancement (Days 6-7)
- [ ] Add tone analysis
- [ ] Add content scoring
- [ ] Add variation quality ranking
- [ ] Add usage limits per subscription tier
- [ ] Update frontend to show AI status

---

## 🔧 Code Implementation Guide

### 1. Environment Variables

Add to `.env`:
```bash
# AI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
AI_PROVIDER=openai  # or "anthropic" or "auto"

# Optional: Advanced Settings
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_MODEL=claude-3-5-sonnet-20250215
MAX_TOKENS=2000
TEMPERATURE=0.7
```

---

### 2. Install Dependencies

```bash
npm install openai @anthropic-ai/sdk
```

Or add to `package.json`:
```json
{
  "dependencies": {
    "openai": "^4.28.0",
    "@anthropic-ai/sdk": "^0.17.0"
  }
}
```

---

### 3. Create AI Service

File: `/server/services/ai-service.ts`

```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface GeneratePostParams {
  topic: string;
  niche: string;
  platform: string;
  tone: string;
  numVariations?: number;
}

interface GeneratedPost {
  caption: string;
  hashtags: string[];
  platform: string;
  variationNumber: number;
  score?: number;
}

export class AIService {

  /**
   * Generate social media posts using AI
   */
  static async generatePosts(params: GeneratePostParams): Promise<GeneratedPost[]> {
    const { topic, niche, platform, tone, numVariations = 3 } = params;

    const provider = process.env.AI_PROVIDER || 'openai';

    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      return this.generateWithOpenAI(params);
    } else if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      return this.generateWithAnthropic(params);
    } else {
      throw new Error('No AI provider configured');
    }
  }

  /**
   * Generate posts using OpenAI GPT-4
   */
  private static async generateWithOpenAI(params: GeneratePostParams): Promise<GeneratedPost[]> {
    const { topic, niche, platform, tone, numVariations = 3 } = params;

    const prompt = this.buildPrompt(topic, niche, platform, tone, numVariations);

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert social media marketer specializing in ${niche}.
                     Create engaging, platform-optimized content that drives engagement.
                     Always include relevant hashtags and follow platform best practices.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        max_tokens: parseInt(process.env.MAX_TOKENS || '2000'),
        response_format: { type: 'json_object' }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');

      return this.formatPosts(response.posts || [], platform);

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate content with OpenAI');
    }
  }

  /**
   * Generate posts using Anthropic Claude
   */
  private static async generateWithAnthropic(params: GeneratePostParams): Promise<GeneratedPost[]> {
    const { topic, niche, platform, tone, numVariations = 3 } = params;

    const prompt = this.buildPrompt(topic, niche, platform, tone, numVariations);

    try {
      const message = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20250215',
        max_tokens: parseInt(process.env.MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
        messages: [
          {
            role: 'user',
            content: `You are an expert social media marketer specializing in ${niche}.

${prompt}

Return ONLY valid JSON in this exact format:
{
  "posts": [
    {
      "caption": "post text here",
      "hashtags": ["hashtag1", "hashtag2"],
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

      const response = JSON.parse(textContent.text);

      return this.formatPosts(response.posts || [], platform);

    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error('Failed to generate content with Claude');
    }
  }

  /**
   * Build platform-specific prompt
   */
  private static buildPrompt(
    topic: string,
    niche: string,
    platform: string,
    tone: string,
    numVariations: number
  ): string {
    const platformGuides = {
      instagram: {
        maxLength: 2200,
        hashtags: '10-30 hashtags',
        tips: 'Use line breaks, emojis, and call-to-action'
      },
      twitter: {
        maxLength: 280,
        hashtags: '1-2 hashtags',
        tips: 'Be concise, use threads for longer content'
      },
      linkedin: {
        maxLength: 3000,
        hashtags: '3-5 hashtags',
        tips: 'Professional tone, thought leadership, include questions'
      },
      facebook: {
        maxLength: 63206,
        hashtags: '1-3 hashtags',
        tips: 'Conversational, encourage sharing and comments'
      },
      tiktok: {
        maxLength: 2200,
        hashtags: '3-5 hashtags',
        tips: 'Trendy, use trending sounds/challenges'
      }
    };

    const guide = platformGuides[platform.toLowerCase() as keyof typeof platformGuides] || platformGuides.instagram;

    return `Create ${numVariations} unique, engaging social media posts about: "${topic}"

Platform: ${platform}
Niche: ${niche}
Tone: ${tone}
Max length: ${guide.maxLength} characters
Hashtags: ${guide.hashtags}
Best practices: ${guide.tips}

Requirements:
1. Each variation must be unique and creative
2. Optimize for ${platform} algorithm and audience
3. Include ${guide.hashtags} relevant to ${niche}
4. Use ${tone} tone throughout
5. Include call-to-action when appropriate
6. Add emojis naturally (not excessive)
7. Each post should drive engagement

Return ${numVariations} variations in JSON format:
{
  "posts": [
    {
      "caption": "the post text",
      "hashtags": ["tag1", "tag2"],
      "variationNumber": 1
    }
  ]
}`;
  }

  /**
   * Format and score posts
   */
  private static formatPosts(posts: any[], platform: string): GeneratedPost[] {
    return posts.map((post, index) => ({
      caption: post.caption || '',
      hashtags: post.hashtags || [],
      platform,
      variationNumber: post.variationNumber || index + 1,
      score: this.scorePost(post.caption, platform)
    }));
  }

  /**
   * Score post quality (0-100)
   */
  private static scorePost(caption: string, platform: string): number {
    let score = 50; // Base score

    // Length optimization
    const platformLengths = {
      twitter: { ideal: 200, max: 280 },
      instagram: { ideal: 150, max: 2200 },
      linkedin: { ideal: 1000, max: 3000 },
      facebook: { ideal: 400, max: 5000 },
      tiktok: { ideal: 100, max: 2200 }
    };

    const lengths = platformLengths[platform.toLowerCase() as keyof typeof platformLengths];
    if (lengths) {
      const length = caption.length;
      if (length >= lengths.ideal * 0.8 && length <= lengths.ideal * 1.2) {
        score += 15;
      } else if (length > lengths.max) {
        score -= 20;
      }
    }

    // Has question mark (drives engagement)
    if (caption.includes('?')) score += 10;

    // Has call-to-action words
    const ctaWords = ['click', 'link', 'comment', 'share', 'tag', 'follow', 'visit', 'check out'];
    if (ctaWords.some(word => caption.toLowerCase().includes(word))) score += 10;

    // Has emojis (but not too many)
    const emojiCount = (caption.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount >= 2 && emojiCount <= 5) score += 10;
    if (emojiCount > 10) score -= 15;

    // Has line breaks (readability)
    if (caption.includes('\n')) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate hashtags for a topic
   */
  static async generateHashtags(topic: string, niche: string, count: number = 10): Promise<string[]> {
    const provider = process.env.AI_PROVIDER || 'openai';

    const prompt = `Generate ${count} highly relevant, trending hashtags for a social media post about "${topic}" in the ${niche} niche.

Return only a JSON array of hashtags (without # symbol):
["hashtag1", "hashtag2", ...]`;

    try {
      if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 200
        });

        const response = completion.choices[0].message.content || '[]';
        return JSON.parse(response);
      }

      return [];
    } catch (error) {
      console.error('Hashtag generation error:', error);
      return [];
    }
  }

  /**
   * Analyze content sentiment and tone
   */
  static async analyzeTone(content: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    tone: string;
    readabilityScore: number;
  }> {
    // Simple implementation - can be enhanced with dedicated sentiment API
    const positiveWords = ['great', 'awesome', 'excellent', 'amazing', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing'];

    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerContent.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    if (negativeCount > positiveCount) sentiment = 'negative';

    // Simple readability score (Flesch Reading Ease approximation)
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));

    return {
      sentiment,
      tone: sentiment === 'positive' ? 'Optimistic' : sentiment === 'negative' ? 'Critical' : 'Balanced',
      readabilityScore: Math.round(readabilityScore)
    };
  }
}
```

---

### 4. Update Posts Route

File: `/server/routes/posts.ts`

Find the `/generate` endpoint and replace with:

```typescript
import { AIService } from '../services/ai-service';

router.post('/generate', requireSubscription(['free', 'pro', 'enterprise']), async (req, res) => {
  try {
    const { topic, niche, platform, tone, numVariations = 3 } = req.body;
    const userId = req.user!.id;

    // Validate input
    if (!topic || !niche || !platform || !tone) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields'
      });
    }

    // Check subscription limits
    const user = req.user!;
    const limits = {
      free: 10,      // 10 posts per day
      pro: 100,      // 100 posts per day
      enterprise: 1000  // 1000 posts per day
    };

    // TODO: Check daily usage against limit
    // const todayCount = await db.query...
    // if (todayCount >= limits[user.subscriptionTier]) {
    //   return res.status(429).json({ error: 'Daily limit reached' });
    // }

    // Generate posts with AI
    const posts = await AIService.generatePosts({
      topic,
      niche,
      platform,
      tone,
      numVariations: Math.min(numVariations, 5) // Max 5 variations
    });

    // Save to database
    const savedPosts = [];
    for (const post of posts) {
      const [saved] = await db.insert(aiPosts).values({
        userId,
        platform: post.platform,
        niche,
        tone,
        content: post.caption,
        hashtags: post.hashtags.join(' '),
        prompt: topic,
        isFavorite: false,
        isScheduled: false
      }).returning();

      savedPosts.push({
        ...post,
        id: saved.id
      });
    }

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId,
      eventType: 'ai_post_generated',
      eventData: { platform, niche, tone, count: posts.length }
    });

    res.json({
      ok: true,
      isAiGenerated: true,
      posts: savedPosts,
      usage: {
        provider: process.env.AI_PROVIDER || 'openai',
        model: process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL
      }
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to generate posts',
      isAiGenerated: false
    });
  }
});
```

---

### 5. Test the Integration

Create a test file: `/server/tests/ai-service.test.ts`

```typescript
import { AIService } from '../services/ai-service';

async function testAIService() {
  console.log('Testing AI Service...\n');

  try {
    // Test 1: Generate posts
    console.log('Test 1: Generating Instagram posts...');
    const posts = await AIService.generatePosts({
      topic: 'Launch of our new productivity app',
      niche: 'Tech & SaaS',
      platform: 'instagram',
      tone: 'Professional',
      numVariations: 3
    });

    console.log(`✅ Generated ${posts.length} posts`);
    posts.forEach((post, i) => {
      console.log(`\nPost ${i + 1} (Score: ${post.score}%):`);
      console.log(post.caption);
      console.log('Hashtags:', post.hashtags.join(' '));
    });

    // Test 2: Generate hashtags
    console.log('\n\nTest 2: Generating hashtags...');
    const hashtags = await AIService.generateHashtags('AI marketing tools', 'Tech & SaaS', 10);
    console.log('✅ Hashtags:', hashtags);

    // Test 3: Analyze tone
    console.log('\n\nTest 3: Analyzing tone...');
    const analysis = await AIService.analyzeTone(posts[0].caption);
    console.log('✅ Analysis:', analysis);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testAIService();
```

Run with:
```bash
tsx server/tests/ai-service.test.ts
```

---

## 🎯 Success Criteria

✅ Real AI content generates in < 5 seconds
✅ Content is platform-optimized and engaging
✅ Hashtags are relevant and trending
✅ Tone matches user selection
✅ Error handling for API failures
✅ Fallback to mock data if API down
✅ Usage tracking per subscription tier

---

## 📈 Expected Impact

- **User satisfaction**: +50% (real AI vs. mocks)
- **Feature usage**: +200% (users will use it more)
- **Upgrade rate**: +30% (free users see value, upgrade)
- **Retention**: +25% (sticky feature)

---

## 🚀 Next Steps After This

Once real AI is working:
1. Add image generation (DALL-E 3)
2. Add content calendar bulk generation
3. Add A/B test scoring
4. Add brand voice learning
5. Add competitor analysis

---

## 💡 Pro Tips

1. **Cache common requests** - Save API costs
2. **Batch processing** - Generate multiple posts in one call
3. **User feedback loop** - Let users rate posts, improve prompts
4. **Monitor usage** - Track API costs per user
5. **A/B test prompts** - Find what generates best content

---

Ready to implement? Let's start! 🚀
