-- Migration: Seed verticals data
-- Seeds the initial verticals for the organization
-- This migration is idempotent - it will only insert if verticals don't already exist

-- Get a user ID for created_by (using the first active superadmin profile)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to get a superadmin user first
  SELECT id INTO v_user_id 
  FROM profiles 
  WHERE role = 'superadmin' AND is_active = true 
  LIMIT 1;
  
  -- If no superadmin, get any active user
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE is_active = true 
    LIMIT 1;
  END IF;
  
  -- Only insert if verticals don't already exist
  IF NOT EXISTS (SELECT 1 FROM verticals WHERE deleted_at IS NULL LIMIT 1) THEN
    
    -- Insert seed verticals
    INSERT INTO verticals (name, code, description, is_active, created_by, updated_by)
    VALUES
      ('Legal Nations', 'legalnations', 'LLC formation and legal services', true, v_user_id, v_user_id),
      ('Goyo Tours', 'goyo-tours', 'China tour delegation services', true, v_user_id, v_user_id),
      ('USDrop AI', 'usdrop-ai', 'US Dropshipping operations', true, v_user_id, v_user_id),
      ('Faire USA', 'faire-usa', 'USA wholesale marketplace', true, v_user_id, v_user_id),
      ('Brand Development', 'brand-development', 'Brand development and marketing', true, v_user_id, v_user_id)
    ON CONFLICT (name) DO NOTHING;
    
    RAISE NOTICE 'Seeded verticals successfully';
  ELSE
    RAISE NOTICE 'Verticals already exist, skipping seed';
  END IF;
END $$;

