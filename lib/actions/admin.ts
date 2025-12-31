'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { permissionDefinitions, defaultRolePermissions } from '@/lib/data/permissions'
import type { RolePermissions } from '@/lib/types/permissions'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { requireSuperadmin } from '@/lib/utils/user-context'
import type { AdminUser, UserRole, UserStatus } from '@/lib/types/admin'
import { resolveDepartmentId, resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getAvatarForUser } from '@/lib/utils/avatars'

/**
 * Get user permissions (combines role permissions + user-specific overrides)
 */
export async function getUserPermissions(userId: string): Promise<RolePermissions> {
  const supabase = await createClient()

  try {
    // Get user profile to determine role
    const { data: user, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    // If user doesn't exist, return empty permissions
    if (error || !user) {
      const allPermissionKeys = permissionDefinitions.flatMap((group) =>
        group.permissions.map((perm) => perm.key)
      )
      return allPermissionKeys.reduce((acc, key) => {
        acc[key] = false
        return acc
      }, {} as RolePermissions)
    }

    const userRole = user.role

    // Start with default role permissions
    const rolePerms = defaultRolePermissions[userRole] || {}
    const userPerms: RolePermissions = { ...rolePerms }

    // Get all permission keys from definitions
    const allPermissionKeys = permissionDefinitions.flatMap((group) =>
      group.permissions.map((perm) => perm.key)
    )

    // Initialize all permissions to false if not in role permissions
    allPermissionKeys.forEach((key) => {
      if (!(key in userPerms)) {
        userPerms[key] = false
      }
    })

    // Get user-specific permission overrides from database
    const { data: userPermRecords } = await supabase
      .from('user_permissions')
      .select(`
        granted,
        permission:permissions(name)
      `)
      .eq('user_id', userId)

    // Apply user-specific overrides
    if (userPermRecords) {
      userPermRecords.forEach((record) => {
        const permission = record.permission as unknown as { name: string } | null
        if (permission?.name) {
          userPerms[permission.name] = record.granted
        }
      })
    }

    return userPerms
  } catch (error) {
    logDatabaseError(error, 'getUserPermissions')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Update user permissions
 */
export async function updateUserPermissions(
  userId: string,
  permissions: Record<string, boolean>
): Promise<void> {
  const supabase = await createClient()

  try {
    // Check if user exists
    const { data: user } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (!user) {
      return // User doesn't exist, skip update
    }

    // Get all permission definitions from database
    const { data: allPerms } = await supabase
      .from('permissions')
      .select('id, name')

    if (!allPerms) return

    const permMap = new Map(allPerms.map((p) => [p.name, p.id]))

    // Get existing user permissions
    const { data: existingUserPerms } = await supabase
      .from('user_permissions')
      .select('permission_id, granted')
      .eq('user_id', userId)

    const existingPermMap = new Map(
      (existingUserPerms || []).map((up) => [up.permission_id, up])
    )

    // Process each permission
    for (const [permName, granted] of Object.entries(permissions)) {
      const permId = permMap.get(permName)
      if (!permId) continue

      const existing = existingPermMap.get(permId)

      if (existing) {
        // Update existing permission
        if (existing.granted !== granted) {
          await supabase
            .from('user_permissions')
            .update({ granted })
            .eq('user_id', userId)
            .eq('permission_id', permId)
        }
      } else {
        // Insert new permission override if it differs from role default
        const roleDefault = defaultRolePermissions[user.role]?.[permName] ?? false

        if (granted !== roleDefault) {
          await supabase
            .from('user_permissions')
            .insert({
              user_id: userId,
              permission_id: permId,
              granted,
            })
        }
      }
    }

    // Remove permissions that are no longer in the update
    const updatedPermIds = new Set(
      Object.keys(permissions)
        .map((name) => permMap.get(name))
        .filter((id): id is string => id !== undefined)
    )

    const toDelete = (existingUserPerms || []).filter(
      (up) => !updatedPermIds.has(up.permission_id)
    )

    if (toDelete.length > 0) {
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .in('permission_id', toDelete.map((up) => up.permission_id))
    }

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'updateUserPermissions')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Ensure all permissions exist in the database
 */
export async function ensurePermissionsExist(): Promise<void> {
  const supabase = await createClient()

  try {
    const allPerms = permissionDefinitions.flatMap((group) => group.permissions)

    for (const perm of allPerms) {
      const [resource, action] = perm.key.split('.')
      if (!resource || !action) continue

      // Check if permission exists
      const { data: existing } = await supabase
        .from('permissions')
        .select('id, description')
        .eq('name', perm.key)
        .single()

      if (!existing) {
        // Create permission
        await supabase
          .from('permissions')
          .insert({
            name: perm.key,
            resource,
            action,
            description: perm.description || null,
          })
      } else {
        // Update description if changed
        if (existing.description !== perm.description) {
          await supabase
            .from('permissions')
            .update({ description: perm.description || null })
            .eq('id', existing.id)
        }
      }
    }
  } catch (error) {
    logDatabaseError(error, 'ensurePermissionsExist')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create a service role client for admin operations
 * This bypasses RLS and allows admin operations
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

/**
 * Get all users for admin management
 */
export async function getUsers(): Promise<AdminUser[]> {
  await requireSuperadmin()
  const supabase = await createClient()
  const adminClient = createAdminClient()

  try {
    // Get all auth users
    const { data: authUsersData, error: authError } = await adminClient.auth.admin.listUsers()

    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`)
    }

    if (!authUsersData?.users || authUsersData.users.length === 0) {
      return []
    }

    const authUsers = authUsersData.users

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        phone,
        department_id,
        is_active,
        created_at,
        updated_at,
        avatar_url,
        department:departments(name)
      `)

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
    }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // Combine auth users with profiles
    const adminUsers: AdminUser[] = authUsers.map(authUser => {
      const profile = profileMap.get(authUser.id)
      
      // Determine status based on auth user and profile
      let status: UserStatus = 'active'
      if ((authUser as any).banned_until) {
        status = 'suspended'
      } else if (!profile?.is_active) {
        status = 'inactive'
      }

      return {
        id: authUser.id,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown',
        email: authUser.email || profile?.email || '',
        role: (profile?.role || 'executive') as UserRole,
        status,
        department: (profile?.department as any)?.name || profile?.department_id || undefined,
        phoneNumber: profile?.phone || undefined,
        username: authUser.email?.split('@')[0] || undefined,
        avatarUrl: profile?.avatar_url || getAvatarForUser(profile?.full_name || authUser.email || 'U'),
        createdAt: new Date(authUser.created_at || profile?.created_at || Date.now()),
        updatedAt: new Date(authUser.updated_at || profile?.updated_at || Date.now()),
      }
    })

    return adminUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    logDatabaseError(error, 'getUsers')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create a new user
 */
export async function createUser(input: {
  email: string
  password: string
  fullName: string
  role: UserRole
  departmentId?: string | null
  phone?: string | null
  managerId?: string | null
}): Promise<AdminUser> {
  await requireSuperadmin()
  const adminClient = createAdminClient()
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!input.email || !input.password || !input.fullName || !input.role) {
      throw new Error('Email, password, full name, and role are required')
    }

    // Resolve foreign keys
    const departmentId = await resolveDepartmentId(input.departmentId, false)
    const managerId = await resolveProfileId(input.managerId, false)
    const phone = normalizeOptional(input.phone)

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password,
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

    const userId = authData.user.id

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: input.email,
        full_name: input.fullName,
        role: input.role,
        phone,
        department_id: departmentId,
        manager_id: managerId,
        is_active: true,
      })

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(userId).catch(() => {})
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    revalidatePath('/admin/users')

    // Return the created user
    const users = await getUsers()
    const createdUser = users.find(u => u.id === userId)
    if (!createdUser) {
      throw new Error('Failed to retrieve created user')
    }

    return createdUser
  } catch (error) {
    logDatabaseError(error, 'createUser')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Update a user
 */
export async function updateUser(
  userId: string,
  input: {
    email?: string
    fullName?: string
    role?: UserRole
    departmentId?: string | null
    phone?: string | null
    managerId?: string | null
    status?: UserStatus
  }
): Promise<AdminUser> {
  await requireSuperadmin()
  const adminClient = createAdminClient()
  const supabase = await createClient()

  try {
    // Resolve foreign keys
    const departmentId = input.departmentId !== undefined ? await resolveDepartmentId(input.departmentId, false) : undefined
    const managerId = input.managerId !== undefined ? await resolveProfileId(input.managerId, false) : undefined
    const phone = input.phone !== undefined ? normalizeOptional(input.phone) : undefined

    // Update auth user if email changed
    if (input.email) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        email: input.email,
        user_metadata: input.fullName ? { full_name: input.fullName } : undefined,
      })

      if (authError) {
        throw new Error(`Failed to update auth user: ${authError.message}`)
      }
    }

    // Update profile
    const profileUpdate: any = {}
    if (input.email !== undefined) profileUpdate.email = input.email
    if (input.fullName !== undefined) profileUpdate.full_name = input.fullName
    if (input.role !== undefined) profileUpdate.role = input.role
    if (phone !== undefined) profileUpdate.phone = phone
    if (departmentId !== undefined) profileUpdate.department_id = departmentId
    if (managerId !== undefined) profileUpdate.manager_id = managerId
    if (input.status !== undefined) profileUpdate.is_active = input.status === 'active'
    profileUpdate.updated_at = new Date().toISOString()

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    // Handle status changes (suspend/unsuspend)
    if (input.status === 'suspended') {
      await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: '876000h', // ~100 years (effectively permanent until manually unsuspended)
      })
    } else if (input.status === 'active') {
      await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: '0s', // Remove ban
      })
    }

    revalidatePath('/admin/users')

    // Return the updated user
    const users = await getUsers()
    const updatedUser = users.find(u => u.id === userId)
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user')
    }

    return updatedUser
  } catch (error) {
    logDatabaseError(error, 'updateUser')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  await requireSuperadmin()
  const adminClient = createAdminClient()

  try {
    // Delete auth user (this will cascade delete profile due to foreign key)
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'deleteUser')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Suspend a user
 */
export async function suspendUser(userId: string): Promise<void> {
  await requireSuperadmin()
  const adminClient = createAdminClient()
  const supabase = await createClient()

  try {
    // Ban user in auth
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: '876000h', // ~100 years (effectively permanent)
    })

    if (authError) {
      throw new Error(`Failed to suspend user: ${authError.message}`)
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId)

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'suspendUser')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Activate a user
 */
export async function activateUser(userId: string): Promise<void> {
  await requireSuperadmin()
  const adminClient = createAdminClient()
  const supabase = await createClient()

  try {
    // Unban user in auth
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: '0s', // Remove ban
    })

    if (authError) {
      throw new Error(`Failed to activate user: ${authError.message}`)
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', userId)

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'activateUser')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsers(userIds: string[]): Promise<void> {
  await requireSuperadmin()
  const adminClient = createAdminClient()

  try {
    // Delete all users
    await Promise.all(userIds.map(userId => adminClient.auth.admin.deleteUser(userId)))

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'bulkDeleteUsers')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk suspend users
 */
export async function bulkSuspendUsers(userIds: string[]): Promise<void> {
  await requireSuperadmin()
  const adminClient = createAdminClient()
  const supabase = await createClient()

  try {
    // Suspend all users
    await Promise.all([
      ...userIds.map(userId =>
        adminClient.auth.admin.updateUserById(userId, {
          ban_duration: '876000h',
        })
      ),
      ...userIds.map(userId =>
        supabase
          .from('profiles')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', userId)
      ),
    ])

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'bulkSuspendUsers')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Bulk activate users
 */
export async function bulkActivateUsers(userIds: string[]): Promise<void> {
  await requireSuperadmin()
  const adminClient = createAdminClient()
  const supabase = await createClient()

  try {
    // Activate all users
    await Promise.all([
      ...userIds.map(userId =>
        adminClient.auth.admin.updateUserById(userId, {
          ban_duration: '0s',
        })
      ),
      ...userIds.map(userId =>
        supabase
          .from('profiles')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', userId)
      ),
    ])

    revalidatePath('/admin/users')
  } catch (error) {
    logDatabaseError(error, 'bulkActivateUsers')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}
