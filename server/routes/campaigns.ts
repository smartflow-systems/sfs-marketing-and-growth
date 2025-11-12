import { Router } from 'express';
import { db } from '../../db';
import { campaigns, utmLinks, aiPosts, calendarEvents, analyticsEvents } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all campaigns for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userCampaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.userId, req.userId!))
      .orderBy(desc(campaigns.createdAt));

    res.json(userCampaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Get single campaign with details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    const [campaign] = await db.select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, campaignId),
        eq(campaigns.userId, req.userId!)
      ))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get related data
    const [links, posts, events] = await Promise.all([
      db.select().from(utmLinks).where(eq(utmLinks.campaignId, campaignId)),
      db.select().from(aiPosts).where(eq(aiPosts.campaignId, campaignId)),
      db.select().from(calendarEvents).where(eq(calendarEvents.campaignId, campaignId)),
    ]);

    res.json({
      ...campaign,
      utmLinks: links,
      aiPosts: posts,
      events,
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to get campaign' });
  }
});

// Create campaign
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, description, startDate, endDate, budget, status, metadata } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }

    const [newCampaign] = await db.insert(campaigns).values({
      userId: req.userId!,
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget || null,
      status: status || 'draft',
      metadata: metadata || null,
    }).returning();

    // Track analytics event
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      campaignId: newCampaign.id,
      eventType: 'campaign_created',
      eventData: { campaignName: name },
    });

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { name, description, startDate, endDate, budget, status, metadata } = req.body;

    // Verify ownership
    const [existing] = await db.select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, campaignId),
        eq(campaigns.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const [updated] = await db.update(campaigns)
      .set({
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        budget: budget !== undefined ? budget : existing.budget,
        status: status || existing.status,
        metadata: metadata !== undefined ? metadata : existing.metadata,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    // Verify ownership
    const [existing] = await db.select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, campaignId),
        eq(campaigns.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await db.delete(campaigns).where(eq(campaigns.id, campaignId));

    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Get campaign analytics
router.get('/:id/analytics', async (req: AuthRequest, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    // Verify ownership
    const [campaign] = await db.select()
      .from(campaigns)
      .where(and(
        eq(campaigns.id, campaignId),
        eq(campaigns.userId, req.userId!)
      ))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get all analytics events for this campaign
    const events = await db.select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.campaignId, campaignId))
      .orderBy(desc(analyticsEvents.createdAt));

    // Get UTM link stats
    const links = await db.select()
      .from(utmLinks)
      .where(eq(utmLinks.campaignId, campaignId));

    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);

    // Get post stats
    const posts = await db.select()
      .from(aiPosts)
      .where(eq(aiPosts.campaignId, campaignId));

    res.json({
      campaign,
      analytics: {
        totalUtmLinks: links.length,
        totalClicks,
        totalPosts: posts.length,
        scheduledPosts: posts.filter(p => p.isScheduled).length,
        events: events.length,
        eventsByType: events.reduce((acc: any, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        }, {}),
      },
      recentEvents: events.slice(0, 10),
    });
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
