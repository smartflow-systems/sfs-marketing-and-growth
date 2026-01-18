-- Performance optimization indexes for SmartFlow database
-- Run this migration to improve query performance

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON "User"(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON "User"(created_at);

-- Campaign table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON "Campaign"(user_id);
-- CREATE INDEX IF NOT EXISTS idx_campaigns_status ON "Campaign"(status);
-- CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON "Campaign"(created_at);

-- Post table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS idx_posts_user_id ON "Post"(user_id);
-- CREATE INDEX IF NOT EXISTS idx_posts_platform ON "Post"(platform);
-- CREATE INDEX IF NOT EXISTS idx_posts_created_at ON "Post"(created_at);

-- BioPage table indexes (if exists)
-- CREATE INDEX IF NOT EXISTS idx_bio_pages_user_id ON "BioPage"(user_id);
-- CREATE INDEX IF NOT EXISTS idx_bio_pages_slug ON "BioPage"(slug);

-- Composite indexes for common queries
-- CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON "Campaign"(user_id, status);
-- CREATE INDEX IF NOT EXISTS idx_posts_user_platform ON "Post"(user_id, platform);

-- Add comments for documentation
COMMENT ON INDEX idx_users_email IS 'Improves login and authentication queries';
COMMENT ON INDEX idx_users_subscription IS 'Optimizes subscription tier filtering';
COMMENT ON INDEX idx_users_created_at IS 'Speeds up user analytics and reporting';
