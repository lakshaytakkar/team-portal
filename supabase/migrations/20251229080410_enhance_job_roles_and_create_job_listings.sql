-- ============================================================================
-- Migration: Enhance Job Roles & Create Job Listings
-- Purpose: Separate role definitions from portal listings, add JD support
-- ============================================================================

-- ============================================================================
-- PHASE 1: Enhance job_roles table with full role definition fields
-- ============================================================================

-- Add missing columns to job_roles for complete role definitions
ALTER TABLE job_roles
ADD COLUMN IF NOT EXISTS experience_min_years INTEGER,
ADD COLUMN IF NOT EXISTS experience_max_years INTEGER,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS preferred_industries TEXT[],
ADD COLUMN IF NOT EXISTS role_type role_type DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS employment_type employment_type DEFAULT 'full-time',
ADD COLUMN IF NOT EXISTS master_jd TEXT,
ADD COLUMN IF NOT EXISTS jd_attachment_url TEXT,
ADD COLUMN IF NOT EXISTS responsibilities TEXT;

-- ============================================================================
-- PHASE 2: Create job_listings table for portal-specific postings
-- ============================================================================

-- Create listing status enum
DO $$ BEGIN
  CREATE TYPE job_listing_status AS ENUM ('draft', 'active', 'paused', 'expired', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create job_listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  job_portal_id UUID NOT NULL REFERENCES job_portals(id) ON DELETE CASCADE,

  -- Portal-specific fields
  portal_listing_url TEXT,
  portal_listing_id TEXT,
  custom_title TEXT,
  custom_jd TEXT,

  -- Dates
  posted_date DATE,
  expiry_date DATE,

  -- Status and metrics
  status job_listing_status NOT NULL DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,

  -- Additional info
  notes TEXT,
  posted_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Add missing columns to job_listings if table already exists
ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS portal_listing_id TEXT;
ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS custom_title TEXT;
ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS custom_jd TEXT;
ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add jd_attachment_url to job_roles if missing
ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS jd_attachment_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_listings_role ON job_listings(job_role_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_portal ON job_listings(job_portal_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_status ON job_listings(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_posted_date ON job_listings(posted_date);

-- ============================================================================
-- PHASE 3: Create Credentials Management System
-- ============================================================================

-- Create credential type enum
DO $$ BEGIN
  CREATE TYPE credential_type AS ENUM ('login', 'api_key', 'oauth', 'ssh_key', 'token', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create access level enum
DO $$ BEGIN
  CREATE TYPE credential_access_level AS ENUM ('superadmin_only', 'managers', 'hr_team', 'all_staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create credential categories table
CREATE TABLE IF NOT EXISTS credential_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES credential_categories(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  credential_type credential_type NOT NULL DEFAULT 'login',

  -- Login credentials
  username TEXT,
  password TEXT,
  email TEXT,

  -- API credentials
  api_key TEXT,
  api_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,

  -- URLs and endpoints
  url TEXT,
  api_endpoint TEXT,

  -- Additional data (JSON for flexibility)
  additional_fields JSONB DEFAULT '{}',

  -- Security and access
  access_level credential_access_level NOT NULL DEFAULT 'superadmin_only',
  is_active BOOLEAN DEFAULT true,

  -- Expiry tracking
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_by UUID REFERENCES profiles(id),

  -- Notes (could be sensitive)
  notes TEXT,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Create junction table for job portal credentials
CREATE TABLE IF NOT EXISTS job_portal_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_portal_id UUID NOT NULL REFERENCES job_portals(id) ON DELETE CASCADE,
  credential_id UUID NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(job_portal_id, credential_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credentials_category ON credentials(category_id);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_credentials_active ON credentials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_portal_credentials_portal ON job_portal_credentials(job_portal_id);
CREATE INDEX IF NOT EXISTS idx_job_portal_credentials_cred ON job_portal_credentials(credential_id);

-- Insert default credential categories
INSERT INTO credential_categories (name, description, icon, color, sort_order) VALUES
  ('Job Portals', 'Credentials for job posting platforms like Naukri, LinkedIn, Indeed', 'Briefcase', 'blue', 1),
  ('Social Media', 'Social media account credentials', 'Share2', 'pink', 2),
  ('Email Accounts', 'Email and communication platform credentials', 'Mail', 'green', 3),
  ('CRM & Sales', 'CRM and sales tool credentials', 'Users', 'orange', 4),
  ('Finance & Accounting', 'Financial software credentials', 'DollarSign', 'emerald', 5),
  ('Cloud & Hosting', 'Cloud platform and hosting credentials', 'Cloud', 'sky', 6),
  ('Development', 'Development tools and API credentials', 'Code', 'violet', 7),
  ('Other', 'Miscellaneous credentials', 'Key', 'gray', 99)
ON CONFLICT (name) DO NOTHING;

-- Add comments
COMMENT ON TABLE credential_categories IS 'Categories for organizing credentials';
COMMENT ON TABLE credentials IS 'Secure storage for various credentials (passwords should be encrypted at app level)';
COMMENT ON TABLE job_portal_credentials IS 'Links credentials to specific job portals';
COMMENT ON COLUMN credentials.additional_fields IS 'JSON storage for custom fields specific to certain credential types';
COMMENT ON COLUMN credentials.access_level IS 'Controls who can view/use this credential';
