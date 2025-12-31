'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { LeaveRequest, CreateLeaveRequestInput, UpdateLeaveRequestInput, ApproveLeaveRequestInput } from '@/lib/types/leave-requests'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { getAvatarForUser } from '@/lib/utils/avatars'
import { getCurrentUserId } from './auth'
import { createNotification } from '@/lib/actions/notifications'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toLeaveRequestUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): LeaveRequest['user'] {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

/**
 * Calculate days between two dates (inclusive)
 */
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Inclusive
}

/**
 * Check if user can approve a leave request
 */
async function canApproveLeaveRequest(userId: string, leaveRequestUserId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Get current user's profile
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('id, role, department_id')
    .eq('id', userId)
    .single()

  if (!currentUser) return false

  // SuperAdmin can approve all
  if (currentUser.role === 'superadmin') return true

  // HR department users can approve all
  if (currentUser.department_id) {
    const { data: dept } = await supabase
      .from('departments')
      .select('code')
      .eq('id', currentUser.department_id)
      .single()
    
    if (dept?.code?.toLowerCase() === 'hr') return true
  }

  // Managers can approve requests from their direct reports
  if (currentUser.role === 'manager') {
    const { data: requestUser } = await supabase
      .from('profiles')
      .select('manager_id')
      .eq('id', leaveRequestUserId)
      .single()

    if (requestUser?.manager_id === userId) return true
  }

  return false
}

/**
 * Check if user can edit a leave request
 */
function canEditLeaveRequest(userId: string, leaveRequest: LeaveRequest): boolean {
  // Only creator can edit
  if (leaveRequest.userId !== userId) return false
  // Only pending requests can be edited
  if (leaveRequest.status !== 'pending') return false
  return true
}

// ============================================================================
// FETCH OPERATIONS
// ============================================================================

// getCurrentUserId is imported from './auth'

/**
 * Get leave requests with filtering
 */
export async function getLeaveRequests(
  userId?: string,
  view: 'my' | 'all' = 'my',
  filter: 'active' | 'past' | 'pending' | 'all' = 'all',
  departmentId?: string
): Promise<LeaveRequest[]> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) return []

    let query = supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply view filter
    if (view === 'my') {
      query = query.eq('user_id', userId || currentUserId)
    }
    // For 'all' view, no additional filter (will be filtered by permissions in UI)

    // Apply status/date filter
    const today = new Date().toISOString().split('T')[0]
    
    // Execute query first, then filter in memory for complex cases
    let { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getLeaveRequests')
      throw new Error(error.message)
    }

    if (!data || data.length === 0) return []

    // Fetch related profiles separately
    const userIds = new Set<string>()
    data.forEach((row: any) => {
      if (row.user_id) userIds.add(row.user_id)
      if (row.approved_by_id) userIds.add(row.approved_by_id)
    })

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, department_id')
      .in('id', Array.from(userIds))

    if (profilesError) {
      logDatabaseError(profilesError, 'getLeaveRequests - fetch profiles')
    }

    // Create a map for quick lookup
    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // Map profiles to leave requests
    const dataWithProfiles = data.map((row: any) => ({
      ...row,
      user: profilesMap.get(row.user_id) || null,
      approved_by: row.approved_by_id ? (profilesMap.get(row.approved_by_id) || null) : null,
    }))

    // Apply department filter in memory if provided (for nested relation data)
    let filteredData = dataWithProfiles
    if (departmentId && view === 'all') {
      filteredData = filteredData.filter((row: any) => row.user?.department_id === departmentId)
    }

    // Apply filters in memory for complex conditions
    if (filter === 'active') {
      // Active: (pending OR approved) AND end_date >= today
      filteredData = filteredData.filter((row: any) => {
        const isPendingOrApproved = row.status === 'pending' || row.status === 'approved'
        const endDate = row.end_date
        return isPendingOrApproved && endDate >= today
      })
    } else if (filter === 'past') {
      // Past: end_date < today OR cancelled OR rejected
      filteredData = filteredData.filter((row: any) => {
        const endDate = row.end_date
        const status = row.status
        return endDate < today || status === 'cancelled' || status === 'rejected'
      })
    } else if (filter === 'pending') {
      filteredData = filteredData.filter((row: any) => row.status === 'pending')
    }

    return filteredData.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      startDate: row.start_date,
      endDate: row.end_date,
      days: row.days,
      status: row.status,
      reason: row.reason || undefined,
      approvedById: row.approved_by_id || undefined,
      approvedAt: row.approved_at || undefined,
      approvalNotes: row.approval_notes || undefined,
      metadata: row.metadata || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by || undefined,
      updatedBy: row.updated_by || undefined,
      user: toLeaveRequestUser(row.user),
      approvedBy: toLeaveRequestUser(row.approved_by),
    }))
  } catch (error) {
    logDatabaseError(error, 'getLeaveRequests')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get a single leave request by ID
 */
export async function getLeaveRequestById(id: string): Promise<LeaveRequest | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logDatabaseError(error, 'getLeaveRequestById')
      throw new Error(error.message)
    }

    if (!data) return null

    // Fetch related profiles separately
    const userIds: string[] = []
    if (data.user_id) userIds.push(data.user_id)
    if (data.approved_by_id) userIds.push(data.approved_by_id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      status: data.status,
      reason: data.reason || undefined,
      approvedById: data.approved_by_id || undefined,
      approvedAt: data.approved_at || undefined,
      approvalNotes: data.approval_notes || undefined,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined,
      updatedBy: data.updated_by || undefined,
      user: toLeaveRequestUser(profilesMap.get(data.user_id) || null),
      approvedBy: toLeaveRequestUser(data.approved_by_id ? (profilesMap.get(data.approved_by_id) || null) : null),
    }
  } catch (error) {
    logDatabaseError(error, 'getLeaveRequestById')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new leave request
 */
export async function createLeaveRequest(input: CreateLeaveRequestInput): Promise<LeaveRequest> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Validate required fields
    if (!input.type || !input.startDate || !input.endDate || !input.reason) {
      throw new Error('Leave type, start date, end date, and reason are required')
    }

    // Validate date range
    const startDate = new Date(input.startDate)
    const endDate = new Date(input.endDate)
    
    if (endDate < startDate) {
      throw new Error('End date must be after start date')
    }

    // Calculate days
    const days = calculateDays(input.startDate, input.endDate)

    // Prepare metadata
    const metadata: any = {}
    if (input.coveragePlan) metadata.coveragePlan = input.coveragePlan
    if (input.contactDuringLeave) metadata.contactDuringLeave = input.contactDuringLeave
    if (input.documents && input.documents.length > 0) metadata.documents = input.documents

    // Normalize optional fields
    const reason = normalizeOptional(input.reason)

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: currentUserId,
        type: input.type,
        start_date: input.startDate,
        end_date: input.endDate,
        days,
        status: 'pending',
        reason,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        created_by: currentUserId,
        updated_by: currentUserId,
      })
      .select('*')
      .single()

    if (error) {
      logDatabaseError(error, 'createLeaveRequest')
      throw new Error(error.message)
    }

    // Fetch related profiles separately
    const userIds: string[] = []
    if (data.user_id) userIds.push(data.user_id)
    if (data.approved_by_id) userIds.push(data.approved_by_id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    revalidatePath('/my-leave-requests')

    // Notify manager when leave request is submitted
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('manager_id, department_id')
      .eq('id', currentUserId)
      .single()

    if (userProfile?.manager_id) {
      const userProfileData = profilesMap.get(data.user_id)
      try {
        await createNotification({
          userId: userProfile.manager_id,
          type: 'leave_request_submitted',
          title: 'Leave Request Submitted',
          message: `${userProfileData?.full_name || 'An employee'} has submitted a ${input.type} leave request for ${data.days} day${data.days !== 1 ? 's' : ''}`,
          data: {
            leave_request_id: data.id,
            user_id: currentUserId,
            user_name: userProfileData?.full_name,
            type: input.type,
            start_date: input.startDate,
            end_date: input.endDate,
            days: data.days,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'createLeaveRequest - manager notification creation')
      }
    }

    // Notify HR department users if applicable
    if (userProfile?.department_id) {
      const { data: hrDepartment } = await supabase
        .from('departments')
        .select('id')
        .eq('code', 'hr')
        .eq('id', userProfile.department_id)
        .single()

      if (hrDepartment) {
        const { data: hrUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('department_id', hrDepartment.id)
          .eq('is_active', true)
          .neq('id', currentUserId)

        if (hrUsers && hrUsers.length > 0) {
          const userProfileData = profilesMap.get(data.user_id)
          for (const hrUser of hrUsers) {
            try {
              await createNotification({
                userId: hrUser.id,
                type: 'leave_request_submitted',
                title: 'Leave Request Submitted',
                message: `${userProfileData?.full_name || 'An employee'} has submitted a ${input.type} leave request`,
                data: {
                  leave_request_id: data.id,
                  user_id: currentUserId,
                  user_name: userProfileData?.full_name,
                  type: input.type,
                  start_date: input.startDate,
                  end_date: input.endDate,
                  days: data.days,
                },
              })
            } catch (notificationError) {
              logDatabaseError(notificationError, 'createLeaveRequest - HR notification creation')
            }
          }
        }
      }
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      status: data.status,
      reason: data.reason || undefined,
      approvedById: data.approved_by_id || undefined,
      approvedAt: data.approved_at || undefined,
      approvalNotes: data.approval_notes || undefined,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined,
      updatedBy: data.updated_by || undefined,
      user: toLeaveRequestUser(profilesMap.get(data.user_id) || null),
      approvedBy: toLeaveRequestUser(data.approved_by_id ? (profilesMap.get(data.approved_by_id) || null) : null),
    }
  } catch (error) {
    logDatabaseError(error, 'createLeaveRequest')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update a leave request (only if pending)
 */
export async function updateLeaveRequest(id: string, input: UpdateLeaveRequestInput): Promise<LeaveRequest> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Get existing request
    const existing = await getLeaveRequestById(id)
    if (!existing) {
      throw new Error('Leave request not found')
    }

    // Check permissions
    if (!canEditLeaveRequest(currentUserId, existing)) {
      throw new Error('You can only edit your own pending leave requests')
    }

    // Validate date range if dates are provided
    if (input.startDate && input.endDate) {
      const startDate = new Date(input.startDate)
      const endDate = new Date(input.endDate)
      
      if (endDate < startDate) {
        throw new Error('End date must be after start date')
      }
    }

    // Prepare update object
    const update: any = {
      updated_by: currentUserId,
      updated_at: new Date().toISOString(),
    }

    if (input.type) update.type = input.type
    if (input.startDate) update.start_date = input.startDate
    if (input.endDate) update.end_date = input.endDate
    if (input.reason !== undefined) update.reason = normalizeOptional(input.reason)

    // Recalculate days if dates changed
    if (input.startDate || input.endDate) {
      const startDate = input.startDate || existing.startDate
      const endDate = input.endDate || existing.endDate
      update.days = calculateDays(startDate, endDate)
    }

    // Update metadata
    if (input.coveragePlan !== undefined || input.contactDuringLeave !== undefined || input.documents !== undefined) {
      const currentMetadata = existing.metadata || {}
      update.metadata = {
        ...currentMetadata,
        ...(input.coveragePlan !== undefined && { coveragePlan: normalizeOptional(input.coveragePlan) }),
        ...(input.contactDuringLeave !== undefined && { contactDuringLeave: normalizeOptional(input.contactDuringLeave) }),
        ...(input.documents !== undefined && { documents: input.documents }),
      }
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      logDatabaseError(error, 'updateLeaveRequest')
      throw new Error(error.message)
    }

    // Fetch related profiles separately
    const userIds: string[] = []
    if (data.user_id) userIds.push(data.user_id)
    if (data.approved_by_id) userIds.push(data.approved_by_id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    revalidatePath('/my-leave-requests')
    revalidatePath('/hr/leave-requests')
    revalidatePath('/leave-requests')

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      status: data.status,
      reason: data.reason || undefined,
      approvedById: data.approved_by_id || undefined,
      approvedAt: data.approved_at || undefined,
      approvalNotes: data.approval_notes || undefined,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined,
      updatedBy: data.updated_by || undefined,
      user: toLeaveRequestUser(profilesMap.get(data.user_id) || null),
      approvedBy: toLeaveRequestUser(data.approved_by_id ? (profilesMap.get(data.approved_by_id) || null) : null),
    }
  } catch (error) {
    logDatabaseError(error, 'updateLeaveRequest')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Cancel a leave request (only if pending)
 */
export async function cancelLeaveRequest(id: string): Promise<LeaveRequest> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Get existing request
    const existing = await getLeaveRequestById(id)
    if (!existing) {
      throw new Error('Leave request not found')
    }

    // Only creator can cancel
    if (existing.userId !== currentUserId) {
      throw new Error('You can only cancel your own leave requests')
    }

    // Only pending requests can be cancelled
    if (existing.status !== 'pending') {
      throw new Error('Only pending leave requests can be cancelled')
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'cancelled',
        updated_by: currentUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      logDatabaseError(error, 'cancelLeaveRequest')
      throw new Error(error.message)
    }

    // Fetch related profiles separately
    const userIds: string[] = []
    if (data.user_id) userIds.push(data.user_id)
    if (data.approved_by_id) userIds.push(data.approved_by_id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    revalidatePath('/my-leave-requests')
    revalidatePath('/hr/leave-requests')
    revalidatePath('/leave-requests')

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      status: data.status,
      reason: data.reason || undefined,
      approvedById: data.approved_by_id || undefined,
      approvedAt: data.approved_at || undefined,
      approvalNotes: data.approval_notes || undefined,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined,
      updatedBy: data.updated_by || undefined,
      user: toLeaveRequestUser(profilesMap.get(data.user_id) || null),
      approvedBy: toLeaveRequestUser(data.approved_by_id ? (profilesMap.get(data.approved_by_id) || null) : null),
    }
  } catch (error) {
    logDatabaseError(error, 'cancelLeaveRequest')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// APPROVAL OPERATIONS
// ============================================================================

/**
 * Approve a leave request
 */
export async function approveLeaveRequest(id: string, input: ApproveLeaveRequestInput): Promise<LeaveRequest> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Get existing request
    const existing = await getLeaveRequestById(id)
    if (!existing) {
      throw new Error('Leave request not found')
    }

    // Check permissions
    const canApprove = await canApproveLeaveRequest(currentUserId, existing.userId)
    if (!canApprove) {
      throw new Error('You do not have permission to approve this leave request')
    }

    // Only pending requests can be approved
    if (existing.status !== 'pending') {
      throw new Error('Only pending leave requests can be approved')
    }

    const approvalNotes = normalizeOptional(input.approvalNotes)

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        approved_by_id: currentUserId,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes,
        updated_by: currentUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      logDatabaseError(error, 'approveLeaveRequest')
      throw new Error(error.message)
    }

    // Fetch related profiles separately
    const userIds: string[] = []
    if (data.user_id) userIds.push(data.user_id)
    if (data.approved_by_id) userIds.push(data.approved_by_id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    revalidatePath('/my-leave-requests')
    revalidatePath('/hr/leave-requests')
    revalidatePath('/leave-requests')

    // Notify requester when request is approved
    try {
      await createNotification({
        userId: data.user_id,
        type: 'leave_request_approved',
        title: 'Leave Request Approved',
        message: `Your ${data.type} leave request (${data.start_date} to ${data.end_date}) has been approved`,
        data: {
          leave_request_id: id,
          type: data.type,
          start_date: data.start_date,
          end_date: data.end_date,
          days: data.days,
          approved_by_id: currentUserId,
          approval_notes: approvalNotes,
        },
      })
    } catch (notificationError) {
      logDatabaseError(notificationError, 'approveLeaveRequest - notification creation')
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      status: data.status,
      reason: data.reason || undefined,
      approvedById: data.approved_by_id || undefined,
      approvedAt: data.approved_at || undefined,
      approvalNotes: data.approval_notes || undefined,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined,
      updatedBy: data.updated_by || undefined,
      user: toLeaveRequestUser(profilesMap.get(data.user_id) || null),
      approvedBy: toLeaveRequestUser(data.approved_by_id ? (profilesMap.get(data.approved_by_id) || null) : null),
    }
  } catch (error) {
    logDatabaseError(error, 'approveLeaveRequest')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Reject a leave request
 */
export async function rejectLeaveRequest(id: string, input: ApproveLeaveRequestInput): Promise<LeaveRequest> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Get existing request
    const existing = await getLeaveRequestById(id)
    if (!existing) {
      throw new Error('Leave request not found')
    }

    // Check permissions
    const canApprove = await canApproveLeaveRequest(currentUserId, existing.userId)
    if (!canApprove) {
      throw new Error('You do not have permission to reject this leave request')
    }

    // Only pending requests can be rejected
    if (existing.status !== 'pending') {
      throw new Error('Only pending leave requests can be rejected')
    }

    const approvalNotes = normalizeOptional(input.approvalNotes)

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        approved_by_id: currentUserId,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes,
        updated_by: currentUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      logDatabaseError(error, 'rejectLeaveRequest')
      throw new Error(error.message)
    }

    // Fetch related profiles separately
    const userIds: string[] = []
    if (data.user_id) userIds.push(data.user_id)
    if (data.approved_by_id) userIds.push(data.approved_by_id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    revalidatePath('/my-leave-requests')
    revalidatePath('/hr/leave-requests')
    revalidatePath('/leave-requests')

    // Notify requester when request is rejected
    try {
      await createNotification({
        userId: data.user_id,
        type: 'leave_request_rejected',
        title: 'Leave Request Rejected',
        message: `Your ${data.type} leave request (${data.start_date} to ${data.end_date}) has been rejected`,
        data: {
          leave_request_id: id,
          type: data.type,
          start_date: data.start_date,
          end_date: data.end_date,
          days: data.days,
          rejected_by_id: currentUserId,
          rejection_notes: approvalNotes,
        },
      })
    } catch (notificationError) {
      logDatabaseError(notificationError, 'rejectLeaveRequest - notification creation')
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      status: data.status,
      reason: data.reason || undefined,
      approvedById: data.approved_by_id || undefined,
      approvedAt: data.approved_at || undefined,
      approvalNotes: data.approval_notes || undefined,
      metadata: data.metadata || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by || undefined,
      updatedBy: data.updated_by || undefined,
      user: toLeaveRequestUser(profilesMap.get(data.user_id) || null),
      approvedBy: toLeaveRequestUser(data.approved_by_id ? (profilesMap.get(data.approved_by_id) || null) : null),
    }
  } catch (error) {
    logDatabaseError(error, 'rejectLeaveRequest')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk approve leave requests (SuperAdmin only)
 */
export async function bulkApproveLeaveRequests(
  ids: string[],
  approvalNotes?: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Check if user is superadmin
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single()

    if (currentUser?.role !== 'superadmin') {
      throw new Error('Only superadmins can perform bulk operations')
    }

    if (!ids || ids.length === 0) {
      throw new Error('No leave request IDs provided')
    }

    const approvalNotesNormalized = normalizeOptional(approvalNotes)
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const id of ids) {
      try {
        const existing = await getLeaveRequestById(id)
        if (!existing) {
          errors.push(`Leave request ${id} not found`)
          failed++
          continue
        }

        if (existing.status !== 'pending') {
          errors.push(`Leave request ${id} is not pending`)
          failed++
          continue
        }

        await approveLeaveRequest(id, { approvalNotes: approvalNotesNormalized })
        success++
      } catch (error) {
        failed++
        errors.push(`${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    revalidatePath('/my-leave-requests')
    revalidatePath('/hr/leave-requests')
    revalidatePath('/leave-requests')

    return { success, failed, errors }
  } catch (error) {
    logDatabaseError(error, 'bulkApproveLeaveRequests')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk reject leave requests (SuperAdmin only)
 */
export async function bulkRejectLeaveRequests(
  ids: string[],
  approvalNotes?: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = await createClient()

  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Check if user is superadmin
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single()

    if (currentUser?.role !== 'superadmin') {
      throw new Error('Only superadmins can perform bulk operations')
    }

    if (!ids || ids.length === 0) {
      throw new Error('No leave request IDs provided')
    }

    const approvalNotesNormalized = normalizeOptional(approvalNotes)
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const id of ids) {
      try {
        const existing = await getLeaveRequestById(id)
        if (!existing) {
          errors.push(`Leave request ${id} not found`)
          failed++
          continue
        }

        if (existing.status !== 'pending') {
          errors.push(`Leave request ${id} is not pending`)
          failed++
          continue
        }

        await rejectLeaveRequest(id, { approvalNotes: approvalNotesNormalized })
        success++
      } catch (error) {
        failed++
        errors.push(`${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    revalidatePath('/my-leave-requests')
    revalidatePath('/hr/leave-requests')
    revalidatePath('/leave-requests')

    return { success, failed, errors }
  } catch (error) {
    logDatabaseError(error, 'bulkRejectLeaveRequests')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

