import { Router } from 'express';
import { db } from '../../db';
import { calendarEvents } from '../../db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/calendar
 * Get all calendar events for the current user
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { campaignId, startDate, endDate } = req.query;

    let query = db.select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, req.userId!));

    // Filter by campaign if provided
    if (campaignId) {
      query = query.where(
        and(
          eq(calendarEvents.userId, req.userId!),
          eq(calendarEvents.campaignId, parseInt(campaignId as string))
        )
      ) as any;
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(calendarEvents.userId, req.userId!),
          gte(calendarEvents.startDate, new Date(startDate as string)),
          lte(calendarEvents.endDate, new Date(endDate as string))
        )
      ) as any;
    }

    const events = await query.orderBy(desc(calendarEvents.startDate));

    res.json(events);
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to get calendar events' });
  }
});

/**
 * POST /api/calendar
 * Create a new calendar event
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { campaignId, title, description, startDate, endDate, eventType, metadata } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ error: 'Title and start date are required' });
    }

    const [event] = await db.insert(calendarEvents).values({
      userId: req.userId!,
      campaignId: campaignId || null,
      title,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      eventType: eventType || 'custom',
      metadata: metadata || null,
    }).returning();

    res.status(201).json(event);
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

/**
 * GET /api/calendar/:id
 * Get a single calendar event
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const [event] = await db.select()
      .from(calendarEvents)
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.userId, req.userId!)
      ))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get calendar event error:', error);
    res.status(500).json({ error: 'Failed to get calendar event' });
  }
});

/**
 * PATCH /api/calendar/:id
 * Update a calendar event
 */
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { title, description, startDate, endDate, eventType, metadata } = req.body;

    const updates: any = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (startDate) updates.startDate = new Date(startDate);
    if (endDate) updates.endDate = new Date(endDate);
    if (eventType) updates.eventType = eventType;
    if (metadata !== undefined) updates.metadata = metadata;

    const [updatedEvent] = await db.update(calendarEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.userId, req.userId!)
      ))
      .returning();

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

/**
 * DELETE /api/calendar/:id
 * Delete a calendar event
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const [deletedEvent] = await db.delete(calendarEvents)
      .where(and(
        eq(calendarEvents.id, eventId),
        eq(calendarEvents.userId, req.userId!)
      ))
      .returning();

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json({ success: true, message: 'Calendar event deleted' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

export default router;
