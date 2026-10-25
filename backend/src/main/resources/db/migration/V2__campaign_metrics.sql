-- ==========================================================
-- Leadora B2B Platform - V2 Migration: Campaign Metrics
-- ==========================================================

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS impressions BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reach BIGINT DEFAULT 0;
