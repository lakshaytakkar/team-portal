'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { Lead, Deal, Quotation, LeadStatus, DealStage, QuotationStatus, SalesUser } from '@/lib/types/sales'
import { getAvatarForUser } from '@/lib/utils/avatars'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateLeadInput {
  company: string
  contactName: string
  email?: string
  phone?: string
  status?: LeadStatus
  source?: string
  value?: number
  assignedTo?: string
  notes?: string
}

export interface UpdateLeadInput {
  company?: string
  contactName?: string
  email?: string
  phone?: string
  status?: LeadStatus
  source?: string
  value?: number
  assignedTo?: string
  notes?: string
}

export interface CreateDealInput {
  leadId?: string
  name: string
  value?: number
  stage?: DealStage
  probability?: number
  closeDate?: string
  assignedTo?: string
}

export interface UpdateDealInput {
  leadId?: string
  name?: string
  value?: number
  stage?: DealStage
  probability?: number
  closeDate?: string
  assignedTo?: string
}

export interface CreateQuotationInput {
  dealId?: string
  quotationNumber: string
  amount: number
  status?: QuotationStatus
  validUntil?: string
}

export interface UpdateQuotationInput {
  dealId?: string
  quotationNumber?: string
  amount?: number
  status?: QuotationStatus
  validUntil?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get assignable users for dropdowns
 */
export async function getAssignableUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
    
    if (error) {
      logDatabaseError(error, 'getAssignableUsers')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((profile: any) => ({
      id: profile.id,
      name: profile.full_name || profile.email || 'Unknown',
      email: profile.email || '',
    }))
  } catch (error) {
    logDatabaseError(error, 'getAssignableUsers')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

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

function toSalesUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): SalesUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// LEADS
// ============================================================================

export async function getLeads(viewMode: 'my' | 'team' | 'all' = 'all'): Promise<Lead[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_to_profile:profiles!leads_assigned_to_id_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
    
    // Role-based filtering
    if (role === 'executive' || (role === 'manager' && viewMode === 'my')) {
      query = query.eq('assigned_to_id', user.id)
    } else if (role === 'manager' && viewMode === 'team') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = [user.id, ...teamMemberIds]
      if (allIds.length > 0) {
        query = query.in('assigned_to_id', allIds)
      } else {
        query = query.eq('assigned_to_id', user.id)
      }
    }
    // SuperAdmin sees all (no filter)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getLeads')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      company: row.company,
      contactName: row.contact_name,
      email: row.email || '',
      phone: row.phone || undefined,
      status: row.status as LeadStatus,
      source: row.source as any,
      value: row.value ? Number(row.value) : undefined,
      assignedTo: toSalesUser(row.assigned_to_profile) || {
        id: row.assigned_to_id || '',
        name: 'Unassigned',
      },
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getLeads')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_to_profile:profiles!leads_assigned_to_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getLead')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      company: data.company,
      contactName: data.contact_name,
      email: data.email || '',
      phone: data.phone || undefined,
      status: data.status as LeadStatus,
      source: data.source as any,
      value: data.value ? Number(data.value) : undefined,
      assignedTo: toSalesUser(data.assigned_to_profile) || {
        id: data.assigned_to_id || '',
        name: 'Unassigned',
      },
      notes: data.notes || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getLead')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createLead(input: CreateLeadInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const email = normalizeOptional(input.email)
    const phone = normalizeOptional(input.phone)
    const source = normalizeOptional(input.source)
    const notes = normalizeOptional(input.notes)
    
    // Resolve foreign keys
    const assignedToId = input.assignedTo ? await resolveProfileId(input.assignedTo, false) : null
    
    // Validate required fields
    if (!input.company || !input.contactName) {
      throw new Error('Company and contact name are required')
    }
    
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        company: input.company,
        contact_name: input.contactName,
        email,
        phone,
        status: input.status || 'new',
        source,
        value: input.value ? Number(input.value) : null,
        assigned_to_id: assignedToId,
        notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createLead')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/leads')
    return newLead
  } catch (error) {
    logDatabaseError(error, 'createLead')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const email = normalizeOptional(input.email)
    const phone = normalizeOptional(input.phone)
    const source = normalizeOptional(input.source)
    const notes = normalizeOptional(input.notes)
    
    // Resolve foreign keys
    const assignedToId = input.assignedTo !== undefined 
      ? (input.assignedTo ? await resolveProfileId(input.assignedTo, false) : null)
      : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.company !== undefined) updateData.company = input.company
    if (input.contactName !== undefined) updateData.contact_name = input.contactName
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (input.status !== undefined) updateData.status = input.status
    if (source !== undefined) updateData.source = source
    if (input.value !== undefined) updateData.value = input.value ? Number(input.value) : null
    if (assignedToId !== undefined) updateData.assigned_to_id = assignedToId
    if (notes !== undefined) updateData.notes = notes
    
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateLead')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/leads')
    revalidatePath(`/sales/leads/${id}`)
    return updatedLead
  } catch (error) {
    logDatabaseError(error, 'updateLead')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteLead')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/leads')
  } catch (error) {
    logDatabaseError(error, 'deleteLead')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// DEALS
// ============================================================================

export async function getDeals(viewMode: 'my' | 'team' | 'all' = 'all'): Promise<Deal[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    let query = supabase
      .from('deals')
      .select(`
        *,
        assigned_to_profile:profiles!deals_assigned_to_id_fkey(id, full_name, email, avatar_url),
        lead:leads!deals_lead_id_fkey(id, company, contact_name)
      `)
      .is('deleted_at', null)
    
    // Role-based filtering
    if (role === 'executive' || (role === 'manager' && viewMode === 'my')) {
      query = query.eq('assigned_to_id', user.id)
    } else if (role === 'manager' && viewMode === 'team') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = [user.id, ...teamMemberIds]
      if (allIds.length > 0) {
        query = query.in('assigned_to_id', allIds)
      } else {
        query = query.eq('assigned_to_id', user.id)
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getDeals')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      company: row.lead?.company || '',
      contactName: row.lead?.contact_name || '',
      value: row.value ? Number(row.value) : 0,
      stage: row.stage as DealStage,
      probability: row.probability || 0,
      expectedCloseDate: row.close_date || undefined,
      actualCloseDate: row.stage === 'closed-won' || row.stage === 'closed-lost' ? row.close_date : undefined,
      assignedTo: toSalesUser(row.assigned_to_profile) || {
        id: row.assigned_to_id || '',
        name: 'Unassigned',
      },
      notes: undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getDeals')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getDeal(id: string): Promise<Deal | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        assigned_to_profile:profiles!deals_assigned_to_id_fkey(id, full_name, email, avatar_url),
        lead:leads!deals_lead_id_fkey(id, company, contact_name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getDeal')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      company: data.lead?.company || '',
      contactName: data.lead?.contact_name || '',
      value: data.value ? Number(data.value) : 0,
      stage: data.stage as DealStage,
      probability: data.probability || 0,
      expectedCloseDate: data.close_date || undefined,
      actualCloseDate: data.stage === 'closed-won' || data.stage === 'closed-lost' ? data.close_date : undefined,
      assignedTo: toSalesUser(data.assigned_to_profile) || {
        id: data.assigned_to_id || '',
        name: 'Unassigned',
      },
      notes: undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getDeal')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createDeal(input: CreateDealInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Resolve foreign keys
    const leadId = input.leadId ? (input.leadId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? input.leadId : null) : null
    const assignedToId = input.assignedTo ? await resolveProfileId(input.assignedTo, false) : null
    
    // Validate required fields
    if (!input.name) {
      throw new Error('Deal name is required')
    }
    
    const { data: newDeal, error } = await supabase
      .from('deals')
      .insert({
        lead_id: leadId,
        name: input.name,
        value: input.value ? Number(input.value) : null,
        stage: input.stage || 'prospecting',
        probability: input.probability || 0,
        close_date: input.closeDate || null,
        assigned_to_id: assignedToId,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createDeal')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/deals')
    return newDeal
  } catch (error) {
    logDatabaseError(error, 'createDeal')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateDeal(id: string, input: UpdateDealInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Resolve foreign keys
    const leadId = input.leadId !== undefined
      ? (input.leadId ? (input.leadId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? input.leadId : null) : null)
      : undefined
    const assignedToId = input.assignedTo !== undefined
      ? (input.assignedTo ? await resolveProfileId(input.assignedTo, false) : null)
      : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (leadId !== undefined) updateData.lead_id = leadId
    if (input.name !== undefined) updateData.name = input.name
    if (input.value !== undefined) updateData.value = input.value ? Number(input.value) : null
    if (input.stage !== undefined) updateData.stage = input.stage
    if (input.probability !== undefined) updateData.probability = input.probability
    if (input.closeDate !== undefined) updateData.close_date = input.closeDate || null
    if (assignedToId !== undefined) updateData.assigned_to_id = assignedToId
    
    const { data: updatedDeal, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateDeal')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/deals')
    revalidatePath(`/sales/deals/${id}`)
    return updatedDeal
  } catch (error) {
    logDatabaseError(error, 'updateDeal')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteDeal(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('deals')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteDeal')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/deals')
  } catch (error) {
    logDatabaseError(error, 'deleteDeal')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// QUOTATIONS
// ============================================================================

export async function getQuotations(viewMode: 'my' | 'team' | 'all' = 'all'): Promise<Quotation[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    let query = supabase
      .from('quotations')
      .select(`
        *,
        deal:deals!quotations_deal_id_fkey(
          id,
          name,
          assigned_to_id,
          assigned_to_profile:profiles!deals_assigned_to_id_fkey(id, full_name, email, avatar_url)
        )
      `)
      .is('deleted_at', null)
    
    // Role-based filtering through deal assignment
    if (role === 'executive' || (role === 'manager' && viewMode === 'my')) {
      query = query.eq('deal.assigned_to_id', user.id)
    } else if (role === 'manager' && viewMode === 'team') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      const allIds = [user.id, ...teamMemberIds]
      if (allIds.length > 0) {
        query = query.in('deal.assigned_to_id', allIds)
      } else {
        query = query.eq('deal.assigned_to_id', user.id)
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getQuotations')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      quotationNumber: row.quotation_number,
      company: row.deal?.name || '',
      contactName: '',
      email: '',
      amount: Number(row.amount),
      status: row.status as QuotationStatus,
      validUntil: row.valid_until || '',
      assignedTo: toSalesUser(row.deal?.assigned_to_profile) || {
        id: row.deal?.assigned_to_id || '',
        name: 'Unassigned',
      },
      items: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getQuotations')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getQuotation(id: string): Promise<Quotation | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select(`
        *,
        deal:deals!quotations_deal_id_fkey(
          id,
          name,
          assigned_to_id,
          assigned_to_profile:profiles!deals_assigned_to_id_fkey(id, full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getQuotation')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      quotationNumber: data.quotation_number,
      company: data.deal?.name || '',
      contactName: '',
      email: '',
      amount: Number(data.amount),
      status: data.status as QuotationStatus,
      validUntil: data.valid_until || '',
      assignedTo: toSalesUser(data.deal?.assigned_to_profile) || {
        id: data.deal?.assigned_to_id || '',
        name: 'Unassigned',
      },
      items: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'getQuotation')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createQuotation(input: CreateQuotationInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Resolve foreign keys - dealId should be a UUID
    const dealId = input.dealId ? (input.dealId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? input.dealId : null) : null
    
    // Validate required fields
    if (!input.quotationNumber || !input.amount) {
      throw new Error('Quotation number and amount are required')
    }
    
    const { data: newQuotation, error } = await supabase
      .from('quotations')
      .insert({
        deal_id: dealId,
        quotation_number: input.quotationNumber,
        amount: Number(input.amount),
        status: input.status || 'draft',
        valid_until: input.validUntil || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createQuotation')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/quotations')
    return newQuotation
  } catch (error) {
    logDatabaseError(error, 'createQuotation')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateQuotation(id: string, input: UpdateQuotationInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Resolve foreign keys - dealId should be a UUID
    const dealId = input.dealId !== undefined
      ? (input.dealId ? (input.dealId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? input.dealId : null) : null)
      : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (dealId !== undefined) updateData.deal_id = dealId
    if (input.quotationNumber !== undefined) updateData.quotation_number = input.quotationNumber
    if (input.amount !== undefined) updateData.amount = Number(input.amount)
    if (input.status !== undefined) updateData.status = input.status
    if (input.validUntil !== undefined) updateData.valid_until = input.validUntil || null
    
    const { data: updatedQuotation, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateQuotation')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/quotations')
    revalidatePath(`/sales/quotations/${id}`)
    return updatedQuotation
  } catch (error) {
    logDatabaseError(error, 'updateQuotation')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteQuotation(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('quotations')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteQuotation')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/sales/quotations')
  } catch (error) {
    logDatabaseError(error, 'deleteQuotation')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}
