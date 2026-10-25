-- ==========================================================
-- Leadora B2B Platform - V3 Migration: Add Assigned Status
-- ==========================================================

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('New', 'Assigned', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'));
