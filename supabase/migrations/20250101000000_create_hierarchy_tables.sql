-- Migration: Create organizational hierarchy tables
-- Creates: verticals, roles, teams, positions tables

-- ============================================================================
-- VERTICALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS verticals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE, -- e.g., "usa-dropshipping"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verticals_active ON verticals(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_verticals_code ON verticals(code) WHERE deleted_at IS NULL;

-- ============================================================================
-- ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., "Sales Executive", "Video Editor"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id),
  vertical_id UUID REFERENCES verticals(id), -- NULL for vertical-agnostic teams
  name TEXT NOT NULL, -- Auto-generated: "Sales – LegalNations" or "Sales" if no vertical
  code TEXT, -- e.g., "sales-legalnations"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,
  UNIQUE(department_id, vertical_id) -- Prevent duplicate team combinations
);

CREATE INDEX IF NOT EXISTS idx_teams_department ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_teams_vertical ON teams(vertical_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active) WHERE deleted_at IS NULL;

-- ============================================================================
-- POSITIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  title TEXT, -- Optional override (e.g., "Senior Sales Executive" vs role "Sales Executive")
  is_primary BOOLEAN DEFAULT false, -- Mark primary position for employee
  start_date DATE,
  end_date DATE, -- NULL for active positions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_positions_employee ON positions(employee_id);
CREATE INDEX IF NOT EXISTS idx_positions_team ON positions(team_id);
CREATE INDEX IF NOT EXISTS idx_positions_role ON positions(role_id);
CREATE INDEX IF NOT EXISTS idx_positions_active ON positions(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_positions_primary ON positions(employee_id, is_primary) WHERE is_primary = true;

-- ============================================================================
-- UPDATE PROFILES TABLE
-- ============================================================================
-- Add primary_position_id for quick lookup (optional, nullable)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_position_id UUID REFERENCES positions(id);

CREATE INDEX IF NOT EXISTS idx_profiles_primary_position ON profiles(primary_position_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
DROP TRIGGER IF EXISTS update_verticals_updated_at ON verticals;
CREATE TRIGGER update_verticals_updated_at
  BEFORE UPDATE ON verticals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();






