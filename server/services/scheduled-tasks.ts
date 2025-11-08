import cron from 'node-cron';
import { db } from '../../db';
import { aiPosts, users, campaigns, utmLinks, analyticsEvents } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { emailService } from './email';

/**
 * Scheduled Tasks Service
 *
 * Handles recurring background jobs:
 * - Check for upcoming scheduled posts (every 15 minutes)
 * - Send weekly analytics digest (Mondays at 9 AM)
 */

class ScheduledTasksService {
  private isRunning = false;

  /**
   * Initialize all scheduled tasks
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduled tasks already running');
      return;
    }

    console.log('🕐 Starting scheduled tasks...');

    // Check for upcoming posts every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.checkUpcomingPosts().catch(err => {
        console.error('Error checking upcoming posts:', err);
      });
    });

    // Send weekly digest every Monday at 9 AM
    cron.schedule('0 9 * * 1', () => {
      this.sendWeeklyDigests().catch(err => {
        console.error('Error sending weekly digests:', err);
      });
    });

    this.isRunning = true;
    console.log('✅ Scheduled tasks started');
  }

  /**
   * Check for posts scheduled in the next hour and send reminders
   */
  private async checkUpcomingPosts() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find posts scheduled in the next hour that haven't been reminded yet
      const upcomingPosts = await db.select({
        post: aiPosts,
        user: users,
      })
        .from(aiPosts)
        .innerJoin(users, eq(aiPosts.userId, users.id))
        .where(
          and(
            eq(aiPosts.status, 'scheduled'),
            gte(aiPosts.scheduledFor, now),
            lte(aiPosts.scheduledFor, oneHourFromNow)
          )
        );

      console.log(`📬 Found ${upcomingPosts.length} posts scheduled in the next hour`);

      for (const { post, user } of upcomingPosts) {
        // Check if we've already sent a reminder for this post
        const [existingReminder] = await db.select()
          .from(analyticsEvents)
          .where(
            and(
              eq(analyticsEvents.userId, user.id),
              eq(analyticsEvents.eventType, 'post_reminder_sent'),
              sql`${analyticsEvents.eventData}->>'postId' = ${post.id.toString()}`
            )
          )
          .limit(1);

        if (existingReminder) {
          continue; // Already sent reminder for this post
        }

        // Send reminder email
        const platforms = post.platforms || ['social media'];
        await emailService.sendScheduledPostReminder(
          user.email,
          post.title || 'Untitled Post',
          post.scheduledFor!,
          platforms
        );

        // Track that we sent the reminder
        await db.insert(analyticsEvents).values({
          userId: user.id,
          campaignId: post.campaignId,
          eventType: 'post_reminder_sent',
          eventData: {
            postId: post.id,
            scheduledFor: post.scheduledFor,
          },
        });

        console.log(`✉️  Sent reminder to ${user.email} for post: ${post.title}`);
      }
    } catch (error) {
      console.error('Error in checkUpcomingPosts:', error);
      throw error;
    }
  }

  /**
   * Send weekly analytics digest to all active users
   */
  private async sendWeeklyDigests() {
    try {
      // Get all users with active subscriptions
      const activeUsers = await db.select()
        .from(users)
        .where(eq(users.subscriptionStatus, 'active'));

      console.log(`📊 Sending weekly digests to ${activeUsers.length} active users`);

      for (const user of activeUsers) {
        try {
          // Calculate date range (last 7 days)
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

          // Get user's campaigns
          const userCampaigns = await db.select()
            .from(campaigns)
            .where(eq(campaigns.userId, user.id));

          if (userCampaigns.length === 0) {
            continue; // Skip users with no campaigns
          }

          // Get weekly stats
          const [clickStats] = await db.select({
            totalClicks: sql<number>`COALESCE(SUM(${utmLinks.clicks}), 0)`,
          })
            .from(utmLinks)
            .where(
              and(
                eq(utmLinks.userId, user.id),
                gte(utmLinks.createdAt, startDate)
              )
            );

          const [postStats] = await db.select({
            totalPosts: sql<number>`COUNT(*)`,
          })
            .from(aiPosts)
            .where(
              and(
                eq(aiPosts.userId, user.id),
                gte(aiPosts.createdAt, startDate)
              )
            );

          const [eventStats] = await db.select({
            totalEngagement: sql<number>`COUNT(*)`,
          })
            .from(analyticsEvents)
            .where(
              and(
                eq(analyticsEvents.userId, user.id),
                gte(analyticsEvents.createdAt, startDate),
                sql`${analyticsEvents.eventType} IN ('utm_click', 'bio_page_view', 'template_view')`
              )
            );

          // Get previous week stats for comparison
          const previousWeekStart = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          const [prevClickStats] = await db.select({
            totalClicks: sql<number>`COALESCE(SUM(${utmLinks.clicks}), 0)`,
          })
            .from(utmLinks)
            .where(
              and(
                eq(utmLinks.userId, user.id),
                gte(utmLinks.createdAt, previousWeekStart),
                lte(utmLinks.createdAt, startDate)
              )
            );

          // Calculate week-over-week growth
          const currentClicks = Number(clickStats?.totalClicks || 0);
          const previousClicks = Number(prevClickStats?.totalClicks || 0);
          const weekOverWeekGrowth = previousClicks > 0
            ? Math.round(((currentClicks - previousClicks) / previousClicks) * 100)
            : 0;

          // Find top campaign
          const topCampaign = userCampaigns.length > 0
            ? userCampaigns[0].name
            : 'No campaigns';

          // Send digest email
          await emailService.sendWeeklyDigest(user.email, {
            totalClicks: currentClicks,
            totalPosts: Number(postStats?.totalPosts || 0),
            totalEngagement: Number(eventStats?.totalEngagement || 0),
            topCampaign,
            weekOverWeekGrowth,
          });

          console.log(`✅ Sent weekly digest to ${user.email}`);

          // Track that we sent the digest
          await db.insert(analyticsEvents).values({
            userId: user.id,
            eventType: 'weekly_digest_sent',
            eventData: {
              totalClicks: currentClicks,
              totalPosts: Number(postStats?.totalPosts || 0),
              weekOverWeekGrowth,
            },
          });
        } catch (error) {
          console.error(`Error sending digest to user ${user.id}:`, error);
          // Continue with next user even if one fails
        }
      }

      console.log('✅ Finished sending weekly digests');
    } catch (error) {
      console.error('Error in sendWeeklyDigests:', error);
      throw error;
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Scheduled tasks stopped');
  }
}

export const scheduledTasksService = new ScheduledTasksService();
