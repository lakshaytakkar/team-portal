/**
 * Department Reports Types
 * 
 * Types for the department-level daily reporting system with aggregation,
 * separate reports, submission tracking, and reminders.
 */

export type DepartmentReportStatus = 'draft' | 'submitted' | 'late'

export type DepartmentReportType = 'aggregated' | 'separate' | 'hybrid'

export type DepartmentReportReminderType = 'before_deadline' | 'on_deadline' | 'after_deadline'

export interface DepartmentReportAssignment {
  id: string
  departmentId: string
  department?: {
    id: string
    name: string
    code?: string
  }
  categoryId?: string
  category?: {
    id: string
    name: string
    code: string
  }
  assignedUserId: string
  assignedUser?: {
    id: string
    name: string
    email: string
  }
  reportType: 'aggregated' | 'separate' | 'both'
  submissionDeadlineTime: string // TIME format "HH:mm:ss"
  timezone: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface DepartmentReport {
  id: string
  departmentId: string
  department?: {
    id: string
    name: string
    code?: string
  }
  categoryId?: string
  category?: {
    id: string
    name: string
    code: string
  }
  reportDate: string // DATE format "YYYY-MM-DD"
  reportType: DepartmentReportType
  submittedById?: string
  submittedBy?: {
    id: string
    name: string
    email: string
  }
  status: DepartmentReportStatus
  submittedAt?: string
  deadline: string // TIMESTAMPTZ
  isLate: boolean
  summaryData?: Record<string, unknown> // Aggregated metrics from individual reports
  customData?: Record<string, unknown> // Additional data for separate reports
  notes?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  // Related data
  submission?: DepartmentReportSubmission
  individualReports?: Array<{
    id: string
    userId: string
    userName: string
    date: string
    status: string
  }>
}

export interface DepartmentReportSubmission {
  id: string
  departmentReportId: string
  departmentId: string
  reportDate: string
  expectedDeadline: string
  actualSubmissionTime?: string
  isOnTime?: boolean
  daysLate?: number
  reminderSentCount: number
  lastReminderSentAt?: string
  createdAt: string
  updatedAt: string
}

export interface DepartmentReportReminderConfig {
  id: string
  departmentId?: string
  department?: {
    id: string
    name: string
  }
  reminderType: DepartmentReportReminderType
  daysBefore?: number
  daysAfter?: number
  escalationLevel: number
  notifyUsers: Array<string | { type: 'user' | 'role'; value: string }>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentReportAssignmentInput {
  departmentId: string
  categoryId?: string
  assignedUserId: string
  reportType?: 'aggregated' | 'separate' | 'both'
  submissionDeadlineTime?: string // "HH:mm:ss"
  timezone?: string
  isActive?: boolean
}

export interface UpdateDepartmentReportAssignmentInput {
  assignedUserId?: string
  reportType?: 'aggregated' | 'separate' | 'both'
  submissionDeadlineTime?: string
  timezone?: string
  isActive?: boolean
}

export interface CreateDepartmentReportInput {
  departmentId: string
  categoryId?: string
  reportDate: string
  reportType?: DepartmentReportType
  summaryData?: Record<string, unknown>
  customData?: Record<string, unknown>
  notes?: string
  metadata?: Record<string, unknown>
  status?: DepartmentReportStatus
}

export interface UpdateDepartmentReportInput {
  categoryId?: string
  reportDate?: string
  reportType?: DepartmentReportType
  summaryData?: Record<string, unknown>
  customData?: Record<string, unknown>
  notes?: string
  metadata?: Record<string, unknown>
  status?: DepartmentReportStatus
}

export interface DepartmentReportFilters {
  departmentId?: string[]
  categoryId?: string[]
  status?: DepartmentReportStatus[]
  reportType?: DepartmentReportType[]
  date?: {
    type?: 'today' | 'this-week' | 'this-month' | 'custom'
    start?: string
    end?: string
  }
  isLate?: boolean
  search?: string
}

export interface DepartmentReportSort {
  field: 'report_date' | 'status' | 'deadline' | 'created_at' | 'submitted_at'
  direction: 'asc' | 'desc'
}

export interface DepartmentReportStats {
  total: number
  submitted: number
  drafts: number
  late: number
  missing: number
  onTime: number
  byDepartment: Record<string, {
    total: number
    submitted: number
    late: number
    missing: number
  }>
  complianceRate: number // Percentage of on-time submissions
}

export interface AggregatedReportData {
  totalReports: number
  submittedReports: number
  draftReports: number
  averageTasksCompleted: number
  totalTasksCompleted: number
  totalTasksPlanned: number
  totalBlockers: number
  reportsByCategory: Record<string, {
    count: number
    submitted: number
  }>
  reportsByUser: Array<{
    userId: string
    userName: string
    reportId: string
    status: string
    tasksCompleted: number
  }>
  summary: string
}









