-- ============================================================================
-- LLC Clients Management System for Legal Nations
-- Complete schema for managing LLC formation service clients
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- LLC Client Status - Tracks the stage in the formation journey
CREATE TYPE llc_client_status AS ENUM (
  'llc_booked',           -- Initial payment received, LLC booked
  'onboarded',            -- Onboarding call done, documents being collected
  'under_ein',            -- EIN application in progress
  'under_boi',            -- BOI filing in progress
  'under_banking',        -- Bank account setup in progress
  'under_payment_gateway', -- Payment gateway setup (Elite plan)
  'delivered'             -- All services completed
);

-- Client Health Status - Overall client satisfaction/engagement
CREATE TYPE llc_client_health AS ENUM (
  'healthy',    -- Everything on track
  'neutral',    -- Normal progress
  'at_risk',    -- Some issues, needs attention
  'critical'    -- Urgent attention required
);

-- Service Plan Type
CREATE TYPE llc_service_plan AS ENUM (
  'elite',      -- Full service with website
  'llc'         -- Basic LLC formation only
);

-- Bank Application Status
CREATE TYPE llc_bank_status AS ENUM (
  'not_started',
  'documents_pending',
  'application_submitted',
  'under_review',
  'approved',
  'rejected'
);

-- Document Category - What type of document flow
CREATE TYPE llc_document_category AS ENUM (
  'client_submitted',    -- Documents client provides (Passport, Address Proof)
  'llc_documents',       -- Documents we get for them (LLC Articles, EIN Letter)
  'bank_documents',      -- Bank-related docs (Bank Application, Approval Letter)
  'website_documents'    -- For Elite plan (Domain Certificate, Website Credentials)
);

-- Document Status
CREATE TYPE llc_document_status AS ENUM (
  'pending',      -- Awaiting submission/generation
  'submitted',    -- Client has submitted
  'verified',     -- Verified and accepted
  'rejected',     -- Rejected, needs resubmission
  'issued',       -- Issued to client (for docs we generate)
  'delivered'     -- Delivered to client
);

-- Timeline Event Type
CREATE TYPE llc_timeline_event_type AS ENUM (
  'status_change',        -- Stage/status changed
  'document_uploaded',    -- Document uploaded
  'document_issued',      -- Document issued to client
  'note_added',           -- Note/comment added
  'payment_received',     -- Payment recorded
  'call_scheduled',       -- Call scheduled
  'call_completed',       -- Call completed
  'bank_update',          -- Bank application update
  'milestone'             -- Generic milestone
);

-- ============================================================================
-- MASTER TABLES
-- ============================================================================

-- Supported Banks
CREATE TABLE llc_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Types Master
CREATE TABLE llc_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category llc_document_category NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  for_elite_only BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- LLC Clients - Main client table
CREATE TABLE llc_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client Identification
  client_code TEXT NOT NULL UNIQUE,  -- e.g., SUPLLC1001
  serial_number INTEGER,              -- For display ordering

  -- Client Information
  client_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  country TEXT,

  -- LLC Information
  llc_name TEXT,
  status llc_client_status NOT NULL DEFAULT 'llc_booked',
  health llc_client_health DEFAULT 'neutral',

  -- Service Details
  plan llc_service_plan NOT NULL DEFAULT 'elite',
  website_included BOOLEAN NOT NULL DEFAULT true,

  -- Key Dates
  payment_date DATE,
  onboarding_date DATE,
  onboarding_call_date DATE,
  document_submission_date DATE,
  delivery_date DATE,

  -- Financial
  amount_received DECIMAL(12, 2) DEFAULT 0,
  remaining_payment DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',

  -- Banking
  bank_id UUID REFERENCES llc_banks(id),
  bank_approved TEXT,  -- Legacy: stores bank name as string
  bank_status llc_bank_status DEFAULT 'not_started',
  bank_application_date DATE,
  bank_approval_date DATE,

  -- Assignment
  assigned_to_id UUID REFERENCES employees(id),

  -- External Links
  external_project_url TEXT,  -- Odoo/external project link

  -- Notes
  notes TEXT,
  additional_notes TEXT,

  -- Audit Fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

-- LLC Client Documents
CREATE TABLE llc_client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES llc_clients(id) ON DELETE CASCADE,
  document_type_id UUID REFERENCES llc_document_types(id),

  -- Document Info
  name TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,           -- Storage path
  file_size INTEGER DEFAULT 0,
  mime_type TEXT,

  -- Status & Categorization
  category llc_document_category NOT NULL,
  status llc_document_status NOT NULL DEFAULT 'pending',

  -- Dates
  submitted_date TIMESTAMPTZ,
  verified_date TIMESTAMPTZ,
  issued_date TIMESTAMPTZ,
  expiry_date DATE,

  -- Tracking
  submitted_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  issued_by UUID REFERENCES profiles(id),

  -- Notes
  notes TEXT,
  rejection_reason TEXT,

  -- Audit Fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

-- LLC Client Timeline - Activity log
CREATE TABLE llc_client_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES llc_clients(id) ON DELETE CASCADE,
  document_id UUID REFERENCES llc_client_documents(id) ON DELETE SET NULL,

  -- Event Details
  event_type llc_timeline_event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- For status changes
  old_status llc_client_status,
  new_status llc_client_status,

  -- Metadata (JSON for flexible data)
  metadata JSONB,

  -- Who did it
  performed_by UUID REFERENCES profiles(id),

  -- Audit Fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- llc_clients indexes
CREATE INDEX idx_llc_clients_status ON llc_clients(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_clients_health ON llc_clients(health) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_clients_assigned_to ON llc_clients(assigned_to_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_clients_plan ON llc_clients(plan) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_clients_client_code ON llc_clients(client_code);
CREATE INDEX idx_llc_clients_bank_status ON llc_clients(bank_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_clients_payment_date ON llc_clients(payment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_clients_created_at ON llc_clients(created_at DESC) WHERE deleted_at IS NULL;

-- llc_client_documents indexes
CREATE INDEX idx_llc_client_documents_client ON llc_client_documents(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_client_documents_category ON llc_client_documents(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_client_documents_status ON llc_client_documents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_llc_client_documents_type ON llc_client_documents(document_type_id) WHERE deleted_at IS NULL;

-- llc_client_timeline indexes
CREATE INDEX idx_llc_client_timeline_client ON llc_client_timeline(client_id);
CREATE INDEX idx_llc_client_timeline_event_type ON llc_client_timeline(event_type);
CREATE INDEX idx_llc_client_timeline_created_at ON llc_client_timeline(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_llc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_llc_clients_updated_at
  BEFORE UPDATE ON llc_clients
  FOR EACH ROW EXECUTE FUNCTION update_llc_updated_at();

CREATE TRIGGER trigger_llc_client_documents_updated_at
  BEFORE UPDATE ON llc_client_documents
  FOR EACH ROW EXECUTE FUNCTION update_llc_updated_at();

CREATE TRIGGER trigger_llc_banks_updated_at
  BEFORE UPDATE ON llc_banks
  FOR EACH ROW EXECUTE FUNCTION update_llc_updated_at();

CREATE TRIGGER trigger_llc_document_types_updated_at
  BEFORE UPDATE ON llc_document_types
  FOR EACH ROW EXECUTE FUNCTION update_llc_updated_at();

-- Auto-create timeline entry on status change
CREATE OR REPLACE FUNCTION create_llc_status_change_timeline()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO llc_client_timeline (
      client_id,
      event_type,
      title,
      description,
      old_status,
      new_status,
      performed_by
    ) VALUES (
      NEW.id,
      'status_change',
      'Status changed to ' || REPLACE(NEW.status::TEXT, '_', ' '),
      'Client status updated from ' || COALESCE(REPLACE(OLD.status::TEXT, '_', ' '), 'new') || ' to ' || REPLACE(NEW.status::TEXT, '_', ' '),
      OLD.status,
      NEW.status,
      NEW.updated_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_llc_status_change_timeline
  AFTER UPDATE ON llc_clients
  FOR EACH ROW EXECUTE FUNCTION create_llc_status_change_timeline();

-- ============================================================================
-- SEED DATA - Banks
-- ============================================================================

INSERT INTO llc_banks (name, code, description, website, display_order) VALUES
  ('Mercury Bank', 'mercury', 'US-based digital bank for startups', 'https://mercury.com', 1),
  ('Payoneer', 'payoneer', 'Global payment platform', 'https://payoneer.com', 2),
  ('Wise', 'wise', 'International money transfers and accounts', 'https://wise.com', 3),
  ('Airwallex', 'airwallex', 'Global business accounts', 'https://airwallex.com', 4),
  ('Relay', 'relay', 'Business banking for startups', 'https://relay.com', 5);

-- ============================================================================
-- SEED DATA - Document Types
-- ============================================================================

INSERT INTO llc_document_types (name, code, category, description, is_required, for_elite_only, display_order) VALUES
  -- Client Submitted Documents
  ('Passport', 'passport', 'client_submitted', 'Valid passport copy', true, false, 1),
  ('Address Proof', 'address_proof', 'client_submitted', 'Utility bill or bank statement', true, false, 2),
  ('Photo', 'photo', 'client_submitted', 'Recent passport-size photo', false, false, 3),
  ('Business Plan', 'business_plan', 'client_submitted', 'Brief business plan/description', false, false, 4),

  -- LLC Documents
  ('LLC Articles of Organization', 'llc_articles', 'llc_documents', 'Wyoming LLC formation certificate', true, false, 10),
  ('Operating Agreement', 'operating_agreement', 'llc_documents', 'LLC operating agreement', true, false, 11),
  ('EIN Letter', 'ein_letter', 'llc_documents', 'IRS EIN confirmation letter', true, false, 12),
  ('BOI Filing Receipt', 'boi_receipt', 'llc_documents', 'Beneficial Ownership Information filing receipt', true, false, 13),
  ('Registered Agent Certificate', 'registered_agent', 'llc_documents', 'Registered agent appointment', true, false, 14),

  -- Bank Documents
  ('Bank Application Form', 'bank_application', 'bank_documents', 'Completed bank application', false, false, 20),
  ('Bank Approval Letter', 'bank_approval', 'bank_documents', 'Bank account approval confirmation', false, false, 21),
  ('Bank Account Details', 'bank_details', 'bank_documents', 'Account number and routing details', false, false, 22),

  -- Website Documents (Elite only)
  ('Domain Certificate', 'domain_cert', 'website_documents', 'Domain registration certificate', false, true, 30),
  ('Website Credentials', 'website_creds', 'website_documents', 'Admin login credentials', false, true, 31),
  ('SSL Certificate', 'ssl_cert', 'website_documents', 'SSL/TLS certificate', false, true, 32);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE llc_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE llc_client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE llc_client_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE llc_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE llc_document_types ENABLE ROW LEVEL SECURITY;

-- Banks and Document Types - readable by all authenticated users
CREATE POLICY "Banks readable by authenticated users"
  ON llc_banks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Document types readable by authenticated users"
  ON llc_document_types FOR SELECT
  TO authenticated
  USING (true);

-- LLC Clients - Superadmins can see all, employees see assigned
CREATE POLICY "Superadmins can manage all LLC clients"
  ON llc_clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Employees can view assigned LLC clients"
  ON llc_clients FOR SELECT
  TO authenticated
  USING (
    assigned_to_id IN (
      SELECT id FROM employees
      WHERE profile_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Employees can update assigned LLC clients"
  ON llc_clients FOR UPDATE
  TO authenticated
  USING (
    assigned_to_id IN (
      SELECT id FROM employees
      WHERE profile_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- LLC Client Documents - Same access as clients
CREATE POLICY "Superadmins can manage all LLC client documents"
  ON llc_client_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Employees can view documents for assigned clients"
  ON llc_client_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM llc_clients
      WHERE llc_clients.id = llc_client_documents.client_id
      AND llc_clients.assigned_to_id IN (
        SELECT id FROM employees WHERE profile_id = auth.uid()
      )
      AND llc_clients.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Employees can manage documents for assigned clients"
  ON llc_client_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM llc_clients
      WHERE llc_clients.id = llc_client_documents.client_id
      AND llc_clients.assigned_to_id IN (
        SELECT id FROM employees WHERE profile_id = auth.uid()
      )
      AND llc_clients.deleted_at IS NULL
    )
  );

-- LLC Client Timeline - Same access as clients
CREATE POLICY "Superadmins can manage all LLC client timeline"
  ON llc_client_timeline FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Employees can view timeline for assigned clients"
  ON llc_client_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM llc_clients
      WHERE llc_clients.id = llc_client_timeline.client_id
      AND llc_clients.assigned_to_id IN (
        SELECT id FROM employees WHERE profile_id = auth.uid()
      )
      AND llc_clients.deleted_at IS NULL
    )
  );

CREATE POLICY "Employees can add timeline entries for assigned clients"
  ON llc_client_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM llc_clients
      WHERE llc_clients.id = llc_client_timeline.client_id
      AND llc_clients.assigned_to_id IN (
        SELECT id FROM employees WHERE profile_id = auth.uid()
      )
      AND llc_clients.deleted_at IS NULL
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE llc_clients IS 'Main table for LLC formation service clients';
COMMENT ON TABLE llc_client_documents IS 'Documents associated with LLC clients';
COMMENT ON TABLE llc_client_timeline IS 'Activity timeline/audit log for LLC clients';
COMMENT ON TABLE llc_banks IS 'Master list of supported US banks';
COMMENT ON TABLE llc_document_types IS 'Master list of document types for LLC formation';

COMMENT ON COLUMN llc_clients.client_code IS 'Unique client identifier (e.g., SUPLLC1001)';
COMMENT ON COLUMN llc_clients.status IS 'Current stage in LLC formation journey';
COMMENT ON COLUMN llc_clients.health IS 'Client engagement/satisfaction status';
COMMENT ON COLUMN llc_clients.plan IS 'Service plan type (elite with website or basic LLC only)';
