'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Goal, GoalStatus, GoalPriority, GoalUser } from '@/lib/types/goal'
import { getAvatarForUser } from '@/lib/utils/avatars'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateGoalInput {
  title: string
  description?: string
  status: GoalStatus
  priority: GoalPriority
  targetDate?: string
  progress?: number
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  status?: GoalStatus
  priority?: GoalPriority
  progress?: number
  targetDate?: string
  completedAt?: string | null
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
 * Transform database goal to frontend goal
 */
function transformGoal(row: any, profile: any): Goal {
  const assignedTo: GoalUser = {
    id: profile?.id || row.user_id,
    name: profile?.full_name || 'Unknown',
    email: profile?.email,
    avatar: profile?.avatar_url || getAvatarForUser(profile?.full_name || 'U'),
  }
  
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    status: row.status as GoalStatus,
    priority: row.priority as GoalPriority,
    targetDate: row.target_date || undefined,
    progress: row.progress || 0,
    assignedTo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get all goals for the current user
 */
export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    let userIds: string[] = [user.id]
    
    // Managers can see their team's goals
    if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      userIds = [user.id, ...teamMemberIds]
    }
    // Superadmin sees all (no filter on user_id)
    
    let query = supabase
      .from('goals')
      .select(`
        *,
        user_profile:profiles!goals_user_id_profiles_id_fk(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
    
    // Apply user filter for executives and managers
    if (role !== 'superadmin') {
      query = query.in('user_id', userIds)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch goals: ${error.message}`)
    }
    
    if (!data) return []
    
    return data.map(row => {
      const profile = row.user_profile || row.user_profile
      return transformGoal(row, profile)
    })
  } catch (error) {
    logDatabaseError(error, 'getGoals')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get goal by ID
 */
export async function getGoalById(id: string): Promise<Goal | null> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check if user has access to this goal
    const { data: goalCheck, error: checkError } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (checkError || !goalCheck) {
      return null
    }
    
    // Role-based access check
    if (role === 'executive' && goalCheck.user_id !== user.id) {
      throw new Error('Access denied')
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(goalCheck.user_id) && goalCheck.user_id !== user.id) {
        throw new Error('Access denied')
      }
    }
    // Superadmin has access (no check needed)
    
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        user_profile:profiles!goals_user_id_profiles_id_fk(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch goal: ${error.message}`)
    }
    
    if (!data) return null
    
    const profile = data.user_profile || data.user_profile
    return transformGoal(data, profile)
  } catch (error) {
    logDatabaseError(error, 'getGoalById')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create a new goal
 */
export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Validate required fields
    if (!input.title || !input.status || !input.priority) {
      throw new Error('Title, status, and priority are required')
    }
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const targetDate = normalizeOptional(input.targetDate)
    const progress = Math.max(0, Math.min(100, input.progress || 0))
    
    // Create goal
    const { data: newGoal, error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: input.title,
        description,
        status: input.status,
        priority: input.priority,
        progress,
        target_date: targetDate,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (goalError) {
      throw new Error(`Failed to create goal: ${goalError.message}`)
    }
    
    revalidatePath('/my-goals')
    revalidatePath(`/my-goals/${newGoal.id}`)
    
    // Fetch complete goal with relations
    const goal = await getGoalById(newGoal.id)
    if (!goal) {
      throw new Error('Failed to retrieve created goal')
    }
    
    return goal
  } catch (error) {
    logDatabaseError(error, 'createGoal')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Update a goal
 */
export async function updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check access
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!existingGoal) {
      throw new Error('Goal not found')
    }
    
    // Check permissions
    if (role === 'executive' && existingGoal.user_id !== user.id) {
      throw new Error('Only goal owner can update this goal')
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(existingGoal.user_id) && existingGoal.user_id !== user.id) {
        throw new Error('Access denied')
      }
    }
    // Superadmin can update any goal
    
    // Build update object
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = normalizeOptional(input.description)
    if (input.status !== undefined) {
      updateData.status = input.status
      // Auto-set completed_at when status changes to completed
      if (input.status === 'completed' && !existingGoal.completed_at) {
        updateData.completed_at = new Date().toISOString()
      } else if (input.status !== 'completed') {
        updateData.completed_at = null
      }
    }
    if (input.priority !== undefined) updateData.priority = input.priority
    if (input.progress !== undefined) {
      updateData.progress = Math.max(0, Math.min(100, input.progress))
      // Auto-update status based on progress
      if (input.progress === 100 && existingGoal.status !== 'completed') {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
      }
    }
    if (input.targetDate !== undefined) updateData.target_date = normalizeOptional(input.targetDate)
    if (input.completedAt !== undefined) {
      updateData.completed_at = input.completedAt
      if (input.completedAt) {
        updateData.status = 'completed'
        updateData.progress = 100
      }
    }
    
    const { error: updateError } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
    
    if (updateError) {
      throw new Error(`Failed to update goal: ${updateError.message}`)
    }
    
    revalidatePath('/my-goals')
    revalidatePath(`/my-goals/${id}`)
    
    // Fetch updated goal
    const goal = await getGoalById(id)
    if (!goal) {
      throw new Error('Failed to retrieve updated goal')
    }
    
    return goal
  } catch (error) {
    logDatabaseError(error, 'updateGoal')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete a goal (soft delete)
 */
export async function deleteGoal(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check access
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (!existingGoal) {
      throw new Error('Goal not found')
    }
    
    // Check permissions
    if (role === 'executive' && existingGoal.user_id !== user.id) {
      throw new Error('Only goal owner can delete this goal')
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(existingGoal.user_id) && existingGoal.user_id !== user.id) {
        throw new Error('Access denied')
      }
    }
    // Superadmin can delete any goal
    
    // Soft delete
    const { error } = await supabase
      .from('goals')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete goal: ${error.message}`)
    }
    
    revalidatePath('/my-goals')
  } catch (error) {
    logDatabaseError(error, 'deleteGoal')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk delete goals
 */
export async function bulkDeleteGoals(ids: string[]): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // For bulk delete, superadmin can delete any, others can only delete their own
    let query = supabase
      .from('goals')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
    
    if (role !== 'superadmin') {
      // Filter to only goals owned by user or their team
      if (role === 'executive') {
        query = query.eq('user_id', user.id)
      } else if (role === 'manager') {
        const teamMemberIds = await getTeamMemberIds(user.id)
        query = query.in('user_id', [user.id, ...teamMemberIds])
      }
    }
    
    const { error } = await query
    
    if (error) {
      throw new Error(`Failed to delete goals: ${error.message}`)
    }
    
    revalidatePath('/my-goals')
  } catch (error) {
    logDatabaseError(error, 'bulkDeleteGoals')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

