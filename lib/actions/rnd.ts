'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, resolveVerticalId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { ResearchDoc, Mindmap, FinancialPlanning, Suggestion, StrategicPlanning, MarketResearch, DocumentStatus, RNDUser } from '@/lib/types/rnd'
import { getAvatarForUser } from '@/lib/utils/avatars'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateResearchDocInput {
  title: string
  description?: string
  category?: string
  content?: string
  status?: DocumentStatus
  tags?: string[]
  fileUrl?: string
}

export interface UpdateResearchDocInput {
  title?: string
  description?: string
  category?: string
  content?: string
  status?: DocumentStatus
  tags?: string[]
  fileUrl?: string
}

export interface CreateMindmapInput {
  title: string
  description?: string
  data?: Record<string, any>
  status?: DocumentStatus
  fileUrl?: string
}

export interface UpdateMindmapInput {
  title?: string
  description?: string
  data?: Record<string, any>
  status?: DocumentStatus
  fileUrl?: string
}

export interface CreateFinancialPlanningInput {
  title: string
  description?: string
  type?: string
  data?: Record<string, any>
  status?: DocumentStatus
  budget?: number
  verticalId?: string
  fileUrl?: string
}

export interface UpdateFinancialPlanningInput {
  title?: string
  description?: string
  type?: string
  data?: Record<string, any>
  status?: DocumentStatus
  budget?: number
  verticalId?: string
  fileUrl?: string
}

export interface CreateSuggestionInput {
  title: string
  description: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'open' | 'reviewing' | 'approved' | 'rejected'
}

export interface UpdateSuggestionInput {
  title?: string
  description?: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'open' | 'reviewing' | 'approved' | 'rejected'
  votes?: number
}

export interface CreateStrategicPlanningInput {
  title: string
  description?: string
  type?: string
  data?: Record<string, any>
  status?: DocumentStatus
  initiative?: string
  fileUrl?: string
}

export interface UpdateStrategicPlanningInput {
  title?: string
  description?: string
  type?: string
  data?: Record<string, any>
  status?: DocumentStatus
  initiative?: string
  fileUrl?: string
}

export interface CreateMarketResearchInput {
  title: string
  description?: string
  data?: Record<string, any>
  status?: DocumentStatus
  market?: string
  fileUrl?: string
}

export interface UpdateMarketResearchInput {
  title?: string
  description?: string
  data?: Record<string, any>
  status?: DocumentStatus
  market?: string
  fileUrl?: string
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

function toRNDUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): RNDUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// RESEARCH DOCS
// ============================================================================

export async function getResearchDocs(): Promise<ResearchDoc[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('research_docs')
      .select(`
        *,
        created_by_profile:profiles!research_docs_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getResearchDocs')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      category: row.category || '',
      status: row.status as DocumentStatus,
      fileUrl: row.file_url || undefined,
      tags: (row.tags || []) as string[],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toRNDUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getResearchDocs')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getResearchDoc(id: string): Promise<ResearchDoc | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('research_docs')
      .select(`
        *,
        created_by_profile:profiles!research_docs_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getResearchDoc')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      category: data.category || '',
      status: data.status as DocumentStatus,
      fileUrl: data.file_url || undefined,
      tags: (data.tags || []) as string[],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toRNDUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getResearchDoc')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createResearchDoc(input: CreateResearchDocInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const category = normalizeOptional(input.category)
    const content = normalizeOptional(input.content)
    const fileUrl = normalizeOptional(input.fileUrl)
    
    // Validate required fields
    if (!input.title) {
      throw new Error('Title is required')
    }
    
    const { data: newDoc, error } = await supabase
      .from('research_docs')
      .insert({
        title: input.title,
        description,
        category,
        content,
        status: input.status || 'draft',
        tags: input.tags ? JSON.stringify(input.tags) : '[]',
        file_url: fileUrl,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createResearchDoc')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/research-docs')
    return newDoc
  } catch (error) {
    logDatabaseError(error, 'createResearchDoc')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateResearchDoc(id: string, input: UpdateResearchDocInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    const category = input.category !== undefined ? normalizeOptional(input.category) : undefined
    const content = input.content !== undefined ? normalizeOptional(input.content) : undefined
    const fileUrl = input.fileUrl !== undefined ? normalizeOptional(input.fileUrl) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (content !== undefined) updateData.content = content
    if (input.status !== undefined) updateData.status = input.status
    if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags)
    if (fileUrl !== undefined) updateData.file_url = fileUrl
    
    const { data: updatedDoc, error } = await supabase
      .from('research_docs')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateResearchDoc')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/research-docs')
    revalidatePath(`/rnd/research-docs/${id}`)
    return updatedDoc
  } catch (error) {
    logDatabaseError(error, 'updateResearchDoc')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteResearchDoc(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('research_docs')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteResearchDoc')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/research-docs')
  } catch (error) {
    logDatabaseError(error, 'deleteResearchDoc')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// MINDMAPS
// ============================================================================

export async function getMindmaps(): Promise<Mindmap[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('mindmaps')
      .select(`
        *,
        created_by_profile:profiles!mindmaps_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getMindmaps')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      category: '',
      fileUrl: row.file_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toRNDUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getMindmaps')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getMindmap(id: string): Promise<Mindmap | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('mindmaps')
      .select(`
        *,
        created_by_profile:profiles!mindmaps_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getMindmap')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      category: '',
      fileUrl: data.file_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toRNDUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getMindmap')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createMindmap(input: CreateMindmapInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const fileUrl = normalizeOptional(input.fileUrl)
    
    // Validate required fields
    if (!input.title) {
      throw new Error('Title is required')
    }
    
    const { data: newMindmap, error } = await supabase
      .from('mindmaps')
      .insert({
        title: input.title,
        description,
        data: input.data ? JSON.stringify(input.data) : '{}',
        status: input.status || 'draft',
        file_url: fileUrl,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createMindmap')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/mindmaps')
    return newMindmap
  } catch (error) {
    logDatabaseError(error, 'createMindmap')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateMindmap(id: string, input: UpdateMindmapInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    const fileUrl = input.fileUrl !== undefined ? normalizeOptional(input.fileUrl) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (description !== undefined) updateData.description = description
    if (input.data !== undefined) updateData.data = JSON.stringify(input.data)
    if (input.status !== undefined) updateData.status = input.status
    if (fileUrl !== undefined) updateData.file_url = fileUrl
    
    const { data: updatedMindmap, error } = await supabase
      .from('mindmaps')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateMindmap')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/mindmaps')
    revalidatePath(`/rnd/mindmaps/${id}`)
    return updatedMindmap
  } catch (error) {
    logDatabaseError(error, 'updateMindmap')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteMindmap(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('mindmaps')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteMindmap')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/mindmaps')
  } catch (error) {
    logDatabaseError(error, 'deleteMindmap')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// FINANCIAL PLANNING
// ============================================================================

export async function getFinancialPlannings(): Promise<FinancialPlanning[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('financial_planning')
      .select(`
        *,
        created_by_profile:profiles!financial_planning_created_by_fkey(id, full_name, email, avatar_url),
        vertical:verticals!financial_planning_vertical_id_fkey(id, name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getFinancialPlannings')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      vertical: row.vertical?.name || '',
      budget: row.budget ? Number(row.budget) : 0,
      status: row.status as DocumentStatus,
      fileUrl: row.file_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toRNDUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getFinancialPlannings')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getFinancialPlanning(id: string): Promise<FinancialPlanning | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('financial_planning')
      .select(`
        *,
        created_by_profile:profiles!financial_planning_created_by_fkey(id, full_name, email, avatar_url),
        vertical:verticals!financial_planning_vertical_id_fkey(id, name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getFinancialPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      vertical: data.vertical?.name || '',
      budget: data.budget ? Number(data.budget) : 0,
      status: data.status as DocumentStatus,
      fileUrl: data.file_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toRNDUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getFinancialPlanning')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createFinancialPlanning(input: CreateFinancialPlanningInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const type = normalizeOptional(input.type)
    const fileUrl = normalizeOptional(input.fileUrl)
    
    // Resolve foreign keys
    const verticalId = input.verticalId ? await resolveVerticalId(input.verticalId, false) : null
    
    // Validate required fields
    if (!input.title) {
      throw new Error('Title is required')
    }
    
    const { data: newPlanning, error } = await supabase
      .from('financial_planning')
      .insert({
        title: input.title,
        description,
        type,
        data: input.data ? JSON.stringify(input.data) : '{}',
        status: input.status || 'draft',
        budget: input.budget ? Number(input.budget) : null,
        vertical_id: verticalId,
        file_url: fileUrl,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createFinancialPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/financial-planning')
    return newPlanning
  } catch (error) {
    logDatabaseError(error, 'createFinancialPlanning')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateFinancialPlanning(id: string, input: UpdateFinancialPlanningInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    const type = input.type !== undefined ? normalizeOptional(input.type) : undefined
    const fileUrl = input.fileUrl !== undefined ? normalizeOptional(input.fileUrl) : undefined
    
    // Resolve foreign keys
    const verticalId = input.verticalId !== undefined
      ? (input.verticalId ? await resolveVerticalId(input.verticalId, false) : null)
      : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (input.data !== undefined) updateData.data = JSON.stringify(input.data)
    if (input.status !== undefined) updateData.status = input.status
    if (input.budget !== undefined) updateData.budget = input.budget ? Number(input.budget) : null
    if (verticalId !== undefined) updateData.vertical_id = verticalId
    if (fileUrl !== undefined) updateData.file_url = fileUrl
    
    const { data: updatedPlanning, error } = await supabase
      .from('financial_planning')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateFinancialPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/financial-planning')
    revalidatePath(`/rnd/financial-planning/${id}`)
    return updatedPlanning
  } catch (error) {
    logDatabaseError(error, 'updateFinancialPlanning')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteFinancialPlanning(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('financial_planning')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteFinancialPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/financial-planning')
  } catch (error) {
    logDatabaseError(error, 'deleteFinancialPlanning')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// SUGGESTIONS
// ============================================================================

export async function getSuggestions(): Promise<Suggestion[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        created_by_profile:profiles!suggestions_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getSuggestions')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category || '',
      priority: row.priority as 'low' | 'medium' | 'high',
      status: row.status as 'open' | 'reviewing' | 'approved' | 'rejected',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toRNDUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getSuggestions')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getSuggestion(id: string): Promise<Suggestion | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        created_by_profile:profiles!suggestions_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getSuggestion')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category || '',
      priority: data.priority as 'low' | 'medium' | 'high',
      status: data.status as 'open' | 'reviewing' | 'approved' | 'rejected',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toRNDUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getSuggestion')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createSuggestion(input: CreateSuggestionInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const category = normalizeOptional(input.category)
    
    // Validate required fields
    if (!input.title || !input.description) {
      throw new Error('Title and description are required')
    }
    
    const { data: newSuggestion, error } = await supabase
      .from('suggestions')
      .insert({
        title: input.title,
        description: input.description,
        category,
        priority: input.priority || 'medium',
        status: input.status || 'open',
        votes: 0,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createSuggestion')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/suggestions')
    return newSuggestion
  } catch (error) {
    logDatabaseError(error, 'createSuggestion')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateSuggestion(id: string, input: UpdateSuggestionInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const category = input.category !== undefined ? normalizeOptional(input.category) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (category !== undefined) updateData.category = category
    if (input.priority !== undefined) updateData.priority = input.priority
    if (input.status !== undefined) updateData.status = input.status
    if (input.votes !== undefined) updateData.votes = input.votes
    
    const { data: updatedSuggestion, error } = await supabase
      .from('suggestions')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateSuggestion')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/suggestions')
    revalidatePath(`/rnd/suggestions/${id}`)
    return updatedSuggestion
  } catch (error) {
    logDatabaseError(error, 'updateSuggestion')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteSuggestion(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('suggestions')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteSuggestion')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/suggestions')
  } catch (error) {
    logDatabaseError(error, 'deleteSuggestion')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// STRATEGIC PLANNING
// ============================================================================

export async function getStrategicPlannings(): Promise<StrategicPlanning[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('strategic_planning')
      .select(`
        *,
        created_by_profile:profiles!strategic_planning_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getStrategicPlannings')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      initiative: row.initiative || '',
      status: row.status as DocumentStatus,
      fileUrl: row.file_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toRNDUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getStrategicPlannings')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getStrategicPlanning(id: string): Promise<StrategicPlanning | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('strategic_planning')
      .select(`
        *,
        created_by_profile:profiles!strategic_planning_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getStrategicPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      initiative: data.initiative || '',
      status: data.status as DocumentStatus,
      fileUrl: data.file_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toRNDUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getStrategicPlanning')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createStrategicPlanning(input: CreateStrategicPlanningInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const type = normalizeOptional(input.type)
    const initiative = normalizeOptional(input.initiative)
    const fileUrl = normalizeOptional(input.fileUrl)
    
    // Validate required fields
    if (!input.title) {
      throw new Error('Title is required')
    }
    
    const { data: newPlanning, error } = await supabase
      .from('strategic_planning')
      .insert({
        title: input.title,
        description,
        type,
        data: input.data ? JSON.stringify(input.data) : '{}',
        status: input.status || 'draft',
        initiative,
        file_url: fileUrl,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createStrategicPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/strategic-planning')
    return newPlanning
  } catch (error) {
    logDatabaseError(error, 'createStrategicPlanning')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateStrategicPlanning(id: string, input: UpdateStrategicPlanningInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    const type = input.type !== undefined ? normalizeOptional(input.type) : undefined
    const initiative = input.initiative !== undefined ? normalizeOptional(input.initiative) : undefined
    const fileUrl = input.fileUrl !== undefined ? normalizeOptional(input.fileUrl) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (input.data !== undefined) updateData.data = JSON.stringify(input.data)
    if (input.status !== undefined) updateData.status = input.status
    if (initiative !== undefined) updateData.initiative = initiative
    if (fileUrl !== undefined) updateData.file_url = fileUrl
    
    const { data: updatedPlanning, error } = await supabase
      .from('strategic_planning')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateStrategicPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/strategic-planning')
    revalidatePath(`/rnd/strategic-planning/${id}`)
    return updatedPlanning
  } catch (error) {
    logDatabaseError(error, 'updateStrategicPlanning')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteStrategicPlanning(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('strategic_planning')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteStrategicPlanning')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/strategic-planning')
  } catch (error) {
    logDatabaseError(error, 'deleteStrategicPlanning')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// MARKET RESEARCH
// ============================================================================

export async function getMarketResearches(): Promise<MarketResearch[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('market_research')
      .select(`
        *,
        created_by_profile:profiles!market_research_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getMarketResearches')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      market: row.market || '',
      status: row.status as DocumentStatus,
      fileUrl: row.file_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toRNDUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getMarketResearches')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getMarketResearch(id: string): Promise<MarketResearch | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('market_research')
      .select(`
        *,
        created_by_profile:profiles!market_research_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getMarketResearch')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      market: data.market || '',
      status: data.status as DocumentStatus,
      fileUrl: data.file_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toRNDUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getMarketResearch')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createMarketResearch(input: CreateMarketResearchInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const market = normalizeOptional(input.market)
    const fileUrl = normalizeOptional(input.fileUrl)
    
    // Validate required fields
    if (!input.title) {
      throw new Error('Title is required')
    }
    
    const { data: newResearch, error } = await supabase
      .from('market_research')
      .insert({
        title: input.title,
        description,
        data: input.data ? JSON.stringify(input.data) : '{}',
        status: input.status || 'draft',
        market,
        file_url: fileUrl,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createMarketResearch')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/market-research')
    return newResearch
  } catch (error) {
    logDatabaseError(error, 'createMarketResearch')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateMarketResearch(id: string, input: UpdateMarketResearchInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    const market = input.market !== undefined ? normalizeOptional(input.market) : undefined
    const fileUrl = input.fileUrl !== undefined ? normalizeOptional(input.fileUrl) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.title !== undefined) updateData.title = input.title
    if (description !== undefined) updateData.description = description
    if (input.data !== undefined) updateData.data = JSON.stringify(input.data)
    if (input.status !== undefined) updateData.status = input.status
    if (market !== undefined) updateData.market = market
    if (fileUrl !== undefined) updateData.file_url = fileUrl
    
    const { data: updatedResearch, error } = await supabase
      .from('market_research')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateMarketResearch')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/market-research')
    revalidatePath(`/rnd/market-research/${id}`)
    return updatedResearch
  } catch (error) {
    logDatabaseError(error, 'updateMarketResearch')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteMarketResearch(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('market_research')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteMarketResearch')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/rnd/market-research')
  } catch (error) {
    logDatabaseError(error, 'deleteMarketResearch')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}




