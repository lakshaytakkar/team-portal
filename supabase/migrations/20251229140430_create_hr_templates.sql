-- Migration: Create HR templates table
-- Creates: hr_templates table for managing HR message templates, form templates, policy templates, and printables

-- ============================================================================
-- HR TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hr_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'form', 'policy', 'printable')),
  category TEXT, -- e.g., 'onboarding', 'training', 'review', 'exit', 'compliance'
  description TEXT,
  content TEXT NOT NULL, -- Template content/body
  variables JSONB, -- Available template variables (e.g., {"employee_name": "Employee Name", "date": "Date"})
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hr_templates_type ON hr_templates(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hr_templates_active ON hr_templates(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hr_templates_category ON hr_templates(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hr_templates_type_active ON hr_templates(type, is_active) WHERE deleted_at IS NULL;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hr_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hr_templates_updated_at
  BEFORE UPDATE ON hr_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_templates_updated_at();

