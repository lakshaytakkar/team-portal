'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Project, ProjectStatus, ProjectPriority, ProjectMember } from '@/lib/types/project'
import { getAvatarForUser } from '@/lib/utils/avatars'
import { createNotification } from '@/lib/actions/notifications'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateProjectInput {
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  endDate?: string
  dueDate?: string
  ownerId: string
  teamMemberIds?: string[]
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  progress?: number
  startDate?: string
  endDate?: string
  dueDate?: string
  ownerId?: string
  teamMemberIds?: string[]
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
 * Transform database project to frontend project
 */
function transformProject(row: any, tasksCount: number = 0, completedTasksCount: number = 0): Project {
  const ownerProfile = row.owner_profile || row.owner
  const members = row.project_members || []
  
  const owner: ProjectMember = {
    id: ownerProfile?.id || row.owner_id,
    name: ownerProfile?.full_name || 'Unknown',
    email: ownerProfile?.email,
    avatar: ownerProfile?.avatar_url || getAvatarForUser(ownerProfile?.full_name || 'U'),
    role: 'Owner',
  }
  
  const team: ProjectMember[] = members.map((member: any) => {
    const profile = member.profile || member
    return {
      id: profile?.id || member.user_id,
      name: profile?.full_name || 'Unknown',
      email: profile?.email,
      avatar: profile?.avatar_url || getAvatarForUser(profile?.full_name || 'U'),
      role: member.role || 'Member',
    }
  })
  
  // Include owner in team if not already there
  const teamWithOwner = team.find(m => m.id === owner.id) ? team : [owner, ...team]
  
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    status: row.status as ProjectStatus,
    priority: row.priority as ProjectPriority,
    progress: row.progress || 0,
    startDate: row.start_date || row.created_at.split('T')[0],
    endDate: row.end_date || undefined,
    dueDate: row.due_date || undefined,
    team: teamWithOwner,
    owner,
    tasksCount,
    completedTasksCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner_profile:profiles!projects_owner_id_profiles_id_fk(id, full_name, email, avatar_url),
        project_members(
          id,
          role,
          user_id,
          profile:profiles!project_members_user_id_profiles_id_fk(id, full_name, email, avatar_url)
        )
      `)
      .is('deleted_at', null)
    
    // Fetch all projects (RLS will handle filtering at database level)
    // For now, we'll fetch and filter in memory based on role
    const { data: allProjects, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }
    
    if (!allProjects) return []
    
    // Filter based on role
    let data = allProjects
    if (role === 'executive') {
      // Get project IDs where user is a member
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id)
      
      const memberProjectIds = new Set(memberProjects?.map(m => m.project_id) || [])
      
      // Filter to projects where user is owner or member
      data = allProjects.filter(p => 
        p.owner_id === user.id || memberProjectIds.has(p.id)
      )
    } else if (role === 'manager') {
      // Managers see projects where they or team members are owners/members
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = new Set([user.id, ...teamMemberIds])
      
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id, user_id')
        .in('user_id', Array.from(allIds))
      
      const memberProjectIds = new Set(memberProjects?.map(m => m.project_id) || [])
      
      data = allProjects.filter(p => 
        allIds.has(p.owner_id) || memberProjectIds.has(p.id)
      )
    }
    // Superadmin sees all (no filtering)

    // Get task counts for each project
    const projectIds = data.map(p => p.id)
    const taskCounts = new Map<string, { total: number; completed: number }>()
    
    if (projectIds.length > 0) {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('project_id, status')
        .in('project_id', projectIds)
        .is('deleted_at', null)
      
      if (tasksData) {
        projectIds.forEach(projectId => {
          const projectTasks = tasksData.filter(t => t.project_id === projectId)
          taskCounts.set(projectId, {
            total: projectTasks.length,
            completed: projectTasks.filter(t => t.status === 'completed').length,
          })
        })
      }
    }
    
    return data.map(row => {
      const counts = taskCounts.get(row.id) || { total: 0, completed: 0 }
      return transformProject(row, counts.total, counts.completed)
    })
  } catch (error) {
    logDatabaseError(error, 'getProjects')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check if user has access to this project
    const { data: projectCheck, error: checkError } = await supabase
      .from('projects')
      .select('owner_id, id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (checkError || !projectCheck) {
      return null
    }
    
    // Role-based access check
    if (role === 'executive') {
      // Check if user is owner or member
      const { data: memberCheck } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single()
      
      if (projectCheck.owner_id !== user.id && !memberCheck) {
        throw new Error('Access denied')
      }
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = [user.id, ...teamMemberIds]
      
      const { data: memberCheck } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', id)
        .in('user_id', allIds)
        .limit(1)
        .single()
      
      if (!allIds.includes(projectCheck.owner_id) && !memberCheck) {
        throw new Error('Access denied')
      }
    }
    // Superadmin has access (no check needed)
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner_profile:profiles!projects_owner_id_profiles_id_fk(id, full_name, email, avatar_url),
        project_members(
          id,
          role,
          user_id,
          profile:profiles!project_members_user_id_profiles_id_fk(id, full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`)
    }
    
    if (!data) return null
    
    // Get task counts
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('status')
      .eq('project_id', id)
      .is('deleted_at', null)
    
    const tasksCount = tasksData?.length || 0
    const completedTasksCount = tasksData?.filter(t => t.status === 'completed').length || 0
    
    return transformProject(data, tasksCount, completedTasksCount)
  } catch (error) {
    logDatabaseError(error, 'getProjectById')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Resolve owner ID
    const ownerId = await resolveProfileId(input.ownerId, true)
    
    // Validate required fields
    if (!input.name || !input.status || !input.priority || !ownerId) {
      throw new Error('Name, status, priority, and owner are required')
    }
    
    // Normalize optional dates
    const startDate = normalizeOptional(input.startDate)
    const endDate = normalizeOptional(input.endDate)
    const dueDate = normalizeOptional(input.dueDate)
    const description = normalizeOptional(input.description)
    
    // Create project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: input.name,
        description,
        status: input.status,
        priority: input.priority,
        progress: 0,
        start_date: startDate,
        end_date: endDate,
        due_date: dueDate,
        owner_id: ownerId,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`)
    }
    
    // Add project members
    if (input.teamMemberIds && input.teamMemberIds.length > 0) {
      const memberIds = await Promise.all(
        input.teamMemberIds.map(id => resolveProfileId(id, false))
      )
      const validMemberIds = memberIds.filter((id): id is string => id !== null && id !== ownerId)
      
      if (validMemberIds.length > 0) {
        const { error: membersError } = await supabase
          .from('project_members')
          .insert(
            validMemberIds.map(memberId => ({
              project_id: newProject.id,
              user_id: memberId,
              role: 'member',
              created_by: user.id,
            }))
          )
        
        if (membersError) {
          // Log error but don't fail the entire operation
          logDatabaseError(membersError, 'createProject - members')
        }
      }
    }
    
    // Add owner as member if not in teamMemberIds
    if (!input.teamMemberIds?.includes(ownerId)) {
      // Ignore duplicate errors - just attempt insert
      await supabase
        .from('project_members')
        .insert({
          project_id: newProject.id,
          user_id: ownerId,
          role: 'owner',
          created_by: user.id,
        })
    }
    
    // Notify project owner
    if (ownerId && ownerId !== user.id) {
      try {
        await createNotification({
          userId: ownerId,
          type: 'project_assigned',
          title: 'New Project Assigned',
          message: `You have been assigned as owner of project: ${input.name}`,
          data: {
            project_id: newProject.id,
            project_name: input.name,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'createProject - notification creation')
      }
    }
    
    // Notify team members when added to project
    if (input.teamMemberIds && input.teamMemberIds.length > 0) {
      const memberIds = await Promise.all(
        input.teamMemberIds.map(id => resolveProfileId(id, false))
      )
      const validMemberIds = memberIds.filter((id): id is string => id !== null && id !== ownerId && id !== user.id)
      
      for (const memberId of validMemberIds) {
        try {
          await createNotification({
            userId: memberId,
            type: 'project_member_added',
            title: 'Added to Project',
            message: `You have been added to project: ${input.name}`,
            data: {
              project_id: newProject.id,
              project_name: input.name,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'createProject - member notification creation')
        }
      }
    }
    
    revalidatePath('/projects')
    revalidatePath(`/projects/${newProject.id}`)
    
    // Fetch complete project with relations
    const project = await getProjectById(newProject.id)
    if (!project) {
      throw new Error('Failed to retrieve created project')
    }
    
    return project
  } catch (error) {
    logDatabaseError(error, 'createProject')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Update a project
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check access
    const { data: existingProject } = await supabase
      .from('projects')
      .select('owner_id, name, status')
      .eq('id', id)
      .single()

    if (!existingProject) {
      throw new Error('Project not found')
    }

    // Check permissions
    if (role === 'executive' && existingProject.owner_id !== user.id) {
      throw new Error('Only project owner can update this project')
    }
    
    // Build update object
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = normalizeOptional(input.description)
    if (input.status !== undefined) updateData.status = input.status
    if (input.priority !== undefined) updateData.priority = input.priority
    if (input.progress !== undefined) {
      updateData.progress = Math.max(0, Math.min(100, input.progress))
    }
    if (input.startDate !== undefined) updateData.start_date = normalizeOptional(input.startDate)
    if (input.endDate !== undefined) updateData.end_date = normalizeOptional(input.endDate)
    if (input.dueDate !== undefined) updateData.due_date = normalizeOptional(input.dueDate)
    
    // Update owner if provided
    if (input.ownerId) {
      const ownerId = await resolveProfileId(input.ownerId, true)
      updateData.owner_id = ownerId
    }
    
    const { error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
    
    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`)
    }
    
    // Get project name for notifications
    const projectName = updateData.name || existingProject.name
    
    // Get team members for notifications
    const { data: teamMembers } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', id)
    
    const teamMemberIds = teamMembers?.map(m => m.user_id) || []
    const finalOwnerId = updateData.owner_id || existingProject.owner_id
    const allNotifyIds = [...new Set([finalOwnerId, ...teamMemberIds])].filter(id => id !== user.id)
    
    // Notify on status change
    if (input.status !== undefined && input.status !== existingProject.status) {
      for (const notifyId of allNotifyIds) {
        try {
          await createNotification({
            userId: notifyId,
            type: input.status === 'completed' ? 'project_completed' : 'project_status_changed',
            title: input.status === 'completed' ? 'Project Completed' : 'Project Status Updated',
            message: `Project "${projectName}" status has been changed to ${input.status}`,
            data: {
              project_id: id,
              project_name: projectName,
              old_status: existingProject.status,
              new_status: input.status,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'updateProject - status notification creation')
        }
      }
    }
    
    // Notify on owner change
    if (input.ownerId && updateData.owner_id !== existingProject.owner_id) {
      try {
        await createNotification({
          userId: updateData.owner_id,
          type: 'project_assigned',
          title: 'Project Assigned',
          message: `You have been assigned as owner of project: ${projectName}`,
          data: {
            project_id: id,
            project_name: projectName,
          },
        })
      } catch (notificationError) {
        logDatabaseError(notificationError, 'updateProject - owner notification creation')
      }
    }
    
    // Update team members if provided
    if (input.teamMemberIds !== undefined) {
      // Get existing members before deletion
      const { data: existingMembers } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', id)
      
      const existingMemberIds = existingMembers?.map(m => m.user_id) || []
      
      // Remove all existing members
      await supabase
        .from('project_members')
        .delete()
        .eq('project_id', id)
      
      // Add new members
      const memberIds = await Promise.all(
        input.teamMemberIds.map(memberId => resolveProfileId(memberId, false))
      )
      const validMemberIds = memberIds.filter((id): id is string => id !== null)
      
      if (validMemberIds.length > 0) {
        await supabase
          .from('project_members')
          .insert(
            validMemberIds.map(memberId => ({
              project_id: id,
              user_id: memberId,
              role: memberId === finalOwnerId ? 'owner' : 'member',
              created_by: user.id,
            }))
          )
      }
      
      // Ensure owner is a member
      await supabase
        .from('project_members')
        .upsert({
          project_id: id,
          user_id: finalOwnerId,
          role: 'owner',
          created_by: user.id,
        }, {
          onConflict: 'project_id,user_id',
        })
      
      // Notify newly added members
      const newMemberIds = validMemberIds.filter(id => !existingMemberIds.includes(id) && id !== finalOwnerId && id !== user.id)
      for (const memberId of newMemberIds) {
        try {
          await createNotification({
            userId: memberId,
            type: 'project_member_added',
            title: 'Added to Project',
            message: `You have been added to project: ${projectName}`,
            data: {
              project_id: id,
              project_name: projectName,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'updateProject - member notification creation')
        }
      }
    }
    
    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    
    // Fetch updated project
    const project = await getProjectById(id)
    if (!project) {
      throw new Error('Failed to retrieve updated project')
    }
    
    return project
  } catch (error) {
    logDatabaseError(error, 'updateProject')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Check access
    const { data: existingProject } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', id)
      .single()
    
    if (!existingProject) {
      throw new Error('Project not found')
    }
    
    // Check permissions
    if (role === 'executive' && existingProject.owner_id !== user.id) {
      throw new Error('Only project owner can delete this project')
    }
    
    if (role === 'manager' && existingProject.owner_id !== user.id) {
      // Managers can only delete if owner is in their team
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (!teamMemberIds.includes(existingProject.owner_id)) {
        throw new Error('Access denied')
      }
    }
    
    // Soft delete
    const { error } = await supabase
      .from('projects')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    
    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
    
    revalidatePath('/projects')
  } catch (error) {
    logDatabaseError(error, 'deleteProject')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk delete projects
 */
export async function bulkDeleteProjects(ids: string[]): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // For bulk delete, superadmin can delete any, others can only delete their own
    let query = supabase
      .from('projects')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
    
    if (role !== 'superadmin') {
      // Filter to only projects owned by user or their team
      if (role === 'executive') {
        query = query.eq('owner_id', user.id)
      } else if (role === 'manager') {
        const teamMemberIds = await getTeamMemberIds(user.id)
        query = query.in('owner_id', [user.id, ...teamMemberIds])
      }
    }
    
    const { error } = await query
    
    if (error) {
      throw new Error(`Failed to delete projects: ${error.message}`)
    }
    
    revalidatePath('/projects')
  } catch (error) {
    logDatabaseError(error, 'bulkDeleteProjects')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

