-- ==========================================================
-- Leadora B2B Platform - V1 Schema Migration
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE', 'SALES_EXECUTIVE')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(30),
    department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- 2. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token_hash);

-- 3. Lead Sources Table
CREATE TABLE IF NOT EXISTS lead_sources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'Other',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_sources_name ON lead_sources(name);
CREATE INDEX IF NOT EXISTS idx_lead_sources_active ON lead_sources(active);

-- 4. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Social Media', 'Search', 'Email', 'Content Marketing', 'Website', 'Referral', 'Event', 'Other')),
    objective VARCHAR(255),
    start_date DATE,
    end_date DATE,
    target_audience VARCHAR(255),
    target_location VARCHAR(255),
    budget NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (budget >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'Active', 'Paused', 'Completed', 'Cancelled')),
    description TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);

-- 5. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(100),
    industry VARCHAR(100),
    job_role VARCHAR(100),
    source_id BIGINT REFERENCES lead_sources(id) ON DELETE RESTRICT,
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    date_received TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost')),
    lead_score INT NOT NULL DEFAULT 0,
    notes TEXT,
    qualification_status VARCHAR(50) NOT NULL DEFAULT 'Not Qualified' CHECK (qualification_status IN ('Not Qualified', 'Potential', 'Qualified', 'High Priority')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user ON leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_id);
CREATE INDEX IF NOT EXISTS idx_leads_date_received ON leads(date_received);

-- 6. Lead Qualifications Table
CREATE TABLE IF NOT EXISTS lead_qualifications (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
    company_size VARCHAR(50),
    business_requirement TEXT,
    budget_range VARCHAR(100),
    expected_timeline VARCHAR(100),
    decision_maker_status VARCHAR(100),
    business_need TEXT,
    qualification_level VARCHAR(50) NOT NULL DEFAULT 'Not Qualified' CHECK (qualification_level IN ('Not Qualified', 'Potential', 'Qualified', 'High Priority')),
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_qualifications_lead ON lead_qualifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_qualifications_level ON lead_qualifications(qualification_level);

-- 7. Lead Assignments Table
CREATE TABLE IF NOT EXISTS lead_assignments (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    previous_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    new_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    notes TEXT,
    assignment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_new_user ON lead_assignments(new_user_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_date ON lead_assignments(assignment_date);

-- 8. Follow-ups Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_date_time TIMESTAMPTZ NOT NULL,
    follow_up_type VARCHAR(50) NOT NULL CHECK (follow_up_type IN ('Phone', 'Email', 'Meeting', 'Demo', 'Online Meeting', 'Other')),
    notes TEXT,
    outcome VARCHAR(50) CHECK (outcome IS NULL OR outcome IN ('Interested', 'Follow-up Required', 'Not Interested', 'No Response', 'Converted', 'Lost')),
    next_follow_up_date TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_user ON follow_ups(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled ON follow_ups(scheduled_date_time);
CREATE INDEX IF NOT EXISTS idx_follow_ups_completed ON follow_ups(completed);

-- 9. Lead Activities / Timeline Table
CREATE TABLE IF NOT EXISTS lead_activities (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created ON lead_activities(created_at);

-- 10. Conversions Table
CREATE TABLE IF NOT EXISTS conversions (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
    customer_company VARCHAR(150) NOT NULL,
    deal_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (deal_value >= 0),
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    source_id BIGINT REFERENCES lead_sources(id) ON DELETE SET NULL,
    sales_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    conversion_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversions_lead ON conversions(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversions_campaign ON conversions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_conversions_date ON conversions(conversion_date);

-- 11. Lost Leads Table
CREATE TABLE IF NOT EXISTS lost_leads (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('Budget', 'Competitor', 'No Requirement', 'No Response', 'Timing', 'Product Mismatch', 'Pricing', 'Other')),
    notes TEXT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    lost_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lost_leads_lead ON lost_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_lost_leads_reason ON lost_leads(reason);

-- 12. Marketing Content Table
CREATE TABLE IF NOT EXISTS marketing_content (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('Social Media Posts', 'Blogs', 'Advertisements', 'Emails', 'Videos', 'Landing Pages', 'Other')),
    platform VARCHAR(100),
    target_audience VARCHAR(255),
    publication_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Published', 'Archived')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketing_content_campaign ON marketing_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_content_status ON marketing_content(status);

-- 13. Landing Pages Table
CREATE TABLE IF NOT EXISTS landing_pages (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    url VARCHAR(500) NOT NULL,
    target_audience VARCHAR(255),
    objective VARCHAR(255),
    call_to_action VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_campaign ON landing_pages(campaign_id);

-- 14. Campaign Expenses Table
CREATE TABLE IF NOT EXISTS campaign_expenses (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('Advertising', 'Content', 'Design', 'Event', 'Influencer', 'Software', 'Other')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    description TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaign_expenses_campaign ON campaign_expenses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_expenses_date ON campaign_expenses(expense_date);

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Seed Default Lead Sources (safe idempotency using ON CONFLICT)
INSERT INTO lead_sources (name, type, description, active)
VALUES 
    ('Google Search', 'Search', 'Inbound organic and paid Google search leads', true),
    ('Instagram', 'Social Media', 'Social media marketing on Instagram', true),
    ('Facebook', 'Social Media', 'Targeted Facebook campaigns and community leads', true),
    ('LinkedIn', 'Social Media', 'B2B LinkedIn outreach and sponsored campaigns', true),
    ('YouTube', 'Social Media', 'Video advertising and channel inbound leads', true),
    ('Website', 'Website', 'Direct organic traffic to company website forms', true),
    ('Email', 'Email', 'Outbound and newsletter email campaigns', true),
    ('Referral', 'Referral', 'Customer and partner direct referrals', true),
    ('Event', 'Event', 'Trade shows, conferences, and virtual webinars', true),
    ('Direct', 'Direct', 'Direct walk-in, inbound calls, or executive referrals', true),
    ('Other', 'Other', 'Other miscellaneous lead channels', true)
ON CONFLICT (name) DO NOTHING;
