-- Migration: Create asset management tables
-- Creates: asset_types, assets, asset_assignments tables

-- ============================================================================
-- ASSET TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headphones', 'tablet', 'docking-station'
  icon TEXT, -- Icon identifier for UI (e.g., 'laptop', 'monitor', 'smartphone')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_types_name ON asset_types(name);

-- Seed asset types
INSERT INTO asset_types (name, icon) VALUES
  ('laptop', 'laptop'),
  ('monitor', 'monitor'),
  ('phone', 'smartphone'),
  ('keyboard', 'keyboard'),
  ('mouse', 'mouse'),
  ('headphones', 'headphones'),
  ('tablet', 'tablet'),
  ('docking-station', 'plug')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "MacBook Pro 16-inch"
  asset_type_id UUID NOT NULL REFERENCES asset_types(id),
  serial_number TEXT UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'assigned', 'maintenance', 'retired'
  image_url TEXT NOT NULL, -- Required: URL to uploaded asset image
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('available', 'assigned', 'maintenance', 'retired'))
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_deleted ON assets(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- ASSET ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE, -- NULL if currently assigned
  assigned_by UUID REFERENCES profiles(id),
  return_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_employee ON asset_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_active ON asset_assignments(asset_id, return_date) WHERE return_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_asset_assignments_dates ON asset_assignments(assigned_date, return_date);

-- ============================================================================
-- FUNCTION FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_asset_assignments_updated_at ON asset_assignments;
CREATE TRIGGER update_asset_assignments_updated_at
  BEFORE UPDATE ON asset_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE asset_types IS 'Predefined asset categories';
COMMENT ON TABLE assets IS 'Organizational asset inventory';
COMMENT ON TABLE asset_assignments IS 'Asset assignment history tracking';
COMMENT ON COLUMN assets.status IS 'Asset status: available, assigned, maintenance, retired';
COMMENT ON COLUMN assets.image_url IS 'Required: URL to asset image stored in Supabase Storage';
COMMENT ON COLUMN asset_assignments.return_date IS 'NULL if currently assigned, set when asset is returned';

