-- Migration: Add country and other useful fields to organizations table
-- Adds: country, registration_number, tax_id, address fields

-- ============================================================================
-- ADD COUNTRY AND OTHER FIELDS TO ORGANIZATIONS
-- ============================================================================
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website TEXT;

-- Create index on country for filtering
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country) WHERE deleted_at IS NULL;

