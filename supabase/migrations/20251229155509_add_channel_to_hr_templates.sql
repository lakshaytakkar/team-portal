-- Migration: Add channel field to hr_templates table
-- Adds channel column to distinguish WhatsApp vs Email message templates

-- Add channel column (nullable, no constraint yet)
ALTER TABLE hr_templates 
ADD COLUMN channel TEXT;

-- Set default channel for existing message templates
UPDATE hr_templates 
SET channel = 'email' 
WHERE type = 'message' AND channel IS NULL;

-- Add CHECK constraint for channel values
ALTER TABLE hr_templates 
ADD CONSTRAINT check_channel_values 
CHECK (channel IS NULL OR channel IN ('whatsapp', 'email'));

-- Add constraint: channel only for message type
ALTER TABLE hr_templates 
ADD CONSTRAINT check_channel_only_for_message 
CHECK ((type = 'message' AND channel IS NOT NULL) OR (type != 'message' AND channel IS NULL));

