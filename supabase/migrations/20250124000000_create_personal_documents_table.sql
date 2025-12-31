-- Migration: Create personal documents table
-- Creates: personal_documents table for user file storage
-- ============================================================================
-- PERSONAL DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- e.g., "pdf", "image", "document", "spreadsheet"
  size BIGINT DEFAULT 0, -- Size in bytes
  url TEXT NOT NULL, -- Storage URL or file path
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_personal_documents_user_id ON personal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_documents_type ON personal_documents(type);
CREATE INDEX IF NOT EXISTS idx_personal_documents_uploaded_at ON personal_documents(uploaded_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_personal_documents_updated_at ON personal_documents;
CREATE TRIGGER update_personal_documents_updated_at
  BEFORE UPDATE ON personal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE personal_documents IS 'Personal file storage for users.';
COMMENT ON COLUMN personal_documents.type IS 'Document type category (pdf, image, document, spreadsheet, etc.).';
COMMENT ON COLUMN personal_documents.url IS 'Storage URL or file path in Supabase Storage.';

