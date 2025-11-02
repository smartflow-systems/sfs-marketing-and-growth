import { Router } from 'express';
import { db } from '../../db';
import { linkInBioPages, analyticsEvents } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Create bio page (protected)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { slug, title, bio, avatarUrl, theme, links, socialLinks, customCss } = req.body;

    if (!slug || !title || !links) {
      return res.status(400).json({ error: 'Slug, title, and links are required' });
    }

    // Check if slug is already taken
    const existing = await db.select().from(linkInBioPages).where(eq(linkInBioPages.slug, slug)).limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Slug already taken' });
    }

    // Create bio page
    const [newPage] = await db.insert(linkInBioPages).values({
      userId: req.userId!,
      slug,
      title,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      theme: theme || 'dark',
      links,
      socialLinks: socialLinks || null,
      customCss: customCss || null,
      views: 0,
      isPublic: true,
    }).returning();

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      eventType: 'bio_page_created',
      eventData: { slug, title },
    });

    res.status(201).json(newPage);
  } catch (error) {
    console.error('Create bio page error:', error);
    res.status(500).json({ error: 'Failed to create bio page' });
  }
});

// Get all bio pages for user (protected)
router.get('/my-pages', authenticate, async (req: AuthRequest, res) => {
  try {
    const pages = await db.select()
      .from(linkInBioPages)
      .where(eq(linkInBioPages.userId, req.userId!));

    res.json(pages);
  } catch (error) {
    console.error('Get bio pages error:', error);
    res.status(500).json({ error: 'Failed to get bio pages' });
  }
});

// Get bio page by slug (public)
router.get('/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const [page] = await db.select()
      .from(linkInBioPages)
      .where(and(
        eq(linkInBioPages.slug, slug),
        eq(linkInBioPages.isPublic, true)
      ))
      .limit(1);

    if (!page) {
      return res.status(404).json({ error: 'Bio page not found' });
    }

    // Increment view count
    await db.update(linkInBioPages)
      .set({ views: (page.views || 0) + 1 })
      .where(eq(linkInBioPages.id, page.id));

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: page.userId,
      eventType: 'bio_page_view',
      eventData: { slug, pageId: page.id },
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null,
    });

    res.json({
      ...page,
      views: (page.views || 0) + 1,
    });
  } catch (error) {
    console.error('Get bio page error:', error);
    res.status(500).json({ error: 'Failed to get bio page' });
  }
});

// Update bio page (protected)
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const pageId = parseInt(req.params.id);
    const { title, bio, avatarUrl, theme, links, socialLinks, customCss, isPublic } = req.body;

    const [existing] = await db.select()
      .from(linkInBioPages)
      .where(and(
        eq(linkInBioPages.id, pageId),
        eq(linkInBioPages.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Bio page not found' });
    }

    const [updated] = await db.update(linkInBioPages)
      .set({
        title: title !== undefined ? title : existing.title,
        bio: bio !== undefined ? bio : existing.bio,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
        theme: theme !== undefined ? theme : existing.theme,
        links: links !== undefined ? links : existing.links,
        socialLinks: socialLinks !== undefined ? socialLinks : existing.socialLinks,
        customCss: customCss !== undefined ? customCss : existing.customCss,
        isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(linkInBioPages.id, pageId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update bio page error:', error);
    res.status(500).json({ error: 'Failed to update bio page' });
  }
});

// Delete bio page (protected)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const pageId = parseInt(req.params.id);

    const [existing] = await db.select()
      .from(linkInBioPages)
      .where(and(
        eq(linkInBioPages.id, pageId),
        eq(linkInBioPages.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Bio page not found' });
    }

    await db.delete(linkInBioPages).where(eq(linkInBioPages.id, pageId));

    res.json({ success: true, message: 'Bio page deleted' });
  } catch (error) {
    console.error('Delete bio page error:', error);
    res.status(500).json({ error: 'Failed to delete bio page' });
  }
});

// Get bio page analytics (protected)
router.get('/:id/analytics', authenticate, async (req: AuthRequest, res) => {
  try {
    const pageId = parseInt(req.params.id);

    const [page] = await db.select()
      .from(linkInBioPages)
      .where(and(
        eq(linkInBioPages.id, pageId),
        eq(linkInBioPages.userId, req.userId!)
      ))
      .limit(1);

    if (!page) {
      return res.status(404).json({ error: 'Bio page not found' });
    }

    // Get view events
    const views = await db.select()
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'bio_page_view'),
        eq(analyticsEvents.userId, page.userId)
      ));

    // Filter for this page
    const pageViews = views.filter(view =>
      view.eventData && (view.eventData as any).pageId === pageId
    );

    res.json({
      page,
      totalViews: page.views || 0,
      recentViews: pageViews.slice(0, 20),
      viewsByDate: pageViews.reduce((acc: any, view) => {
        const date = view.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Get bio analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Check slug availability (public)
router.get('/check-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const existing = await db.select().from(linkInBioPages).where(eq(linkInBioPages.slug, slug)).limit(1);

    res.json({
      available: existing.length === 0,
      slug,
    });
  } catch (error) {
    console.error('Check slug error:', error);
    res.status(500).json({ error: 'Failed to check slug' });
  }
});

export default router;
