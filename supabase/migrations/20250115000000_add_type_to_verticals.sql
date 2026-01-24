-- Migration: Add type field to verticals table
-- Types: service, product, saas, dropship

ALTER TABLE verticals ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('service', 'product', 'saas', 'dropship'));

CREATE INDEX IF NOT EXISTS idx_verticals_type ON verticals(type) WHERE deleted_at IS NULL;

