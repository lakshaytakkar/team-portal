-- Migration: Add new notification types to CHECK constraint
-- Purpose: Add notification types for Projects, Calls, Leave Requests, and Assets

-- Drop the existing CHECK constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new CHECK constraint with all notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  -- Task notifications
  'task_assigned',
  'task_due_soon',
  'task_overdue',
  'task_completed',
  'task_blocked',
  'task_comment_added',
  'task_attachment_added',
  'task_status_changed',
  'task_priority_changed',
  -- Project notifications
  'project_assigned',
  'project_status_changed',
  'project_due_soon',
  'project_overdue',
  'project_completed',
  'project_member_added',
  -- Call notifications
  'call_assigned',
  'call_scheduled',
  'call_upcoming',
  'call_status_changed',
  'call_completed',
  -- Leave request notifications
  'leave_request_submitted',
  'leave_request_approved',
  'leave_request_rejected',
  'leave_request_status_changed',
  -- Asset notifications
  'asset_assigned',
  'asset_returned',
  'asset_maintenance'
));

