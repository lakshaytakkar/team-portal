-- Migration: Add organization_id to transactions table
-- Updates: transactions table to include organization_id foreign key (if table exists)
-- Allows transactions to be filtered by organization

-- ============================================================================
-- ADD ORGANIZATION_ID TO TRANSACTIONS (if table exists)
-- ============================================================================
DO $$ 
BEGIN
  -- Check if transactions table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions'
  ) THEN
    -- Add organization_id column
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
    
    -- Create index for efficient filtering
    CREATE INDEX IF NOT EXISTS idx_transactions_organization ON transactions(organization_id);
  END IF;
END $$;

