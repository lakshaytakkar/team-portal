'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Employee as FrontendEmployee, Onboarding as FrontendOnboarding, HRUser, HRTemplate, HRTemplateType } from '@/lib/types/hr'
import { resolveDepartmentId, resolveProfileId, resolveVerticalId, resolveRoleId, getOrCreateTeam, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { getAvatarForUser } from '@/lib/utils/avatars'
// Re-export hierarchy functions for convenience
import {
  getVerticals,
  createVertical,
  updateVertical,
  deleteVertical,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getTeams,
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from './hierarchy'

export {
  getVerticals,
  createVertical,
  updateVertical,
  deleteVertical,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getTeams,
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a service role client for admin operations
 * This bypasses RLS and allows admin operations like creating auth users
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role key. Admin operations require SUPABASE_SERVICE_ROLE_KEY.')
  }

  return createServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function toHRUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): HRUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR FORMS
// ============================================================================

/**
 * Get all active departments for dropdowns
 */
export async function getDepartments(verticalIds?: string[]) {
  'use server'
  const supabase = await createClient()

  let query = supabase
    .from('departments')
    .select('id, name, code')
    .is('deleted_at', null)
    .eq('is_active', true)

  // If verticalIds provided, filter departments through teams
  if (verticalIds && verticalIds.length > 0) {
    // Get unique department IDs from teams that belong to selected verticals
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('department_id')
      .in('vertical_id', verticalIds)
      .is('deleted_at', null)
      .eq('is_active', true)

    if (teamsError) {
      console.warn('Error fetching teams for verticals:', teamsError)
      // Fallback to all departments if teams query fails
    } else if (teams && teams.length > 0) {
      const departmentIds = [...new Set(teams.map((t: any) => t.department_id).filter(Boolean))]
      if (departmentIds.length > 0) {
        query = query.in('id', departmentIds)
      } else {
        // No teams found for selected verticals, return empty
        return []
      }
    } else {
      // No teams found, return empty
      return []
    }
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Get department members (employees) and manager
 */
export async function getDepartmentMembers(departmentId: string) {
  'use server'
  const supabase = await createClient()

  try {
    // Get department with manager
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('id, name, manager_id')
      .eq('id', departmentId)
      .single()

    if (deptError) {
      console.warn('Error fetching department:', deptError)
      return { manager: null, members: [] }
    }

    // Get manager profile if exists
    let manager = null
    if (department.manager_id) {
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', department.manager_id)
        .single()
      
      if (managerProfile) {
        manager = {
          id: managerProfile.id,
          name: managerProfile.full_name,
          email: managerProfile.email,
          avatar: managerProfile.avatar_url || null,
        }
      }
    }

    // Get all employees in this department through positions -> teams -> departments
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select(`
        employee_id,
        team:teams!inner(
          department_id
        ),
        employee:employees!inner(
          id,
          profile:profiles!inner(
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq('team.department_id', departmentId)
      .is('deleted_at', null)
      .is('employee.deleted_at', null)

    if (positionsError) {
      console.warn('Error fetching department members:', positionsError)
    }

    const members = (positions || [])
      .map((pos: any) => ({
        id: pos.employee?.profile?.id,
        name: pos.employee?.profile?.full_name,
        email: pos.employee?.profile?.email,
        avatar: pos.employee?.profile?.avatar_url || null,
      }))
      .filter((m: any) => m.id && m.id !== department?.manager_id) // Exclude manager from members

    return {
      manager,
      members,
    }
  } catch (error) {
    console.error('Error in getDepartmentMembers:', error)
    return {
      manager: null,
      members: [],
    }
  }
}

/**
 * Get all active managers/profiles for dropdowns
 */
export async function getManagers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('is_active', true)
    .in('role', ['manager', 'superadmin'])
    .order('full_name', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ============================================================================
// EMPLOYEES
// ============================================================================

export async function getEmployees(): Promise<FrontendEmployee[]> {
  const supabase = await createClient()

  try {
    // First, get employees with their profiles
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select(`
        *,
        profile:profiles!profile_id(
          *,
          department:departments(name)
        )
      `)
      .is('deleted_at', null)
      .order('employee_id', { ascending: true })

    if (employeesError) {
      logDatabaseError(employeesError, 'getEmployees')
      throw new Error(`Failed to fetch employees: ${employeesError.message}`)
    }
    if (!employeesData) return []

    // Then, get positions for all employees
    const employeeIds = employeesData.map((e: any) => e.id).filter(Boolean)
    let positionsData: any[] = []
    let positionsError: any = null
    
    if (employeeIds.length > 0) {
      const positionsResult = await supabase
        .from('positions')
        .select(`
          *,
          team:teams(
            *,
            department:departments(name, code),
            vertical:verticals(name, code)
          ),
          role:roles(name)
        `)
        .in('employee_id', employeeIds)
        .is('deleted_at', null)
      
      positionsData = positionsResult.data || []
      positionsError = positionsResult.error
    }

    // Don't fail if positions query fails - employees might not have positions yet
    const positionsByEmployeeId = new Map<string, any[]>()
    if (!positionsError && positionsData) {
      positionsData.forEach((pos: any) => {
        const empId = pos.employee_id
        if (!positionsByEmployeeId.has(empId)) {
          positionsByEmployeeId.set(empId, [])
        }
        positionsByEmployeeId.get(empId)!.push(pos)
      })
    }

    const data = employeesData

    return data.map((row) => {
      const positions = positionsByEmployeeId.get(row.id) || []
      // Find primary position from positions array, or use first position
      const primaryPos = positions.find((p: any) => p?.is_primary) || positions[0]

      return {
        id: row.id,
        employeeId: row.employee_id,
        fullName: row.profile?.full_name ?? '',
        email: row.profile?.email ?? '',
        phone: row.profile?.phone ?? undefined,
        department: primaryPos?.team?.department?.name ?? row.profile?.department?.name ?? 'Unknown',
        position: primaryPos?.role?.name ?? row.profile?.position ?? '',
        status: row.status,
        roleType: row.role_type ?? 'internal',
        hireDate: row.hire_date,
        manager: undefined,
        avatar: row.profile?.avatar_url ?? getAvatarForUser(row.profile?.full_name ?? 'U'),
        candidateId: row.candidate_id ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        primaryPosition: primaryPos ? {
        id: primaryPos.id,
        employeeId: primaryPos.employee_id,
        teamId: primaryPos.team_id,
        roleId: primaryPos.role_id,
        title: primaryPos.title,
        isPrimary: primaryPos.is_primary,
        startDate: primaryPos.start_date,
        endDate: primaryPos.end_date,
        isActive: primaryPos.is_active,
        createdAt: primaryPos.created_at,
        updatedAt: primaryPos.updated_at,
        createdBy: primaryPos.created_by,
        updatedBy: primaryPos.updated_by,
        deletedAt: primaryPos.deleted_at,
        team: primaryPos.team ? {
          id: primaryPos.team.id,
          departmentId: primaryPos.team.department_id,
          verticalId: primaryPos.team.vertical_id,
          name: primaryPos.team.name,
          code: primaryPos.team.code,
          isActive: primaryPos.team.is_active,
          createdAt: primaryPos.team.created_at,
          updatedAt: primaryPos.team.updated_at,
          createdBy: primaryPos.team.created_by,
          updatedBy: primaryPos.team.updated_by,
          deletedAt: primaryPos.team.deleted_at,
          department: primaryPos.team.department ? {
            id: primaryPos.team.department.id,
            name: primaryPos.team.department.name,
            code: primaryPos.team.department.code,
          } : undefined,
          vertical: primaryPos.team.vertical ? {
            id: primaryPos.team.vertical.id,
            name: primaryPos.team.vertical.name,
            code: primaryPos.team.vertical.code,
          } : null,
        } : undefined,
        role: primaryPos.role ? {
          id: primaryPos.role.id,
          name: primaryPos.role.name,
          description: primaryPos.role.description,
          isActive: primaryPos.role.is_active,
          createdAt: primaryPos.role.created_at,
          updatedAt: primaryPos.role.updated_at,
          createdBy: primaryPos.role.created_by,
          updatedBy: primaryPos.role.updated_by,
          deletedAt: primaryPos.role.deleted_at,
        } : undefined,
      } : undefined,
      vertical: primaryPos?.team?.vertical ? {
        id: primaryPos.team.vertical.id,
        name: primaryPos.team.vertical.name,
        code: primaryPos.team.vertical.code,
        description: null,
        type: primaryPos.team.vertical.type ?? null,
        organizationId: primaryPos.team.vertical.organization_id ?? null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        createdBy: null,
        updatedBy: null,
        deletedAt: null,
      } : null,
      team: primaryPos?.team ? {
        id: primaryPos.team.id,
        departmentId: primaryPos.team.department_id,
        verticalId: primaryPos.team.vertical_id,
        name: primaryPos.team.name,
        code: primaryPos.team.code,
        isActive: primaryPos.team.is_active,
        createdAt: primaryPos.team.created_at,
        updatedAt: primaryPos.team.updated_at,
        createdBy: primaryPos.team.created_by,
        updatedBy: primaryPos.team.updated_by,
        deletedAt: primaryPos.team.deleted_at,
        department: primaryPos.team.department ? {
          id: primaryPos.team.department.id,
          name: primaryPos.team.department.name,
          code: primaryPos.team.department.code,
        } : undefined,
        vertical: primaryPos.team.vertical ? {
          id: primaryPos.team.vertical.id,
          name: primaryPos.team.vertical.name,
          code: primaryPos.team.vertical.code,
        } : null,
      } : null,
      role: primaryPos?.role ? {
        id: primaryPos.role.id,
        name: primaryPos.role.name,
        description: null,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        createdBy: null,
        updatedBy: null,
        deletedAt: null,
      } : null,
      }
    })
  } catch (error) {
    logDatabaseError(error, 'getEmployees')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function getEmployeeById(id: string): Promise<FrontendEmployee | null> {
  const supabase = await createClient()

  try {
    // First get the employee record
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (employeeError) {
      console.error('Error fetching employee:', employeeError)
      return null
    }
    if (!employeeData) return null

    // Get profile separately (graceful fallback)
    let profileData = null
    if (employeeData.profile_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          department:departments(name)
        `)
        .eq('id', employeeData.profile_id)
        .single()
      profileData = profile
    }

    // Get positions separately (graceful fallback)
    let positionsData: any[] = []
    try {
      const { data: positions } = await supabase
        .from('positions')
        .select(`
          *,
          team:teams(
            *,
            department:departments(name, code),
            vertical:verticals(name, code)
          ),
          role:roles(name)
        `)
        .eq('employee_id', id)
        .is('deleted_at', null)
      positionsData = positions || []
    } catch (positionsError) {
      console.warn('Error fetching positions:', positionsError)
      // Continue without positions
    }

    const data = {
      ...employeeData,
      profile: profileData,
      positions: positionsData,
    }

    const positions = data.positions ?? []
    const primaryPos = positions.find((p: any) => p.is_primary) || positions[0]

    return {
    id: data.id,
    employeeId: data.employee_id,
    fullName: data.profile?.full_name ?? '',
    email: data.profile?.email ?? '',
    phone: data.profile?.phone ?? undefined,
    department: primaryPos?.team?.department?.name ?? data.profile?.department?.name ?? 'Unknown',
    position: primaryPos?.role?.name ?? data.profile?.position ?? '',
    status: data.status,
    roleType: data.role_type ?? 'internal',
    hireDate: data.hire_date,
    manager: undefined,
    avatar: data.profile?.avatar_url ?? getAvatarForUser(data.profile?.full_name ?? 'U'),
    candidateId: data.candidate_id ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    primaryPosition: primaryPos ? {
      id: primaryPos.id,
      employeeId: primaryPos.employee_id,
      teamId: primaryPos.team_id,
      roleId: primaryPos.role_id,
      title: primaryPos.title,
      isPrimary: primaryPos.is_primary,
      startDate: primaryPos.start_date,
      endDate: primaryPos.end_date,
      isActive: primaryPos.is_active,
      createdAt: primaryPos.created_at,
      updatedAt: primaryPos.updated_at,
      createdBy: primaryPos.created_by,
      updatedBy: primaryPos.updated_by,
      deletedAt: primaryPos.deleted_at,
      team: primaryPos.team ? {
        id: primaryPos.team.id,
        departmentId: primaryPos.team.department_id,
        verticalId: primaryPos.team.vertical_id,
        name: primaryPos.team.name,
        code: primaryPos.team.code,
        isActive: primaryPos.team.is_active,
        createdAt: primaryPos.team.created_at,
        updatedAt: primaryPos.team.updated_at,
        createdBy: primaryPos.team.created_by,
        updatedBy: primaryPos.team.updated_by,
        deletedAt: primaryPos.team.deleted_at,
        department: primaryPos.team.department ? {
          id: primaryPos.team.department.id,
          name: primaryPos.team.department.name,
          code: primaryPos.team.department.code,
        } : undefined,
        vertical: primaryPos.team.vertical ? {
          id: primaryPos.team.vertical.id,
          name: primaryPos.team.vertical.name,
          code: primaryPos.team.vertical.code,
        } : null,
      } : undefined,
      role: primaryPos.role ? {
        id: primaryPos.role.id,
        name: primaryPos.role.name,
        description: primaryPos.role.description,
        isActive: primaryPos.role.is_active,
        createdAt: primaryPos.role.created_at,
        updatedAt: primaryPos.role.updated_at,
        createdBy: primaryPos.role.created_by,
        updatedBy: primaryPos.role.updated_by,
        deletedAt: primaryPos.role.deleted_at,
      } : undefined,
    } : undefined,
    vertical: primaryPos?.team?.vertical ? {
      id: primaryPos.team.vertical.id,
      name: primaryPos.team.vertical.name,
      code: primaryPos.team.vertical.code,
      description: null,
      type: primaryPos.team.vertical.type ?? null,
      organizationId: primaryPos.team.vertical.organization_id ?? null,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    } : null,
    team: primaryPos?.team ? {
      id: primaryPos.team.id,
      departmentId: primaryPos.team.department_id,
      verticalId: primaryPos.team.vertical_id,
      name: primaryPos.team.name,
      code: primaryPos.team.code,
      isActive: primaryPos.team.is_active,
      createdAt: primaryPos.team.created_at,
      updatedAt: primaryPos.team.updated_at,
      createdBy: primaryPos.team.created_by,
      updatedBy: primaryPos.team.updated_by,
      deletedAt: primaryPos.team.deleted_at,
      department: primaryPos.team.department ? {
        id: primaryPos.team.department.id,
        name: primaryPos.team.department.name,
        code: primaryPos.team.department.code,
      } : undefined,
      vertical: primaryPos.team.vertical ? {
        id: primaryPos.team.vertical.id,
        name: primaryPos.team.vertical.name,
        code: primaryPos.team.vertical.code,
      } : null,
    } : null,
    role: primaryPos?.role ? {
      id: primaryPos.role.id,
      name: primaryPos.role.name,
      description: null,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      createdBy: null,
      updatedBy: null,
      deletedAt: null,
    } : null,
    }
  } catch (error) {
    console.error('Error in getEmployeeById:', error)
    return null
  }
}

interface CreateEmployeeInput {
  fullName: string
  email: string
  phone?: string
  departmentId?: string
  position?: string // Deprecated: use roleId instead
  managerId?: string
  hireDate: string
  employmentType?: 'full-time' | 'part-time' | 'contract'
  salary?: number
  status?: 'active' | 'on-leave' | 'terminated' | 'resigned'
  // New hierarchy fields
  verticalId?: string | null
  roleId?: string
}

export async function createEmployee(input: CreateEmployeeInput): Promise<FrontendEmployee> {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Normalize optional fields
    const normalizedPhone = normalizeOptional(input.phone)
    const normalizedPosition = normalizeOptional(input.position)
    const normalizedSalary = normalizeOptional(input.salary)

    // Resolve foreign keys
    const resolvedDepartmentId = await resolveDepartmentId(input.departmentId, false)
    const resolvedManagerId = await resolveProfileId(input.managerId, false)

    // Validate required fields
    if (!input.fullName || !input.email || !input.hireDate) {
      throw new Error('Full name, email, and hire date are required')
    }

    // Generate next employee ID
    const { data: lastEmployee } = await supabase
      .from('employees')
      .select('employee_id')
      .order('employee_id', { ascending: false })
      .limit(1)
      .single()

    let nextId = 'EMP001'
    if (lastEmployee) {
      const lastNum = parseInt(lastEmployee.employee_id.replace('EMP', ''))
      nextId = `EMP${String(lastNum + 1).padStart(3, '0')}`
    }

    // Check if auth user already exists for this email
    const { data: existingAuthUsers } = await adminClient.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers?.users.find(u => u.email === input.email)

    let userId: string

    if (existingAuthUser) {
      // Use existing auth user
      userId = existingAuthUser.id
    } else {
      // Create auth user first
      // Generate a temporary password (employee will need to reset it)
      const tempPassword = `Temp${nextId}${Math.random().toString(36).slice(-8)}!`
      
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: input.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: input.fullName,
        },
      })

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user: No user returned')
      }

      userId = authData.user.id
    }

    // Create profile with the auth user's ID
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId, // Use auth user's ID
        email: input.email,
        full_name: input.fullName,
        phone: normalizedPhone,
        department_id: resolvedDepartmentId,
        position: normalizedPosition,
        manager_id: resolvedManagerId,
        role: 'executive',
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails (only if we just created it)
      if (!existingAuthUser) {
        await adminClient.auth.admin.deleteUser(userId).catch(() => {})
      }
      throw new Error(profileError.message)
    }

    // Create employee record
    const { data: newEmployee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        profile_id: newProfile.id,
        employee_id: nextId,
        hire_date: input.hireDate,
        employment_type: input.employmentType || 'full-time',
        salary: normalizedSalary,
        status: input.status || 'active',
      })
      .select()
      .single()

    if (employeeError) throw new Error(employeeError.message)

    // Create initial position if roleId and departmentId are provided
    if (input.roleId && resolvedDepartmentId) {
      const resolvedVerticalId = input.verticalId ? await resolveVerticalId(input.verticalId, false) : null
      const resolvedRoleId = await resolveRoleId(input.roleId, true)
      const teamId = await getOrCreateTeam(resolvedDepartmentId, resolvedVerticalId)

      const { data: newPosition } = await supabase
        .from('positions')
        .insert({
          employee_id: newEmployee.id,
          team_id: teamId,
          role_id: resolvedRoleId,
          is_primary: true,
          start_date: input.hireDate,
          is_active: true,
        })
        .select()
        .single()

      if (newPosition) {
        // Update profile with primary position
        await supabase
          .from('profiles')
          .update({ primary_position_id: newPosition.id })
          .eq('id', newProfile.id)
      }
    }

    revalidatePath('/hr/employees')

    return {
      id: newEmployee.id,
      employeeId: newEmployee.employee_id,
      fullName: newProfile.full_name ?? '',
      email: newProfile.email,
      phone: newProfile.phone ?? undefined,
      department: 'Unknown',
      position: newProfile.position ?? '',
      status: newEmployee.status,
      roleType: newEmployee.role_type ?? 'internal',
      hireDate: newEmployee.hire_date,
      manager: undefined,
      avatar: newProfile.avatar_url ?? getAvatarForUser(newProfile.full_name ?? 'U'),
      candidateId: newEmployee.candidate_id ?? undefined,
      createdAt: newEmployee.created_at,
      updatedAt: newEmployee.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createEmployee')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

interface UpdateEmployeeInput {
  id: string
  fullName?: string
  email?: string
  phone?: string
  departmentId?: string
  position?: string
  managerId?: string
  hireDate?: string
  employmentType?: 'full-time' | 'part-time' | 'contract'
  salary?: number
  status?: 'active' | 'on-leave' | 'terminated' | 'resigned'
}

export async function updateEmployee(input: UpdateEmployeeInput): Promise<FrontendEmployee> {
  const supabase = await createClient()

  try {
    // Get employee to find profile
    const { data: existingEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('profile_id')
      .eq('id', input.id)
      .single()

    if (fetchError || !existingEmployee) {
      throw new Error('Employee not found')
    }

    // Normalize optional fields
    const normalizedPhone = normalizeOptional(input.phone)
    const normalizedPosition = normalizeOptional(input.position)
    const normalizedSalary = normalizeOptional(input.salary)

    // Resolve foreign keys
    const resolvedDepartmentId = input.departmentId !== undefined
      ? await resolveDepartmentId(input.departmentId, false)
      : undefined
    const resolvedManagerId = input.managerId !== undefined
      ? await resolveProfileId(input.managerId, false)
      : undefined

    // Update profile
    const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.fullName !== undefined) profileUpdate.full_name = input.fullName
    if (input.email !== undefined) profileUpdate.email = input.email
    if (normalizedPhone !== undefined) profileUpdate.phone = normalizedPhone
    if (resolvedDepartmentId !== undefined) profileUpdate.department_id = resolvedDepartmentId
    if (normalizedPosition !== undefined) profileUpdate.position = normalizedPosition
    if (resolvedManagerId !== undefined) profileUpdate.manager_id = resolvedManagerId

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', existingEmployee.profile_id)
      .select()
      .single()

    if (profileError) throw new Error(profileError.message)

    // Update employee
    const employeeUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.hireDate !== undefined) employeeUpdate.hire_date = input.hireDate
    if (input.employmentType !== undefined) employeeUpdate.employment_type = input.employmentType
    if (normalizedSalary !== undefined) employeeUpdate.salary = normalizedSalary
    if (input.status !== undefined) employeeUpdate.status = input.status

    const { data: updatedEmployee, error: employeeError } = await supabase
      .from('employees')
      .update(employeeUpdate)
      .eq('id', input.id)
      .select()
      .single()

    if (employeeError) throw new Error(employeeError.message)

    revalidatePath('/hr/employees')
    revalidatePath(`/hr/employees/${input.id}`)

    return {
      id: updatedEmployee.id,
      employeeId: updatedEmployee.employee_id,
      fullName: updatedProfile.full_name ?? '',
      email: updatedProfile.email,
      phone: updatedProfile.phone ?? undefined,
      department: 'Unknown',
      position: updatedProfile.position ?? '',
      status: updatedEmployee.status,
      roleType: updatedEmployee.role_type ?? 'internal',
      hireDate: updatedEmployee.hire_date,
      manager: undefined,
      avatar: updatedProfile.avatar_url ?? getAvatarForUser(updatedProfile.full_name ?? 'U'),
      candidateId: updatedEmployee.candidate_id ?? undefined,
      createdAt: updatedEmployee.created_at,
      updatedAt: updatedEmployee.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateEmployee')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/hr/employees')
}

// ============================================================================
// ONBOARDING
// ============================================================================

export async function getOnboardings(): Promise<FrontendOnboarding[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('onboardings')
    .select(`
      *,
      employee:employees(
        id,
        employee_id,
        profile:profiles(id, full_name, email, avatar_url)
      ),
      assigned_to:profiles!onboardings_assigned_to_id_profiles_id_fk(id, full_name, email, avatar_url),
      tasks:onboarding_tasks(
        *,
        assigned_to:profiles(id, full_name, email, avatar_url)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    employeeId: row.employee?.id ?? '',
    employeeName: row.employee?.profile?.full_name ?? '',
    status: row.status,
    startDate: row.start_date,
    completionDate: row.completion_date ?? undefined,
    tasks: (row.tasks ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((task: {
        id: string
        title: string
        description: string | null
        assigned_to: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
        due_date: string | null
        completed: boolean
        completed_at: string | null
      }) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? undefined,
        assignedTo: toHRUser(task.assigned_to),
        dueDate: task.due_date ?? undefined,
        completed: task.completed,
        completedAt: task.completed_at ?? undefined,
      })),
    assignedTo: toHRUser(row.assigned_to)!,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getOnboardingById(id: string): Promise<FrontendOnboarding | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('onboardings')
    .select(`
      *,
      employee:employees(
        id,
        employee_id,
        profile:profiles(id, full_name, email, avatar_url)
      ),
      assigned_to:profiles!onboardings_assigned_to_id_profiles_id_fk(id, full_name, email, avatar_url),
      tasks:onboarding_tasks(
        *,
        assigned_to:profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    employeeId: data.employee?.id ?? '',
    employeeName: data.employee?.profile?.full_name ?? '',
    status: data.status,
    startDate: data.start_date,
    completionDate: data.completion_date ?? undefined,
    tasks: (data.tasks ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((task: {
        id: string
        title: string
        description: string | null
        assigned_to: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
        due_date: string | null
        completed: boolean
        completed_at: string | null
      }) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? undefined,
        assignedTo: toHRUser(task.assigned_to),
        dueDate: task.due_date ?? undefined,
        completed: task.completed,
        completedAt: task.completed_at ?? undefined,
      })),
    assignedTo: toHRUser(data.assigned_to)!,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

interface CreateOnboardingInput {
  employeeId: string
  assignedToId: string
  startDate: string
  notes?: string
  tasks?: Array<{
    title: string
    description?: string
    assignedToId?: string
    dueDate?: string
  }>
}

export async function createOnboarding(input: CreateOnboardingInput): Promise<FrontendOnboarding> {
  const supabase = await createClient()

  // Create onboarding
  const { data: newOnboarding, error: onboardingError } = await supabase
    .from('onboardings')
    .insert({
      employee_id: input.employeeId,
      assigned_to_id: input.assignedToId,
      start_date: input.startDate,
      status: 'pending',
      notes: input.notes,
    })
    .select()
    .single()

  if (onboardingError) throw new Error(onboardingError.message)

  // Create tasks if provided
  if (input.tasks && input.tasks.length > 0) {
    const { error: tasksError } = await supabase
      .from('onboarding_tasks')
      .insert(
        input.tasks.map((task, index) => ({
          onboarding_id: newOnboarding.id,
          title: task.title,
          description: task.description,
          assigned_to_id: task.assignedToId,
          due_date: task.dueDate,
          sort_order: index,
          completed: false,
        }))
      )

    if (tasksError) throw new Error(tasksError.message)
  }

  revalidatePath('/hr/onboarding')

  // Fetch complete onboarding with relations
  const result = await getOnboardingById(newOnboarding.id)
  if (!result) throw new Error('Failed to create onboarding')
  return result
}

interface UpdateOnboardingInput {
  id: string
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold'
  completionDate?: string
  notes?: string
}

export async function updateOnboarding(input: UpdateOnboardingInput): Promise<FrontendOnboarding> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.status !== undefined) update.status = input.status
  if (input.completionDate !== undefined) update.completion_date = input.completionDate
  if (input.notes !== undefined) update.notes = input.notes

  const { error } = await supabase
    .from('onboardings')
    .update(update)
    .eq('id', input.id)

  if (error) throw new Error(error.message)

  revalidatePath('/hr/onboarding')

  const result = await getOnboardingById(input.id)
  if (!result) throw new Error('Onboarding not found')
  return result
}

interface UpdateOnboardingTaskInput {
  id: string
  completed?: boolean
  completedAt?: string
}

export async function updateOnboardingTask(input: UpdateOnboardingTaskInput): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('onboarding_tasks')
    .update({
      completed: input.completed,
      completed_at: input.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)

  if (error) throw new Error(error.message)
  revalidatePath('/hr/onboarding')
}

// ============================================================================
// HR TEMPLATES
// ============================================================================

export async function getHRTemplates(type?: HRTemplateType): Promise<HRTemplate[]> {
  const supabase = await createClient()

  let query = supabase
    .from('hr_templates')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, email, avatar_url)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as HRTemplateType,
    category: row.category ?? '',
    description: row.description ?? undefined,
    content: row.content,
    channel: row.channel as 'whatsapp' | 'email' | undefined,
    variables: row.variables as Record<string, string> | undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: toHRUser(row.created_by_profile),
  }))
}

export async function getHRTemplateById(id: string): Promise<HRTemplate | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hr_templates')
    .select(`
      *,
      created_by_profile:profiles!created_by(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    type: data.type as HRTemplateType,
    category: data.category ?? '',
    description: data.description ?? undefined,
    content: data.content,
    channel: data.channel as 'whatsapp' | 'email' | undefined,
    variables: data.variables as Record<string, string> | undefined,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: toHRUser(data.created_by_profile),
  }
}

export interface CreateHRTemplateInput {
  name: string
  type: HRTemplateType
  category: string
  description?: string
  content: string
  channel?: 'whatsapp' | 'email'
  variables?: Record<string, string>
  isActive?: boolean
}

export async function createHRTemplate(input: CreateHRTemplateInput): Promise<HRTemplate> {
  const supabase = await createClient()

  try {
    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('hr_templates')
      .insert({
        name: input.name,
        type: input.type,
        category: input.category,
        description: normalizeOptional(input.description),
        content: input.content,
        channel: input.channel ?? (input.type === 'message' ? 'email' : null),
        variables: input.variables ? JSON.stringify(input.variables) : null,
        is_active: input.isActive ?? true,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        created_by_profile:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/hr/templates')

    return {
      id: data.id,
      name: data.name,
      type: data.type as HRTemplateType,
      category: data.category ?? '',
      description: data.description ?? undefined,
      content: data.content,
      channel: data.channel as 'whatsapp' | 'email' | undefined,
      variables: data.variables as Record<string, string> | undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toHRUser(data.created_by_profile),
    }
  } catch (error) {
    logDatabaseError(error, 'createHRTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export interface UpdateHRTemplateInput {
  id: string
  name?: string
  type?: HRTemplateType
  category?: string
  description?: string
  content?: string
  channel?: 'whatsapp' | 'email'
  variables?: Record<string, string>
  isActive?: boolean
}

export async function updateHRTemplate(input: UpdateHRTemplateInput): Promise<HRTemplate> {
  const supabase = await createClient()

  try {
    // Get current user for updated_by
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }

    if (input.name !== undefined) update.name = input.name
    if (input.type !== undefined) update.type = input.type
    if (input.category !== undefined) update.category = input.category
    if (input.description !== undefined) update.description = normalizeOptional(input.description)
    if (input.content !== undefined) update.content = input.content
    if (input.channel !== undefined) update.channel = input.channel
    if (input.variables !== undefined) update.variables = input.variables ? JSON.stringify(input.variables) : null
    if (input.isActive !== undefined) update.is_active = input.isActive

    const { data, error } = await supabase
      .from('hr_templates')
      .update(update)
      .eq('id', input.id)
      .select(`
        *,
        created_by_profile:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/hr/templates')
    revalidatePath(`/hr/templates/${input.id}`)

    return {
      id: data.id,
      name: data.name,
      type: data.type as HRTemplateType,
      category: data.category ?? '',
      description: data.description ?? undefined,
      content: data.content,
      channel: data.channel as 'whatsapp' | 'email' | undefined,
      variables: data.variables as Record<string, string> | undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toHRUser(data.created_by_profile),
    }
  } catch (error) {
    logDatabaseError(error, 'updateHRTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteHRTemplate(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    // Get current user for updated_by
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('hr_templates')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/hr/templates')
  } catch (error) {
    logDatabaseError(error, 'deleteHRTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}
