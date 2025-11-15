import { Router } from 'express';
import { db } from '../../db';
import { aiPosts, analyticsEvents } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, requireSubscription, AuthRequest } from '../middleware/auth';
import { AIService } from '../services/ai-service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ✨ Generate AI posts with real OpenAI/Claude integration
router.post('/generate', requireSubscription(['pro', 'enterprise', 'free']), async (req: AuthRequest, res) => {
  try {
    const { topic, platform, niche, tone, numVariations, campaignId, brandVoice, targetAudience } = req.body;

    // Validate required fields
    if (!topic || !platform || !niche || !tone) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['topic', 'platform', 'niche', 'tone']
      });
    }

    // Check subscription limits
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, req.userId!)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Subscription tier limits (posts per generation)
    const limits = {
      free: 3,        // 3 variations max
      pro: 5,         // 5 variations max
      enterprise: 10  // 10 variations max
    };

    const maxVariations = limits[user.subscriptionTier as keyof typeof limits] || 3;
    const requestedVariations = Math.min(numVariations || 3, maxVariations);

    console.log(`🎨 Generating ${requestedVariations} AI posts for ${user.email}...`);

    // Generate AI posts using our powerhouse AI service
    const generatedPosts = await AIService.generatePosts({
      topic,
      niche,
      platform,
      tone,
      numVariations: requestedVariations,
      brandVoice,
      targetAudience
    });

    console.log(`✅ Successfully generated ${generatedPosts.length} posts`);

    // Save all posts to database
    const savedPosts = [];
    for (const post of generatedPosts) {
      const [saved] = await db.insert(aiPosts).values({
        userId: req.userId!,
        campaignId: campaignId || null,
        platform: post.platform,
        niche,
        tone,
        content: post.caption,
        hashtags: post.hashtags.join(' '),
        prompt: topic,
        isFavorite: false,
        isScheduled: false,
      }).returning();

      savedPosts.push({
        ...saved,
        score: post.score,
        estimatedEngagement: post.estimatedEngagement,
        tips: post.tips,
        hashtagArray: post.hashtags
      });
    }

    // Track analytics event
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      campaignId: campaignId || null,
      eventType: 'ai_post_generated',
      eventData: {
        platform,
        niche,
        tone,
        count: generatedPosts.length,
        provider: AIService.getStatus().activeProvider
      },
    });

    // Return response with AI metadata
    const status = AIService.getStatus();
    res.status(201).json({
      success: true,
      posts: savedPosts,
      metadata: {
        generated: savedPosts.length,
        provider: status.activeProvider,
        model: status.activeProvider === 'openai' ? status.openai.model : status.anthropic.model,
        subscriptionTier: user.subscriptionTier,
        maxVariations
      }
    });

  } catch (error: any) {
    console.error('❌ Generate AI post error:', error);
    res.status(500).json({
      error: 'Failed to generate posts',
      message: error.message,
      fallback: 'Try again or contact support'
    });
  }
});

// 🏷️ Generate smart hashtags endpoint
router.post('/hashtags', requireSubscription(['pro', 'enterprise', 'free']), async (req: AuthRequest, res) => {
  try {
    const { topic, niche, platform, count = 10 } = req.body;

    if (!topic || !niche) {
      return res.status(400).json({ error: 'Topic and niche are required' });
    }

    const hashtags = await AIService.generateHashtags(topic, niche, platform || 'instagram', count);

    res.json({
      success: true,
      hashtags,
      count: hashtags.length
    });
  } catch (error: any) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({ error: 'Failed to generate hashtags' });
  }
});

// 🔍 Analyze content endpoint
router.post('/analyze', requireSubscription(['pro', 'enterprise', 'free']), async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const analysis = await AIService.analyzeContent(content);

    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Content analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
});

// 📊 Get AI service status
router.get('/ai-status', async (req: AuthRequest, res) => {
  try {
    const status = AIService.getStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

// Get all posts for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { campaignId, platform, isFavorite } = req.query;

    let conditions = [eq(aiPosts.userId, req.userId!)];

    if (campaignId) {
      conditions.push(eq(aiPosts.campaignId, parseInt(campaignId as string)));
    }
    if (platform) {
      conditions.push(eq(aiPosts.platform, platform as string));
    }
    if (isFavorite === 'true') {
      conditions.push(eq(aiPosts.isFavorite, true));
    }

    const posts = await db.select()
      .from(aiPosts)
      .where(and(...conditions))
      .orderBy(desc(aiPosts.createdAt));

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get single post
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);

    const [post] = await db.select()
      .from(aiPosts)
      .where(and(
        eq(aiPosts.id, postId),
        eq(aiPosts.userId, req.userId!)
      ))
      .limit(1);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Update post
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content, hashtags, isFavorite, campaignId } = req.body;

    const [existing] = await db.select()
      .from(aiPosts)
      .where(and(
        eq(aiPosts.id, postId),
        eq(aiPosts.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [updated] = await db.update(aiPosts)
      .set({
        content: content !== undefined ? content : existing.content,
        hashtags: hashtags !== undefined ? hashtags : existing.hashtags,
        isFavorite: isFavorite !== undefined ? isFavorite : existing.isFavorite,
        campaignId: campaignId !== undefined ? campaignId : existing.campaignId,
      })
      .where(eq(aiPosts.id, postId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Schedule post
router.post('/:id/schedule', async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { scheduledFor } = req.body;

    if (!scheduledFor) {
      return res.status(400).json({ error: 'scheduledFor date is required' });
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate < new Date()) {
      return res.status(400).json({ error: 'Cannot schedule in the past' });
    }

    const [existing] = await db.select()
      .from(aiPosts)
      .where(and(
        eq(aiPosts.id, postId),
        eq(aiPosts.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [updated] = await db.update(aiPosts)
      .set({
        isScheduled: true,
        scheduledFor: scheduledDate,
      })
      .where(eq(aiPosts.id, postId))
      .returning();

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      campaignId: existing.campaignId,
      eventType: 'post_scheduled',
      eventData: {
        postId,
        platform: existing.platform,
        scheduledFor: scheduledDate.toISOString(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Schedule post error:', error);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

// Delete post
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id);

    const [existing] = await db.select()
      .from(aiPosts)
      .where(and(
        eq(aiPosts.id, postId),
        eq(aiPosts.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await db.delete(aiPosts).where(eq(aiPosts.id, postId));

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get scheduled posts
router.get('/scheduled/upcoming', async (req: AuthRequest, res) => {
  try {
    const posts = await db.select()
      .from(aiPosts)
      .where(and(
        eq(aiPosts.userId, req.userId!),
        eq(aiPosts.isScheduled, true)
      ))
      .orderBy(aiPosts.scheduledFor);

    res.json(posts);
  } catch (error) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({ error: 'Failed to get scheduled posts' });
  }
});

export default router;
