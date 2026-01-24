/**
 * Daily Reports Types
 * 
 * Types for the daily reporting system with category-based reporting
 * and department-specific fields.
 */

export type DailyReportStatus = 'draft' | 'submitted'

export type DailyReportFieldType = 'text' | 'number' | 'array' | 'object' | 'boolean' | 'date'

export interface DailyReportUser {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface DailyReportCategory {
  id: string
  name: string
  code: string
  description?: string
  departmentId?: string
  formConfig: FormConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FormConfig {
  steps: FormStep[]
}

export interface FormStep {
  step: number
  title: string
  fields: FormField[]
}

export interface FormField {
  key: string
  type: DailyReportFieldType
  label: string
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface DailyReportFieldValue {
  id: string
  dailyReportId: string
  fieldKey: string
  fieldValue: string | number | boolean | string[] | object | null
  fieldType: DailyReportFieldType
  createdAt: string
  updatedAt: string
}

export interface DailyReport {
  id: string
  userId: string
  user?: DailyReportUser
  date: string
  categoryId?: string
  category?: DailyReportCategory
  departmentId?: string
  department?: {
    id: string
    name: string
    code?: string
  }
  tasksCompleted: string[]
  tasksPlanned: string[]
  blockers: string[]
  notes?: string
  status: DailyReportStatus
  metadata?: Record<string, unknown>
  fieldValues?: DailyReportFieldValue[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateDailyReportInput {
  date: string
  categoryId?: string
  departmentId?: string
  tasksCompleted?: string[]
  tasksPlanned?: string[]
  blockers?: string[]
  notes?: string
  status?: DailyReportStatus
  metadata?: Record<string, unknown>
  fieldValues?: Array<{
    fieldKey: string
    fieldValue: string | number | boolean | string[] | object | null
    fieldType: DailyReportFieldType
  }>
}

export interface UpdateDailyReportInput {
  date?: string
  categoryId?: string
  departmentId?: string
  tasksCompleted?: string[]
  tasksPlanned?: string[]
  blockers?: string[]
  notes?: string
  status?: DailyReportStatus
  metadata?: Record<string, unknown>
  fieldValues?: Array<{
    fieldKey: string
    fieldValue: string | number | boolean | string[] | object | null
    fieldType: DailyReportFieldType
  }>
}

export interface DailyReportFilters {
  userId?: string[]
  departmentId?: string[]
  categoryId?: string[]
  status?: DailyReportStatus[]
  date?: {
    type?: 'today' | 'this-week' | 'this-month' | 'custom'
    start?: string
    end?: string
  }
  search?: string
}

export interface DailyReportSort {
  field: 'date' | 'status' | 'created_at' | 'updated_at'
  direction: 'asc' | 'desc'
}

export interface DailyReportStats {
  total: number
  submitted: number
  drafts: number
  byCategory: Record<string, number>
  byDepartment: Record<string, number>
}

