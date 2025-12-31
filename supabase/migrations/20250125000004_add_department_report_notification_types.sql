-- ============================================================================
-- Add Department Report Notification Types
-- ============================================================================
-- This migration adds notification types for department report reminders
-- ============================================================================

-- Drop the existing CHECK constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new CHECK constraint with all notification types including department reports
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
  'asset_maintenance',
  -- Reminder notifications
  'reminder',
  -- Department report notifications
  'department_report_due_soon',
  'department_report_deadline_today',
  'department_report_late',
  'department_report_missing',
  'department_report_submitted',
  'department_report_reminder_escalation'
));


