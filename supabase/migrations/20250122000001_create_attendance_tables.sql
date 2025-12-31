-- Migration: Create attendance tracking tables
-- Creates: attendance, attendance_corrections tables

-- ============================================================================
-- ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present', -- present, absent, late, half-day, leave
  work_hours DECIMAL(5,2), -- Calculated work hours
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, date) -- One attendance record per user per day
);

CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);

-- ============================================================================
-- ATTENDANCE CORRECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  requested_by_id UUID NOT NULL REFERENCES profiles(id),
  requested_date DATE NOT NULL,
  requested_check_in TIMESTAMPTZ,
  requested_check_out TIMESTAMPTZ,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by_id UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_corrections_attendance ON attendance_corrections(attendance_id);
CREATE INDEX IF NOT EXISTS idx_attendance_corrections_requested_by ON attendance_corrections(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_attendance_corrections_status ON attendance_corrections(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_attendance_corrections_updated_at ON attendance_corrections;
CREATE TRIGGER update_attendance_corrections_updated_at
  BEFORE UPDATE ON attendance_corrections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCTION TO CALCULATE WORK HOURS
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_work_hours(check_in TIMESTAMPTZ, check_out TIMESTAMPTZ)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF check_in IS NULL OR check_out IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(EXTRACT(EPOCH FROM (check_out - check_in)) / 3600.0, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate work hours
CREATE OR REPLACE FUNCTION update_attendance_work_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.work_hours = calculate_work_hours(NEW.check_in_time, NEW.check_out_time);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_attendance_work_hours_trigger ON attendance;
CREATE TRIGGER update_attendance_work_hours_trigger
  BEFORE INSERT OR UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_work_hours();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE attendance IS 'Daily attendance records for employees';
COMMENT ON TABLE attendance_corrections IS 'Requests to correct attendance records';
COMMENT ON COLUMN attendance.status IS 'Attendance status: present, absent, late, half-day, leave';
COMMENT ON COLUMN attendance_corrections.status IS 'Correction request status: pending, approved, rejected';

