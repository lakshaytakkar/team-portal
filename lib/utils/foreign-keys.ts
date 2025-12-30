/**
 * Foreign Key Resolution Utilities
 *
 * Provides helper functions to resolve user-friendly identifiers (names, codes, emails)
 * to UUIDs required for database foreign key relationships.
 *
 * This prevents errors from passing string values directly to foreign key fields.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validates if a string is a valid UUID format
 */
export function isValidUUID(value: string | null | undefined): boolean {
  if (!value) return false
  return UUID_REGEX.test(value)
}

/**
 * Normalizes empty strings to undefined for optional fields
 */
export function normalizeOptional<T>(value: T | string | null | undefined): T | undefined {
  if (value === null || value === '') return undefined
  return value as T
}

/**
 * Resolves a department identifier to a department UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Department name (case-insensitive)
 * - Department code (case-insensitive)
 *
 * @param identifier - Department UUID, name, or code
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Department UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveDepartmentId(
  identifier: string | null | undefined,
  required: boolean = false
): Promise<string | null> {
  if (!identifier) {
    if (required) {
      throw new Error('Department is required')
    }
    return null
  }

  const supabase = await createClient()

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    // Verify it exists
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .eq('id', identifier)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (!dept) {
      if (required) {
        throw new Error(`Department with ID ${identifier} not found`)
      }
      return null
    }

    return dept.id
  }

  // Lookup by name or code (case-insensitive)
  const { data: byName } = await supabase
    .from('departments')
    .select('id')
    .is('deleted_at', null)
    .ilike('name', identifier)
    .limit(1)
    .single()

  if (byName) {
    return byName.id
  }

  const { data: byCode } = await supabase
    .from('departments')
    .select('id')
    .is('deleted_at', null)
    .ilike('code', identifier)
    .limit(1)
    .single()

  if (byCode) {
    return byCode.id
  }

  // Not found
  if (required) {
    throw new Error(`Department "${identifier}" not found`)
  }
  return null
}

/**
 * Resolves a manager/profile identifier to a profile UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Email address
 * - Full name (fuzzy match - exact match preferred)
 *
 * @param identifier - Profile UUID, email, or name
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Profile UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveProfileId(
  identifier: string | null | undefined,
  required: boolean = false
): Promise<string | null> {
  if (!identifier) {
    if (required) {
      throw new Error('Manager/Profile is required')
    }
    return null
  }

  const supabase = await createClient()

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    // Verify it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', identifier)
      .limit(1)
      .single()

    if (!profile) {
      if (required) {
        throw new Error(`Profile with ID ${identifier} not found`)
      }
      return null
    }

    return profile.id
  }

  // Try email first (exact match, case-insensitive)
  const { data: byEmail } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', identifier)
    .limit(1)
    .single()

  if (byEmail) {
    return byEmail.id
  }

  // Try name (case-insensitive)
  const { data: byName } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', identifier)
    .limit(1)
    .single()

  if (byName) {
    return byName.id
  }

  // Not found
  if (required) {
    throw new Error(`Profile "${identifier}" not found`)
  }
  return null
}

/**
 * Resolves multiple department identifiers to UUIDs
 *
 * @param identifiers - Array of department identifiers
 * @param required - If true, throws error if any not found
 * @returns Array of department UUIDs (nulls filtered out if not required)
 */
export async function resolveDepartmentIds(
  identifiers: (string | null | undefined)[],
  required: boolean = false
): Promise<(string | null)[]> {
  return Promise.all(identifiers.map((id) => resolveDepartmentId(id, required)))
}

/**
 * Resolves multiple profile identifiers to UUIDs
 *
 * @param identifiers - Array of profile identifiers
 * @param required - If true, throws error if any not found
 * @returns Array of profile UUIDs (nulls filtered out if not required)
 */
export async function resolveProfileIds(
  identifiers: (string | null | undefined)[],
  required: boolean = false
): Promise<(string | null)[]> {
  return Promise.all(identifiers.map((id) => resolveProfileId(id, required)))
}

/**
 * Resolves an organization identifier to an organization UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Organization name (case-insensitive)
 * - Organization code (case-insensitive)
 *
 * @param identifier - Organization UUID, name, or code
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Organization UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveOrganizationId(
  identifier: string | null | undefined,
  required: boolean = false
): Promise<string | null> {
  if (!identifier) {
    if (required) {
      throw new Error('Organization is required')
    }
    return null
  }

  const supabase = await createClient()

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    const { data: organization } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', identifier)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (!organization) {
      if (required) {
        throw new Error(`Organization with ID ${identifier} not found`)
      }
      return null
    }

    return organization.id
  }

  // Lookup by name (case-insensitive)
  const { data: byName } = await supabase
    .from('organizations')
    .select('id')
    .is('deleted_at', null)
    .ilike('name', identifier)
    .limit(1)
    .single()

  if (byName) {
    return byName.id
  }

  // Lookup by code (case-insensitive)
  const { data: byCode } = await supabase
    .from('organizations')
    .select('id')
    .is('deleted_at', null)
    .ilike('code', identifier)
    .limit(1)
    .single()

  if (byCode) {
    return byCode.id
  }

  // Not found
  if (required) {
    throw new Error(`Organization "${identifier}" not found`)
  }
  return null
}

/**
 * Resolves a vertical identifier to a vertical UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Vertical name (case-insensitive)
 * - Vertical code (case-insensitive)
 *
 * @param identifier - Vertical UUID, name, or code
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Vertical UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveVerticalId(
  identifier: string | null | undefined,
  required: boolean = false
): Promise<string | null> {
  if (!identifier) {
    if (required) {
      throw new Error('Vertical is required')
    }
    return null
  }

  const supabase = await createClient()

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    const { data: vertical } = await supabase
      .from('verticals')
      .select('id')
      .eq('id', identifier)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (!vertical) {
      if (required) {
        throw new Error(`Vertical with ID ${identifier} not found`)
      }
      return null
    }

    return vertical.id
  }

  // Lookup by name (case-insensitive)
  const { data: byName } = await supabase
    .from('verticals')
    .select('id')
    .is('deleted_at', null)
    .ilike('name', identifier)
    .limit(1)
    .single()

  if (byName) {
    return byName.id
  }

  // Lookup by code (case-insensitive)
  const { data: byCode } = await supabase
    .from('verticals')
    .select('id')
    .is('deleted_at', null)
    .ilike('code', identifier)
    .limit(1)
    .single()

  if (byCode) {
    return byCode.id
  }

  // Not found
  if (required) {
    throw new Error(`Vertical "${identifier}" not found`)
  }
  return null
}

/**
 * Resolves a role identifier to a role UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Role name (case-insensitive)
 *
 * @param identifier - Role UUID or name
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Role UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveRoleId(
  identifier: string | null | undefined,
  required: boolean = false
): Promise<string | null> {
  if (!identifier) {
    if (required) {
      throw new Error('Role is required')
    }
    return null
  }

  const supabase = await createClient()

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('id', identifier)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (!role) {
      if (required) {
        throw new Error(`Role with ID ${identifier} not found`)
      }
      return null
    }

    return role.id
  }

  // Lookup by name (case-insensitive)
  const { data: byName } = await supabase
    .from('roles')
    .select('id')
    .is('deleted_at', null)
    .ilike('name', identifier)
    .limit(1)
    .single()

  if (byName) {
    return byName.id
  }

  // Not found
  if (required) {
    throw new Error(`Role "${identifier}" not found`)
  }
  return null
}

/**
 * Resolves a team identifier to a team UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Team name (case-insensitive)
 * - Team code (case-insensitive)
 * - Department ID + Vertical ID combination
 *
 * @param identifier - Team UUID, name, code, or department+vertical combo
 * @param departmentId - Optional department ID if resolving by combination
 * @param verticalId - Optional vertical ID if resolving by combination (can be null)
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Team UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveTeamId(
  identifier: string | null | undefined,
  departmentId?: string | null,
  verticalId?: string | null,
  required: boolean = false
): Promise<string | null> {
  const supabase = await createClient()

  // If resolving by department+vertical combination
  if (departmentId && identifier === undefined) {
    const query = supabase
      .from('teams')
      .select('id')
      .eq('department_id', departmentId)
      .is('deleted_at', null)

    if (verticalId === null || verticalId === undefined) {
      query.is('vertical_id', null)
    } else {
      query.eq('vertical_id', verticalId)
    }

    const { data: team } = await query.limit(1).single()

    if (team) {
      return team.id
    }

    if (required) {
      throw new Error(`Team not found for department ${departmentId} and vertical ${verticalId ?? 'null'}`)
    }
    return null
  }

  if (!identifier) {
    if (required) {
      throw new Error('Team is required')
    }
    return null
  }

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', identifier)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (!team) {
      if (required) {
        throw new Error(`Team with ID ${identifier} not found`)
      }
      return null
    }

    return team.id
  }

  // Lookup by name (case-insensitive)
  const { data: byName } = await supabase
    .from('teams')
    .select('id')
    .is('deleted_at', null)
    .ilike('name', identifier)
    .limit(1)
    .single()

  if (byName) {
    return byName.id
  }

  // Lookup by code (case-insensitive)
  const { data: byCode } = await supabase
    .from('teams')
    .select('id')
    .is('deleted_at', null)
    .ilike('code', identifier)
    .limit(1)
    .single()

  if (byCode) {
    return byCode.id
  }

  // Not found
  if (required) {
    throw new Error(`Team "${identifier}" not found`)
  }
  return null
}

/**
 * Gets or creates a team from department and vertical combination
 * Auto-generates team name and code if team doesn't exist
 *
 * @param departmentId - Department UUID
 * @param verticalId - Vertical UUID (can be null for vertical-agnostic teams)
 * @returns Team UUID
 */
export async function getOrCreateTeam(
  departmentId: string,
  verticalId: string | null | undefined
): Promise<string> {
  const supabase = await createClient()

  // Try to find existing team
  const query = supabase
    .from('teams')
    .select('id, name')
    .eq('department_id', departmentId)
    .is('deleted_at', null)

  if (verticalId === null || verticalId === undefined) {
    query.is('vertical_id', null)
  } else {
    query.eq('vertical_id', verticalId)
  }

  const { data: existingTeam } = await query.limit(1).single()

  if (existingTeam) {
    return existingTeam.id
  }

  // Team doesn't exist, create it
  // Get department and vertical names for team name generation
  const [deptResult, verticalResult] = await Promise.all([
    supabase.from('departments').select('name').eq('id', departmentId).single(),
    verticalId
      ? supabase.from('verticals').select('name').eq('id', verticalId).single()
      : Promise.resolve({ data: null }),
  ])

  const departmentName = deptResult.data?.name ?? 'Unknown'
  const verticalName = verticalResult.data?.name

  // Generate team name: "Sales – LegalNations" or "Sales" if no vertical
  const teamName = verticalName ? `${departmentName} – ${verticalName}` : departmentName

  // Generate team code: "sales-legalnations" or "sales"
  const teamCode = verticalName
    ? `${departmentName.toLowerCase().replace(/\s+/g, '-')}-${verticalName.toLowerCase().replace(/\s+/g, '-')}`
    : departmentName.toLowerCase().replace(/\s+/g, '-')

  const { data: newTeam, error } = await supabase
    .from('teams')
    .insert({
      department_id: departmentId,
      vertical_id: verticalId || null,
      name: teamName,
      code: teamCode,
      is_active: true,
    })
    .select('id')
    .single()

  if (error || !newTeam) {
    throw new Error(`Failed to create team: ${error?.message ?? 'Unknown error'}`)
  }

  return newTeam.id
}

/**
 * Resolves an employee identifier to an employee UUID
 *
 * Supports:
 * - UUID (if already a valid UUID, returns as-is)
 * - Employee ID (e.g., "EMP001", "E-01")
 * - Email address (via profile lookup)
 * - Full name (via profile lookup, case-insensitive)
 *
 * @param identifier - Employee UUID, employee ID, email, or name
 * @param required - If true, throws error if not found. If false, returns null for optional fields.
 * @returns Employee UUID or null if not found and not required
 * @throws Error if required and not found
 */
export async function resolveEmployeeId(
  identifier: string | null | undefined,
  required: boolean = false
): Promise<string | null> {
  if (!identifier) {
    if (required) {
      throw new Error('Employee is required')
    }
    return null
  }

  const supabase = await createClient()

  // If already a valid UUID, return it
  if (isValidUUID(identifier)) {
    // Verify it exists
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', identifier)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (!employee) {
      if (required) {
        throw new Error(`Employee with ID ${identifier} not found`)
      }
      return null
    }

    return employee.id
  }

  // Try employee_id (exact match)
  const { data: byEmployeeId } = await supabase
    .from('employees')
    .select('id')
    .eq('employee_id', identifier)
    .is('deleted_at', null)
    .limit(1)
    .single()

  if (byEmployeeId) {
    return byEmployeeId.id
  }

  // Try email (via profile)
  const { data: byEmail } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', identifier)
    .limit(1)
    .single()

  if (byEmail) {
    // Find employee with this profile_id
    const { data: employeeByProfile } = await supabase
      .from('employees')
      .select('id')
      .eq('profile_id', byEmail.id)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (employeeByProfile) {
      return employeeByProfile.id
    }
  }

  // Try name (via profile, case-insensitive)
  const { data: byName } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', identifier)
    .limit(1)
    .single()

  if (byName) {
    // Find employee with this profile_id
    const { data: employeeByProfile } = await supabase
      .from('employees')
      .select('id')
      .eq('profile_id', byName.id)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (employeeByProfile) {
      return employeeByProfile.id
    }
  }

  // Not found
  if (required) {
    throw new Error(`Employee "${identifier}" not found`)
  }
  return null
}
