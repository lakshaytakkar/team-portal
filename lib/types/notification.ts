/**
 * Notification types for the application
 */

export type NotificationType =
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'task_completed'
  | 'task_blocked'
  | 'task_comment_added'
  | 'task_attachment_added'
  | 'task_status_changed'
  | 'task_priority_changed'
  | 'project_assigned'
  | 'project_status_changed'
  | 'project_due_soon'
  | 'project_overdue'
  | 'project_completed'
  | 'project_member_added'
  | 'call_assigned'
  | 'call_scheduled'
  | 'call_upcoming'
  | 'call_status_changed'
  | 'call_completed'
  | 'leave_request_submitted'
  | 'leave_request_approved'
  | 'leave_request_rejected'
  | 'leave_request_status_changed'
  | 'asset_assigned'
  | 'asset_returned'
  | 'asset_maintenance'
  | 'reminder'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any> // Additional data for the notification
  read: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

export interface NotificationFilters {
  read?: boolean
  type?: NotificationType
  limit?: number
  offset?: number
}

