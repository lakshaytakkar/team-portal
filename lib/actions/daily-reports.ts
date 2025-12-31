'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  DailyReport,
  DailyReportCategory,
  DailyReportFieldValue,
  CreateDailyReportInput,
  UpdateDailyReportInput,
  DailyReportFilters,
  DailyReportSort,
  DailyReportStats,
} from '@/lib/types/daily-reports'
import { resolveDepartmentId, resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { getAvatarForUser } from '@/lib/utils/avatars'
import { getCurrentUserId } from './auth'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toDailyReportUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): DailyReport['user'] {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

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
 * Transform database row to DailyReport
 */
function transformDailyReport(row: any, user?: any, category?: any, department?: any, fieldValues?: any[]): DailyReport {
  return {
    id: row.id,
    userId: row.user_id,
    user: user ? toDailyReportUser(user) : undefined,
    date: row.date,
    categoryId: row.category_id || undefined,
    category: category ? {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description || undefined,
      departmentId: category.department_id || undefined,
      formConfig: category.form_config,
      isActive: category.is_active,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    } : undefined,
    departmentId: row.department_id || undefined,
    department: department ? {
      id: department.id,
      name: department.name,
      code: department.code || undefined,
    } : undefined,
    tasksCompleted: Array.isArray(row.tasks_completed) ? row.tasks_completed : [],
    tasksPlanned: Array.isArray(row.tasks_planned) ? row.tasks_planned : [],
    blockers: Array.isArray(row.blockers) ? row.blockers : [],
    notes: row.notes || undefined,
    status: row.status as 'draft' | 'submitted',
    metadata: row.metadata || undefined,
    fieldValues: fieldValues?.map(fv => ({
      id: fv.id,
      dailyReportId: fv.daily_report_id,
      fieldKey: fv.field_key,
      fieldValue: fv.field_value,
      fieldType: fv.field_type,
      createdAt: fv.created_at,
      updatedAt: fv.updated_at,
    })) || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || undefined,
    updatedBy: row.updated_by || undefined,
  }
}

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

/**
 * Get daily reports with filtering
 */
export async function getDailyReports(
  filters?: DailyReportFilters,
  sort?: DailyReportSort,
  userId?: string
): Promise<DailyReport[]> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return []

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Build query
    let query = supabase
      .from('daily_reports')
      .select('*')
      .order(sort?.field === 'date' ? 'date' : sort?.field === 'status' ? 'status' : 'created_at', {
        ascending: sort?.direction === 'asc',
      })

    // Apply role-based filtering
    if (!isSuperadmin) {
      // Employees can only see their own reports
      query = query.eq('user_id', userId || currentUserId)
    } else if (filters?.userId && filters.userId.length > 0) {
      // Superadmin can filter by user
      query = query.in('user_id', filters.userId)
    }

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.categoryId && filters.categoryId.length > 0) {
      query = query.in('category_id', filters.categoryId)
    }

    if (filters?.departmentId && filters.departmentId.length > 0) {
      query = query.in('department_id', filters.departmentId)
    }

    // Date filters
    if (filters?.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filters.date.type === 'today') {
        query = query.eq('date', today.toISOString().split('T')[0])
      } else if (filters.date.type === 'this-week') {
        const endOfWeek = new Date(today)
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
        query = query.gte('date', today.toISOString().split('T')[0])
        query = query.lte('date', endOfWeek.toISOString().split('T')[0])
      } else if (filters.date.type === 'this-month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        query = query.gte('date', startOfMonth.toISOString().split('T')[0])
        query = query.lte('date', endOfMonth.toISOString().split('T')[0])
      } else if (filters.date.type === 'custom' && filters.date.start && filters.date.end) {
        query = query.gte('date', filters.date.start)
        query = query.lte('date', filters.date.end)
      }
    }

    // Search filter (searches in notes and tasks)
    if (filters?.search && filters.search.trim().length >= 2) {
      query = query.or(`notes.ilike.%${filters.search}%,tasks_completed::text.ilike.%${filters.search}%,tasks_planned::text.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getDailyReports')
      throw new Error(error.message)
    }

    if (!data || data.length === 0) return []

    // Fetch related data
    const userIds = new Set<string>()
    const categoryIds = new Set<string>()
    const departmentIds = new Set<string>()

    data.forEach((row: any) => {
      if (row.user_id) userIds.add(row.user_id)
      if (row.category_id) categoryIds.add(row.category_id)
      if (row.department_id) departmentIds.add(row.department_id)
    })

    // Fetch users
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', Array.from(userIds))

    // Fetch categories
    const { data: categories } = categoryIds.size > 0
      ? await supabase
          .from('daily_report_categories')
          .select('*')
          .in('id', Array.from(categoryIds))
      : { data: [] }

    // Fetch departments
    const { data: departments } = departmentIds.size > 0
      ? await supabase
          .from('departments')
          .select('id, name, code')
          .in('id', Array.from(departmentIds))
      : { data: [] }

    // Fetch field values
    const reportIds = data.map((r: any) => r.id)
    const { data: fieldValues } = reportIds.length > 0
      ? await supabase
          .from('daily_report_field_values')
          .select('*')
          .in('daily_report_id', reportIds)
      : { data: [] }

    // Create maps for quick lookup
    const usersMap = new Map((users || []).map((u: any) => [u.id, u]))
    const categoriesMap = new Map((categories || []).map((c: any) => [c.id, c]))
    const departmentsMap = new Map((departments || []).map((d: any) => [d.id, d]))
    const fieldValuesMap = new Map<string, any[]>()
    
    ;(fieldValues || []).forEach((fv: any) => {
      if (!fieldValuesMap.has(fv.daily_report_id)) {
        fieldValuesMap.set(fv.daily_report_id, [])
      }
      fieldValuesMap.get(fv.daily_report_id)!.push(fv)
    })

    // Transform and return
    return data.map((row: any) => {
      const user = usersMap.get(row.user_id)
      const category = row.category_id ? categoriesMap.get(row.category_id) : undefined
      const department = row.department_id ? departmentsMap.get(row.department_id) : undefined
      const fvs = fieldValuesMap.get(row.id) || []
      return transformDailyReport(row, user, category, department, fvs)
    })
  } catch (error) {
    logDatabaseError(error, 'getDailyReports')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get single daily report by ID
 */
export async function getDailyReport(id: string): Promise<DailyReport | null> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return null

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    const { data: report, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logDatabaseError(error, 'getDailyReport')
      throw new Error(error.message)
    }

    if (!report) return null

    // Check permissions
    if (!isSuperadmin && report.user_id !== currentUserId) {
      throw new Error('Not authorized to view this report')
    }

    // Fetch related data
    const [userResult, categoryResult, departmentResult, fieldValuesResult] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, avatar_url').eq('id', report.user_id).single(),
      report.category_id
        ? supabase.from('daily_report_categories').select('*').eq('id', report.category_id).single()
        : { data: null, error: null },
      report.department_id
        ? supabase.from('departments').select('id, name, code').eq('id', report.department_id).single()
        : { data: null, error: null },
      supabase.from('daily_report_field_values').select('*').eq('daily_report_id', id),
    ])

    return transformDailyReport(
      report,
      userResult.data,
      categoryResult.data,
      departmentResult.data,
      fieldValuesResult.data || []
    )
  } catch (error) {
    logDatabaseError(error, 'getDailyReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get all daily report categories
 */
export async function getDailyReportCategories(): Promise<DailyReportCategory[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('daily_report_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      logDatabaseError(error, 'getDailyReportCategories')
      throw new Error(error.message)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description || undefined,
      departmentId: row.department_id || undefined,
      formConfig: row.form_config,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getDailyReportCategories')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get category form configuration
 */
export async function getCategoryFormConfig(categoryId: string): Promise<DailyReportCategory['formConfig'] | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('daily_report_categories')
      .select('form_config')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return data.form_config
  } catch (error) {
    logDatabaseError(error, 'getCategoryFormConfig')
    return null
  }
}

/**
 * Get all employees for filtering (superadmin only)
 */
export async function getAssignableUsers(): Promise<Array<{ id: string; name: string; email: string; avatar?: string }>> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return []

    const userRole = await getUserRole(currentUserId)
    if (userRole !== 'superadmin') {
      return []
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) {
      logDatabaseError(error, 'getAssignableUsers')
      throw new Error(error.message)
    }

    return (profiles || []).map((profile) => ({
      id: profile.id,
      name: profile.full_name || 'Unknown',
      email: profile.email,
      avatar: profile.avatar_url || undefined,
    }))
  } catch (error) {
    logDatabaseError(error, 'getAssignableUsers')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get daily report statistics
 */
export async function getDailyReportStats(filters?: DailyReportFilters): Promise<DailyReportStats> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return {
        total: 0,
        submitted: 0,
        drafts: 0,
        byCategory: {},
        byDepartment: {},
      }
    }

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    let query = supabase.from('daily_reports').select('status, category_id, department_id', { count: 'exact', head: false })

    // Apply role-based filtering
    if (!isSuperadmin) {
      query = query.eq('user_id', currentUserId)
    } else if (filters?.userId && filters.userId.length > 0) {
      query = query.in('user_id', filters.userId)
    }

    // Apply other filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.categoryId && filters.categoryId.length > 0) {
      query = query.in('category_id', filters.categoryId)
    }

    if (filters?.departmentId && filters.departmentId.length > 0) {
      query = query.in('department_id', filters.departmentId)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getDailyReportStats')
      throw new Error(error.message)
    }

    const stats: DailyReportStats = {
      total: data?.length || 0,
      submitted: data?.filter((r: any) => r.status === 'submitted').length || 0,
      drafts: data?.filter((r: any) => r.status === 'draft').length || 0,
      byCategory: {},
      byDepartment: {},
    }

    // Count by category
    data?.forEach((r: any) => {
      if (r.category_id) {
        stats.byCategory[r.category_id] = (stats.byCategory[r.category_id] || 0) + 1
      }
    })

    // Count by department
    data?.forEach((r: any) => {
      if (r.department_id) {
        stats.byDepartment[r.department_id] = (stats.byDepartment[r.department_id] || 0) + 1
      }
    })

    return stats
  } catch (error) {
    logDatabaseError(error, 'getDailyReportStats')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new daily report
 */
export async function createDailyReport(input: CreateDailyReportInput): Promise<DailyReport> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    // Resolve foreign keys
    const categoryId = normalizeOptional(input.categoryId)
    const departmentId = input.departmentId ? await resolveDepartmentId(input.departmentId, false) : null

    // Get user's department if not provided
    let finalDepartmentId = departmentId
    if (!finalDepartmentId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', currentUserId)
        .single()
      finalDepartmentId = profile?.department_id || null
    }

    // Insert daily report
    const { data: report, error: reportError } = await supabase
      .from('daily_reports')
      .insert({
        user_id: currentUserId,
        date: input.date,
        category_id: categoryId,
        department_id: finalDepartmentId,
        tasks_completed: input.tasksCompleted || [],
        tasks_planned: input.tasksPlanned || [],
        blockers: input.blockers || [],
        notes: normalizeOptional(input.notes),
        status: input.status || 'draft',
        metadata: input.metadata || {},
        created_by: currentUserId,
        updated_by: currentUserId,
      })
      .select()
      .single()

    if (reportError) {
      logDatabaseError(reportError, 'createDailyReport')
      throw new Error(reportError.message)
    }

    // Insert field values if provided
    if (input.fieldValues && input.fieldValues.length > 0) {
      const fieldValueInserts = input.fieldValues.map(fv => ({
        daily_report_id: report.id,
        field_key: fv.fieldKey,
        field_value: fv.fieldValue,
        field_type: fv.fieldType,
      }))

      const { error: fvError } = await supabase
        .from('daily_report_field_values')
        .insert(fieldValueInserts)

      if (fvError) {
        logDatabaseError(fvError, 'createDailyReport - field values')
        // Don't fail the whole operation, just log the error
      }
    }

    revalidatePath('/my-daily-reporting')
    revalidatePath('/daily-reporting')

    // Fetch the complete report with relations
    const completeReport = await getDailyReport(report.id)
    if (!completeReport) {
      throw new Error('Failed to fetch created report')
    }

    return completeReport
  } catch (error) {
    logDatabaseError(error, 'createDailyReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a daily report
 */
export async function updateDailyReport(id: string, input: UpdateDailyReportInput): Promise<DailyReport> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    // Check if report exists and user has permission
    const { data: existingReport, error: fetchError } = await supabase
      .from('daily_reports')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingReport) {
      throw new Error('Report not found')
    }

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Check permissions - only owner or superadmin can update
    if (!isSuperadmin && existingReport.user_id !== currentUserId) {
      throw new Error('Not authorized to update this report')
    }

    // Only allow editing drafts or if superadmin
    if (!isSuperadmin && existingReport.status === 'submitted') {
      throw new Error('Cannot edit submitted reports')
    }

    // Resolve foreign keys
    const categoryId = input.categoryId !== undefined
      ? normalizeOptional(input.categoryId)
      : undefined

    const departmentId = input.departmentId !== undefined
      ? input.departmentId
        ? await resolveDepartmentId(input.departmentId, false)
        : null
      : undefined

    // Build update object
    const updateData: any = {
      updated_by: currentUserId,
      updated_at: new Date().toISOString(),
    }

    if (input.date !== undefined) updateData.date = input.date
    if (categoryId !== undefined) updateData.category_id = categoryId
    if (departmentId !== undefined) updateData.department_id = departmentId
    if (input.tasksCompleted !== undefined) updateData.tasks_completed = input.tasksCompleted
    if (input.tasksPlanned !== undefined) updateData.tasks_planned = input.tasksPlanned
    if (input.blockers !== undefined) updateData.blockers = input.blockers
    if (input.notes !== undefined) updateData.notes = normalizeOptional(input.notes)
    if (input.status !== undefined) updateData.status = input.status
    if (input.metadata !== undefined) updateData.metadata = input.metadata

    // Update report
    const { error: updateError } = await supabase
      .from('daily_reports')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      logDatabaseError(updateError, 'updateDailyReport')
      throw new Error(updateError.message)
    }

    // Update field values if provided
    if (input.fieldValues !== undefined) {
      // Delete existing field values
      await supabase
        .from('daily_report_field_values')
        .delete()
        .eq('daily_report_id', id)

      // Insert new field values
      if (input.fieldValues.length > 0) {
        const fieldValueInserts = input.fieldValues.map(fv => ({
          daily_report_id: id,
          field_key: fv.fieldKey,
          field_value: fv.fieldValue,
          field_type: fv.fieldType,
        }))

        const { error: fvError } = await supabase
          .from('daily_report_field_values')
          .insert(fieldValueInserts)

        if (fvError) {
          logDatabaseError(fvError, 'updateDailyReport - field values')
          // Don't fail the whole operation, just log the error
        }
      }
    }

    revalidatePath('/my-daily-reporting')
    revalidatePath('/daily-reporting')
    revalidatePath(`/daily-reporting/${id}`)
    revalidatePath(`/my-daily-reporting/${id}`)

    // Fetch the complete report with relations
    const completeReport = await getDailyReport(id)
    if (!completeReport) {
      throw new Error('Failed to fetch updated report')
    }

    return completeReport
  } catch (error) {
    logDatabaseError(error, 'updateDailyReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete a daily report
 */
export async function deleteDailyReport(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('Not authenticated')
    }

    // Check if report exists and user has permission
    const { data: existingReport, error: fetchError } = await supabase
      .from('daily_reports')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingReport) {
      throw new Error('Report not found')
    }

    const userRole = await getUserRole(currentUserId)
    const isSuperadmin = userRole === 'superadmin'

    // Check permissions - only owner or superadmin can delete
    if (!isSuperadmin && existingReport.user_id !== currentUserId) {
      throw new Error('Not authorized to delete this report')
    }

    // Delete report (field values will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', id)

    if (deleteError) {
      logDatabaseError(deleteError, 'deleteDailyReport')
      throw new Error(deleteError.message)
    }

    revalidatePath('/my-daily-reporting')
    revalidatePath('/daily-reporting')
  } catch (error) {
    logDatabaseError(error, 'deleteDailyReport')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

