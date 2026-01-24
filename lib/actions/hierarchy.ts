'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  Organization,
  Vertical,
  Role,
  Team,
  Position,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  CreateVerticalInput,
  UpdateVerticalInput,
  CreateRoleInput,
  UpdateRoleInput,
  CreatePositionInput,
  UpdatePositionInput,
} from '@/lib/types/hierarchy'
import { resolveVerticalId, resolveRoleId, resolveDepartmentId, getOrCreateTeam, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export async function getOrganizations(): Promise<Organization[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    country: row.country,
    registrationNumber: row.registration_number,
    taxId: row.tax_id,
    address: row.address,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    phone: row.phone,
    email: row.email,
    website: row.website,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedAt: row.deleted_at,
  }))
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    description: data.description,
    country: data.country,
    registrationNumber: data.registration_number,
    taxId: data.tax_id,
    address: data.address,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    phone: data.phone,
    email: data.email,
    website: data.website,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    deletedAt: data.deleted_at,
  }
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  const supabase = await createClient()

  try {
    const normalizedCode = normalizeOptional(input.code)
    const normalizedDescription = normalizeOptional(input.description)
    const normalizedCountry = normalizeOptional(input.country)
    const normalizedRegistrationNumber = normalizeOptional(input.registrationNumber)
    const normalizedTaxId = normalizeOptional(input.taxId)
    const normalizedAddress = normalizeOptional(input.address)
    const normalizedCity = normalizeOptional(input.city)
    const normalizedState = normalizeOptional(input.state)
    const normalizedPostalCode = normalizeOptional(input.postalCode)
    const normalizedPhone = normalizeOptional(input.phone)
    const normalizedEmail = normalizeOptional(input.email)
    const normalizedWebsite = normalizeOptional(input.website)

    if (!input.name) {
      throw new Error('Organization name is required')
    }

    const { data: newOrganization, error } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        code: normalizedCode,
        description: normalizedDescription,
        country: normalizedCountry,
        registration_number: normalizedRegistrationNumber,
        tax_id: normalizedTaxId,
        address: normalizedAddress,
        city: normalizedCity,
        state: normalizedState,
        postal_code: normalizedPostalCode,
        phone: normalizedPhone,
        email: normalizedEmail,
        website: normalizedWebsite,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/admin/organizations')

    return {
      id: newOrganization.id,
      name: newOrganization.name,
      code: newOrganization.code,
      description: newOrganization.description,
      country: newOrganization.country,
      registrationNumber: newOrganization.registration_number,
      taxId: newOrganization.tax_id,
      address: newOrganization.address,
      city: newOrganization.city,
      state: newOrganization.state,
      postalCode: newOrganization.postal_code,
      phone: newOrganization.phone,
      email: newOrganization.email,
      website: newOrganization.website,
      isActive: newOrganization.is_active,
      createdAt: newOrganization.created_at,
      updatedAt: newOrganization.updated_at,
      createdBy: newOrganization.created_by,
      updatedBy: newOrganization.updated_by,
      deletedAt: newOrganization.deleted_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createOrganization')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateOrganization(input: UpdateOrganizationInput): Promise<Organization> {
  const supabase = await createClient()

  try {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) update.name = input.name
    if (input.code !== undefined) update.code = normalizeOptional(input.code)
    if (input.description !== undefined) update.description = normalizeOptional(input.description)
    if (input.country !== undefined) update.country = normalizeOptional(input.country)
    if (input.registrationNumber !== undefined) update.registration_number = normalizeOptional(input.registrationNumber)
    if (input.taxId !== undefined) update.tax_id = normalizeOptional(input.taxId)
    if (input.address !== undefined) update.address = normalizeOptional(input.address)
    if (input.city !== undefined) update.city = normalizeOptional(input.city)
    if (input.state !== undefined) update.state = normalizeOptional(input.state)
    if (input.postalCode !== undefined) update.postal_code = normalizeOptional(input.postalCode)
    if (input.phone !== undefined) update.phone = normalizeOptional(input.phone)
    if (input.email !== undefined) update.email = normalizeOptional(input.email)
    if (input.website !== undefined) update.website = normalizeOptional(input.website)
    if (input.isActive !== undefined) update.is_active = input.isActive

    const { data: updatedOrganization, error } = await supabase
      .from('organizations')
      .update(update)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/admin/organizations')
    revalidatePath(`/admin/organizations/${input.id}`)

    return {
      id: updatedOrganization.id,
      name: updatedOrganization.name,
      code: updatedOrganization.code,
      description: updatedOrganization.description,
      country: updatedOrganization.country,
      registrationNumber: updatedOrganization.registration_number,
      taxId: updatedOrganization.tax_id,
      address: updatedOrganization.address,
      city: updatedOrganization.city,
      state: updatedOrganization.state,
      postalCode: updatedOrganization.postal_code,
      phone: updatedOrganization.phone,
      email: updatedOrganization.email,
      website: updatedOrganization.website,
      isActive: updatedOrganization.is_active,
      createdAt: updatedOrganization.created_at,
      updatedAt: updatedOrganization.updated_at,
      createdBy: updatedOrganization.created_by,
      updatedBy: updatedOrganization.updated_by,
      deletedAt: updatedOrganization.deleted_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateOrganization')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteOrganization(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organizations')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/organizations')
  revalidatePath(`/admin/organizations/${id}`)
}

// ============================================================================
// VERTICALS
// ============================================================================

export async function getVerticals(organizationId?: string | null): Promise<Vertical[]> {
  const supabase = await createClient()

  let query = supabase
    .from('verticals')
    .select('*')
    .is('deleted_at', null)
    .eq('is_active', true)

  // Filter by organization if provided
  if (organizationId !== undefined) {
    if (organizationId === null) {
      // Show verticals with no organization
      query = query.is('organization_id', null)
    } else {
      // Show verticals for specific organization
      query = query.eq('organization_id', organizationId)
    }
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    type: row.type || null,
    organizationId: row.organization_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedAt: row.deleted_at,
  }))
}

export async function getVerticalById(id: string): Promise<Vertical | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('verticals')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    description: data.description,
    type: data.type || null,
    organizationId: data.organization_id,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    deletedAt: data.deleted_at,
  }
}

export async function createVertical(input: CreateVerticalInput): Promise<Vertical> {
  const supabase = await createClient()

  try {
    const normalizedCode = normalizeOptional(input.code)
    const normalizedDescription = normalizeOptional(input.description)

    if (!input.name) {
      throw new Error('Vertical name is required')
    }

    const { data: newVertical, error } = await supabase
      .from('verticals')
      .insert({
        name: input.name,
        code: normalizedCode,
        description: normalizedDescription,
        type: input.type || null,
        organization_id: input.organizationId || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/hr/verticals')
    revalidatePath('/admin/verticals')

    return {
      id: newVertical.id,
      name: newVertical.name,
      code: newVertical.code,
      description: newVertical.description,
      type: newVertical.type || null,
      organizationId: newVertical.organization_id,
      isActive: newVertical.is_active,
      createdAt: newVertical.created_at,
      updatedAt: newVertical.updated_at,
      createdBy: newVertical.created_by,
      updatedBy: newVertical.updated_by,
      deletedAt: newVertical.deleted_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createVertical')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateVertical(input: UpdateVerticalInput): Promise<Vertical> {
  const supabase = await createClient()

  try {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) update.name = input.name
    if (input.code !== undefined) update.code = normalizeOptional(input.code)
    if (input.description !== undefined) update.description = normalizeOptional(input.description)
    if (input.type !== undefined) update.type = input.type || null
    if (input.organizationId !== undefined) update.organization_id = input.organizationId || null
    if (input.isActive !== undefined) update.is_active = input.isActive

    const { data: updatedVertical, error } = await supabase
      .from('verticals')
      .update(update)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/hr/verticals')
    revalidatePath('/admin/verticals')
    revalidatePath(`/hr/verticals/${input.id}`)
    revalidatePath(`/admin/verticals/${input.id}`)

    return {
      id: updatedVertical.id,
      name: updatedVertical.name,
      code: updatedVertical.code,
      description: updatedVertical.description,
      type: updatedVertical.type || null,
      organizationId: updatedVertical.organization_id,
      isActive: updatedVertical.is_active,
      createdAt: updatedVertical.created_at,
      updatedAt: updatedVertical.updated_at,
      createdBy: updatedVertical.created_by,
      updatedBy: updatedVertical.updated_by,
      deletedAt: updatedVertical.deleted_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateVertical')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteVertical(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('verticals')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/hr/verticals')
  revalidatePath('/admin/verticals')
  revalidatePath(`/admin/verticals/${id}`)
}

// ============================================================================
// ROLES
// ============================================================================

export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedAt: row.deleted_at,
  }))
}

export async function getRoleById(id: string): Promise<Role | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    deletedAt: data.deleted_at,
  }
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const supabase = await createClient()

  try {
    const normalizedDescription = normalizeOptional(input.description)

    if (!input.name) {
      throw new Error('Role name is required')
    }

    const { data: newRole, error } = await supabase
      .from('roles')
      .insert({
        name: input.name,
        description: normalizedDescription,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/hr/roles')

    return {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      isActive: newRole.is_active,
      createdAt: newRole.created_at,
      updatedAt: newRole.updated_at,
      createdBy: newRole.created_by,
      updatedBy: newRole.updated_by,
      deletedAt: newRole.deleted_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createRole')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateRole(input: UpdateRoleInput): Promise<Role> {
  const supabase = await createClient()

  try {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) update.name = input.name
    if (input.description !== undefined) update.description = normalizeOptional(input.description)
    if (input.isActive !== undefined) update.is_active = input.isActive

    const { data: updatedRole, error } = await supabase
      .from('roles')
      .update(update)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/hr/roles')
    revalidatePath(`/hr/roles/${input.id}`)

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      isActive: updatedRole.is_active,
      createdAt: updatedRole.created_at,
      updatedAt: updatedRole.updated_at,
      createdBy: updatedRole.created_by,
      updatedBy: updatedRole.updated_by,
      deletedAt: updatedRole.deleted_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateRole')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteRole(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('roles')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/hr/roles')
}

// ============================================================================
// TEAMS
// ============================================================================

export async function getTeams(verticalId?: string | null, departmentId?: string | null): Promise<Team[]> {
  const supabase = await createClient()

  let query = supabase
    .from('teams')
    .select(`
      *,
      department:departments(id, name, code),
      vertical:verticals(id, name, code)
    `)
    .is('deleted_at', null)
    .eq('is_active', true)

  if (verticalId) {
    query = query.eq('vertical_id', verticalId)
  } else if (verticalId === null) {
    query = query.is('vertical_id', null)
  }

  if (departmentId) {
    query = query.eq('department_id', departmentId)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    departmentId: row.department_id,
    verticalId: row.vertical_id,
    name: row.name,
    code: row.code,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedAt: row.deleted_at,
    department: row.department
      ? {
          id: row.department.id,
          name: row.department.name,
          code: row.department.code,
        }
      : undefined,
    vertical: row.vertical
      ? {
          id: row.vertical.id,
          name: row.vertical.name,
          code: row.vertical.code,
        }
      : null,
  }))
}

export async function getTeamById(id: string): Promise<Team | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      department:departments(id, name, code),
      vertical:verticals(id, name, code)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    departmentId: data.department_id,
    verticalId: data.vertical_id,
    name: data.name,
    code: data.code,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    deletedAt: data.deleted_at,
    department: data.department
      ? {
          id: data.department.id,
          name: data.department.name,
          code: data.department.code,
        }
      : undefined,
    vertical: data.vertical
      ? {
          id: data.vertical.id,
          name: data.vertical.name,
          code: data.vertical.code,
        }
      : null,
  }
}

// ============================================================================
// POSITIONS
// ============================================================================

export async function getPositions(employeeId: string): Promise<Position[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('positions')
    .select(`
      *,
      team:teams(
        *,
        department:departments(id, name, code),
        vertical:verticals(id, name, code)
      ),
      role:roles(*)
    `)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('is_primary', { ascending: false })
    .order('start_date', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    employeeId: row.employee_id,
    teamId: row.team_id,
    roleId: row.role_id,
    title: row.title,
    isPrimary: row.is_primary,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    deletedAt: row.deleted_at,
    team: row.team
      ? {
          id: row.team.id,
          departmentId: row.team.department_id,
          verticalId: row.team.vertical_id,
          name: row.team.name,
          code: row.team.code,
          isActive: row.team.is_active,
          createdAt: row.team.created_at,
          updatedAt: row.team.updated_at,
          createdBy: row.team.created_by,
          updatedBy: row.team.updated_by,
          deletedAt: row.team.deleted_at,
          department: row.team.department
            ? {
                id: row.team.department.id,
                name: row.team.department.name,
                code: row.team.department.code,
              }
            : undefined,
          vertical: row.team.vertical
            ? {
                id: row.team.vertical.id,
                name: row.team.vertical.name,
                code: row.team.vertical.code,
              }
            : null,
        }
      : undefined,
    role: row.role
      ? {
          id: row.role.id,
          name: row.role.name,
          description: row.role.description,
          isActive: row.role.is_active,
          createdAt: row.role.created_at,
          updatedAt: row.role.updated_at,
          createdBy: row.role.created_by,
          updatedBy: row.role.updated_by,
          deletedAt: row.role.deleted_at,
        }
      : undefined,
  }))
}

export async function createPosition(input: CreatePositionInput): Promise<Position> {
  const supabase = await createClient()

  try {
    const normalizedTitle = normalizeOptional(input.title)
    const normalizedStartDate = normalizeOptional(input.startDate)
    const normalizedEndDate = normalizeOptional(input.endDate)

    if (!input.employeeId || !input.teamId || !input.roleId) {
      throw new Error('Employee ID, Team ID, and Role ID are required')
    }

    // If this is marked as primary, unset other primary positions for this employee
    if (input.isPrimary) {
      await supabase
        .from('positions')
        .update({ is_primary: false })
        .eq('employee_id', input.employeeId)
        .is('deleted_at', null)
    }

    const { data: newPosition, error } = await supabase
      .from('positions')
      .insert({
        employee_id: input.employeeId,
        team_id: input.teamId,
        role_id: input.roleId,
        title: normalizedTitle,
        is_primary: input.isPrimary ?? false,
        start_date: normalizedStartDate,
        end_date: normalizedEndDate,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Update profile's primary_position_id if this is primary
    if (input.isPrimary) {
      const { data: employee } = await supabase
        .from('employees')
        .select('profile_id')
        .eq('id', input.employeeId)
        .single()

      if (employee) {
        await supabase
          .from('profiles')
          .update({ primary_position_id: newPosition.id })
          .eq('id', employee.profile_id)
      }
    }

    revalidatePath('/hr/employees')
    revalidatePath(`/hr/employees/${input.employeeId}`)

    // Fetch complete position with relations
    const result = await getPositionById(newPosition.id)
    if (!result) throw new Error('Failed to create position')
    return result
  } catch (error) {
    logDatabaseError(error, 'createPosition')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function getPositionById(id: string): Promise<Position | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('positions')
    .select(`
      *,
      team:teams(
        *,
        department:departments(id, name, code),
        vertical:verticals(id, name, code)
      ),
      role:roles(*),
      employee:employees(id, employee_id, profile:profiles(id, full_name, email))
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    employeeId: data.employee_id,
    teamId: data.team_id,
    roleId: data.role_id,
    title: data.title,
    isPrimary: data.is_primary,
    startDate: data.start_date,
    endDate: data.end_date,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    deletedAt: data.deleted_at,
    team: data.team
      ? {
          id: data.team.id,
          departmentId: data.team.department_id,
          verticalId: data.team.vertical_id,
          name: data.team.name,
          code: data.team.code,
          isActive: data.team.is_active,
          createdAt: data.team.created_at,
          updatedAt: data.team.updated_at,
          createdBy: data.team.created_by,
          updatedBy: data.team.updated_by,
          deletedAt: data.team.deleted_at,
          department: data.team.department
            ? {
                id: data.team.department.id,
                name: data.team.department.name,
                code: data.team.department.code,
              }
            : undefined,
          vertical: data.team.vertical
            ? {
                id: data.team.vertical.id,
                name: data.team.vertical.name,
                code: data.team.vertical.code,
              }
            : null,
        }
      : undefined,
    role: data.role
      ? {
          id: data.role.id,
          name: data.role.name,
          description: data.role.description,
          isActive: data.role.is_active,
          createdAt: data.role.created_at,
          updatedAt: data.role.updated_at,
          createdBy: data.role.created_by,
          updatedBy: data.role.updated_by,
          deletedAt: data.role.deleted_at,
        }
      : undefined,
    employee: data.employee
      ? {
          id: data.employee.id,
          employeeId: data.employee.employee_id,
          fullName: data.employee.profile?.full_name ?? '',
          email: data.employee.profile?.email ?? '',
        }
      : undefined,
  }
}

export async function updatePosition(input: UpdatePositionInput): Promise<Position> {
  const supabase = await createClient()

  try {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.teamId !== undefined) update.team_id = input.teamId
    if (input.roleId !== undefined) update.role_id = input.roleId
    if (input.title !== undefined) update.title = normalizeOptional(input.title)
    if (input.isPrimary !== undefined) update.is_primary = input.isPrimary
    if (input.startDate !== undefined) update.start_date = normalizeOptional(input.startDate)
    if (input.endDate !== undefined) update.end_date = normalizeOptional(input.endDate)
    if (input.isActive !== undefined) update.is_active = input.isActive

    // If setting as primary, unset other primary positions
    if (input.isPrimary === true) {
      const { data: position } = await supabase
        .from('positions')
        .select('employee_id')
        .eq('id', input.id)
        .single()

      if (position) {
        await supabase
          .from('positions')
          .update({ is_primary: false })
          .eq('employee_id', position.employee_id)
          .neq('id', input.id)
          .is('deleted_at', null)
      }
    }

    const { data: updatedPosition, error } = await supabase
      .from('positions')
      .update(update)
      .eq('id', input.id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Update profile's primary_position_id if this is primary
    if (input.isPrimary === true) {
      const { data: position } = await supabase
        .from('positions')
        .select('employee_id')
        .eq('id', input.id)
        .single()

      if (position) {
        const { data: employee } = await supabase
          .from('employees')
          .select('profile_id')
          .eq('id', position.employee_id)
          .single()

        if (employee) {
          await supabase
            .from('profiles')
            .update({ primary_position_id: input.id })
            .eq('id', employee.profile_id)
        }
      }
    }

    revalidatePath('/hr/employees')
    revalidatePath(`/hr/employees/${updatedPosition.employee_id}`)

    const result = await getPositionById(input.id)
    if (!result) throw new Error('Position not found')
    return result
  } catch (error) {
    logDatabaseError(error, 'updatePosition')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deletePosition(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('positions')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/hr/employees')
}


