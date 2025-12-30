-- Migration: Add organization_id to verticals table
-- Updates: verticals table to include organization_id foreign key
-- Allows verticals to belong to organizations

-- ============================================================================
-- ADD ORGANIZATION_ID TO VERTICALS
-- ============================================================================
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_verticals_organization ON verticals(organization_id);

-- Drop old unique constraint on name (if exists)
DO $$ 
BEGIN
  -- Check if unique constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'verticals_name_key' 
    AND conrelid = 'verticals'::regclass
  ) THEN
    ALTER TABLE verticals DROP CONSTRAINT verticals_name_key;
  END IF;
END $$;

-- Add new unique constraint: same vertical name can exist in different organizations
-- But within an organization, vertical names must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_verticals_org_name_unique 
ON verticals(organization_id, name) 
WHERE deleted_at IS NULL;

