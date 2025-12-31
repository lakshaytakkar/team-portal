'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  DepartmentReport,
  DepartmentReportAssignment,
  DepartmentReportSubmission,
  DepartmentReportReminderConfig,
  CreateDepartmentReportInput,
  UpdateDepartmentReportInput,
  CreateDepartmentReportAssignmentInput,
  UpdateDepartmentReportAssignmentInput,
  DepartmentReportFilters,
  DepartmentReportSort,
  DepartmentReportStats,
} from '@/lib/types/department-reports'
import { resolveDepartmentId, resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { getCurrentUserId } from './auth'
import { aggregateDepartmentReports } from '@/lib/services/department-report-aggregator'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user role from profile
 */
async function getUserRole(userId: string): Promise<'executive' | 'manager' | 'superadmin'> {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    throw new Error('User profile not found')
  }
  
  return profile.role as 'executive' | 'manager' | 'superadmin'
}

/**
 * Transform database row to DepartmentReport
 */
function transformDepartmentReport(
  row: any,
  department?: any,
  category?: any,
  submittedBy?: any,
  submission?: any
): DepartmentReport {
  return {
    id: row.id,
    departmentId: row.department_id,
    department: department ? {
      id: department.id,
      name: department.name,
      code: department.code,
    } : undefined,
    categoryId: row.category_id || undefined,
    category: category ? {
      id: category.id,
      name: category.name,
      code: category.code,
    } : undefined,
    reportDate: row.report_date,
    reportType: row.report_type,
    submittedById: row.submitted_by_id || undefined,
    submittedBy: submittedBy ? {
      id: submittedBy.id,
      name: submittedBy.full_name || 'Unknown',
      email: submittedBy.email,
    } : undefined,
    status: row.status,
    submittedAt: row.submitted_at || undefined,
    deadline: row.deadline,
    isLate: row.is_late,
    summaryData: row.summary_data || {},
    customData: row.custom_data || {},
    notes: normalizeOptional(row.notes),
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || undefined,
    updatedBy: row.updated_by || undefined,
    submission: submission ? transformDepartmentReportSubmission(submission) : undefined,
  }
}

/**
 * Transform database row to DepartmentReportSubmission
 */
function transformDepartmentReportSubmission(row: any): DepartmentReportSubmission {
  return {
    id: row.id,
    departmentReportId: row.department_report_id,
    departmentId: row.department_id,
    reportDate: row.report_date,
    expectedDeadline: row.expected_deadline,
    actualSubmissionTime: row.actual_submission_time || undefined,
    isOnTime: row.is_on_time || undefined,
    daysLate: row.days_late || undefined,
    reminderSentCount: row.reminder_sent_count || 0,
    lastReminderSentAt: row.last_reminder_sent_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Calculate deadline from report date and assignment
 */
async function calculateDeadline(
  reportDate: string,
  departmentId: string,
  categoryId?: string
): Promise<string> {
  const supabase = await createClient()
  
  // Get assignment to find deadline time
  let query = supabase
    .from('department_report_assignments')
    .select('submission_deadline_time, timezone')
    .eq('department_id', departmentId)
    .eq('is_active', true)
  
  if (categoryId) {
    query = query.or(`category_id.is.null,category_id.eq.${categoryId}`)
  } else {
    query = query.is('category_id', null)
  }
  
  const { data: assignment } = await query.limit(1).single()
  
  if (!assignment) {
    // Default to end of day UTC
    return `${reportDate}T23:59:59Z`
  }
  
  // Combine report date with deadline time in the specified timezone
  const deadlineTime = assignment.submission_deadline_time
  const timezone = assignment.timezone || 'UTC'
  
  // Create timestamp: report_date + deadline_time in timezone
  const deadline = `${reportDate}T${deadlineTime}`
  
  // Return as ISO string (PostgreSQL will handle timezone conversion)
  return deadline
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all department reports with filters and sorting
 */
export async function getDepartmentReports(
  filters?: DepartmentReportFilters,
  sort?: DepartmentReportSort
): Promise<DepartmentReport[]> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return []

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Build query
    let query = supabase
      .from('department_reports')
      .select('*')
      .order(
        sort?.field === 'report_date' ? 'report_date' :
        sort?.field === 'deadline' ? 'deadline' :
        sort?.field === 'submitted_at' ? 'submitted_at' :
        'created_at',
        { ascending: sort?.direction === 'asc' }
      )

    // Apply role-based filtering
    if (!isSuperadmin) {
      // Non-superadmins can only see reports for their department
      const { data: profile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', currentUserId)
        .single()
      
      if (profile?.department_id) {
        query = query.eq('department_id', profile.department_id)
      } else {
        return [] // No department, no reports
      }
    }

    // Apply filters
    if (filters?.departmentId && filters.departmentId.length > 0) {
      query = query.in('department_id', filters.departmentId)
    }

    if (filters?.categoryId && filters.categoryId.length > 0) {
      query = query.in('category_id', filters.categoryId)
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.reportType && filters.reportType.length > 0) {
      query = query.in('report_type', filters.reportType)
    }

    if (filters?.isLate !== undefined) {
      query = query.eq('is_late', filters.isLate)
    }

    // Date filters
    if (filters?.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filters.date.type === 'today') {
        query = query.eq('report_date', today.toISOString().split('T')[0])
      } else if (filters.date.type === 'this-week') {
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
        query = query.gte('report_date', today.toISOString().split('T')[0])
        query = query.lte('report_date', endOfWeek.toISOString().split('T')[0])
      } else if (filters.date.type === 'this-month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        query = query.gte('report_date', startOfMonth.toISOString().split('T')[0])
        query = query.lte('report_date', endOfMonth.toISOString().split('T')[0])
      } else if (filters.date.type === 'custom' && filters.date.start && filters.date.end) {
        query = query.gte('report_date', filters.date.start)
        query = query.lte('report_date', filters.date.end)
      }
    }

    // Search filter
    if (filters?.search && filters.search.trim().length >= 2) {
      query = query.or(`notes.ilike.%${filters.search}%,summary_data::text.ilike.%${filters.search}%,custom_data::text.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getDepartmentReports')
      throw new Error(error.message)
    }

    if (!data || data.length === 0) return []

    // Fetch related data
    const departmentIds = new Set<string>()
    const categoryIds = new Set<string>()
    const submittedByIds = new Set<string>()
    const reportIds = new Set<string>()

    data.forEach((row: any) => {
      if (row.department_id) departmentIds.add(row.department_id)
      if (row.category_id) categoryIds.add(row.category_id)
      if (row.submitted_by_id) submittedByIds.add(row.submitted_by_id)
      reportIds.add(row.id)
    })

    // Fetch departments
    const { data: departments } = departmentIds.size > 0
      ? await supabase
          .from('departments')
          .select('id, name, code')
          .in('id', Array.from(departmentIds))
      : { data: [] }

    // Fetch categories
    const { data: categories } = categoryIds.size > 0
      ? await supabase
          .from('daily_report_categories')
          .select('id, name, code')
          .in('id', Array.from(categoryIds))
      : { data: [] }

    // Fetch submitted by users
    const { data: submittedByUsers } = submittedByIds.size > 0
      ? await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', Array.from(submittedByIds))
      : { data: [] }

    // Fetch submissions
    const { data: submissions } = reportIds.size > 0
      ? await supabase
          .from('department_report_submissions')
          .select('*')
          .in('department_report_id', Array.from(reportIds))
      : { data: [] }

    // Create maps for quick lookup
    const departmentsMap = new Map((departments || []).map((d: any) => [d.id, d]))
    const categoriesMap = new Map((categories || []).map((c: any) => [c.id, c]))
    const submittedByMap = new Map((submittedByUsers || []).map((u: any) => [u.id, u]))
    const submissionsMap = new Map((submissions || []).map((s: any) => [s.department_report_id, s]))

    // Transform and return
    return data.map((row: any) => {
      const department = row.department_id ? departmentsMap.get(row.department_id) : undefined
      const category = row.category_id ? categoriesMap.get(row.category_id) : undefined
      const submittedBy = row.submitted_by_id ? submittedByMap.get(row.submitted_by_id) : undefined
      const submission = submissionsMap.get(row.id)
      return transformDepartmentReport(row, department, category, submittedBy, submission)
    })
  } catch (error) {
    logDatabaseError(error, 'getDepartmentReports')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get a single department report by ID
 */
export async function getDepartmentReport(id: string): Promise<DepartmentReport | null> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return null

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Fetch report
    const { data: report, error } = await supabase
      .from('department_reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      logDatabaseError(error, 'getDepartmentReport')
      throw new Error(error.message)
    }

    if (!report) return null

    // Check permissions
    if (!isSuperadmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', currentUserId)
        .single()
      
      if (profile?.department_id !== report.department_id) {
        return null // Not authorized
      }
    }

    // Fetch related data
    const [departmentResult, categoryResult, submittedByResult, submissionResult] = await Promise.all([
      report.department_id
        ? supabase.from('departments').select('id, name, code').eq('id', report.department_id).single()
        : { data: null },
      report.category_id
        ? supabase.from('daily_report_categories').select('id, name, code').eq('id', report.category_id).single()
        : { data: null },
      report.submitted_by_id
        ? supabase.from('profiles').select('id, full_name, email').eq('id', report.submitted_by_id).single()
        : { data: null },
      supabase
        .from('department_report_submissions')
        .select('*')
        .eq('department_report_id', id)
        .single(),
    ])

    return transformDepartmentReport(
      report,
      departmentResult.data,
      categoryResult.data,
      submittedByResult.data,
      submissionResult.data
    )
  } catch (error) {
    logDatabaseError(error, 'getDepartmentReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get department report assignments
 */
export async function getDepartmentReportAssignments(
  departmentId?: string
): Promise<DepartmentReportAssignment[]> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return []

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    let query = supabase
      .from('department_report_assignments')
      .select('*')
      .order('created_at', { ascending: false })

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

    if (!isSuperadmin) {
      // Non-superadmins can only see their own assignments
      query = query.eq('assigned_user_id', currentUserId)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getDepartmentReportAssignments')
      throw new Error(error.message)
    }

    if (!data || data.length === 0) return []

    // Fetch related data
    const departmentIds = new Set<string>()
    const categoryIds = new Set<string>()
    const assignedUserIds = new Set<string>()

    data.forEach((row: any) => {
      if (row.department_id) departmentIds.add(row.department_id)
      if (row.category_id) categoryIds.add(row.category_id)
      if (row.assigned_user_id) assignedUserIds.add(row.assigned_user_id)
    })

    const [departmentsResult, categoriesResult, usersResult] = await Promise.all([
      departmentIds.size > 0
        ? supabase.from('departments').select('id, name, code').in('id', Array.from(departmentIds))
        : { data: [] },
      categoryIds.size > 0
        ? supabase.from('daily_report_categories').select('id, name, code').in('id', Array.from(categoryIds))
        : { data: [] },
      assignedUserIds.size > 0
        ? supabase.from('profiles').select('id, full_name, email').in('id', Array.from(assignedUserIds))
        : { data: [] },
    ])

    const departmentsMap = new Map((departmentsResult.data || []).map((d: any) => [d.id, d]))
    const categoriesMap = new Map((categoriesResult.data || []).map((c: any) => [c.id, c]))
    const usersMap = new Map((usersResult.data || []).map((u: any) => [u.id, u]))

    return (data || []).map((row: any) => ({
      id: row.id,
      departmentId: row.department_id,
      department: row.department_id ? {
        id: row.department_id,
        name: departmentsMap.get(row.department_id)?.name || 'Unknown',
        code: departmentsMap.get(row.department_id)?.code,
      } : undefined,
      categoryId: row.category_id || undefined,
      category: row.category_id ? {
        id: row.category_id,
        name: categoriesMap.get(row.category_id)?.name || 'Unknown',
        code: categoriesMap.get(row.category_id)?.code || '',
      } : undefined,
      assignedUserId: row.assigned_user_id,
      assignedUser: row.assigned_user_id ? {
        id: row.assigned_user_id,
        name: usersMap.get(row.assigned_user_id)?.full_name || 'Unknown',
        email: usersMap.get(row.assigned_user_id)?.email || '',
      } : undefined,
      reportType: row.report_type,
      submissionDeadlineTime: row.submission_deadline_time,
      timezone: row.timezone,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by || undefined,
      updatedBy: row.updated_by || undefined,
    }))
  } catch (error) {
    logDatabaseError(error, 'getDepartmentReportAssignments')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get department report statistics
 */
export async function getDepartmentReportStats(
  filters?: DepartmentReportFilters
): Promise<DepartmentReportStats> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return {
        total: 0,
        submitted: 0,
        drafts: 0,
        late: 0,
        missing: 0,
        onTime: 0,
        byDepartment: {},
        complianceRate: 0,
      }
    }

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Build base query
    let query = supabase.from('department_reports').select('department_id, status, is_late, submitted_at, deadline', { count: 'exact' })

    // Apply role-based filtering
    if (!isSuperadmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', currentUserId)
        .single()
      
      if (profile?.department_id) {
        query = query.eq('department_id', profile.department_id)
      } else {
        return {
          total: 0,
          submitted: 0,
          drafts: 0,
          late: 0,
          missing: 0,
          onTime: 0,
          byDepartment: {},
          complianceRate: 0,
        }
      }
    }

    // Apply filters
    if (filters?.departmentId && filters.departmentId.length > 0) {
      query = query.in('department_id', filters.departmentId)
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filters.date.type === 'today') {
        query = query.eq('report_date', today.toISOString().split('T')[0])
      } else if (filters.date.type === 'this-week') {
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
        query = query.gte('report_date', today.toISOString().split('T')[0])
        query = query.lte('report_date', endOfWeek.toISOString().split('T')[0])
      } else if (filters.date.type === 'this-month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        query = query.gte('report_date', startOfMonth.toISOString().split('T')[0])
        query = query.lte('report_date', endOfMonth.toISOString().split('T')[0])
      } else if (filters.date.type === 'custom' && filters.date.start && filters.date.end) {
        query = query.gte('report_date', filters.date.start)
        query = query.lte('report_date', filters.date.end)
      }
    }

    const { data, error, count } = await query

    if (error) {
      logDatabaseError(error, 'getDepartmentReportStats')
      throw new Error(error.message)
    }

    const reports = data || []
    const total = count || 0
    const submitted = reports.filter((r: any) => r.status === 'submitted').length
    const drafts = reports.filter((r: any) => r.status === 'draft').length
    const late = reports.filter((r: any) => r.is_late === true).length
    
    // Calculate on-time submissions
    const onTime = reports.filter((r: any) => 
      r.status === 'submitted' && 
      r.submitted_at && 
      r.deadline && 
      new Date(r.submitted_at) <= new Date(r.deadline)
    ).length

    // Group by department
    const byDepartment: Record<string, { total: number; submitted: number; late: number; missing: number }> = {}
    reports.forEach((report: any) => {
      const deptId = report.department_id
      if (!byDepartment[deptId]) {
        byDepartment[deptId] = { total: 0, submitted: 0, late: 0, missing: 0 }
      }
      byDepartment[deptId].total++
      if (report.status === 'submitted') {
        byDepartment[deptId].submitted++
      }
      if (report.is_late) {
        byDepartment[deptId].late++
      }
      if (report.status === 'draft' && report.is_late) {
        byDepartment[deptId].missing++
      }
    })

    // Calculate missing reports (expected but not submitted)
    // This would require checking assignments vs actual reports
    const missing = 0 // TODO: Implement missing report detection

    // Calculate compliance rate
    const complianceRate = submitted > 0 
      ? Math.round((onTime / submitted) * 100) 
      : 0

    return {
      total,
      submitted,
      drafts,
      late,
      missing,
      onTime,
      byDepartment,
      complianceRate,
    }
  } catch (error) {
    logDatabaseError(error, 'getDepartmentReportStats')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new department report
 */
export async function createDepartmentReport(
  input: CreateDepartmentReportInput
): Promise<DepartmentReport> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    // Resolve foreign keys
    const departmentId = await resolveDepartmentId(input.departmentId, false)
    if (!departmentId) {
      throw new Error('Invalid department')
    }

    const categoryId = normalizeOptional(input.categoryId)

    // Calculate deadline
    const deadline = await calculateDeadline(input.reportDate, departmentId, categoryId || undefined)

    // If report type is aggregated or hybrid, aggregate the data
    let summaryData = input.summaryData || {}
    if (input.reportType === 'aggregated' || input.reportType === 'hybrid') {
      try {
        const aggregatedData = await aggregateDepartmentReports(input.reportDate, departmentId)
        summaryData = aggregatedData
      } catch (error) {
        console.error('Error aggregating reports:', error)
        // Continue with empty summary data
      }
    }

    // Insert department report
    const { data: report, error: reportError } = await supabase
      .from('department_reports')
      .insert({
        department_id: departmentId,
        category_id: categoryId,
        report_date: input.reportDate,
        report_type: input.reportType || 'aggregated',
        submitted_by_id: input.status === 'submitted' ? currentUserId : null,
        status: input.status || 'draft',
        submitted_at: input.status === 'submitted' ? new Date().toISOString() : null,
        deadline: deadline,
        summary_data: summaryData,
        custom_data: input.customData || {},
        notes: normalizeOptional(input.notes),
        metadata: input.metadata || {},
        created_by: currentUserId,
        updated_by: currentUserId,
      })
      .select()
      .single()

    if (reportError) {
      logDatabaseError(reportError, 'createDepartmentReport')
      throw new Error(reportError.message)
    }

    revalidatePath('/daily-reporting')
    revalidatePath('/daily-reporting/department')

    // Fetch the complete report with relations
    const completeReport = await getDepartmentReport(report.id)
    if (!completeReport) {
      throw new Error('Failed to fetch created report')
    }

    return completeReport
  } catch (error) {
    logDatabaseError(error, 'createDepartmentReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create a department report assignment
 */
export async function createDepartmentReportAssignment(
  input: CreateDepartmentReportAssignmentInput
): Promise<DepartmentReportAssignment> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    const userRole = await getUserRole(currentUserId)
    if (userRole !== 'superadmin') {
      throw new Error('Only superadmins can create assignments')
    }

    // Resolve foreign keys
    const departmentId = await resolveDepartmentId(input.departmentId, false)
    if (!departmentId) {
      throw new Error('Invalid department')
    }

    const categoryId = normalizeOptional(input.categoryId)
    const assignedUserId = await resolveProfileId(input.assignedUserId, false)
    if (!assignedUserId) {
      throw new Error('Invalid assigned user')
    }

    // Deactivate any existing active assignment for this department/category
    if (input.isActive !== false) {
      await supabase
        .from('department_report_assignments')
        .update({ is_active: false })
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .or(categoryId 
          ? `category_id.is.null,category_id.eq.${categoryId}`
          : 'category_id.is.null'
        )
    }

    // Insert assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('department_report_assignments')
      .insert({
        department_id: departmentId,
        category_id: categoryId,
        assigned_user_id: assignedUserId,
        report_type: input.reportType || 'both',
        submission_deadline_time: input.submissionDeadlineTime || '18:00:00',
        timezone: input.timezone || 'UTC',
        is_active: input.isActive !== false,
        created_by: currentUserId,
        updated_by: currentUserId,
      })
      .select()
      .single()

    if (assignmentError) {
      logDatabaseError(assignmentError, 'createDepartmentReportAssignment')
      throw new Error(assignmentError.message)
    }

    revalidatePath('/admin/department-report-assignments')

    // Fetch complete assignment
    const assignments = await getDepartmentReportAssignments(departmentId)
    const completeAssignment = assignments.find(a => a.id === assignment.id)
    if (!completeAssignment) {
      throw new Error('Failed to fetch created assignment')
    }

    return completeAssignment
  } catch (error) {
    logDatabaseError(error, 'createDepartmentReportAssignment')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a department report
 */
export async function updateDepartmentReport(
  id: string,
  input: UpdateDepartmentReportInput
): Promise<DepartmentReport> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    // Check if report exists and user has permission
    const { data: existingReport, error: fetchError } = await supabase
      .from('department_reports')
      .select('department_id, status, report_date, category_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingReport) {
      throw new Error('Report not found')
    }

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Check permissions - only assigned users or superadmin can update
    if (!isSuperadmin) {
      const { data: assignment } = await supabase
        .from('department_report_assignments')
        .select('assigned_user_id')
        .eq('department_id', existingReport.department_id)
        .eq('assigned_user_id', currentUserId)
        .eq('is_active', true)
        .single()

      if (!assignment) {
        throw new Error('Not authorized to update this report')
      }
    }

    // Only allow editing drafts or if superadmin
    if (!isSuperadmin && existingReport.status === 'submitted') {
      throw new Error('Cannot edit submitted reports')
    }

    // Build update object
    const updateData: any = {
      updated_by: currentUserId,
      updated_at: new Date().toISOString(),
    }

    if (input.categoryId !== undefined) {
      updateData.category_id = normalizeOptional(input.categoryId)
    }

    if (input.reportDate !== undefined) {
      updateData.report_date = input.reportDate
      // Recalculate deadline if date changes
      updateData.deadline = await calculateDeadline(
        input.reportDate,
        existingReport.department_id,
        input.categoryId || existingReport.category_id || undefined
      )
    }

    if (input.reportType !== undefined) {
      updateData.report_type = input.reportType
      
      // Re-aggregate if switching to aggregated or hybrid
      if (input.reportType === 'aggregated' || input.reportType === 'hybrid') {
        try {
          const aggregatedData = await aggregateDepartmentReports(
            input.reportDate || existingReport.report_date,
            existingReport.department_id
          )
          updateData.summary_data = aggregatedData
        } catch (error) {
          console.error('Error re-aggregating reports:', error)
        }
      }
    }

    if (input.summaryData !== undefined) {
      updateData.summary_data = input.summaryData
    }

    if (input.customData !== undefined) {
      updateData.custom_data = input.customData
    }

    if (input.notes !== undefined) {
      updateData.notes = normalizeOptional(input.notes)
    }

    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata
    }

    if (input.status !== undefined) {
      updateData.status = input.status
      if (input.status === 'submitted') {
        updateData.submitted_by_id = currentUserId
        updateData.submitted_at = new Date().toISOString()
      }
    }

    // Update report
    const { error: updateError } = await supabase
      .from('department_reports')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      logDatabaseError(updateError, 'updateDepartmentReport')
      throw new Error(updateError.message)
    }

    revalidatePath('/daily-reporting')
    revalidatePath('/daily-reporting/department')
    revalidatePath(`/daily-reporting/department/${id}`)

    // Fetch the complete report with relations
    const completeReport = await getDepartmentReport(id)
    if (!completeReport) {
      throw new Error('Failed to fetch updated report')
    }

    return completeReport
  } catch (error) {
    logDatabaseError(error, 'updateDepartmentReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Submit a department report
 */
export async function submitDepartmentReport(id: string): Promise<DepartmentReport> {
  return updateDepartmentReport(id, { status: 'submitted' })
}

/**
 * Update a department report assignment
 */
export async function updateDepartmentReportAssignment(
  id: string,
  input: UpdateDepartmentReportAssignmentInput
): Promise<DepartmentReportAssignment> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    const userRole = await getUserRole(currentUserId)
    if (userRole !== 'superadmin') {
      throw new Error('Only superadmins can update assignments')
    }

    // Build update object
    const updateData: any = {
      updated_by: currentUserId,
      updated_at: new Date().toISOString(),
    }

    if (input.assignedUserId !== undefined) {
      const assignedUserId = await resolveProfileId(input.assignedUserId, false)
      if (!assignedUserId) {
        throw new Error('Invalid assigned user')
      }
      updateData.assigned_user_id = assignedUserId
    }

    if (input.reportType !== undefined) {
      updateData.report_type = input.reportType
    }

    if (input.submissionDeadlineTime !== undefined) {
      updateData.submission_deadline_time = input.submissionDeadlineTime
    }

    if (input.timezone !== undefined) {
      updateData.timezone = input.timezone
    }

    if (input.isActive !== undefined) {
      updateData.is_active = input.isActive
    }

    // Update assignment
    const { error: updateError } = await supabase
      .from('department_report_assignments')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      logDatabaseError(updateError, 'updateDepartmentReportAssignment')
      throw new Error(updateError.message)
    }

    revalidatePath('/admin/department-report-assignments')

    // Fetch complete assignment
    const { data: assignment } = await supabase
      .from('department_report_assignments')
      .select('department_id')
      .eq('id', id)
      .single()

    if (assignment) {
      const assignments = await getDepartmentReportAssignments(assignment.department_id)
      const completeAssignment = assignments.find(a => a.id === id)
      if (completeAssignment) {
        return completeAssignment
      }
    }

    throw new Error('Failed to fetch updated assignment')
  } catch (error) {
    logDatabaseError(error, 'updateDepartmentReportAssignment')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a department report
 */
export async function deleteDepartmentReport(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    const userRole = await getUserRole(currentUserId)
    if (userRole !== 'superadmin') {
      throw new Error('Only superadmins can delete reports')
    }

    const { error } = await supabase
      .from('department_reports')
      .delete()
      .eq('id', id)

    if (error) {
      logDatabaseError(error, 'deleteDepartmentReport')
      throw new Error(error.message)
    }

    revalidatePath('/daily-reporting')
    revalidatePath('/daily-reporting/department')
  } catch (error) {
    logDatabaseError(error, 'deleteDepartmentReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete a department report assignment
 */
export async function deleteDepartmentReportAssignment(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    const userRole = await getUserRole(currentUserId)
    if (userRole !== 'superadmin') {
      throw new Error('Only superadmins can delete assignments')
    }

    const { error } = await supabase
      .from('department_report_assignments')
      .delete()
      .eq('id', id)

    if (error) {
      logDatabaseError(error, 'deleteDepartmentReportAssignment')
      throw new Error(error.message)
    }

    revalidatePath('/admin/department-report-assignments')
  } catch (error) {
    logDatabaseError(error, 'deleteDepartmentReportAssignment')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Check for late or missing submissions
 */
export async function checkLateSubmissions(): Promise<Array<{
  departmentId: string
  departmentName: string
  reportDate: string
  expectedDeadline: string
  daysLate: number
  status: 'missing' | 'late'
}>> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return []
    }

    const userRole = await getUserRole(currentUserId)
    if (userRole !== 'superadmin') {
      return [] // Only superadmins can check late submissions
    }

    // Get all active assignments
    const { data: assignments } = await supabase
      .from('department_report_assignments')
      .select('department_id, category_id, submission_deadline_time, timezone')
      .eq('is_active', true)

    if (!assignments || assignments.length === 0) {
      return []
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Check last 7 days for missing/late reports
    const lateSubmissions: Array<{
      departmentId: string
      departmentName: string
      reportDate: string
      expectedDeadline: string
      daysLate: number
      status: 'missing' | 'late'
    }> = []

    for (const assignment of assignments) {
      // Get department name
      const { data: department } = await supabase
        .from('departments')
        .select('id, name')
        .eq('id', assignment.department_id)
        .single()

      if (!department) continue

      // Check last 7 days
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const checkDateStr = checkDate.toISOString().split('T')[0]

        // Calculate expected deadline
        const deadlineTime = assignment.submission_deadline_time
        const timezone = assignment.timezone || 'UTC'
        const expectedDeadline = `${checkDateStr}T${deadlineTime}`

        // Check if report exists
        let query = supabase
          .from('department_reports')
          .select('id, status, submitted_at, deadline')
          .eq('department_id', assignment.department_id)
          .eq('report_date', checkDateStr)

        if (assignment.category_id) {
          query = query.eq('category_id', assignment.category_id)
        } else {
          query = query.is('category_id', null)
        }

        const { data: report } = await query.single()

        if (!report) {
          // Missing report
          const daysSinceDeadline = Math.floor(
            (new Date().getTime() - new Date(expectedDeadline).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceDeadline > 0) {
            lateSubmissions.push({
              departmentId: assignment.department_id,
              departmentName: department.name,
              reportDate: checkDateStr,
              expectedDeadline,
              daysLate: daysSinceDeadline,
              status: 'missing',
            })
          }
        } else if (report.status === 'submitted' && report.submitted_at) {
          // Check if late
          if (new Date(report.submitted_at) > new Date(expectedDeadline)) {
            const daysLate = Math.floor(
              (new Date(report.submitted_at).getTime() - new Date(expectedDeadline).getTime()) / (1000 * 60 * 60 * 24)
            )
            lateSubmissions.push({
              departmentId: assignment.department_id,
              departmentName: department.name,
              reportDate: checkDateStr,
              expectedDeadline,
              daysLate,
              status: 'late',
            })
          }
        } else if (report.status === 'draft') {
          // Draft past deadline is missing
          const daysSinceDeadline = Math.floor(
            (new Date().getTime() - new Date(expectedDeadline).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceDeadline > 0) {
            lateSubmissions.push({
              departmentId: assignment.department_id,
              departmentName: department.name,
              reportDate: checkDateStr,
              expectedDeadline,
              daysLate: daysSinceDeadline,
              status: 'missing',
            })
          }
        }
      }
    }

    return lateSubmissions.sort((a, b) => b.daysLate - a.daysLate)
  } catch (error) {
    logDatabaseError(error, 'checkLateSubmissions')
    return []
  }
}

