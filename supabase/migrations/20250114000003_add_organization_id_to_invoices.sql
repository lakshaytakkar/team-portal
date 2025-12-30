-- Migration: Add organization_id to invoices table
-- Updates: invoices table to include organization_id foreign key (if table exists)
-- Allows invoices to be filtered by organization

-- ============================================================================
-- ADD ORGANIZATION_ID TO INVOICES (if table exists)
-- ============================================================================
DO $$ 
BEGIN
  -- Check if invoices table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices'
  ) THEN
    -- Add organization_id column
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    
    -- Create index for efficient filtering
    CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id);
  END IF;
END $$;

