-- Migration: Add missing foreign key indexes for performance
-- Addresses 17 unindexed foreign keys identified in audit

-- ============================================================================
-- ASSET ASSIGNMENTS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_asset_assignments_assigned_by 
ON asset_assignments(assigned_by);

-- ============================================================================
-- ASSETS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_assets_created_by 
ON assets(created_by);

CREATE INDEX IF NOT EXISTS idx_assets_updated_by 
ON assets(updated_by);

-- ============================================================================
-- CREDENTIAL CATEGORIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_credential_categories_created_by 
ON credential_categories(created_by);

CREATE INDEX IF NOT EXISTS idx_credential_categories_updated_by 
ON credential_categories(updated_by);

-- ============================================================================
-- CREDENTIALS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_credentials_created_by 
ON credentials(created_by);

CREATE INDEX IF NOT EXISTS idx_credentials_last_used_by 
ON credentials(last_used_by);

CREATE INDEX IF NOT EXISTS idx_credentials_updated_by 
ON credentials(updated_by);

-- ============================================================================
-- HR TEMPLATES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_hr_templates_created_by 
ON hr_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_hr_templates_updated_by 
ON hr_templates(updated_by);

-- ============================================================================
-- JOB LISTINGS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_job_listings_created_by 
ON job_listings(created_by);

CREATE INDEX IF NOT EXISTS idx_job_listings_updated_by 
ON job_listings(updated_by);

-- ============================================================================
-- RECRUITMENT CALLS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recruitment_calls_called_by_id 
ON recruitment_calls(called_by_id);

CREATE INDEX IF NOT EXISTS idx_recruitment_calls_created_by 
ON recruitment_calls(created_by);

CREATE INDEX IF NOT EXISTS idx_recruitment_calls_updated_by 
ON recruitment_calls(updated_by);

-- ============================================================================
-- TASK ATTACHMENTS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_task_attachments_created_by 
ON task_attachments(created_by);

CREATE INDEX IF NOT EXISTS idx_task_attachments_updated_by 
ON task_attachments(updated_by);

-- ============================================================================
-- USER ROLES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by 
ON user_roles(assigned_by);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_asset_assignments_assigned_by IS 'Index for foreign key to profiles.id - improves queries filtering by assigned_by';
COMMENT ON INDEX idx_assets_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_assets_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_credential_categories_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_credential_categories_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_credentials_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_credentials_last_used_by IS 'Index for foreign key to profiles.id - improves queries filtering by last user';
COMMENT ON INDEX idx_credentials_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_hr_templates_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_hr_templates_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_job_listings_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_job_listings_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_recruitment_calls_called_by_id IS 'Index for foreign key to profiles.id - improves queries filtering by caller';
COMMENT ON INDEX idx_recruitment_calls_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_recruitment_calls_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_task_attachments_created_by IS 'Index for foreign key to profiles.id - improves queries filtering by creator';
COMMENT ON INDEX idx_task_attachments_updated_by IS 'Index for foreign key to profiles.id - improves queries filtering by updater';
COMMENT ON INDEX idx_user_roles_assigned_by IS 'Index for foreign key to profiles.id - improves queries filtering by assigner';

