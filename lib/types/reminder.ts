/**
 * Reminder types for the application
 */

export type ReminderStatus = 'scheduled' | 'triggered' | 'completed' | 'cancelled'
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrencePattern {
  type: RecurrenceType
  interval?: number // e.g., every 2 days, every 3 weeks
  days_of_week?: number[] // For weekly: [1,3,5] where 1=Monday, 7=Sunday
  day_of_month?: number // For monthly: day of month (1-31)
  end_date?: string // Optional end date in YYYY-MM-DD format
}

export interface Reminder {
  id: string
  createdBy: string
  assignedTo: string
  title: string
  message: string
  reminderDate: string
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern | null
  status: ReminderStatus
  priority: ReminderPriority
  actionRequired: boolean
  actionUrl?: string | null
  data?: Record<string, any> | null
  triggeredAt?: string | null
  completedAt?: string | null
  acknowledgedAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateReminderInput {
  assignedTo: string // User ID or email
  title: string
  message: string
  reminderDate: string // ISO timestamp
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern | null
  priority?: ReminderPriority
  actionRequired?: boolean
  actionUrl?: string | null
  data?: Record<string, any> | null
}

export interface UpdateReminderInput {
  assignedTo?: string
  title?: string
  message?: string
  reminderDate?: string
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern | null
  priority?: ReminderPriority
  actionRequired?: boolean
  actionUrl?: string | null
  data?: Record<string, any> | null
  status?: ReminderStatus
}

export interface ReminderFilters {
  status?: ReminderStatus
  priority?: ReminderPriority
  assignedTo?: string
  createdBy?: string
  startDate?: string
  endDate?: string
  isRecurring?: boolean
  limit?: number
  offset?: number
}

