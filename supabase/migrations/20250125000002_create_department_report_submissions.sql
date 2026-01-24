-- ============================================================================
-- Department Report Submissions Tracking Migration
-- ============================================================================
-- This migration creates the table to track submission history and compliance
-- for department reports.
-- ============================================================================

CREATE TABLE IF NOT EXISTS department_report_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_report_id UUID NOT NULL REFERENCES department_reports(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  expected_deadline TIMESTAMPTZ NOT NULL,
  actual_submission_time TIMESTAMPTZ,
  is_on_time BOOLEAN,
  days_late INTEGER,
  reminder_sent_count INTEGER NOT NULL DEFAULT 0,
  last_reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One submission record per report
  CONSTRAINT unique_submission_per_report UNIQUE (department_report_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_department_report_submissions_department_report_id 
  ON department_report_submissions(department_report_id);
CREATE INDEX IF NOT EXISTS idx_department_report_submissions_department_id 
  ON department_report_submissions(department_id);
CREATE INDEX IF NOT EXISTS idx_department_report_submissions_report_date 
  ON department_report_submissions(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_department_report_submissions_is_on_time 
  ON department_report_submissions(is_on_time) WHERE is_on_time = false;
CREATE INDEX IF NOT EXISTS idx_department_report_submissions_expected_deadline 
  ON department_report_submissions(expected_deadline);

-- Create updated_at trigger
CREATE TRIGGER update_department_report_submissions_updated_at
  BEFORE UPDATE ON department_report_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate is_on_time and days_late
CREATE OR REPLACE FUNCTION calculate_submission_compliance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.actual_submission_time IS NOT NULL THEN
    NEW.is_on_time := NEW.actual_submission_time <= NEW.expected_deadline;
    
    IF NOT NEW.is_on_time THEN
      NEW.days_late := EXTRACT(EPOCH FROM (NEW.actual_submission_time - NEW.expected_deadline)) / 86400;
      NEW.days_late := CEIL(NEW.days_late)::INTEGER;
    ELSE
      NEW.days_late := NULL;
    END IF;
  ELSE
    -- If not submitted yet, check if deadline has passed
    IF NOW() > NEW.expected_deadline THEN
      NEW.is_on_time := false;
      NEW.days_late := EXTRACT(EPOCH FROM (NOW() - NEW.expected_deadline)) / 86400;
      NEW.days_late := CEIL(NEW.days_late)::INTEGER;
    ELSE
      NEW.is_on_time := NULL;
      NEW.days_late := NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate compliance
CREATE TRIGGER calculate_submission_compliance_trigger
  BEFORE INSERT OR UPDATE ON department_report_submissions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_submission_compliance();

-- Function to auto-create submission record when report is submitted
CREATE OR REPLACE FUNCTION create_submission_record_on_submit()
RETURNS TRIGGER AS $$
DECLARE
  assignment_record RECORD;
  calculated_deadline TIMESTAMPTZ;
BEGIN
  -- Only create submission record when status changes to 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
    -- Get assignment to calculate deadline
    SELECT dra.submission_deadline_time, dra.timezone
    INTO assignment_record
    FROM department_report_assignments dra
    WHERE dra.department_id = NEW.department_id
    AND (
      dra.category_id IS NULL 
      OR dra.category_id = NEW.category_id
    )
    AND dra.is_active = true
    LIMIT 1;
    
    -- Calculate deadline (report_date + deadline_time in timezone)
    IF assignment_record.submission_deadline_time IS NOT NULL THEN
      calculated_deadline := (
        NEW.report_date::timestamp + assignment_record.submission_deadline_time::interval
      ) AT TIME ZONE assignment_record.timezone;
    ELSE
      -- Default to end of day if no assignment found
      calculated_deadline := (NEW.report_date + INTERVAL '1 day')::timestamp AT TIME ZONE 'UTC';
    END IF;
    
    -- Insert or update submission record
    INSERT INTO department_report_submissions (
      department_report_id,
      department_id,
      report_date,
      expected_deadline,
      actual_submission_time
    )
    VALUES (
      NEW.id,
      NEW.department_id,
      NEW.report_date,
      calculated_deadline,
      NEW.submitted_at
    )
    ON CONFLICT (department_report_id)
    DO UPDATE SET
      actual_submission_time = NEW.submitted_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create submission record
CREATE TRIGGER create_submission_on_report_submit
  AFTER INSERT OR UPDATE OF status, submitted_at ON department_reports
  FOR EACH ROW
  EXECUTE FUNCTION create_submission_record_on_submit();

-- Enable RLS
ALTER TABLE department_report_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmins can do everything
CREATE POLICY "superadmin_all_department_report_submissions"
ON department_report_submissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Users can view submissions for their department
CREATE POLICY "users_view_department_submissions"
ON department_report_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role = 'superadmin'
      OR profiles.department_id = department_report_submissions.department_id
    )
  )
);

-- Comments
COMMENT ON TABLE department_report_submissions IS 'Tracks submission history and compliance for department reports';
COMMENT ON COLUMN department_report_submissions.is_on_time IS 'True if submitted before or at deadline';
COMMENT ON COLUMN department_report_submissions.days_late IS 'Number of days late (NULL if on time)';
COMMENT ON COLUMN department_report_submissions.reminder_sent_count IS 'Number of reminders sent for this submission';









