-- ============================================================================
-- Daily Reporting System Migration
-- ============================================================================
-- This migration extends the daily_reports table and creates supporting
-- tables for category-based reporting with department-specific fields.
-- ============================================================================

-- Extend daily_reports table
ALTER TABLE daily_reports
  ADD COLUMN IF NOT EXISTS category_id UUID,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for category_id
CREATE INDEX IF NOT EXISTS idx_daily_reports_category_id ON daily_reports(category_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_department_id ON daily_reports(department_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);

-- ============================================================================
-- Daily Report Categories Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_report_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  form_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Add foreign key for category_id in daily_reports
ALTER TABLE daily_reports
  ADD CONSTRAINT daily_reports_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES daily_report_categories(id);

-- Create indexes for daily_report_categories
CREATE INDEX IF NOT EXISTS idx_daily_report_categories_department_id ON daily_report_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_categories_code ON daily_report_categories(code);
CREATE INDEX IF NOT EXISTS idx_daily_report_categories_is_active ON daily_report_categories(is_active);

-- ============================================================================
-- Daily Report Field Values Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_report_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_value JSONB NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'array', 'object', 'boolean', 'date')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(daily_report_id, field_key)
);

-- Create indexes for daily_report_field_values
CREATE INDEX IF NOT EXISTS idx_daily_report_field_values_daily_report_id ON daily_report_field_values(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_field_values_field_key ON daily_report_field_values(field_key);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE daily_report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_field_values ENABLE ROW LEVEL SECURITY;

-- Daily Report Categories Policies
CREATE POLICY "superadmin_all_daily_report_categories"
ON daily_report_categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

CREATE POLICY "all_view_active_daily_report_categories"
ON daily_report_categories FOR SELECT
TO authenticated
USING (is_active = true);

-- Daily Report Field Values Policies
CREATE POLICY "superadmin_all_daily_report_field_values"
ON daily_report_field_values FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

CREATE POLICY "executive_view_own_daily_report_field_values"
ON daily_report_field_values FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM daily_reports
    WHERE daily_reports.id = daily_report_field_values.daily_report_id
    AND daily_reports.user_id = auth.uid()
  )
);

CREATE POLICY "executive_create_own_daily_report_field_values"
ON daily_report_field_values FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM daily_reports
    WHERE daily_reports.id = daily_report_field_values.daily_report_id
    AND daily_reports.user_id = auth.uid()
  )
);

CREATE POLICY "executive_update_own_daily_report_field_values"
ON daily_report_field_values FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM daily_reports
    WHERE daily_reports.id = daily_report_field_values.daily_report_id
    AND daily_reports.user_id = auth.uid()
  )
);

-- ============================================================================
-- Seed Default Categories
-- ============================================================================

INSERT INTO daily_report_categories (name, code, description, form_config, is_active)
VALUES
  (
    'Standard Report',
    'standard',
    'Standard daily report with basic fields',
    '{
      "steps": [
        {
          "step": 1,
          "title": "Basic Information",
          "fields": [
            {"key": "date", "type": "date", "label": "Date", "required": true}
          ]
        },
        {
          "step": 2,
          "title": "Tasks",
          "fields": [
            {"key": "tasks_completed", "type": "array", "label": "Tasks Completed", "required": true},
            {"key": "tasks_planned", "type": "array", "label": "Tasks Planned", "required": false},
            {"key": "blockers", "type": "array", "label": "Blockers", "required": false}
          ]
        },
        {
          "step": 3,
          "title": "Notes",
          "fields": [
            {"key": "notes", "type": "text", "label": "Additional Notes", "required": false}
          ]
        }
      ]
    }'::jsonb,
    true
  ),
  (
    'Sales Report',
    'sales',
    'Sales-specific daily report with metrics',
    '{
      "steps": [
        {
          "step": 1,
          "title": "Basic Information",
          "fields": [
            {"key": "date", "type": "date", "label": "Date", "required": true}
          ]
        },
        {
          "step": 2,
          "title": "Sales Metrics",
          "fields": [
            {"key": "vip_clients_contacted", "type": "number", "label": "VIP Clients Contacted", "required": false},
            {"key": "connected_calls", "type": "number", "label": "Connected Calls", "required": false},
            {"key": "meetings_scheduled", "type": "number", "label": "Meetings Scheduled", "required": false},
            {"key": "deals_progressed", "type": "array", "label": "Deals Progressed (Deal IDs)", "required": false}
          ]
        },
        {
          "step": 3,
          "title": "Tasks",
          "fields": [
            {"key": "tasks_completed", "type": "array", "label": "Tasks Completed", "required": true},
            {"key": "tasks_planned", "type": "array", "label": "Tasks Planned", "required": false},
            {"key": "blockers", "type": "array", "label": "Blockers", "required": false}
          ]
        },
        {
          "step": 4,
          "title": "Notes",
          "fields": [
            {"key": "notes", "type": "text", "label": "Additional Notes", "required": false}
          ]
        }
      ]
    }'::jsonb,
    true
  ),
  (
    'Engineering Report',
    'engineering',
    'Engineering-specific daily report with development metrics',
    '{
      "steps": [
        {
          "step": 1,
          "title": "Basic Information",
          "fields": [
            {"key": "date", "type": "date", "label": "Date", "required": true}
          ]
        },
        {
          "step": 2,
          "title": "Development Metrics",
          "fields": [
            {"key": "code_commits", "type": "number", "label": "Code Commits", "required": false},
            {"key": "pull_requests_created", "type": "number", "label": "Pull Requests Created", "required": false},
            {"key": "bugs_fixed", "type": "number", "label": "Bugs Fixed", "required": false},
            {"key": "features_completed", "type": "array", "label": "Features Completed", "required": false}
          ]
        },
        {
          "step": 3,
          "title": "Tasks",
          "fields": [
            {"key": "tasks_completed", "type": "array", "label": "Tasks Completed", "required": true},
            {"key": "tasks_planned", "type": "array", "label": "Tasks Planned", "required": false},
            {"key": "blockers", "type": "array", "label": "Blockers", "required": false}
          ]
        },
        {
          "step": 4,
          "title": "Notes",
          "fields": [
            {"key": "notes", "type": "text", "label": "Additional Notes", "required": false}
          ]
        }
      ]
    }'::jsonb,
    true
  ),
  (
    'HR Report',
    'hr',
    'HR-specific daily report with recruitment metrics',
    '{
      "steps": [
        {
          "step": 1,
          "title": "Basic Information",
          "fields": [
            {"key": "date", "type": "date", "label": "Date", "required": true}
          ]
        },
        {
          "step": 2,
          "title": "HR Metrics",
          "fields": [
            {"key": "interviews_conducted", "type": "number", "label": "Interviews Conducted", "required": false},
            {"key": "candidates_processed", "type": "number", "label": "Candidates Processed", "required": false},
            {"key": "documents_reviewed", "type": "number", "label": "Documents Reviewed", "required": false}
          ]
        },
        {
          "step": 3,
          "title": "Tasks",
          "fields": [
            {"key": "tasks_completed", "type": "array", "label": "Tasks Completed", "required": true},
            {"key": "tasks_planned", "type": "array", "label": "Tasks Planned", "required": false},
            {"key": "blockers", "type": "array", "label": "Blockers", "required": false}
          ]
        },
        {
          "step": 4,
          "title": "Notes",
          "fields": [
            {"key": "notes", "type": "text", "label": "Additional Notes", "required": false}
          ]
        }
      ]
    }'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Update existing daily_reports to use standard category if category_id is null
-- ============================================================================

UPDATE daily_reports
SET category_id = (SELECT id FROM daily_report_categories WHERE code = 'standard' LIMIT 1)
WHERE category_id IS NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE daily_report_categories IS 'Defines report categories with form configurations';
COMMENT ON TABLE daily_report_field_values IS 'Stores department-specific field values for daily reports';
COMMENT ON COLUMN daily_reports.category_id IS 'Category of the report (determines form fields)';
COMMENT ON COLUMN daily_reports.department_id IS 'Department for department-specific requirements';
COMMENT ON COLUMN daily_reports.metadata IS 'Additional flexible data storage';
COMMENT ON COLUMN daily_report_categories.form_config IS 'JSONB configuration defining form steps and fields';
COMMENT ON COLUMN daily_report_field_values.field_key IS 'Key identifier for the field (e.g., vip_clients_count)';
COMMENT ON COLUMN daily_report_field_values.field_value IS 'Value stored as JSONB (can be string, number, array, object)';
COMMENT ON COLUMN daily_report_field_values.field_type IS 'Type of the field value for validation';

