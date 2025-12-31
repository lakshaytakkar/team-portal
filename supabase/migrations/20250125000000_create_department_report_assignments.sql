-- ============================================================================
-- Department Report Assignments Migration
-- ============================================================================
-- This migration creates the table to track who is responsible for 
-- submitting department reports.
-- ============================================================================

-- Create enum for report type
CREATE TYPE department_report_type AS ENUM ('aggregated', 'separate', 'both');

-- ============================================================================
-- Department Report Assignments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS department_report_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES daily_report_categories(id) ON DELETE SET NULL,
  assigned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type department_report_type NOT NULL DEFAULT 'both',
  submission_deadline_time TIME NOT NULL DEFAULT '18:00:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  
  -- Ensure one active assignment per department/category combination
  CONSTRAINT unique_active_assignment UNIQUE NULLS NOT DISTINCT (department_id, category_id) 
    WHERE is_active = true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_department_report_assignments_department_id 
  ON department_report_assignments(department_id);
CREATE INDEX IF NOT EXISTS idx_department_report_assignments_category_id 
  ON department_report_assignments(category_id);
CREATE INDEX IF NOT EXISTS idx_department_report_assignments_assigned_user_id 
  ON department_report_assignments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_department_report_assignments_is_active 
  ON department_report_assignments(is_active) WHERE is_active = true;

-- Create updated_at trigger
CREATE TRIGGER update_department_report_assignments_updated_at
  BEFORE UPDATE ON department_report_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE department_report_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmins can do everything
CREATE POLICY "superadmin_all_department_report_assignments"
ON department_report_assignments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Assigned users can view their own assignments
CREATE POLICY "assigned_users_view_own_assignments"
ON department_report_assignments FOR SELECT
TO authenticated
USING (
  assigned_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Managers can view assignments for their department
CREATE POLICY "managers_view_department_assignments"
ON department_report_assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN departments d ON p.department_id = d.id
    WHERE p.id = auth.uid()
    AND p.role = 'manager'
    AND d.id = department_report_assignments.department_id
  )
);

-- Comments
COMMENT ON TABLE department_report_assignments IS 'Tracks who is responsible for submitting department reports';
COMMENT ON COLUMN department_report_assignments.report_type IS 'Type of report: aggregated (from individual reports), separate (independent), or both';
COMMENT ON COLUMN department_report_assignments.submission_deadline_time IS 'Time of day when report is due (e.g., 18:00 for 6 PM)';
COMMENT ON COLUMN department_report_assignments.timezone IS 'Timezone for deadline calculation';


