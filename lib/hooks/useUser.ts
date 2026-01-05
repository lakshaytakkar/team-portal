/**
 * Hook to access current user information
 * Connected to Supabase authentication
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  role: 'executive' | 'manager' | 'superadmin'
  department?: string
  departmentId?: string
  departmentName?: string
  email?: string
  name?: string
  avatar?: string | null
}

/**
 * Hook to get current user
 */
export function useUser(): { user: UserProfile | null; isLoading: boolean } {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user with timeout
    const getUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          setUser(null)
          setIsLoading(false)
          return
        }

        // Get profile
        const { data: profile, error } = await supabase
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
          .eq('id', authUser.id)
          .single()

        if (error || !profile) {
          console.error('Error fetching profile:', error)
          setUser(null)
          setIsLoading(false)
          return
        }

        const dept = Array.isArray(profile.department) ? profile.department[0] : profile.department
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.email.split('@')[0],
          role: profile.role as 'executive' | 'manager' | 'superadmin',
          department: dept?.code,
          departmentId: profile.department_id || undefined,
          departmentName: dept?.name,
          avatar: profile.avatar_url || null,
        })
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // User signed in
        const { data: profile, error } = await supabase
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
          .eq('id', session.user.id)
          .single()

        if (!error && profile) {
          const dept = Array.isArray(profile.department) ? profile.department[0] : profile.department
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.full_name || profile.email.split('@')[0],
            role: profile.role as 'executive' | 'manager' | 'superadmin',
            department: dept?.code,
            departmentId: profile.department_id || undefined,
            departmentName: dept?.name,
            avatar: profile.avatar_url || null,
          })
        } else {
          setUser(null)
        }
      } else {
        // User signed out
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}
