-- ============================================================================
-- Department Report Reminder Configuration Migration
-- ============================================================================
-- This migration creates the table to configure reminder schedules for
-- department reports.
-- ============================================================================

-- Create enum for reminder type
CREATE TYPE department_report_reminder_type AS ENUM ('before_deadline', 'on_deadline', 'after_deadline');

CREATE TABLE IF NOT EXISTS department_report_reminder_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  reminder_type department_report_reminder_type NOT NULL,
  days_before INTEGER,
  days_after INTEGER,
  escalation_level INTEGER NOT NULL DEFAULT 1,
  notify_users JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Validation: days_before required for before_deadline, days_after for after_deadline
  CONSTRAINT valid_before_deadline_config CHECK (
    reminder_type != 'before_deadline' OR days_before IS NOT NULL
  ),
  CONSTRAINT valid_after_deadline_config CHECK (
    reminder_type != 'after_deadline' OR days_after IS NOT NULL
  ),
  CONSTRAINT valid_escalation_level CHECK (
    escalation_level > 0 AND escalation_level <= 5
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_department_report_reminder_configs_department_id 
  ON department_report_reminder_configs(department_id);
CREATE INDEX IF NOT EXISTS idx_department_report_reminder_configs_reminder_type 
  ON department_report_reminder_configs(reminder_type);
CREATE INDEX IF NOT EXISTS idx_department_report_reminder_configs_is_active 
  ON department_report_reminder_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_department_report_reminder_configs_escalation_level 
  ON department_report_reminder_configs(escalation_level);

-- Create updated_at trigger
CREATE TRIGGER update_department_report_reminder_configs_updated_at
  BEFORE UPDATE ON department_report_reminder_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE department_report_reminder_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmins can do everything
CREATE POLICY "superadmin_all_department_report_reminder_configs"
ON department_report_reminder_configs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Everyone can view active configs
CREATE POLICY "all_view_active_reminder_configs"
ON department_report_reminder_configs FOR SELECT
TO authenticated
USING (is_active = true);

-- Insert default global reminder configurations
INSERT INTO department_report_reminder_configs (
  department_id,
  reminder_type,
  days_before,
  days_after,
  escalation_level,
  notify_users,
  is_active
) VALUES
  -- 1 day before deadline
  (
    NULL,
    'before_deadline',
    1,
    NULL,
    1,
    '["assigned_user"]'::jsonb,
    true
  ),
  -- On deadline day
  (
    NULL,
    'on_deadline',
    NULL,
    NULL,
    1,
    '["assigned_user", "manager"]'::jsonb,
    true
  ),
  -- 1 day after deadline (escalation level 1)
  (
    NULL,
    'after_deadline',
    NULL,
    1,
    1,
    '["assigned_user", "manager"]'::jsonb,
    true
  ),
  -- 3 days after deadline (escalation level 2)
  (
    NULL,
    'after_deadline',
    NULL,
    3,
    2,
    '["assigned_user", "manager", "superadmin"]'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE department_report_reminder_configs IS 'Configuration for reminder schedules for department reports';
COMMENT ON COLUMN department_report_reminder_configs.department_id IS 'NULL = global default, otherwise department-specific';
COMMENT ON COLUMN department_report_reminder_configs.days_before IS 'Days before deadline to send reminder (for before_deadline type)';
COMMENT ON COLUMN department_report_reminder_configs.days_after IS 'Days after deadline to send reminder (for after_deadline type)';
COMMENT ON COLUMN department_report_reminder_configs.escalation_level IS 'Escalation level (1-5) for multiple reminders';
COMMENT ON COLUMN department_report_reminder_configs.notify_users IS 'JSONB array of user IDs or roles: ["assigned_user", "manager", "superadmin"]';


