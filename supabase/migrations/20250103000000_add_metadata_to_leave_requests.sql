-- Migration: Add metadata column to leave_requests table
-- This allows storing additional fields like coverage_plan, contact_during_leave, and documents

-- Add metadata JSONB column to store additional information
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN leave_requests.metadata IS 'Additional leave request information: {coverage_plan: string, contact_during_leave: string, documents: string[]}';

-- Create index for JSONB queries if needed (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_leave_requests_metadata ON leave_requests USING GIN (metadata);

