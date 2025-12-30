/**
 * Server-side user context utilities
 * Loads authenticated user + profile and normalizes to v1 UserContext
 */

import { createClient } from '@/lib/supabase/server'
import type { UserContext } from '@/lib/types/user-context'

/**
 * Get current user context from Supabase auth + profiles table
 * Returns null if user is not authenticated
 * 
 * For v1: Maps CEO role to superadmin, everything else to employee
 */
export async function getCurrentUserContext(): Promise<UserContext | null> {
  const supabase = await createClient()

  try {
    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return null
    }

    // Get profile with role, name, and avatar
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, department_id')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      // If profile doesn't exist, still return basic context with employee role
      return {
        userId: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || 'User',
        avatar: null,
        role: 'employee',
        isSuperadmin: false,
      }
    }

    // Normalize role: CEO and superadmin -> superadmin, everything else -> employee
    const dbRole = (profile.role || '').toLowerCase()
    const isSuperadmin = dbRole === 'superadmin' || dbRole === 'ceo'
    const normalizedRole: UserContext['role'] = isSuperadmin ? 'superadmin' : 'employee'

    return {
      userId: profile.id,
      email: profile.email || authUser.email || '',
      name: profile.full_name || profile.email?.split('@')[0] || 'User',
      avatar: profile.avatar_url || null,
      role: normalizedRole,
      isSuperadmin,
      departmentId: profile.department_id || null,
    }
  } catch (error) {
    console.error('Error loading user context:', error)
    return null
  }
}

/**
 * Require authenticated user context
 * Throws error if user is not authenticated
 */
export async function requireUserContext(): Promise<UserContext> {
  const context = await getCurrentUserContext()
  if (!context) {
    throw new Error('Unauthorized: User not authenticated')
  }
  return context
}

/**
 * Require superadmin role
 * Throws error if user is not superadmin
 */
export async function requireSuperadmin(): Promise<UserContext> {
  const context = await requireUserContext()
  if (!context.isSuperadmin) {
    throw new Error('Forbidden: Superadmin access required')
  }
  return context
}

