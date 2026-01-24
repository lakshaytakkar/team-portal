-- Migration: Create organizations table
-- Creates: organizations table for top-level organizational hierarchy
-- Organization > Vertical > Department

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE, -- e.g., "acme-inc", "main-org"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

