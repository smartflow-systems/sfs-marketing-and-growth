import { pgTable, text, serial, integer, timestamp, boolean, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table with auth and subscription info
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free"), // free, pro, enterprise
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive"), // active, inactive, canceled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

// Campaigns for cross-project tracking
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: integer("budget"), // in cents
  status: varchar("status", { length: 50 }).default("draft"), // draft, active, paused, completed
  metadata: jsonb("metadata"), // flexible field for campaign-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("campaign_user_idx").on(table.userId),
  statusIdx: index("campaign_status_idx").on(table.status),
}));

// UTM Links
export const utmLinks = pgTable("utm_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  url: text("url").notNull(),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  utmTerm: varchar("utm_term", { length: 255 }),
  utmContent: varchar("utm_content", { length: 255 }),
  shortCode: varchar("short_code", { length: 50 }).unique(),
  qrCodeUrl: text("qr_code_url"),
  clicks: integer("clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("utm_user_idx").on(table.userId),
  campaignIdx: index("utm_campaign_idx").on(table.campaignId),
  shortCodeIdx: index("utm_short_code_idx").on(table.shortCode),
}));

// Link-in-Bio Pages
export const linkInBioPages = pgTable("link_in_bio_pages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  theme: varchar("theme", { length: 50 }).default("dark"), // dark, light, gold
  links: jsonb("links").notNull(), // array of {title, url, icon}
  socialLinks: jsonb("social_links"), // {twitter, instagram, etc}
  customCss: text("custom_css"),
  views: integer("views").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("bio_user_idx").on(table.userId),
  slugIdx: index("bio_slug_idx").on(table.slug),
}));

// AI Generated Posts
export const aiPosts = pgTable("ai_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  platform: varchar("platform", { length: 50 }).notNull(), // instagram, facebook, twitter, linkedin
  niche: varchar("niche", { length: 100 }),
  tone: varchar("tone", { length: 50 }), // professional, casual, funny
  content: text("content").notNull(),
  hashtags: text("hashtags"),
  prompt: text("prompt"), // original prompt used
  isFavorite: boolean("is_favorite").default(false),
  isScheduled: boolean("is_scheduled").default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("post_user_idx").on(table.userId),
  campaignIdx: index("post_campaign_idx").on(table.campaignId),
  scheduledIdx: index("post_scheduled_idx").on(table.isScheduled, table.scheduledFor),
}));

// Campaign Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }), // post, launch, deadline, meeting
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  platform: varchar("platform", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed, canceled
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("event_user_idx").on(table.userId),
  campaignIdx: index("event_campaign_idx").on(table.campaignId),
  dateIdx: index("event_date_idx").on(table.date),
}));

// OG Images
export const ogImages = pgTable("og_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  template: varchar("template", { length: 50 }), // minimal, bold, gradient
  brandColor: varchar("brand_color", { length: 7 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("og_user_idx").on(table.userId),
}));

// Templates Marketplace
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // campaign, post, utm, bio
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: integer("price").default(0), // in cents, 0 = free
  content: jsonb("content").notNull(), // template data
  preview: text("preview"), // screenshot URL
  downloads: integer("downloads").default(0),
  rating: integer("rating").default(0), // 0-5 stars
  ratingCount: integer("rating_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("template_type_idx").on(table.type),
  categoryIdx: index("template_category_idx").on(table.category),
  featuredIdx: index("template_featured_idx").on(table.isFeatured),
}));

// Template Purchases
export const templatePurchases = pgTable("template_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateId: integer("template_id").references(() => templates.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  stripePaymentId: text("stripe_payment_id"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("purchase_user_idx").on(table.userId),
  templateIdx: index("purchase_template_idx").on(table.templateId),
}));

// Analytics Events for tracking
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  eventType: varchar("event_type", { length: 100 }).notNull(), // utm_click, bio_view, post_generated, etc
  eventData: jsonb("event_data"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("analytics_user_idx").on(table.userId),
  campaignIdx: index("analytics_campaign_idx").on(table.campaignId),
  eventTypeIdx: index("analytics_event_type_idx").on(table.eventType),
  createdAtIdx: index("analytics_created_at_idx").on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  utmLinks: many(utmLinks),
  linkInBioPages: many(linkInBioPages),
  aiPosts: many(aiPosts),
  calendarEvents: many(calendarEvents),
  ogImages: many(ogImages),
  templates: many(templates),
  purchases: many(templatePurchases),
  analyticsEvents: many(analyticsEvents),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  utmLinks: many(utmLinks),
  aiPosts: many(aiPosts),
  calendarEvents: many(calendarEvents),
  analyticsEvents: many(analyticsEvents),
}));

export const utmLinksRelations = relations(utmLinks, ({ one }) => ({
  user: one(users, {
    fields: [utmLinks.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [utmLinks.campaignId],
    references: [campaigns.id],
  }),
}));

export const linkInBioPagesRelations = relations(linkInBioPages, ({ one }) => ({
  user: one(users, {
    fields: [linkInBioPages.userId],
    references: [users.id],
  }),
}));

export const aiPostsRelations = relations(aiPosts, ({ one }) => ({
  user: one(users, {
    fields: [aiPosts.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [aiPosts.campaignId],
    references: [campaigns.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [calendarEvents.campaignId],
    references: [campaigns.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  creator: one(users, {
    fields: [templates.creatorId],
    references: [users.id],
  }),
  purchases: many(templatePurchases),
}));

export const templatePurchasesRelations = relations(templatePurchases, ({ one }) => ({
  user: one(users, {
    fields: [templatePurchases.userId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [templatePurchases.templateId],
    references: [templates.id],
  }),
}));
