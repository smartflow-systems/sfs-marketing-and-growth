import { Router } from 'express';
import { db } from '../../db';
import { aiPosts, analyticsEvents } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, requireSubscription, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate AI post
router.post('/generate', requireSubscription(['pro', 'enterprise', 'free']), async (req: AuthRequest, res) => {
  try {
    const { platform, niche, tone, prompt, campaignId } = req.body;

    if (!platform || !prompt) {
      return res.status(400).json({ error: 'Platform and prompt are required' });
    }

    // Check if user has OpenAI configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    // Generate AI content (placeholder - integrate with OpenAI API)
    const content = await generateAIContent(prompt, platform, niche, tone);
    const hashtags = await generateHashtags(niche, platform);

    // Save post
    const [newPost] = await db.insert(aiPosts).values({
      userId: req.userId!,
      campaignId: campaignId || null,
      platform,
      niche: niche || null,
      tone: tone || null,
      content,
      hashtags,
      prompt,
      isFavorite: false,
      isScheduled: false,
    }).returning();

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      campaignId: campaignId || null,
      eventType: 'ai_post_generated',
      eventData: { platform, niche, tone },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Generate AI post error:', error);
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

// Helper function to generate AI content
async function generateAIContent(prompt: string, platform: string, niche?: string, tone?: string): Promise<string> {
  // This is a placeholder. In production, integrate with OpenAI API:
  /*
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: `You are a social media expert. Create engaging ${platform} content for the ${niche} niche with a ${tone} tone.`
    }, {
      role: "user",
      content: prompt
    }],
    max_tokens: 500
  });
  return response.choices[0].message.content;
  */

  return `🚀 ${prompt}\n\nGenerated for ${platform} with ${tone || 'professional'} tone in the ${niche || 'general'} niche.\n\n[AI-generated content placeholder - integrate OpenAI API for production]`;
}

// Helper function to generate hashtags
async function generateHashtags(niche?: string, platform?: string): Promise<string> {
  // Placeholder - could use OpenAI or predefined hashtag sets
  const commonHashtags = ['#marketing', '#growth', '#business', '#entrepreneur'];
  return commonHashtags.slice(0, 3).join(' ');
}

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
