-- Migration: Create task_comments and task_dependencies tables
-- Purpose: Enable comments and dependencies for tasks

-- ============================================================================
-- TASK COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_by ON task_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_task_comments_deleted ON task_comments(deleted_at) WHERE deleted_at IS NULL;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TASK DEPENDENCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id) -- Prevent self-dependency
);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE task_comments IS 'Comments/notes on tasks';
COMMENT ON TABLE task_dependencies IS 'Task dependencies - tasks that must be completed before this task';

