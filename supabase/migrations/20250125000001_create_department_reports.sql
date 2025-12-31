-- ============================================================================
-- Department Reports Migration
-- ============================================================================
-- This migration creates the table for department-level reports
-- (distinct from individual employee reports).
-- ============================================================================

-- Create enum for department report status
CREATE TYPE department_report_status AS ENUM ('draft', 'submitted', 'late');

-- Create enum for department report type
CREATE TYPE department_report_type_enum AS ENUM ('aggregated', 'separate', 'hybrid');

-- ============================================================================
-- Department Reports Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS department_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES daily_report_categories(id) ON DELETE SET NULL,
  report_date DATE NOT NULL,
  report_type department_report_type_enum NOT NULL DEFAULT 'aggregated',
  submitted_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status department_report_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL,
  is_late BOOLEAN NOT NULL DEFAULT false,
  summary_data JSONB DEFAULT '{}'::jsonb,
  custom_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  
  -- Ensure one report per department/date/category combination
  CONSTRAINT unique_department_report UNIQUE (department_id, report_date, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_department_reports_department_id 
  ON department_reports(department_id);
CREATE INDEX IF NOT EXISTS idx_department_reports_category_id 
  ON department_reports(category_id);
CREATE INDEX IF NOT EXISTS idx_department_reports_report_date 
  ON department_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_department_reports_status 
  ON department_reports(status);
CREATE INDEX IF NOT EXISTS idx_department_reports_submitted_by_id 
  ON department_reports(submitted_by_id);
CREATE INDEX IF NOT EXISTS idx_department_reports_deadline 
  ON department_reports(deadline);
CREATE INDEX IF NOT EXISTS idx_department_reports_is_late 
  ON department_reports(is_late) WHERE is_late = true;
CREATE INDEX IF NOT EXISTS idx_department_reports_created_at 
  ON department_reports(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_department_reports_updated_at
  BEFORE UPDATE ON department_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate is_late
CREATE OR REPLACE FUNCTION calculate_department_report_late_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND NEW.submitted_at IS NOT NULL THEN
    NEW.is_late := NEW.submitted_at > NEW.deadline;
    IF NEW.is_late THEN
      NEW.status := 'late';
    END IF;
  ELSIF NEW.status = 'draft' AND NOW() > NEW.deadline THEN
    NEW.is_late := true;
  ELSE
    NEW.is_late := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update is_late
CREATE TRIGGER calculate_department_report_late
  BEFORE INSERT OR UPDATE ON department_reports
  FOR EACH ROW
  EXECUTE FUNCTION calculate_department_report_late_status();

-- Enable RLS
ALTER TABLE department_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmins can do everything
CREATE POLICY "superadmin_all_department_reports"
ON department_reports FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Users can view reports for their department
CREATE POLICY "users_view_department_reports"
ON department_reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role = 'superadmin'
      OR profiles.department_id = department_reports.department_id
    )
  )
);

-- Assigned users can create/update reports for their assigned departments
CREATE POLICY "assigned_users_manage_department_reports"
ON department_reports FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM department_report_assignments dra
    WHERE dra.department_id = department_reports.department_id
    AND dra.assigned_user_id = auth.uid()
    AND dra.is_active = true
    AND (
      dra.category_id IS NULL 
      OR dra.category_id = department_reports.category_id
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

CREATE POLICY "assigned_users_update_department_reports"
ON department_reports FOR UPDATE
TO authenticated
USING (
  (
    status = 'draft'
    AND EXISTS (
      SELECT 1 FROM department_report_assignments dra
      WHERE dra.department_id = department_reports.department_id
      AND dra.assigned_user_id = auth.uid()
      AND dra.is_active = true
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Comments
COMMENT ON TABLE department_reports IS 'Department-level daily reports (aggregated or separate)';
COMMENT ON COLUMN department_reports.report_type IS 'Type: aggregated (from individual reports), separate (independent), or hybrid (both)';
COMMENT ON COLUMN department_reports.summary_data IS 'Aggregated metrics from individual reports (JSONB)';
COMMENT ON COLUMN department_reports.custom_data IS 'Additional data for separate reports (JSONB)';
COMMENT ON COLUMN department_reports.deadline IS 'Calculated deadline (report_date + deadline_time from assignment)';
COMMENT ON COLUMN department_reports.is_late IS 'Automatically calculated based on submission time vs deadline';


