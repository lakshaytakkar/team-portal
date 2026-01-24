'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Task, TaskLevel0, TaskLevel1, TaskLevel2, TaskStatus, TaskPriority } from '@/lib/types/task'
import { createNotification } from '@/lib/actions/notifications'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateTaskInput {
  name: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId?: string
  parentId?: string
  assignedTo?: string
  dueDate?: string
  startDate?: string
  category?: string
  isDraft?: boolean
  figmaLink?: string
  progress?: number
}

export interface UpdateTaskInput {
  name?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string
  parentId?: string
  assignedTo?: string
  dueDate?: string
  startDate?: string
  category?: string
  isDraft?: boolean
  figmaLink?: string
  progress?: number
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string[]
  projectId?: string[]
  dueDate?: {
    type?: 'today' | 'this-week' | 'overdue' | 'custom'
    start?: string
    end?: string
  }
  search?: string
}

export interface TaskSort {
  field: 'name' | 'status' | 'priority' | 'assigned_to' | 'due_date' | 'updated_at' | 'created_at'
  direction: 'asc' | 'desc'
}

export interface TaskAnalytics {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  completionRate: number
  overdueCount: number
  teamPerformance: Array<{
    userId: string
    userName: string
    totalTasks: number
    completedTasks: number
    completionRate: number
  }>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user from session
 */
async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
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
 * Get team member IDs for a manager
 */
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
 * Enrich task with profile data
 */
async function enrichTaskWithProfiles(supabase: any, task: any): Promise<any> {
  const profileIds = new Set<string>()
  if (task.assigned_to_id) profileIds.add(task.assigned_to_id)
  if (task.created_by) profileIds.add(task.created_by)
  if (task.updated_by) profileIds.add(task.updated_by)
  
  if (profileIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', Array.from(profileIds))
    
    if (profiles) {
      const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
      task.assigned_to_profile = task.assigned_to_id ? profilesMap.get(task.assigned_to_id) : null
      task.created_by_profile = task.created_by ? profilesMap.get(task.created_by) : null
      task.updated_by_profile = task.updated_by ? profilesMap.get(task.updated_by) : null
    }
  }
  
  return task
}

/**
 * Transform database task to frontend task
 */
function transformTask(row: any): Task {
  const baseTask = {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    figmaLink: row.figma_link || undefined,
    dueDate: row.due_date || undefined,
    startDate: row.start_date || undefined,
    category: row.category || undefined,
    isDraft: row.is_draft || false,
    progress: row.progress || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    projectId: row.project_id || undefined,
    parentId: row.parent_id || undefined,
    createdBy: row.created_by || undefined,
    updatedBy: row.updated_by || undefined,
    resource: row.assigned_to_profile ? {
      id: row.assigned_to_profile.id,
      name: row.assigned_to_profile.full_name || 'Unknown',
      email: row.assigned_to_profile.email,
      avatar: row.assigned_to_profile.avatar_url || undefined,
    } : undefined,
  }
  
  // Use level from database (0, 1, or 2)
  const level = row.level ?? 0
  
  if (level === 0) {
    return {
      ...baseTask,
      level: 0,
    } as TaskLevel0
  } else if (level === 1) {
    return {
      ...baseTask,
      level: 1,
    } as TaskLevel1
  } else {
    return {
      ...baseTask,
      level: 2,
    } as TaskLevel2
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get tasks based on role and filters
 */
export async function getTasks(
  filters?: TaskFilters,
  sort?: TaskSort
): Promise<Task[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // For manager role, we need to handle team members differently
    // Let's fetch all tasks first, then filter in memory for managers
    // (This can be optimized with a better SQL query)
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name)
      `)
      .is('deleted_at', null)
    
    // Role-based filtering
    if (role === 'executive') {
      query = query.eq('assigned_to_id', user.id)
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = [user.id, ...teamMemberIds]
      if (allIds.length > 0) {
        query = query.in('assigned_to_id', allIds)
      } else {
        // No team members, only own tasks
        query = query.eq('assigned_to_id', user.id)
      }
    }
    // SuperAdmin sees all (no filter)
    
    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }
      
      if (filters.assignedTo && filters.assignedTo.length > 0) {
        query = query.in('assigned_to_id', filters.assignedTo)
      }
      
      if (filters.projectId && filters.projectId.length > 0) {
        query = query.in('project_id', filters.projectId)
      }
      
      if (filters.dueDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0]
        
        switch (filters.dueDate.type) {
          case 'today':
            query = query.eq('due_date', todayStr)
            break
          case 'this-week':
            const endOfWeek = new Date(today)
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
            const endOfWeekStr = endOfWeek.toISOString().split('T')[0]
            query = query.gte('due_date', todayStr)
            query = query.lte('due_date', endOfWeekStr)
            break
          case 'overdue':
            query = query.lt('due_date', todayStr)
            query = query.neq('status', 'completed')
            break
          case 'custom':
            if (filters.dueDate.start) {
              query = query.gte('due_date', filters.dueDate.start)
            }
            if (filters.dueDate.end) {
              query = query.lte('due_date', filters.dueDate.end)
            }
            break
        }
      }
      
      if (filters.search && filters.search.trim().length >= 2) {
        const searchTerm = filters.search.trim()
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }
    }
    
    // Apply sorting
    if (sort) {
      const orderField = sort.field === 'assigned_to' ? 'assigned_to_id' : sort.field
      query = query.order(orderField, { ascending: sort.direction === 'asc' })
    } else {
      query = query.order('updated_at', { ascending: false })
    }
    
    const { data: tasks, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getTasks')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!tasks) return []
    
    // Fetch profiles for assigned_to_id, created_by, updated_by
    const profileIds = new Set<string>()
    tasks.forEach((row: any) => {
      if (row.assigned_to_id) profileIds.add(row.assigned_to_id)
      if (row.created_by) profileIds.add(row.created_by)
      if (row.updated_by) profileIds.add(row.updated_by)
    })
    
    const profilesMap = new Map<string, any>()
    if (profileIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', Array.from(profileIds))
      
      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap.set(p.id, p)
        })
      }
    }
    
    // Enrich tasks with profile data
    const enrichedTasks = tasks.map((row: any) => ({
      ...row,
      assigned_to_profile: row.assigned_to_id ? profilesMap.get(row.assigned_to_id) : null,
      created_by_profile: row.created_by ? profilesMap.get(row.created_by) : null,
      updated_by_profile: row.updated_by ? profilesMap.get(row.updated_by) : null,
    }))
    
    // Transform tasks and build hierarchical structure
    const taskMap = new Map<string, Task>()
    const rootTasks: Task[] = []
    
    // First pass: create all tasks
    enrichedTasks.forEach((row: any) => {
      const task = transformTask(row)
      taskMap.set(task.id, task)
    })
    
    // Second pass: build hierarchy
    enrichedTasks.forEach((row: any) => {
      const task = taskMap.get(row.id)!
      
      if (row.parent_id) {
        const parent = taskMap.get(row.parent_id)
        if (parent) {
          // Use level from database, but ensure hierarchy is correct
          if (parent.level === 0) {
            if (!(parent as any).subtasks) {
              (parent as any).subtasks = []
            }
            (parent as any).subtasks.push(task)
          } else if (parent.level === 1) {
            if (!(parent as any).subtasks) {
              (parent as any).subtasks = []
            }
            (parent as any).subtasks.push(task)
          }
        } else {
          // Orphaned task - treat as root
          rootTasks.push(task)
        }
      } else {
        rootTasks.push(task)
      }
    })
    
    return rootTasks
  } catch (error) {
    logDatabaseError(error, 'getTasks')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get single task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      logDatabaseError(error, 'getTaskById')
      return null
    }
    
    if (!task) return null
    
    // Check permissions
    if (role === 'executive' && task.assigned_to_id !== user.id) {
      throw new Error('Not authorized to view this task')
    }
    
    if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (task.assigned_to_id !== user.id && !teamMemberIds.includes(task.assigned_to_id)) {
        throw new Error('Not authorized to view this task')
      }
    }
    
    // Fetch profile data
    const profileIds = new Set<string>()
    if (task.assigned_to_id) profileIds.add(task.assigned_to_id)
    if (task.created_by) profileIds.add(task.created_by)
    if (task.updated_by) profileIds.add(task.updated_by)
    
    if (profileIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', Array.from(profileIds))
      
      if (profiles) {
        const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
        task.assigned_to_profile = task.assigned_to_id ? profilesMap.get(task.assigned_to_id) : null
        task.created_by_profile = task.created_by ? profilesMap.get(task.created_by) : null
        task.updated_by_profile = task.updated_by ? profilesMap.get(task.updated_by) : null
      }
    }
    
    return transformTask(task)
  } catch (error) {
    logDatabaseError(error, 'getTaskById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get task with full subtask tree (task + all children + grandchildren)
 */
export async function getTaskTreeById(id: string): Promise<Task | null> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Fetch the main task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (taskError) {
      logDatabaseError(taskError, 'getTaskTreeById')
      return null
    }
    
    if (!task) return null
    
    // Check permissions (same as getTaskById)
    if (role === 'executive' && task.assigned_to_id !== user.id) {
      throw new Error('Not authorized to view this task')
    }
    
    if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (task.assigned_to_id !== user.id && !teamMemberIds.includes(task.assigned_to_id)) {
        throw new Error('Not authorized to view this task')
      }
    }
    
    // Fetch all children (level 1 subtasks)
    const { data: children, error: childrenError } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, name)
      `)
      .eq('parent_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    if (childrenError) {
      logDatabaseError(childrenError, 'getTaskTreeById - children')
    }
    
    const childIds = (children || []).map((c: any) => c.id)
    
    // Fetch all grandchildren (level 2 subtasks)
    let grandchildren: any[] = []
    if (childIds.length > 0) {
      const { data: grandChildrenData, error: grandChildrenError } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name)
        `)
        .in('parent_id', childIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      
      if (grandChildrenError) {
        logDatabaseError(grandChildrenError, 'getTaskTreeById - grandchildren')
      } else {
        grandchildren = grandChildrenData || []
      }
    }
    
    // Collect all profile IDs
    const profileIds = new Set<string>()
    if (task.assigned_to_id) profileIds.add(task.assigned_to_id)
    if (task.created_by) profileIds.add(task.created_by)
    if (task.updated_by) profileIds.add(task.updated_by)
    
    ;(children || []).forEach((row: any) => {
      if (row.assigned_to_id) profileIds.add(row.assigned_to_id)
      if (row.created_by) profileIds.add(row.created_by)
      if (row.updated_by) profileIds.add(row.updated_by)
    })
    
    grandchildren.forEach((row: any) => {
      if (row.assigned_to_id) profileIds.add(row.assigned_to_id)
      if (row.created_by) profileIds.add(row.created_by)
      if (row.updated_by) profileIds.add(row.updated_by)
    })
    
    // Fetch all profiles
    const profilesMap = new Map<string, any>()
    if (profileIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', Array.from(profileIds))
      
      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap.set(p.id, p)
        })
      }
    }
    
    // Enrich all tasks with profile data
    const enrichTask = (row: any) => ({
      ...row,
      assigned_to_profile: row.assigned_to_id ? profilesMap.get(row.assigned_to_id) : null,
      created_by_profile: row.created_by ? profilesMap.get(row.created_by) : null,
      updated_by_profile: row.updated_by ? profilesMap.get(row.updated_by) : null,
    })
    
    const enrichedTask = enrichTask(task)
    const enrichedChildren = (children || []).map(enrichTask)
    const enrichedGrandchildren = grandchildren.map(enrichTask)
    
    // Build hierarchical structure
    const grandchildMap = new Map<string, any>()
    enrichedGrandchildren.forEach((gc: any) => {
      if (!grandchildMap.has(gc.parent_id)) {
        grandchildMap.set(gc.parent_id, [])
      }
      grandchildMap.get(gc.parent_id)!.push(transformTask(gc))
    })
    
    // Attach grandchildren to children
    const childrenWithSubtasks = enrichedChildren.map((child: any) => {
      const transformed = transformTask(child)
      if (transformed.level === 1 && grandchildMap.has(child.id)) {
        ;(transformed as any).subtasks = grandchildMap.get(child.id)
      }
      return transformed
    })
    
    // Transform main task and attach children
    const transformedTask = transformTask(enrichedTask)
    if (transformedTask.level === 0) {
      ;(transformedTask as any).subtasks = childrenWithSubtasks
    } else if (transformedTask.level === 1) {
      ;(transformedTask as any).subtasks = childrenWithSubtasks
    }
    
    return transformedTask
  } catch (error) {
    logDatabaseError(error, 'getTaskTreeById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Validate required fields
    if (!input.name || input.name.trim().length < 3) {
      throw new Error('Task name must be at least 3 characters')
    }
    
    // Permission check for assignment
    if (input.assignedTo) {
      const assignedToId = await resolveProfileId(input.assignedTo, false)
      
      if (role === 'executive') {
        // Executives can only assign to themselves
        if (assignedToId !== user.id) {
          throw new Error('You can only assign tasks to yourself')
        }
      } else if (role === 'manager') {
        // Managers can assign to self or team members
        const teamMemberIds = await getTeamMemberIds(user.id)
        if (assignedToId !== user.id && !teamMemberIds.includes(assignedToId!)) {
          throw new Error('You can only assign tasks to yourself or team members')
        }
      }
      // SuperAdmin can assign to anyone
    } else {
      // Default to current user if not specified
      input.assignedTo = user.id
    }
    
    // Resolve foreign keys
    const assignedToId = await resolveProfileId(input.assignedTo, true)
    const projectId = normalizeOptional(input.projectId)
    const parentId = normalizeOptional(input.parentId)
    
    // Validate parent task if provided
    if (parentId) {
      const { data: parentTask } = await supabase
        .from('tasks')
        .select('level')
        .eq('id', parentId)
        .is('deleted_at', null)
        .single()
      
      if (!parentTask) {
        throw new Error('Parent task not found')
      }
      
      if (parentTask.level === 2) {
        throw new Error('Cannot create subtask for a level 2 task (maximum depth reached)')
      }
    }
    
    // Determine task level
    let level = 0
    if (parentId) {
      const { data: parentTask } = await supabase
        .from('tasks')
        .select('level')
        .eq('id', parentId)
        .is('deleted_at', null)
        .single()
      
      if (parentTask) {
        level = (parentTask.level as number) + 1
        if (level > 2) {
          throw new Error('Maximum task depth is 2 levels')
        }
      }
    }
    
    // Create task
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({
        name: input.name.trim(),
        description: normalizeOptional(input.description),
        status: input.status,
        priority: input.priority,
        level,
        parent_id: parentId || null,
        project_id: projectId || null,
        assigned_to_id: assignedToId,
        due_date: normalizeOptional(input.dueDate),
        start_date: normalizeOptional(input.startDate),
        category: normalizeOptional(input.category),
        is_draft: input.isDraft ?? false,
        figma_link: normalizeOptional(input.figmaLink),
        progress: input.progress || 0,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        project:projects(id, name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'createTask')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
    
    // Create notification for assigned user (if different from creator)
    if (assignedToId && assignedToId !== user.id) {
      try {
        await createNotification({
          userId: assignedToId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${input.name.trim()}`,
          data: {
            task_id: newTask.id,
            task_name: input.name.trim(),
          },
        })
      } catch (notificationError) {
        // Log but don't fail task creation if notification fails
        logDatabaseError(notificationError, 'createTask - notification creation')
      }
    }
    
    // Enrich with profile data
    const enrichedTask = await enrichTaskWithProfiles(supabase, newTask)
    return transformTask(enrichedTask)
  } catch (error) {
    logDatabaseError(error, 'createTask')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Save a task as draft
 * This is a convenience function that creates a task with isDraft=true
 */
export async function saveTaskAsDraft(input: CreateTaskInput): Promise<Task> {
  return createTask({
    ...input,
    isDraft: true,
  })
}

/**
 * Update a task
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Get existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('assigned_to_id, created_by, name, status, priority')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !existingTask) {
      throw new Error('Task not found')
    }
    
    // Permission check
    if (role === 'executive') {
      if (existingTask.assigned_to_id !== user.id) {
        throw new Error('You can only edit your own tasks')
      }
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (existingTask.assigned_to_id !== user.id && !teamMemberIds.includes(existingTask.assigned_to_id)) {
        throw new Error('You can only edit your own tasks or team tasks')
      }
    }
    // SuperAdmin can edit any task
    
    // Validate name if provided
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length < 3) {
        throw new Error('Task name must be at least 3 characters')
      }
    }
    
    // Permission check for assignment change
    if (input.assignedTo !== undefined) {
      const assignedToId = await resolveProfileId(input.assignedTo, false)
      
      if (role === 'executive') {
        // Executives can only assign to themselves
        if (assignedToId !== user.id) {
          throw new Error('You can only assign tasks to yourself')
        }
      } else if (role === 'manager') {
        // Managers can assign to self or team members
        const teamMemberIds = await getTeamMemberIds(user.id)
        if (assignedToId !== user.id && !teamMemberIds.includes(assignedToId!)) {
          throw new Error('You can only assign tasks to yourself or team members')
        }
      }
      // SuperAdmin can assign to anyone
    }
    
    // Resolve foreign keys
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) {
      updateData.name = input.name.trim()
    }
    if (input.description !== undefined) {
      updateData.description = normalizeOptional(input.description)
    }
    if (input.status !== undefined) {
      updateData.status = input.status
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority
    }
    if (input.projectId !== undefined) {
      updateData.project_id = normalizeOptional(input.projectId)
    }
    if (input.parentId !== undefined) {
      // Validate parent if changing
      if (input.parentId) {
        const { data: parentTask } = await supabase
          .from('tasks')
          .select('level, id')
          .eq('id', input.parentId)
          .is('deleted_at', null)
          .single()
        
        if (!parentTask) {
          throw new Error('Parent task not found')
        }
        
        // Prevent circular reference
        if (parentTask.id === id) {
          throw new Error('Task cannot be its own parent')
        }
        
        // Check depth
        const { data: currentTask } = await supabase
          .from('tasks')
          .select('level')
          .eq('id', id)
          .single()
        
        if (currentTask && parentTask.level === 2) {
          throw new Error('Cannot set parent to a level 2 task')
        }
        
        updateData.parent_id = input.parentId
        updateData.level = (parentTask.level as number) + 1
      } else {
        updateData.parent_id = null
        updateData.level = 0
      }
    }
    if (input.assignedTo !== undefined) {
      updateData.assigned_to_id = await resolveProfileId(input.assignedTo, true)
    }
    if (input.dueDate !== undefined) {
      updateData.due_date = normalizeOptional(input.dueDate)
    }
    if (input.startDate !== undefined) {
      updateData.start_date = normalizeOptional(input.startDate)
    }
    if (input.category !== undefined) {
      updateData.category = normalizeOptional(input.category)
    }
    if (input.isDraft !== undefined) {
      updateData.is_draft = input.isDraft
    }
    if (input.figmaLink !== undefined) {
      updateData.figma_link = normalizeOptional(input.figmaLink)
    }
    if (input.progress !== undefined) {
      updateData.progress = Math.max(0, Math.min(100, input.progress))
    }
    
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateTask')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    // Create notifications for various events
    const taskName = updatedTask.name || existingTask.name || 'Untitled Task'
    
    // Notification: Assignment changed
    if (input.assignedTo !== undefined && updateData.assigned_to_id) {
      const newAssigneeId = updateData.assigned_to_id
      // Only notify if assignee changed and is different from current user
      if (existingTask.assigned_to_id !== newAssigneeId && newAssigneeId !== user.id) {
        try {
          await createNotification({
            userId: newAssigneeId,
            type: 'task_assigned',
            title: 'Task Assigned',
            message: `You have been assigned to task: ${taskName}`,
            data: {
              task_id: id,
              task_name: taskName,
            },
          })
        } catch (notificationError) {
          // Log but don't fail task update if notification fails
          logDatabaseError(notificationError, 'updateTask - assignment notification')
        }
      }
    }
    
    // Notification: Status changed to completed
    if (input.status !== undefined && input.status === 'completed' && existingTask.status !== 'completed') {
      // Notify creator if different from assignee
      if (existingTask.created_by && existingTask.created_by !== existingTask.assigned_to_id && existingTask.created_by !== user.id) {
        try {
          await createNotification({
            userId: existingTask.created_by,
            type: 'task_completed',
            title: 'Task Completed',
            message: `Task "${taskName}" has been completed`,
            data: {
              task_id: id,
              task_name: taskName,
              completed_by: existingTask.assigned_to_id,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'updateTask - completion notification')
        }
      }
    }
    
    // Notification: Status changed to blocked
    if (input.status !== undefined && input.status === 'blocked' && existingTask.assigned_to_id) {
      // Notify manager if assignee has a manager
      try {
        const { data: assigneeProfile } = await supabase
          .from('profiles')
          .select('manager_id')
          .eq('id', existingTask.assigned_to_id)
          .single()
        
        if (assigneeProfile?.manager_id && assigneeProfile.manager_id !== user.id) {
          await createNotification({
            userId: assigneeProfile.manager_id,
            type: 'task_blocked',
            title: 'Task Blocked',
            message: `Task "${taskName}" has been marked as blocked`,
            data: {
              task_id: id,
              task_name: taskName,
              assigned_to_id: existingTask.assigned_to_id,
            },
          })
        }
      } catch (notificationError) {
        logDatabaseError(notificationError, 'updateTask - blocked notification')
      }
    }
    
    // Notification: Status changed (general)
    if (input.status !== undefined && input.status !== existingTask.status) {
      // Notify assignee if status changed and assignee is different from updater
      if (existingTask.assigned_to_id && existingTask.assigned_to_id !== user.id) {
        try {
          await createNotification({
            userId: existingTask.assigned_to_id,
            type: 'task_status_changed',
            title: 'Task Status Updated',
            message: `Task "${taskName}" status has been changed to ${input.status}`,
            data: {
              task_id: id,
              task_name: taskName,
              old_status: existingTask.status,
              new_status: input.status,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'updateTask - status change notification')
        }
      }
    }
    
    // Notification: Priority changed
    if (input.priority !== undefined) {
      // Notify assignee if priority changed and assignee is different from updater
      if (existingTask.assigned_to_id && existingTask.assigned_to_id !== user.id) {
        try {
          await createNotification({
            userId: existingTask.assigned_to_id,
            type: 'task_priority_changed',
            title: 'Task Priority Updated',
            message: `Task "${taskName}" priority has been changed to ${input.priority}`,
            data: {
              task_id: id,
              task_name: taskName,
              priority: input.priority,
            },
          })
        } catch (notificationError) {
          logDatabaseError(notificationError, 'updateTask - priority change notification')
        }
      }
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
    revalidatePath(`/tasks/${id}`)
    
    // Enrich with profile data
    const enrichedTask = await enrichTaskWithProfiles(supabase, updatedTask)
    return transformTask(enrichedTask)
  } catch (error) {
    logDatabaseError(error, 'updateTask')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete a task (soft delete, SuperAdmin only)
 */
export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can delete tasks')
    }
    
    const { error } = await supabase
      .from('tasks')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteTask')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
  } catch (error) {
    logDatabaseError(error, 'deleteTask')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update task status (quick update)
 */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Get existing task
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('assigned_to_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !existingTask) {
      throw new Error('Task not found')
    }
    
    // Permission check
    if (role === 'executive') {
      if (existingTask.assigned_to_id !== user.id) {
        throw new Error('You can only update status of your own tasks')
      }
    } else if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (existingTask.assigned_to_id !== user.id && !teamMemberIds.includes(existingTask.assigned_to_id)) {
        throw new Error('You can only update status of your own tasks or team tasks')
      }
    }
    // SuperAdmin can update any task
    
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateTaskStatus')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
    revalidatePath(`/tasks/${id}`)
    
    // Enrich with profile data
    const enrichedTask = await enrichTaskWithProfiles(supabase, updatedTask)
    return transformTask(enrichedTask)
  } catch (error) {
    logDatabaseError(error, 'updateTaskStatus')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Bulk update tasks (SuperAdmin only)
 */
export async function bulkUpdateTasks(
  ids: string[],
  updates: UpdateTaskInput
): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can perform bulk operations')
    }
    
    if (!ids || ids.length === 0) {
      throw new Error('No tasks selected')
    }
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (updates.status !== undefined) {
      updateData.status = updates.status
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority
    }
    if (updates.assignedTo !== undefined) {
      updateData.assigned_to_id = await resolveProfileId(updates.assignedTo, true)
    }
    if (updates.projectId !== undefined) {
      updateData.project_id = normalizeOptional(updates.projectId)
    }
    
    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .in('id', ids)
      .is('deleted_at', null)
    
    if (error) {
      logDatabaseError(error, 'bulkUpdateTasks')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
  } catch (error) {
    logDatabaseError(error, 'bulkUpdateTasks')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Bulk delete tasks (SuperAdmin only)
 */
export async function bulkDeleteTasks(ids: string[]): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can delete tasks')
    }
    
    if (!ids || ids.length === 0) {
      throw new Error('No tasks selected')
    }
    
    const { error } = await supabase
      .from('tasks')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .in('id', ids)
      .is('deleted_at', null)
    
    if (error) {
      logDatabaseError(error, 'bulkDeleteTasks')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
  } catch (error) {
    logDatabaseError(error, 'bulkDeleteTasks')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get task analytics (SuperAdmin only)
 */
export async function getTaskAnalytics(): Promise<TaskAnalytics> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can view analytics')
    }
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, priority, assigned_to_id, due_date')
      .is('deleted_at', null)
    
    if (error) {
      logDatabaseError(error, 'getTaskAnalytics')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!tasks) {
      return {
        total: 0,
        byStatus: {
          'not-started': 0,
          'in-progress': 0,
          'in-review': 0,
          'completed': 0,
          'blocked': 0,
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
        },
        completionRate: 0,
        overdueCount: 0,
        teamPerformance: [],
      }
    }
    
    // Calculate statistics
    const total = tasks.length
    const byStatus: Record<TaskStatus, number> = {
      'not-started': 0,
      'in-progress': 0,
      'in-review': 0,
      'completed': 0,
      'blocked': 0,
    }
    
    const byPriority: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    }
    
    let completedCount = 0
    let overdueCount = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    tasks.forEach((task: any) => {
      byStatus[task.status as TaskStatus] = (byStatus[task.status as TaskStatus] || 0) + 1
      byPriority[task.priority as TaskPriority] = (byPriority[task.priority as TaskPriority] || 0) + 1
      
      if (task.status === 'completed') {
        completedCount++
      }
      
      if (task.due_date && task.status !== 'completed') {
        const dueDate = new Date(task.due_date)
        if (dueDate < today) {
          overdueCount++
        }
      }
    })
    
    // Get team performance
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', [...new Set(tasks.map((t: any) => t.assigned_to_id).filter(Boolean))])
    
    const performanceMap = new Map<string, { total: number; completed: number }>()
    
    tasks.forEach((task: any) => {
      if (task.assigned_to_id) {
        if (!performanceMap.has(task.assigned_to_id)) {
          performanceMap.set(task.assigned_to_id, { total: 0, completed: 0 })
        }
        const perf = performanceMap.get(task.assigned_to_id)!
        perf.total++
        if (task.status === 'completed') {
          perf.completed++
        }
      }
    })
    
    const teamPerformance = Array.from(performanceMap.entries()).map(([userId, perf]) => {
      const profile = profiles?.find((p: any) => p.id === userId)
      return {
        userId,
        userName: profile?.full_name || 'Unknown',
        totalTasks: perf.total,
        completedTasks: perf.completed,
        completionRate: perf.total > 0 ? (perf.completed / perf.total) * 100 : 0,
      }
    })
    
    return {
      total,
      byStatus,
      byPriority,
      completionRate: total > 0 ? (completedCount / total) * 100 : 0,
      overdueCount,
      teamPerformance: teamPerformance.sort((a, b) => b.completionRate - a.completionRate),
    }
  } catch (error) {
    logDatabaseError(error, 'getTaskAnalytics')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all users for task assignment (based on role)
 */
export async function getAssignableUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role === 'executive') {
      // Executives can only see themselves
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', user.id)
        .single()
      
      if (!profile) return []
      
      return [{
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: profile.email,
      }]
    } else if (role === 'manager') {
      // Managers can see themselves + team members
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = [user.id, ...teamMemberIds]
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', allIds)
        .eq('is_active', true)
        .order('full_name', { ascending: true })
      
      if (!profiles) return []
      
      return profiles.map(p => ({
        id: p.id,
        name: p.full_name || 'Unknown',
        email: p.email,
      }))
    } else {
      // SuperAdmin can see all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name', { ascending: true })
      
      if (!profiles) return []
      
      return profiles.map(p => ({
        id: p.id,
        name: p.full_name || 'Unknown',
        email: p.email,
      }))
    }
  } catch (error) {
    logDatabaseError(error, 'getAssignableUsers')
    return []
  }
}

/**
 * Get all projects for task assignment
 */
export async function getProjectsForTasks(): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient()
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name')
      .is('deleted_at', null)
      .order('name', { ascending: true })
    
    if (error) {
      logDatabaseError(error, 'getProjectsForTasks')
      return []
    }
    
    if (!projects) return []
    
    return projects.map(p => ({
      id: p.id,
      name: p.name,
    }))
  } catch (error) {
    logDatabaseError(error, 'getProjectsForTasks')
    return []
  }
}

/**
 * Get parent tasks for hierarchical structure
 */
export async function getParentTasks(excludeId?: string): Promise<Array<{ id: string; name: string; level: number }>> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('tasks')
      .select('id, name, level')
      .is('deleted_at', null)
      .in('level', [0, 1]) // Only level 0 and 1 can have children
      .order('name', { ascending: true })
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data: tasks, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getParentTasks')
      return []
    }
    
    if (!tasks) return []
    
    return tasks.map((t: any) => ({
      id: t.id,
      name: t.name,
      level: t.level,
    }))
  } catch (error) {
    logDatabaseError(error, 'getParentTasks')
    return []
  }
}

// ============================================================================
// COMMENT ACTIONS
// ============================================================================

export interface TaskComment {
  id: string
  taskId: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface CreateTaskCommentInput {
  taskId: string
  content: string
}

/**
 * Create a comment on a task
 */
export async function createTaskComment(input: CreateTaskCommentInput): Promise<TaskComment> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Verify task exists and user has access
    const task = await getTaskById(input.taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    
    if (!input.content || input.content.trim().length < 1) {
      throw new Error('Comment content is required')
    }
    
    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: input.taskId,
        content: input.content.trim(),
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createTaskComment')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${input.taskId}`)
    revalidatePath('/tasks')
    revalidatePath('/my-tasks')
    
    // Fetch author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', user.id)
      .single()
    
    return {
      id: comment.id,
      taskId: comment.task_id,
      content: comment.content,
      createdBy: comment.created_by,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: profile.email,
        avatar: profile.avatar_url || undefined,
      } : undefined,
    }
  } catch (error) {
    logDatabaseError(error, 'createTaskComment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update a task comment
 */
export async function updateTaskComment(commentId: string, content: string): Promise<TaskComment> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Get existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('task_comments')
      .select('task_id, created_by')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !existingComment) {
      throw new Error('Comment not found')
    }
    
    // Only author can edit
    if (existingComment.created_by !== user.id) {
      throw new Error('You can only edit your own comments')
    }
    
    if (!content || content.trim().length < 1) {
      throw new Error('Comment content is required')
    }
    
    const { data: comment, error } = await supabase
      .from('task_comments')
      .update({
        content: content.trim(),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateTaskComment')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${existingComment.task_id}`)
    revalidatePath('/tasks')
    revalidatePath('/my-tasks')
    
    // Fetch author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', comment.created_by)
      .single()
    
    return {
      id: comment.id,
      taskId: comment.task_id,
      content: comment.content,
      createdBy: comment.created_by,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: profile ? {
        id: profile.id,
        name: profile.full_name || 'Unknown',
        email: profile.email,
        avatar: profile.avatar_url || undefined,
      } : undefined,
    }
  } catch (error) {
    logDatabaseError(error, 'updateTaskComment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete a task comment
 */
export async function deleteTaskComment(commentId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Get existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('task_comments')
      .select('task_id, created_by')
      .eq('id', commentId)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !existingComment) {
      throw new Error('Comment not found')
    }
    
    // Only author or SuperAdmin can delete
    if (existingComment.created_by !== user.id && role !== 'superadmin') {
      throw new Error('You can only delete your own comments')
    }
    
    const { error } = await supabase
      .from('task_comments')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', commentId)
    
    if (error) {
      logDatabaseError(error, 'deleteTaskComment')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${existingComment.task_id}`)
    revalidatePath('/tasks')
    revalidatePath('/my-tasks')
  } catch (error) {
    logDatabaseError(error, 'deleteTaskComment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all comments for a task
 */
export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Verify task exists and user has access
    const task = await getTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    
    const { data: comments, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        author:profiles!task_comments_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('task_id', taskId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    if (error) {
      logDatabaseError(error, 'getTaskComments')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!comments) return []
    
    return comments.map((comment: any) => ({
      id: comment.id,
      taskId: comment.task_id,
      content: comment.content,
      createdBy: comment.created_by,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: comment.author ? {
        id: comment.author.id,
        name: comment.author.full_name || 'Unknown',
        email: comment.author.email,
        avatar: comment.author.avatar_url || undefined,
      } : undefined,
    }))
  } catch (error) {
    logDatabaseError(error, 'getTaskComments')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// ATTACHMENT ACTIONS
// ============================================================================

import type { TaskAttachment, CreateTaskAttachmentInput } from '@/lib/types/task-attachment'

/**
 * Upload a task attachment
 */
export async function uploadTaskAttachment(input: CreateTaskAttachmentInput): Promise<TaskAttachment> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Verify task exists and user has access
    const task = await getTaskById(input.taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    
    const { data: attachment, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: input.taskId,
        file_name: input.fileName,
        file_url: input.fileUrl,
        file_size: input.fileSize,
        mime_type: input.mimeType,
        uploaded_by: user.id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'uploadTaskAttachment')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${input.taskId}`)
    revalidatePath('/tasks')
    revalidatePath('/my-tasks')
    
    return {
      id: attachment.id,
      taskId: attachment.task_id,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      fileSize: attachment.file_size,
      mimeType: attachment.mime_type,
      uploadedBy: attachment.uploaded_by,
      createdAt: attachment.created_at,
      updatedAt: attachment.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'uploadTaskAttachment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete a task attachment
 */
export async function deleteTaskAttachment(attachmentId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Get existing attachment
    const { data: existingAttachment, error: fetchError } = await supabase
      .from('task_attachments')
      .select('task_id, uploaded_by')
      .eq('id', attachmentId)
      .is('deleted_at', null)
      .single()
    
    if (fetchError || !existingAttachment) {
      throw new Error('Attachment not found')
    }
    
    // Only uploader or SuperAdmin can delete
    if (existingAttachment.uploaded_by !== user.id && role !== 'superadmin') {
      throw new Error('You can only delete your own attachments')
    }
    
    const { error } = await supabase
      .from('task_attachments')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', attachmentId)
    
    if (error) {
      logDatabaseError(error, 'deleteTaskAttachment')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${existingAttachment.task_id}`)
    revalidatePath('/tasks')
    revalidatePath('/my-tasks')
  } catch (error) {
    logDatabaseError(error, 'deleteTaskAttachment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all attachments for a task
 */
export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Verify task exists and user has access
    const task = await getTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    
    const { data: attachments, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getTaskAttachments')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!attachments) return []
    
    return attachments.map((attachment: any) => ({
      id: attachment.id,
      taskId: attachment.task_id,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      fileSize: attachment.file_size,
      mimeType: attachment.mime_type,
      uploadedBy: attachment.uploaded_by,
      createdAt: attachment.created_at,
      updatedAt: attachment.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getTaskAttachments')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// BULK OPERATIONS (SuperAdmin only)
// ============================================================================

/**
 * Bulk assign tasks to a user
 */
export async function bulkAssignTasks(taskIds: string[], userId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can perform bulk operations')
    }
    
    if (!taskIds || taskIds.length === 0) {
      throw new Error('No tasks selected')
    }
    
    const assignedToId = await resolveProfileId(userId, true)
    
    const { error } = await supabase
      .from('tasks')
      .update({
        assigned_to_id: assignedToId,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', taskIds)
      .is('deleted_at', null)
    
    if (error) {
      logDatabaseError(error, 'bulkAssignTasks')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
  } catch (error) {
    logDatabaseError(error, 'bulkAssignTasks')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Bulk change task status
 */
export async function bulkChangeStatus(taskIds: string[], status: TaskStatus): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can perform bulk operations')
    }
    
    if (!taskIds || taskIds.length === 0) {
      throw new Error('No tasks selected')
    }
    
    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', taskIds)
      .is('deleted_at', null)
    
    if (error) {
      logDatabaseError(error, 'bulkChangeStatus')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
  } catch (error) {
    logDatabaseError(error, 'bulkChangeStatus')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Bulk change task priority
 */
export async function bulkChangePriority(taskIds: string[], priority: TaskPriority): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role !== 'superadmin') {
      throw new Error('Only SuperAdmin can perform bulk operations')
    }
    
    if (!taskIds || taskIds.length === 0) {
      throw new Error('No tasks selected')
    }
    
    const { error } = await supabase
      .from('tasks')
      .update({
        priority,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .in('id', taskIds)
      .is('deleted_at', null)
    
    if (error) {
      logDatabaseError(error, 'bulkChangePriority')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-tasks')
    revalidatePath('/tasks')
    revalidatePath('/admin/tasks')
  } catch (error) {
    logDatabaseError(error, 'bulkChangePriority')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// ADVANCED FILTERING
// ============================================================================

/**
 * Get all tasks for a project
 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Verify project exists
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()
    
    if (!project) {
      throw new Error('Project not found')
    }
    
    return getTasks({ projectId: [projectId] })
  } catch (error) {
    logDatabaseError(error, 'getTasksByProject')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all tasks assigned to a user
 */
export async function getTasksByAssignee(userId: string): Promise<Task[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    // Permission check
    if (role === 'executive' && userId !== user.id) {
      throw new Error('You can only view your own tasks')
    }
    
    if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      if (userId !== user.id && !teamMemberIds.includes(userId)) {
        throw new Error('You can only view your own tasks or team tasks')
      }
    }
    
    return getTasks({ assignedTo: [userId] })
  } catch (error) {
    logDatabaseError(error, 'getTasksByAssignee')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all overdue tasks
 */
export async function getOverdueTasks(): Promise<Task[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    if (role === 'executive') {
      throw new Error('Only Manager and SuperAdmin can view overdue tasks')
    }
    
    return getTasks({ dueDate: { type: 'overdue' } })
  } catch (error) {
    logDatabaseError(error, 'getOverdueTasks')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

// ============================================================================
// TASK DEPENDENCIES
// ============================================================================

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  dependsOnTask?: {
    id: string
    name: string
    status: TaskStatus
  }
  createdAt: string
}

/**
 * Add a task dependency
 */
export async function addTaskDependency(taskId: string, dependsOnTaskId: string): Promise<TaskDependency> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Prevent self-dependency
    if (taskId === dependsOnTaskId) {
      throw new Error('Task cannot depend on itself')
    }
    
    // Verify both tasks exist
    const [task, dependsOnTask] = await Promise.all([
      getTaskById(taskId),
      getTaskById(dependsOnTaskId),
    ])
    
    if (!task || !dependsOnTask) {
      throw new Error('One or both tasks not found')
    }
    
    // Check for circular dependencies (basic check)
    const existingDeps = await getTaskDependencies(dependsOnTaskId)
    if (existingDeps.some(dep => dep.dependsOnTaskId === taskId)) {
      throw new Error('Circular dependency detected')
    }
    
    const { data: dependency, error } = await supabase
      .from('task_dependencies')
      .insert({
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId,
        created_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'addTaskDependency')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath('/tasks')
    
    return {
      id: dependency.id,
      taskId: dependency.task_id,
      dependsOnTaskId: dependency.depends_on_task_id,
      dependsOnTask: {
        id: dependsOnTask.id,
        name: dependsOnTask.name,
        status: dependsOnTask.status,
      },
      createdAt: dependency.created_at,
    }
  } catch (error) {
    logDatabaseError(error, 'addTaskDependency')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Remove a task dependency
 */
export async function removeTaskDependency(taskId: string, dependsOnTaskId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('task_id', taskId)
      .eq('depends_on_task_id', dependsOnTaskId)
    
    if (error) {
      logDatabaseError(error, 'removeTaskDependency')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath('/tasks')
  } catch (error) {
    logDatabaseError(error, 'removeTaskDependency')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all dependencies for a task
 */
export async function getTaskDependencies(taskId: string): Promise<TaskDependency[]> {
  const supabase = await createClient()
  
  try {
    // Verify task exists
    const task = await getTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    
    const { data: dependencies, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(id, name, status)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    
    if (error) {
      logDatabaseError(error, 'getTaskDependencies')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!dependencies) return []
    
    return dependencies.map((dep: any) => ({
      id: dep.id,
      taskId: dep.task_id,
      dependsOnTaskId: dep.depends_on_task_id,
      dependsOnTask: dep.depends_on_task ? {
        id: dep.depends_on_task.id,
        name: dep.depends_on_task.name,
        status: dep.depends_on_task.status,
      } : undefined,
      createdAt: dep.created_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getTaskDependencies')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

