-- Migration: Create sales module tables
-- Creates: leads, deals, quotations, sales_automation_logs tables

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

-- Create lead status enum
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  source TEXT,
  value NUMERIC(10, 2),
  assigned_to_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to_id);

-- ============================================================================
-- DEALS TABLE
-- ============================================================================

-- Create deal stage enum
DO $$ BEGIN
  CREATE TYPE deal_stage AS ENUM ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  name TEXT NOT NULL,
  value NUMERIC(10, 2),
  stage deal_stage NOT NULL DEFAULT 'prospecting',
  probability INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
  close_date DATE,
  assigned_to_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);

-- ============================================================================
-- QUOTATIONS TABLE
-- ============================================================================

-- Create quotation status enum
DO $$ BEGIN
  CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  quotation_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status quotation_status NOT NULL DEFAULT 'draft',
  valid_until DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quotations_deal ON quotations(deal_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- ============================================================================
-- SALES AUTOMATION LOGS TABLE
-- ============================================================================

-- Create automation log status enum
DO $$ BEGIN
  CREATE TYPE automation_log_status AS ENUM ('success', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS sales_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'deal', 'quotation')),
  action TEXT NOT NULL,
  status automation_log_status NOT NULL,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_automation_logs_entity ON sales_automation_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sales_automation_logs_status ON sales_automation_logs(status);


