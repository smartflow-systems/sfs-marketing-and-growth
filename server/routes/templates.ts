import { Router } from 'express';
import { db } from '../../db';
import { templates, templatePurchases, users, analyticsEvents } from '../../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Browse templates (public with optional auth)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { type, category, featured } = req.query;

    let conditions = [eq(templates.isActive, true)];

    if (type) {
      conditions.push(eq(templates.type, type as string));
    }
    if (category) {
      conditions.push(eq(templates.category, category as string));
    }
    if (featured === 'true') {
      conditions.push(eq(templates.isFeatured, true));
    }

    const templateList = await db.select()
      .from(templates)
      .where(and(...conditions))
      .orderBy(desc(templates.isFeatured), desc(templates.downloads));

    res.json(templateList);
  } catch (error) {
    console.error('Browse templates error:', error);
    res.status(500).json({ error: 'Failed to browse templates' });
  }
});

// Get single template (public)
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const templateId = parseInt(req.params.id);

    const [template] = await db.select()
      .from(templates)
      .where(and(
        eq(templates.id, templateId),
        eq(templates.isActive, true)
      ))
      .limit(1);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get creator info
    let creator = null;
    if (template.creatorId) {
      const [creatorData] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
      }).from(users).where(eq(users.id, template.creatorId)).limit(1);

      creator = creatorData;
    }

    res.json({
      ...template,
      creator,
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Create template (protected - for creators)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, name, description, category, price, content, preview } = req.body;

    if (!type || !name || !content) {
      return res.status(400).json({ error: 'Type, name, and content are required' });
    }

    const [newTemplate] = await db.insert(templates).values({
      creatorId: req.userId!,
      type,
      name,
      description: description || null,
      category: category || null,
      price: price || 0,
      content,
      preview: preview || null,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      isFeatured: false,
      isActive: true,
    }).returning();

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: req.userId!,
      eventType: 'template_created',
      eventData: { templateId: newTemplate.id, type, name },
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Purchase template (protected)
router.post('/:id/purchase', authenticate, async (req: AuthRequest, res) => {
  try {
    const templateId = parseInt(req.params.id);

    const [template] = await db.select()
      .from(templates)
      .where(and(
        eq(templates.id, templateId),
        eq(templates.isActive, true)
      ))
      .limit(1);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if already purchased
    const existing = await db.select()
      .from(templatePurchases)
      .where(and(
        eq(templatePurchases.userId, req.userId!),
        eq(templatePurchases.templateId, templateId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Template already purchased' });
    }

    // If free, just create purchase record
    if (template.price === 0) {
      const [purchase] = await db.insert(templatePurchases).values({
        userId: req.userId!,
        templateId,
        amount: 0,
      }).returning();

      // Increment downloads
      await db.update(templates)
        .set({ downloads: (template.downloads || 0) + 1 })
        .where(eq(templates.id, templateId));

      // Track analytics
      await db.insert(analyticsEvents).values({
        userId: req.userId!,
        eventType: 'template_downloaded',
        eventData: { templateId, templateName: template.name, price: 0 },
      });

      return res.json({
        purchase,
        template,
      });
    }

    // For paid templates, create Stripe checkout session
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId || undefined,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: template.name,
            description: template.description || undefined,
          },
          unit_amount: template.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/templates/${templateId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/templates/${templateId}`,
      metadata: {
        userId: req.userId!.toString(),
        templateId: templateId.toString(),
      },
    });

    res.json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error('Purchase template error:', error);
    res.status(500).json({ error: 'Failed to purchase template' });
  }
});

// Get my purchases (protected)
router.get('/my-purchases/all', authenticate, async (req: AuthRequest, res) => {
  try {
    const purchases = await db.select({
      purchase: templatePurchases,
      template: templates,
    })
      .from(templatePurchases)
      .leftJoin(templates, eq(templatePurchases.templateId, templates.id))
      .where(eq(templatePurchases.userId, req.userId!))
      .orderBy(desc(templatePurchases.purchasedAt));

    res.json(purchases);
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// Get my created templates (protected)
router.get('/my-templates/all', authenticate, async (req: AuthRequest, res) => {
  try {
    const myTemplates = await db.select()
      .from(templates)
      .where(eq(templates.creatorId, req.userId!))
      .orderBy(desc(templates.createdAt));

    res.json(myTemplates);
  } catch (error) {
    console.error('Get my templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Update template (protected - creator only)
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { name, description, category, price, content, preview, isActive } = req.body;

    const [existing] = await db.select()
      .from(templates)
      .where(and(
        eq(templates.id, templateId),
        eq(templates.creatorId, req.userId!)
      ))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Template not found or unauthorized' });
    }

    const [updated] = await db.update(templates)
      .set({
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        category: category !== undefined ? category : existing.category,
        price: price !== undefined ? price : existing.price,
        content: content !== undefined ? content : existing.content,
        preview: preview !== undefined ? preview : existing.preview,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, templateId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Rate template (protected)
router.post('/:id/rate', authenticate, async (req: AuthRequest, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const [template] = await db.select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if user purchased
    const purchase = await db.select()
      .from(templatePurchases)
      .where(and(
        eq(templatePurchases.userId, req.userId!),
        eq(templatePurchases.templateId, templateId)
      ))
      .limit(1);

    if (purchase.length === 0) {
      return res.status(403).json({ error: 'Must purchase template before rating' });
    }

    // Update rating (simple average - in production, track individual ratings)
    const currentRating = template.rating || 0;
    const currentCount = template.ratingCount || 0;
    const newCount = currentCount + 1;
    const newRating = Math.round(((currentRating * currentCount) + rating) / newCount);

    await db.update(templates)
      .set({
        rating: newRating,
        ratingCount: newCount,
      })
      .where(eq(templates.id, templateId));

    res.json({
      success: true,
      newRating,
      ratingCount: newCount,
    });
  } catch (error) {
    console.error('Rate template error:', error);
    res.status(500).json({ error: 'Failed to rate template' });
  }
});

export default router;
