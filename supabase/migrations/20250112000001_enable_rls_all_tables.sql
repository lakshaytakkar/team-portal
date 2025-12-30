-- Migration: Enable Row Level Security on all tables
-- Enables RLS on all tables that don't already have it
-- Note: projects, project_members, goals, calls already have RLS enabled

-- ============================================================================
-- CORE USER & EMPLOYEE TABLES
-- ============================================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_departments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RECRUITMENT TABLES
-- ============================================================================

ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations ENABLE ROW LEVEL SECURITY;
-- evaluation_rounds table does not exist, skipping
ALTER TABLE IF EXISTS job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recruitment_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HR & ATTENDANCE TABLES
-- ============================================================================

ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hr_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS personal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meeting_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TASK & PROJECT TABLES
-- ============================================================================

ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
-- projects, project_members already have RLS
-- goals, calls already have RLS

-- ============================================================================
-- ASSET MANAGEMENT TABLES
-- ============================================================================

ALTER TABLE IF EXISTS assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS asset_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DOCUMENT MANAGEMENT TABLES
-- ============================================================================

ALTER TABLE IF EXISTS document_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONAL HIERARCHY TABLES
-- ============================================================================

ALTER TABLE IF EXISTS verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS positions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREDENTIALS TABLES
-- ============================================================================

ALTER TABLE IF EXISTS credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credential_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_portal_credentials ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SALES TABLES
-- ============================================================================

ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_automation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PERMISSION SYSTEM TABLES
-- ============================================================================
-- Note: These may conflict with organizational roles table
-- Using IF EXISTS to handle gracefully

-- Check if permission system tables exist (they might be named differently)
-- If they exist, they will be enabled; if not, these statements will be skipped
DO $$
BEGIN
  -- Only enable if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permissions') THEN
    ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
    ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'RLS enabled - superadmin full access, executives own data only';
COMMENT ON TABLE employees IS 'RLS enabled - superadmin full access, executives own data only';
COMMENT ON TABLE tasks IS 'RLS enabled - superadmin full access, executives assigned tasks only';

