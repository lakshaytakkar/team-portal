'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'

/**
 * Sign in with email and password
 * Returns success status and redirect URL instead of redirecting directly to avoid NEXT_REDIRECT errors
 */
export async function signIn(
  email: string, 
  password: string, 
  redirectTo?: string
): Promise<{ success: true; redirectTo: string }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logDatabaseError(error, 'signIn')
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Sign in failed')
    }

    // Check if profile exists and get role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      // Create profile if it doesn't exist
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          role: 'executive',
          is_active: true,
        })
    }

    // Revalidate paths to ensure fresh data
    revalidatePath('/', 'layout')
    
    // Determine redirect URL based on user role
    let defaultRedirect = '/projects'
    if (profile?.role === 'superadmin') {
      defaultRedirect = '/explore'
    }
    
    // Return success with redirect URL instead of using redirect() to avoid NEXT_REDIRECT error
    return { success: true, redirectTo: redirectTo && redirectTo !== '/' ? redirectTo : defaultRedirect }
  } catch (error: any) {
    // Only log and handle actual errors
    logDatabaseError(error, 'signIn')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, firstName?: string, lastName?: string) {
  const supabase = await createClient()

  try {
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email.split('@')[0]

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      logDatabaseError(error, 'signUp')
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Sign up failed')
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email || email,
        full_name: fullName,
        role: 'executive', // Default role
        is_active: true,
      })

    if (profileError) {
      logDatabaseError(profileError, 'signUp - createProfile')
      // Don't throw - auth user is created, profile can be fixed later
    }

    revalidatePath('/', 'layout')
    
    // If email confirmation is required, redirect to a confirmation page
    // For now, redirect to sign in (user needs to confirm email first)
    redirect('/sign-in?message=Please check your email to confirm your account')
  } catch (error: any) {
    // Next.js redirect() throws a special error that should be re-thrown
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    logDatabaseError(error, 'signUp')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      logDatabaseError(error, 'signOut')
      throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/sign-in')
  } catch (error: any) {
    // Next.js redirect() throws a special error that should be re-thrown
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    logDatabaseError(error, 'signOut')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user.id
  } catch (error) {
    logDatabaseError(error, 'getCurrentUserId')
    return null
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        department_id,
        avatar_url,
        department:departments(code, name)
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    const dept = Array.isArray(profile.department) ? profile.department[0] : profile.department
    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name || profile.email.split('@')[0],
      role: profile.role as 'executive' | 'manager' | 'superadmin',
      department: dept?.code,
      departmentName: dept?.name,
      avatar: profile.avatar_url || null,
    }
  } catch (error) {
    logDatabaseError(error, 'getCurrentUserProfile')
    return null
  }
}

