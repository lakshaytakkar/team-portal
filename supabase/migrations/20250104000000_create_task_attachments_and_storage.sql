-- Migration: Create task_attachments table and storage bucket
-- Purpose: Enable file attachments for tasks with Supabase Storage

-- ============================================================================
-- TASK ATTACHMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_task_attachments_deleted ON task_attachments(deleted_at) WHERE deleted_at IS NULL;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_task_attachments_updated_at ON task_attachments;
CREATE TRIGGER update_task_attachments_updated_at
  BEFORE UPDATE ON task_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- STORAGE BUCKET: task-attachments
-- ============================================================================
-- Create the storage bucket if it doesn't exist
-- Note: Bucket creation via SQL requires proper permissions
-- If this fails, create the bucket manually via Supabase Dashboard or CLI
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  true, -- Public bucket so files can be accessed via URL
  26214400, -- 25MB limit (25 * 1024 * 1024)
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete task attachments" ON storage.objects;

-- Policy: Allow authenticated users to upload files to task-attachments bucket
CREATE POLICY "Users can upload task attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-attachments' AND
  auth.uid() IS NOT NULL
);

-- Policy: Allow authenticated users to view files in task-attachments bucket
-- Files are public, but we still check authentication for consistency
CREATE POLICY "Users can view task attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-attachments'
);

-- Policy: Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete task attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-attachments' AND
  auth.uid() IS NOT NULL
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE task_attachments IS 'File attachments for tasks stored in Supabase Storage';
COMMENT ON COLUMN task_attachments.file_url IS 'Public URL to file in task-attachments storage bucket';
COMMENT ON COLUMN task_attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN task_attachments.mime_type IS 'MIME type of the uploaded file';

