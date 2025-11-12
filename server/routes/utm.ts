import { Router } from 'express';
import { db } from '../../db';
import { utmLinks, analyticsEvents } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import QRCode from 'qrcode';
import crypto from 'crypto';

const router = Router();

// Generate short code for UTM link
function generateShortCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

// Create UTM link with QR code
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { url, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, campaignId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Build UTM URL
    const urlObj = new URL(url);
    if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
    if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
    if (utmTerm) urlObj.searchParams.set('utm_term', utmTerm);
    if (utmContent) urlObj.searchParams.set('utm_content', utmContent);

    const fullUrl = urlObj.toString();

    // Generate short code
    let shortCode = generateShortCode();
    let attempts = 0;

    // Ensure unique short code
    while (attempts < 5) {
      const existing = await db.select().from(utmLinks).where(eq(utmLinks.shortCode, shortCode)).limit(1);
      if (existing.length === 0) break;
      shortCode = generateShortCode();
      attempts++;
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create UTM link
    const [newLink] = await db.insert(utmLinks).values({
      userId: req.userId!,
      campaignId: campaignId || null,
      url: fullUrl,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmTerm: utmTerm || null,
      utmContent: utmContent || null,
      shortCode,
      qrCodeUrl: qrCodeDataUrl,
      clicks: 0,
    }).returning();

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      campaignId: campaignId || null,
      eventType: 'utm_link_created',
      eventData: { shortCode, utmSource, utmMedium, utmCampaign },
    });

    res.status(201).json(newLink);
  } catch (error) {
    console.error('Create UTM link error:', error);
    res.status(500).json({ error: 'Failed to create UTM link' });
  }
});

// Get all UTM links for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { campaignId } = req.query;

    let query = db.select().from(utmLinks).where(eq(utmLinks.userId, req.userId!));

    if (campaignId) {
      query = db.select().from(utmLinks).where(
        and(
          eq(utmLinks.userId, req.userId!),
          eq(utmLinks.campaignId, parseInt(campaignId as string))
        )
      );
    }

    const links = await query.orderBy(desc(utmLinks.createdAt));

    res.json(links);
  } catch (error) {
    console.error('Get UTM links error:', error);
    res.status(500).json({ error: 'Failed to get UTM links' });
  }
});

// Get single UTM link
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const linkId = parseInt(req.params.id);

    const [link] = await db.select()
      .from(utmLinks)
      .where(and(
        eq(utmLinks.id, linkId),
        eq(utmLinks.userId, req.userId!)
      ))
      .limit(1);

    if (!link) {
      return res.status(404).json({ error: 'UTM link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Get UTM link error:', error);
    res.status(500).json({ error: 'Failed to get UTM link' });
  }
});

// Redirect short code and track click (public endpoint)
router.get('/go/:shortCode', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { shortCode } = req.params;

    const [link] = await db.select()
      .from(utmLinks)
      .where(eq(utmLinks.shortCode, shortCode))
      .limit(1);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Increment click count
    await db.update(utmLinks)
      .set({ clicks: (link.clicks || 0) + 1 })
      .where(eq(utmLinks.id, link.id));

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: link.userId,
      campaignId: link.campaignId,
      eventType: 'utm_click',
      eventData: {
        shortCode,
        linkId: link.id,
        utmSource: link.utmSource,
        utmMedium: link.utmMedium,
        utmCampaign: link.utmCampaign,
      },
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null,
    });

    // Redirect
    res.redirect(link.url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Failed to redirect' });
  }
});

// Get link analytics
router.get('/:id/analytics', authenticate, async (req: AuthRequest, res) => {
  try {
    const linkId = parseInt(req.params.id);

    const [link] = await db.select()
      .from(utmLinks)
      .where(and(
        eq(utmLinks.id, linkId),
        eq(utmLinks.userId, req.userId!)
      ))
      .limit(1);

    if (!link) {
      return res.status(404).json({ error: 'UTM link not found' });
    }

    // Get click events
    const clicks = await db.select()
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'utm_click'),
        eq(analyticsEvents.userId, link.userId)
      ))
      .orderBy(desc(analyticsEvents.createdAt));

    // Filter clicks for this link
    const linkClicks = clicks.filter(click =>
      click.eventData && (click.eventData as any).linkId === linkId
    );

    res.json({
      link,
      totalClicks: link.clicks || 0,
      recentClicks: linkClicks.slice(0, 20),
      clicksByDate: linkClicks.reduce((acc: any, click) => {
        const date = click.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Get link analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Update UTM link
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const linkId = parseInt(req.params.id);
    const { campaignId } = req.body;

    const [existing] = await db.select()
      .from(utmLinks)
      .where(and(
        eq(utmLinks.id, linkId),
        eq(utmLinks.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'UTM link not found' });
    }

    const [updated] = await db.update(utmLinks)
      .set({
        campaignId: campaignId !== undefined ? campaignId : existing.campaignId,
      })
      .where(eq(utmLinks.id, linkId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update UTM link error:', error);
    res.status(500).json({ error: 'Failed to update UTM link' });
  }
});

// Delete UTM link
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const linkId = parseInt(req.params.id);

    const [existing] = await db.select()
      .from(utmLinks)
      .where(and(
        eq(utmLinks.id, linkId),
        eq(utmLinks.userId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'UTM link not found' });
    }

    await db.delete(utmLinks).where(eq(utmLinks.id, linkId));

    res.json({ success: true, message: 'UTM link deleted' });
  } catch (error) {
    console.error('Delete UTM link error:', error);
    res.status(500).json({ error: 'Failed to delete UTM link' });
  }
});

export default router;
