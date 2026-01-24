-- Migration: Create training LMS tables
-- Creates: playlists, trainings, training_playlist_items, training_progress tables

-- ============================================================================
-- PLAYLISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0, -- For ordering playlists
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_playlists_active ON playlists(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_playlists_order ON playlists(order_index);

-- ============================================================================
-- TRAININGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., "Onboarding", "Sales", "Technical"
  duration INTEGER, -- Duration in minutes
  video_url TEXT NOT NULL, -- URL to video (can be external or Supabase Storage)
  thumbnail_url TEXT, -- URL to thumbnail image
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL, -- Optional: can belong to a playlist
  order_index INTEGER DEFAULT 0, -- For ordering within playlist
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_trainings_active ON trainings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_trainings_playlist ON trainings(playlist_id);
CREATE INDEX IF NOT EXISTS idx_trainings_category ON trainings(category);
CREATE INDEX IF NOT EXISTS idx_trainings_order ON trainings(playlist_id, order_index);

-- ============================================================================
-- TRAINING PLAYLIST ITEMS TABLE (Many-to-many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS training_playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0, -- Order within the playlist
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, training_id) -- Prevent duplicate entries
);

CREATE INDEX IF NOT EXISTS idx_training_playlist_items_playlist ON training_playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_training_playlist_items_training ON training_playlist_items(training_id);
CREATE INDEX IF NOT EXISTS idx_training_playlist_items_order ON training_playlist_items(playlist_id, order_index);

-- ============================================================================
-- TRAINING PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not-started', -- not-started, in-progress, completed
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, training_id) -- One progress record per user per training
);

CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_training ON training_progress(training_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_status ON training_progress(status);
CREATE INDEX IF NOT EXISTS idx_training_progress_user_training ON training_progress(user_id, training_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_trainings_updated_at ON trainings;
CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON trainings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_training_progress_updated_at ON training_progress;
CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TRIGGER TO UPDATE LAST_ACCESSED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_training_progress_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_training_progress_last_accessed_trigger ON training_progress;
CREATE TRIGGER update_training_progress_last_accessed_trigger
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  WHEN (OLD.progress_percentage IS DISTINCT FROM NEW.progress_percentage)
  EXECUTE FUNCTION update_training_progress_last_accessed();

-- ============================================================================
-- TRIGGER TO SET COMPLETED_AT WHEN STATUS CHANGES TO COMPLETED
-- ============================================================================
CREATE OR REPLACE FUNCTION set_training_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
    NEW.progress_percentage = 100;
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_training_completed_at_trigger ON training_progress;
CREATE TRIGGER set_training_completed_at_trigger
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  EXECUTE FUNCTION set_training_completed_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE playlists IS 'Training playlists/categories for organizing trainings';
COMMENT ON TABLE trainings IS 'Individual training videos/courses';
COMMENT ON TABLE training_playlist_items IS 'Many-to-many relationship between playlists and trainings';
COMMENT ON TABLE training_progress IS 'User progress tracking for each training';
COMMENT ON COLUMN trainings.video_url IS 'URL to video (can be external like YouTube or Supabase Storage)';
COMMENT ON COLUMN training_progress.status IS 'Training status: not-started, in-progress, completed';
COMMENT ON COLUMN training_progress.progress_percentage IS 'Progress percentage (0-100) based on video watch time';

