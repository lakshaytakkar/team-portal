'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Call, CallStatus, CallOutcome, CallUser } from '@/lib/types/call'
import { getAvatarForUser } from '@/lib/utils/avatars'
import { createNotification } from '@/lib/actions/notifications'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateCallInput {
  date: string
  time: string
  contactId?: string
  contactName: string
  company?: string
  phone?: string
  email?: string
  outcome?: CallOutcome
  notes?: string
  nextAction?: string
  nextActionDate?: string
  assignedToId: string
  status: CallStatus
  duration?: number
}

export interface UpdateCallInput {
  date?: string
  time?: string
  contactId?: string
  contactName?: string
  company?: string
  phone?: string
  email?: string
  outcome?: CallOutcome
  notes?: string
  nextAction?: string
  nextActionDate?: string
  assignedToId?: string
  status?: CallStatus
  duration?: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

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

async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data: teamMembers, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('manager_id', managerId)
    .eq('is_active', true)
  
  if (error) {
    logDatabaseError(error, 'getTeamMemberIds')
    return []
  }
  
  return teamMembers?.map(m => m.id) || []
}

/**
 * Transform database call to frontend call
 */
function transformCall(row: any, profile: any): Call {
  const assignedTo: CallUser = {
    id: profile?.id || row.assigned_to_id,
    name: profile?.full_name || 'Unknown',
    email: profile?.email,
    avatar: profile?.avatar_url || getAvatarForUser(profile?.full_name || 'U'),
  }
  
  return {
    id: row.id,
    date: row.date,
    time: row.time || '00:00',
    contactName: row.contact_name,
    company: row.company || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    outcome: row.outcome || undefined,
    notes: row.notes || undefined,
    nextAction: row.next_action || undefined,
    nextActionDate: row.next_action_date || undefined,
    assignedTo,
    status: row.status as CallStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get all calls
 */
export async function getCalls(): Promise<Call[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    let userIds: string[] = [user.id]
    
    // Managers can see their team's calls
    if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      userIds = [user.id, ...teamMemberIds]
    }
    // Superadmin sees all (no filter on assigned_to_id)
    
    let query = supabase
      .from('calls')
      .select(`
        *,
        assigned_profile:profiles!calls_assigned_to_id_profiles_id_fk(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
    
    // Apply user filter for executives and managers
    if (role !== 'superadmin') {
      query = query.in('assigned_to_id', userIds)
    }
    
    const { data, error } = await query.order('date', { ascending: false }).order('time', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch calls: ${error.message}`)
    }
    
    if (!data) return []
    
    return data.map(row => {
      const profile = row.assigned_profile
      return transformCall(row, profile)
    })
  } catch (error) {
    logDatabaseError(error, 'getCalls')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get call by ID
 */
export async function getCallById(id: string): Promise<Call | null> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check if user has access to this call
    const { data: callCheck, error: checkError } = await supabase
      .from('calls')
      .select('assigned_to_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (checkError || !callCheck) {
      return null
    }
    
    // Role-based access check
    if (role === 'executive' && callCheck.assigned_to_id !== user.id) {
      throw new Error('Access denied')
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(callCheck.assigned_to_id) && callCheck.assigned_to_id !== user.id) {
        throw new Error('Access denied')
      }
    }
    // Superadmin has access (no check needed)
    
    const { data, error } = await supabase
      .from('calls')
      .select(`
        *,
        assigned_profile:profiles!calls_assigned_to_id_profiles_id_fk(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch call: ${error.message}`)
    }
    
    if (!data) return null
    
    const profile = data.assigned_profile
    return transformCall(data, profile)
  } catch (error) {
    logDatabaseError(error, 'getCallById')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create a new call
 */
export async function createCall(input: CreateCallInput): Promise<Call> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Resolve assigned to ID
    const assignedToId = await resolveProfileId(input.assignedToId, true)
    
    // Validate required fields
    if (!input.date || !input.time || !input.contactName || !input.status || !assignedToId) {
      throw new Error('Date, time, contact name, status, and assigned to are required')
    }
    
    // Normalize optional fields
    const contactId = normalizeOptional(input.contactId)
    const company = normalizeOptional(input.company)
    const phone = normalizeOptional(input.phone)
    const email = normalizeOptional(input.email)
    const notes = normalizeOptional(input.notes)
    const nextAction = normalizeOptional(input.nextAction)
    const nextActionDate = normalizeOptional(input.nextActionDate)
    
    // Create call
    const { data: newCall, error: callError } = await supabase
      .from('calls')
      .insert({
        date: input.date,
        time: input.time,
        contact_id: contactId,
        contact_name: input.contactName,
        company,
        phone,
        email,
        outcome: input.outcome || null,
        notes,
        next_action: nextAction,
        next_action_date: nextActionDate,
        assigned_to_id: assignedToId,
        status: input.status,
        duration: input.duration || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (callError) {
      throw new Error(`Failed to create call: ${callError.message}`)
    }
    
    // Notify assigned user when call is created
    if (assignedToId && assignedToId !== user.id) {
      try {
        await createNotification({
          userId: assignedToId,
          type: 'call_assigned',
          title: 'New Call Assigned',
          message: `You have been assigned a call with ${input.contactName}${input.company ? ` from ${input.company}` : ''}`,
          data: {
            call_id: newCall.id,
            contact_name: input.contactName,
            company: input.company,
            date: input.date,
            time: input.time,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'createCall - notification creation')
      }
    }
    
    revalidatePath('/my-calls')
    revalidatePath(`/my-calls/${newCall.id}`)
    
    // Fetch complete call with relations
    const call = await getCallById(newCall.id)
    if (!call) {
      throw new Error('Failed to retrieve created call')
    }
    
    return call
  } catch (error) {
    logDatabaseError(error, 'createCall')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Update a call
 */
export async function updateCall(id: string, input: UpdateCallInput): Promise<Call> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check access
    const { data: existingCall } = await supabase
      .from('calls')
      .select('assigned_to_id')
      .eq('id', id)
      .single()
    
    if (!existingCall) {
      throw new Error('Call not found')
    }
    
    // Check permissions
    if (role === 'executive' && existingCall.assigned_to_id !== user.id) {
      throw new Error('Only call assignee can update this call')
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(existingCall.assigned_to_id) && existingCall.assigned_to_id !== user.id) {
        throw new Error('Access denied')
      }
    }
    // Superadmin can update any call
    
    // Build update object
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.date !== undefined) updateData.date = input.date
    if (input.time !== undefined) updateData.time = input.time
    if (input.contactId !== undefined) updateData.contact_id = normalizeOptional(input.contactId)
    if (input.contactName !== undefined) updateData.contact_name = input.contactName
    if (input.company !== undefined) updateData.company = normalizeOptional(input.company)
    if (input.phone !== undefined) updateData.phone = normalizeOptional(input.phone)
    if (input.email !== undefined) updateData.email = normalizeOptional(input.email)
    if (input.outcome !== undefined) updateData.outcome = input.outcome || null
    if (input.notes !== undefined) updateData.notes = normalizeOptional(input.notes)
    if (input.nextAction !== undefined) updateData.next_action = normalizeOptional(input.nextAction)
    if (input.nextActionDate !== undefined) updateData.next_action_date = normalizeOptional(input.nextActionDate)
    if (input.status !== undefined) updateData.status = input.status
    if (input.duration !== undefined) updateData.duration = input.duration || null
    
    // Update assigned to if provided
    if (input.assignedToId) {
      const assignedToId = await resolveProfileId(input.assignedToId, true)
      updateData.assigned_to_id = assignedToId
    }
    
    const { error: updateError } = await supabase
      .from('calls')
      .update(updateData)
      .eq('id', id)
    
    if (updateError) {
      throw new Error(`Failed to update call: ${updateError.message}`)
    }
    
    // Get call details for notifications
    const contactName = updateData.contact_name || existingCall.contact_name
    const company = updateData.company || existingCall.company
    const newAssignedToId = updateData.assigned_to_id || existingCall.assigned_to_id
    
    // Notify on assignment change
    if (input.assignedToId && updateData.assigned_to_id !== existingCall.assigned_to_id && newAssignedToId !== user.id) {
      try {
        await createNotification({
          userId: newAssignedToId,
          type: 'call_assigned',
          title: 'Call Assigned',
          message: `You have been assigned a call with ${contactName}${company ? ` from ${company}` : ''}`,
          data: {
            call_id: id,
            contact_name: contactName,
            company: company,
            date: updateData.date || existingCall.date,
            time: updateData.time || existingCall.time,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'updateCall - assignment notification creation')
      }
    }
    
    // Notify on status change
    if (input.status !== undefined && input.status !== existingCall.status) {
      try {
        await createNotification({
          userId: newAssignedToId,
          type: input.status === 'completed' ? 'call_completed' : 'call_status_changed',
          title: input.status === 'completed' ? 'Call Completed' : 'Call Status Updated',
          message: `Call with ${contactName}${company ? ` from ${company}` : ''} status has been changed to ${input.status}`,
          data: {
            call_id: id,
            contact_name: contactName,
            company: company,
            old_status: existingCall.status,
            new_status: input.status,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'updateCall - status notification creation')
      }
      
      // Notify creator when call is completed
      if (input.status === 'completed' && existingCall.created_by && existingCall.created_by !== newAssignedToId) {
        try {
          await createNotification({
            userId: existingCall.created_by,
            type: 'call_completed',
            title: 'Call Completed',
            message: `Call with ${contactName}${company ? ` from ${company}` : ''} has been completed`,
            data: {
              call_id: id,
              contact_name: contactName,
              company: company,
              completed_by: newAssignedToId,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'updateCall - creator notification creation')
        }
      }
    }
    
    revalidatePath('/my-calls')
    revalidatePath(`/my-calls/${id}`)
    
    // Fetch updated call
    const call = await getCallById(id)
    if (!call) {
      throw new Error('Failed to retrieve updated call')
    }
    
    return call
  } catch (error) {
    logDatabaseError(error, 'updateCall')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete a call (soft delete)
 */
export async function deleteCall(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check access
    const { data: existingCall } = await supabase
      .from('calls')
      .select('assigned_to_id')
      .eq('id', id)
      .single()
    
    if (!existingCall) {
      throw new Error('Call not found')
    }
    
    // Check permissions
    if (role === 'executive' && existingCall.assigned_to_id !== user.id) {
      throw new Error('Only call assignee can delete this call')
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(existingCall.assigned_to_id) && existingCall.assigned_to_id !== user.id) {
        throw new Error('Access denied')
      }
    }
    // Superadmin can delete any call
    
    // Soft delete
    const { error } = await supabase
      .from('calls')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete call: ${error.message}`)
    }
    
    revalidatePath('/my-calls')
  } catch (error) {
    logDatabaseError(error, 'deleteCall')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk delete calls
 */
export async function bulkDeleteCalls(ids: string[]): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // For bulk delete, superadmin can delete any, others can only delete their own
    let query = supabase
      .from('calls')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
    
    if (role !== 'superadmin') {
      // Filter to only calls assigned to user or their team
      if (role === 'executive') {
        query = query.eq('assigned_to_id', user.id)
      } else if (role === 'manager') {
        const teamMemberIds = await getTeamMemberIds(user.id)
        query = query.in('assigned_to_id', [user.id, ...teamMemberIds])
      }
    }
    
    const { error } = await query
    
    if (error) {
      throw new Error(`Failed to delete calls: ${error.message}`)
    }
    
    revalidatePath('/my-calls')
  } catch (error) {
    logDatabaseError(error, 'bulkDeleteCalls')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

