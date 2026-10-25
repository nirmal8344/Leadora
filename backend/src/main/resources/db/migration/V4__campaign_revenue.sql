-- ==========================================================
-- Leadora B2B Platform - V4 Migration: Campaign Revenue
-- ==========================================================

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC(14, 2) DEFAULT 0.00;
