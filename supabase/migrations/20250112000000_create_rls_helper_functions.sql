-- Migration: Create RLS helper functions
-- Creates helper functions for Row Level Security policies
-- These functions use SECURITY DEFINER to bypass RLS when checking user roles

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is executive
CREATE OR REPLACE FUNCTION is_executive(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'executive'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get user's role from profiles table
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_superadmin(UUID) IS 'Check if user is superadmin - used in RLS policies';
COMMENT ON FUNCTION is_executive(UUID) IS 'Check if user is executive - used in RLS policies';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Get user role from profiles table - used in RLS policies';

