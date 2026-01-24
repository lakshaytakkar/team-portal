-- Migration: Create employee documents management tables
-- Creates: document_collections, document_types, employee_documents tables

-- ============================================================================
-- DOCUMENT COLLECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., "KYC Documents", "Employment Documents"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_document_collections_name ON document_collections(name);
CREATE INDEX IF NOT EXISTS idx_document_collections_active ON document_collections(is_active) WHERE is_active = true;

-- ============================================================================
-- DOCUMENT TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., "Aadhaar Card", "PAN Card", "Employment Contract"
  collection_id UUID REFERENCES document_collections(id),
  is_kyc BOOLEAN DEFAULT false, -- True for KYC documents
  is_signed_document BOOLEAN DEFAULT false, -- True for documents requiring signature workflow
  expiry_tracking BOOLEAN DEFAULT false, -- Whether this document type can expire
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_types_name ON document_types(name);
CREATE INDEX IF NOT EXISTS idx_document_types_collection ON document_types(collection_id);
CREATE INDEX IF NOT EXISTS idx_document_types_kyc ON document_types(is_kyc) WHERE is_kyc = true;
CREATE INDEX IF NOT EXISTS idx_document_types_signed ON document_types(is_signed_document) WHERE is_signed_document = true;

-- ============================================================================
-- EMPLOYEE DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  collection_id UUID NOT NULL REFERENCES document_collections(id),
  name TEXT NOT NULL, -- Display name/title
  file_name TEXT NOT NULL, -- Original filename
  file_path TEXT NOT NULL, -- Path in Supabase Storage (bucket: employee-documents)
  file_size BIGINT NOT NULL, -- Size in bytes
  mime_type TEXT NOT NULL, -- e.g., "application/pdf", "image/png"
  collection_status TEXT NOT NULL DEFAULT 'pending', -- For KYC/docs collected: pending, collected, expired, missing
  document_status TEXT, -- For issued docs: draft, issued, signed, archived
  expiry_date DATE, -- Optional expiry date (for KYC docs)
  issued_date DATE, -- When document was issued to employee
  signed_date DATE, -- When document was signed
  uploaded_by UUID REFERENCES profiles(id),
  issued_by UUID REFERENCES profiles(id), -- Who issued the document
  signed_by UUID REFERENCES profiles(id), -- Employee who signed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  CONSTRAINT valid_collection_status CHECK (collection_status IN ('pending', 'collected', 'expired', 'missing')),
  CONSTRAINT valid_document_status CHECK (document_status IS NULL OR document_status IN ('draft', 'issued', 'signed', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_collection ON employee_documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_collection_status ON employee_documents(collection_status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_document_status ON employee_documents(document_status) WHERE document_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employee_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_collection ON employee_documents(employee_id, collection_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_document_collections_updated_at ON document_collections;
CREATE TRIGGER update_document_collections_updated_at
  BEFORE UPDATE ON document_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_employee_documents_updated_at ON employee_documents;
CREATE TRIGGER update_employee_documents_updated_at
  BEFORE UPDATE ON employee_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA: DOCUMENT COLLECTIONS
-- ============================================================================
INSERT INTO document_collections (name, description, is_active) VALUES
  ('KYC Documents', 'Identity and verification documents collected during onboarding', true),
  ('Employment Documents', 'Documents issued and signed by employees (contracts, offers, NDAs)', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA: DOCUMENT TYPES
-- ============================================================================
-- Get collection IDs for FK references
DO $$
DECLARE
  kyc_collection_id UUID;
  employment_collection_id UUID;
BEGIN
  SELECT id INTO kyc_collection_id FROM document_collections WHERE name = 'KYC Documents' LIMIT 1;
  SELECT id INTO employment_collection_id FROM document_collections WHERE name = 'Employment Documents' LIMIT 1;

  -- KYC Document Types
  INSERT INTO document_types (name, collection_id, is_kyc, is_signed_document, expiry_tracking) VALUES
    ('Aadhaar Card', kyc_collection_id, true, false, true),
    ('PAN Card', kyc_collection_id, true, false, true),
    ('Address Proof', kyc_collection_id, true, false, true),
    ('Bank Statement', kyc_collection_id, true, false, false)
  ON CONFLICT (name) DO NOTHING;

  -- Employment Document Types (Signed Documents)
  INSERT INTO document_types (name, collection_id, is_kyc, is_signed_document, expiry_tracking) VALUES
    ('Employment Contract', employment_collection_id, false, true, false),
    ('Offer Letter', employment_collection_id, false, true, false),
    ('NDA', employment_collection_id, false, true, false)
  ON CONFLICT (name) DO NOTHING;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE document_collections IS 'Categories/folders for grouping employee documents';
COMMENT ON TABLE document_types IS 'Predefined document type definitions (Aadhaar, PAN, Contracts, etc.)';
COMMENT ON TABLE employee_documents IS 'Individual employee documents with file storage and status tracking';
COMMENT ON COLUMN employee_documents.collection_status IS 'For KYC/docs collected: pending, collected, expired, missing';
COMMENT ON COLUMN employee_documents.document_status IS 'For issued docs: draft, issued, signed, archived';
COMMENT ON COLUMN employee_documents.file_path IS 'Path in Supabase Storage bucket: employee-documents/{employee_id}/{document_id}/{timestamp}-{filename}';
