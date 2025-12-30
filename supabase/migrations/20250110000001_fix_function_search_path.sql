-- Migration: Fix function search_path security vulnerability
-- Sets search_path parameter to prevent SQL injection

-- ============================================================================
-- FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Fix update_hr_templates_updated_at function
ALTER FUNCTION update_hr_templates_updated_at() 
SET search_path = public;

-- Fix update_updated_at function  
ALTER FUNCTION update_updated_at() 
SET search_path = public;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION update_hr_templates_updated_at() IS 'Updated to set search_path for security - prevents SQL injection';
COMMENT ON FUNCTION update_updated_at() IS 'Updated to set search_path for security - prevents SQL injection';

