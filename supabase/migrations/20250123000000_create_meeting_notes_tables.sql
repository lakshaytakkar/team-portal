-- Migration: Create meeting notes tables
-- Creates: meeting_notes table
-- ============================================================================
-- MEETING NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  attendees JSONB, -- Array of {name, role, email?}
  tags TEXT[], -- Array of tag strings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_meeting_notes_user_id ON meeting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_date ON meeting_notes(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_tags ON meeting_notes USING GIN(tags);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_meeting_notes_updated_at ON meeting_notes;
CREATE TRIGGER update_meeting_notes_updated_at
  BEFORE UPDATE ON meeting_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE meeting_notes IS 'Employee meeting notes and summaries.';
COMMENT ON COLUMN meeting_notes.attendees IS 'JSONB array of meeting attendees with name, role, and optional email.';
COMMENT ON COLUMN meeting_notes.tags IS 'Array of tag strings for categorizing meeting notes.';

