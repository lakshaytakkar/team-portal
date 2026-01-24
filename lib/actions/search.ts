'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperadmin } from '@/lib/utils/user-context'
import { logDatabaseError, getUserFriendlyErrorMessage } from '@/lib/utils/errors'

// ============================================================================
// TYPES
// ============================================================================

export interface SearchEmployeeResult {
  id: string
  name: string
  email: string
  avatar?: string | null
  employeeId?: string
  department?: string
}

export interface SearchTaskResult {
  id: string
  name: string
  description?: string
  status: string
  priority: string
}

export interface SearchProjectResult {
  id: string
  name: string
  description?: string
  status: string
}

export interface SearchDealResult {
  id: string
  name: string
  company: string
  contactName?: string
  stage: string
  value: number
}

export interface SearchCallResult {
  id: string
  contactName: string
  company?: string
  notes?: string
  date: string
  status: string
}

export interface SearchCandidateResult {
  id: string
  fullName: string
  email: string
  status: string
  skills?: string
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Search employees (superadmin only)
 * Returns matching employees with their profile information
 */
export async function searchEmployees(query: string): Promise<SearchEmployeeResult[]> {
  const supabase = await createClient()
  
  try {
    // Enforce superadmin access (includes CEO)
    await requireSuperadmin()
    
    if (!query || query.trim().length < 2) {
      return []
    }
    
    const searchTerm = `%${query.trim()}%`
    
    // First, search profiles table for matching profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        department:departments(name)
      `)
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(20) // Get more profiles, then filter by employees
    
    if (profilesError) {
      logDatabaseError(profilesError, 'searchEmployees')
      throw new Error(getUserFriendlyErrorMessage(profilesError))
    }
    
    if (!profiles || profiles.length === 0) return []
    
    // Get profile IDs
    const profileIds = profiles.map(p => p.id)
    
    // Then get employees for these profiles
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        employee_id,
        profile_id
      `)
      .in('profile_id', profileIds)
      .is('deleted_at', null)
      .limit(10)
      .order('employee_id', { ascending: true })
    
    if (employeesError) {
      logDatabaseError(employeesError, 'searchEmployees')
      throw new Error(getUserFriendlyErrorMessage(employeesError))
    }
    
    if (!employees || employees.length === 0) return []
    
    // Create a map of profile_id to profile data
    const profileMap = new Map(profiles.map(p => [p.id, p]))
    
    // Combine employees with their profiles
    return employees
      .map((emp: any) => {
        const profile = profileMap.get(emp.profile_id)
        if (!profile) return null
        const dept = Array.isArray(profile.department) ? profile.department[0] : profile.department

        return {
          id: emp.id,
          name: profile.full_name || 'Unknown',
          email: profile.email || '',
          avatar: profile.avatar_url || null,
          employeeId: emp.employee_id || undefined,
          department: dept?.name || undefined,
        }
      })
      .filter(Boolean) as SearchEmployeeResult[]
  } catch (error) {
    logDatabaseError(error, 'searchEmployees')
    // If it's a permission error, throw it as-is
    if (error instanceof Error && error.message.includes('Superadmin')) {
      throw error
    }
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Search tasks (superadmin only)
 * Returns matching tasks
 */
export async function searchTasks(query: string): Promise<SearchTaskResult[]> {
  const supabase = await createClient()
  
  try {
    // Enforce superadmin access (includes CEO)
    await requireSuperadmin()
    
    if (!query || query.trim().length < 2) {
      return []
    }
    
    const searchTerm = `%${query.trim()}%`
    
    // Search in tasks table
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, name, description, status, priority')
      .is('deleted_at', null)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10)
      .order('updated_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'searchTasks')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!tasks) return []
    
    return tasks.map((task: any) => ({
      id: task.id,
      name: task.name,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
    }))
  } catch (error) {
    logDatabaseError(error, 'searchTasks')
    // If it's a permission error, throw it as-is
    if (error instanceof Error && error.message.includes('Superadmin')) {
      throw error
    }
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Search projects (superadmin only)
 * Returns matching projects
 */
export async function searchProjects(query: string): Promise<SearchProjectResult[]> {
  const supabase = await createClient()
  
  try {
    await requireSuperadmin()
    
    if (!query || query.trim().length < 2) {
      return []
    }
    
    const searchTerm = `%${query.trim()}%`
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, status')
      .is('deleted_at', null)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10)
      .order('updated_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'searchProjects')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!projects) return []
    
    return projects.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      status: project.status,
    }))
  } catch (error) {
    logDatabaseError(error, 'searchProjects')
    if (error instanceof Error && error.message.includes('Superadmin')) {
      throw error
    }
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Search deals (superadmin only)
 * Returns matching deals
 */
export async function searchDeals(query: string): Promise<SearchDealResult[]> {
  const supabase = await createClient()
  
  try {
    await requireSuperadmin()
    
    if (!query || query.trim().length < 2) {
      return []
    }
    
    const searchTerm = `%${query.trim()}%`
    
    // Search deals with joined leads table
    const { data: deals, error } = await supabase
      .from('deals')
      .select(`
        id,
        name,
        stage,
        value,
        lead:leads!lead_id(
          company,
          contact_name
        )
      `)
      .is('deleted_at', null)
      .or(`name.ilike.${searchTerm}`)
      .limit(20) // Get more to filter by lead info
    
    if (error) {
      logDatabaseError(error, 'searchDeals')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!deals) return []
    
    // Also search leads and get their deals
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        company,
        contact_name,
        deals:deals!lead_id(
          id,
          name,
          stage,
          value
        )
      `)
      .is('deleted_at', null)
      .or(`company.ilike.${searchTerm},contact_name.ilike.${searchTerm}`)
      .limit(20)
    
    if (leadsError) {
      logDatabaseError(leadsError, 'searchDeals')
      // Don't throw, just continue with deals-only results
    }
    
    // Combine results
    const dealMap = new Map<string, SearchDealResult>()
    
    // Add deals from direct search
    deals.forEach((deal: any) => {
      if (deal.id && !dealMap.has(deal.id)) {
        dealMap.set(deal.id, {
          id: deal.id,
          name: deal.name,
          company: deal.lead?.company || '',
          contactName: deal.lead?.contact_name || undefined,
          stage: deal.stage,
          value: Number(deal.value) || 0,
        })
      }
    })
    
    // Add deals from leads search
    if (leads) {
      leads.forEach((lead: any) => {
        if (lead.deals && Array.isArray(lead.deals)) {
          lead.deals.forEach((deal: any) => {
            if (deal.id && !dealMap.has(deal.id) && !deal.deleted_at) {
              dealMap.set(deal.id, {
                id: deal.id,
                name: deal.name,
                company: lead.company || '',
                contactName: lead.contact_name || undefined,
                stage: deal.stage,
                value: Number(deal.value) || 0,
              })
            }
          })
        }
      })
    }
    
    return Array.from(dealMap.values()).slice(0, 10)
  } catch (error) {
    logDatabaseError(error, 'searchDeals')
    if (error instanceof Error && error.message.includes('Superadmin')) {
      throw error
    }
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Search calls (superadmin only)
 * Returns matching calls
 */
export async function searchCalls(query: string): Promise<SearchCallResult[]> {
  const supabase = await createClient()
  
  try {
    await requireSuperadmin()
    
    if (!query || query.trim().length < 2) {
      return []
    }
    
    const searchTerm = `%${query.trim()}%`
    
    const { data: calls, error } = await supabase
      .from('calls')
      .select('id, contact_name, company, notes, date, status')
      .is('deleted_at', null)
      .or(`contact_name.ilike.${searchTerm},company.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      .limit(10)
      .order('date', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'searchCalls')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!calls) return []
    
    return calls.map((call: any) => ({
      id: call.id,
      contactName: call.contact_name || '',
      company: call.company || undefined,
      notes: call.notes || undefined,
      date: call.date,
      status: call.status,
    }))
  } catch (error) {
    logDatabaseError(error, 'searchCalls')
    if (error instanceof Error && error.message.includes('Superadmin')) {
      throw error
    }
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Search candidates (superadmin only)
 * Returns matching candidates
 */
export async function searchCandidates(query: string): Promise<SearchCandidateResult[]> {
  const supabase = await createClient()
  
  try {
    await requireSuperadmin()
    
    if (!query || query.trim().length < 2) {
      return []
    }
    
    const searchTerm = `%${query.trim()}%`
    
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('id, full_name, email, status, skills')
      .is('deleted_at', null)
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},skills.ilike.${searchTerm},experience.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      .limit(10)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'searchCandidates')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!candidates) return []
    
    return candidates.map((candidate: any) => ({
      id: candidate.id,
      fullName: candidate.full_name || '',
      email: candidate.email || '',
      status: candidate.status,
      skills: candidate.skills || undefined,
    }))
  } catch (error) {
    logDatabaseError(error, 'searchCandidates')
    if (error instanceof Error && error.message.includes('Superadmin')) {
      throw error
    }
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}
