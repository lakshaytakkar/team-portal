'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type { EmailTemplate, WhatsAppTemplate, EmailAutomation, WhatsAppAutomation, Campaign, Drip, TemplateStatus, AutomationStatus, CampaignStatus, DripStatus, MarketingUser } from '@/lib/types/marketing'
import { getAvatarForUser } from '@/lib/utils/avatars'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateEmailTemplateInput {
  name: string
  subject: string
  content: string
  variables?: Record<string, string>
  status?: TemplateStatus
  preview?: string
}

export interface UpdateEmailTemplateInput {
  name?: string
  subject?: string
  content?: string
  variables?: Record<string, string>
  status?: TemplateStatus
  preview?: string
}

export interface CreateWhatsAppTemplateInput {
  name: string
  content: string
  variables?: Record<string, string>
  status?: TemplateStatus
  preview?: string
}

export interface UpdateWhatsAppTemplateInput {
  name?: string
  content?: string
  variables?: Record<string, string>
  status?: TemplateStatus
  preview?: string
}

export interface CreateEmailAutomationInput {
  name: string
  trigger: string
  templateId: string
  conditions?: Record<string, any>
  status?: AutomationStatus
}

export interface UpdateEmailAutomationInput {
  name?: string
  trigger?: string
  templateId?: string
  conditions?: Record<string, any>
  status?: AutomationStatus
}

export interface CreateWhatsAppAutomationInput {
  name: string
  trigger: string
  templateId: string
  conditions?: Record<string, any>
  status?: AutomationStatus
}

export interface UpdateWhatsAppAutomationInput {
  name?: string
  trigger?: string
  templateId?: string
  conditions?: Record<string, any>
  status?: AutomationStatus
}

export interface CreateCampaignInput {
  name: string
  description?: string
  type?: string
  status?: CampaignStatus
  startDate?: string
  endDate?: string
  budget?: number
  channels?: string[]
}

export interface UpdateCampaignInput {
  name?: string
  description?: string
  type?: string
  status?: CampaignStatus
  startDate?: string
  endDate?: string
  budget?: number
  channels?: string[]
}

export interface CreateDripInput {
  name: string
  description?: string
  sequence?: any[]
  templates?: any[]
  status?: DripStatus
}

export interface UpdateDripInput {
  name?: string
  description?: string
  sequence?: any[]
  templates?: any[]
  status?: DripStatus
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

function toMarketingUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): MarketingUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select(`
        *,
        created_by_profile:profiles!email_templates_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getEmailTemplates')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      type: 'email' as const,
      status: row.status as TemplateStatus,
      preview: row.preview || undefined,
      content: row.content || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toMarketingUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getEmailTemplates')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select(`
        *,
        created_by_profile:profiles!email_templates_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getEmailTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      type: 'email' as const,
      status: data.status as TemplateStatus,
      preview: data.preview || undefined,
      content: data.content || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toMarketingUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getEmailTemplate')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createEmailTemplate(input: CreateEmailTemplateInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const preview = normalizeOptional(input.preview)
    
    // Validate required fields
    if (!input.name || !input.subject || !input.content) {
      throw new Error('Name, subject, and content are required')
    }
    
    const { data: newTemplate, error } = await supabase
      .from('email_templates')
      .insert({
        name: input.name,
        subject: input.subject,
        content: input.content,
        variables: input.variables ? JSON.stringify(input.variables) : '{}',
        status: input.status || 'draft',
        preview,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createEmailTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/email-templates')
    return newTemplate
  } catch (error) {
    logDatabaseError(error, 'createEmailTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateEmailTemplate(id: string, input: UpdateEmailTemplateInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const preview = input.preview !== undefined ? normalizeOptional(input.preview) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (input.subject !== undefined) updateData.subject = input.subject
    if (input.content !== undefined) updateData.content = input.content
    if (input.variables !== undefined) updateData.variables = JSON.stringify(input.variables)
    if (input.status !== undefined) updateData.status = input.status
    if (preview !== undefined) updateData.preview = preview
    
    const { data: updatedTemplate, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateEmailTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/email-templates')
    revalidatePath(`/marketing/email-templates/${id}`)
    return updatedTemplate
  } catch (error) {
    logDatabaseError(error, 'updateEmailTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteEmailTemplate(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('email_templates')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteEmailTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/email-templates')
  } catch (error) {
    logDatabaseError(error, 'deleteEmailTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// WHATSAPP TEMPLATES
// ============================================================================

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select(`
        *,
        created_by_profile:profiles!whatsapp_templates_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getWhatsAppTemplates')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      message: row.content,
      type: 'whatsapp' as const,
      status: row.status as TemplateStatus,
      preview: row.preview || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toMarketingUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getWhatsAppTemplates')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getWhatsAppTemplate(id: string): Promise<WhatsAppTemplate | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select(`
        *,
        created_by_profile:profiles!whatsapp_templates_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getWhatsAppTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      message: data.content,
      type: 'whatsapp' as const,
      status: data.status as TemplateStatus,
      preview: data.preview || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toMarketingUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getWhatsAppTemplate')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createWhatsAppTemplate(input: CreateWhatsAppTemplateInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const preview = normalizeOptional(input.preview)
    
    // Validate required fields
    if (!input.name || !input.content) {
      throw new Error('Name and content are required')
    }
    
    const { data: newTemplate, error } = await supabase
      .from('whatsapp_templates')
      .insert({
        name: input.name,
        content: input.content,
        variables: input.variables ? JSON.stringify(input.variables) : '{}',
        status: input.status || 'draft',
        preview,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createWhatsAppTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/whatsapp-templates')
    return newTemplate
  } catch (error) {
    logDatabaseError(error, 'createWhatsAppTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateWhatsAppTemplate(id: string, input: UpdateWhatsAppTemplateInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const preview = input.preview !== undefined ? normalizeOptional(input.preview) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (input.content !== undefined) updateData.content = input.content
    if (input.variables !== undefined) updateData.variables = JSON.stringify(input.variables)
    if (input.status !== undefined) updateData.status = input.status
    if (preview !== undefined) updateData.preview = preview
    
    const { data: updatedTemplate, error } = await supabase
      .from('whatsapp_templates')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateWhatsAppTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/whatsapp-templates')
    revalidatePath(`/marketing/whatsapp-templates/${id}`)
    return updatedTemplate
  } catch (error) {
    logDatabaseError(error, 'updateWhatsAppTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteWhatsAppTemplate(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('whatsapp_templates')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteWhatsAppTemplate')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/whatsapp-templates')
  } catch (error) {
    logDatabaseError(error, 'deleteWhatsAppTemplate')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// CAMPAIGNS
// ============================================================================

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        created_by_profile:profiles!campaigns_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getCampaigns')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      status: row.status as CampaignStatus,
      startDate: row.start_date || undefined,
      endDate: row.end_date || undefined,
      channels: (row.channels || []) as ('email' | 'whatsapp')[],
      recipients: row.recipients_count || undefined,
      sent: row.sent_count || undefined,
      opened: row.opened_count || undefined,
      clicked: row.clicked_count || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toMarketingUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getCampaigns')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        created_by_profile:profiles!campaigns_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getCampaign')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      status: data.status as CampaignStatus,
      startDate: data.start_date || undefined,
      endDate: data.end_date || undefined,
      channels: (data.channels || []) as ('email' | 'whatsapp')[],
      recipients: data.recipients_count || undefined,
      sent: data.sent_count || undefined,
      opened: data.opened_count || undefined,
      clicked: data.clicked_count || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toMarketingUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getCampaign')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createCampaign(input: CreateCampaignInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    const type = normalizeOptional(input.type)
    
    // Validate required fields
    if (!input.name) {
      throw new Error('Campaign name is required')
    }
    
    const { data: newCampaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: input.name,
        description,
        type,
        status: input.status || 'draft',
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        budget: input.budget ? Number(input.budget) : null,
        channels: input.channels || [],
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createCampaign')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/campaigns')
    return newCampaign
  } catch (error) {
    logDatabaseError(error, 'createCampaign')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateCampaign(id: string, input: UpdateCampaignInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    const type = input.type !== undefined ? normalizeOptional(input.type) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (input.status !== undefined) updateData.status = input.status
    if (input.startDate !== undefined) updateData.start_date = input.startDate || null
    if (input.endDate !== undefined) updateData.end_date = input.endDate || null
    if (input.budget !== undefined) updateData.budget = input.budget ? Number(input.budget) : null
    if (input.channels !== undefined) updateData.channels = input.channels
    
    const { data: updatedCampaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateCampaign')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/campaigns')
    revalidatePath(`/marketing/campaigns/${id}`)
    return updatedCampaign
  } catch (error) {
    logDatabaseError(error, 'updateCampaign')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('campaigns')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteCampaign')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/campaigns')
  } catch (error) {
    logDatabaseError(error, 'deleteCampaign')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// DRIPS
// ============================================================================

export async function getDrips(): Promise<Drip[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('drips')
      .select(`
        *,
        created_by_profile:profiles!drips_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getDrips')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      status: row.status as DripStatus,
      steps: Array.isArray(row.sequence) ? row.sequence.length : 0,
      recipients: row.recipients_count || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: toMarketingUser(row.created_by_profile) || {
        id: row.created_by || '',
        name: 'Unknown',
      },
    }))
  } catch (error) {
    logDatabaseError(error, 'getDrips')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function getDrip(id: string): Promise<Drip | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('drips')
      .select(`
        *,
        created_by_profile:profiles!drips_created_by_fkey(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      logDatabaseError(error, 'getDrip')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      status: data.status as DripStatus,
      steps: Array.isArray(data.sequence) ? data.sequence.length : 0,
      recipients: data.recipients_count || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: toMarketingUser(data.created_by_profile) || {
        id: data.created_by || '',
        name: 'Unknown',
      },
    }
  } catch (error) {
    logDatabaseError(error, 'getDrip')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

export async function createDrip(input: CreateDripInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = normalizeOptional(input.description)
    
    // Validate required fields
    if (!input.name) {
      throw new Error('Drip name is required')
    }
    
    const { data: newDrip, error } = await supabase
      .from('drips')
      .insert({
        name: input.name,
        description,
        sequence: input.sequence ? JSON.stringify(input.sequence) : '[]',
        templates: input.templates ? JSON.stringify(input.templates) : '[]',
        status: input.status || 'draft',
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createDrip')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/drips')
    return newDrip
  } catch (error) {
    logDatabaseError(error, 'createDrip')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function updateDrip(id: string, input: UpdateDripInput) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    // Normalize optional fields
    const description = input.description !== undefined ? normalizeOptional(input.description) : undefined
    
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    
    if (input.name !== undefined) updateData.name = input.name
    if (description !== undefined) updateData.description = description
    if (input.sequence !== undefined) updateData.sequence = JSON.stringify(input.sequence)
    if (input.templates !== undefined) updateData.templates = JSON.stringify(input.templates)
    if (input.status !== undefined) updateData.status = input.status
    
    const { data: updatedDrip, error } = await supabase
      .from('drips')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'updateDrip')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/drips')
    revalidatePath(`/marketing/drips/${id}`)
    return updatedDrip
  } catch (error) {
    logDatabaseError(error, 'updateDrip')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteDrip(id: string) {
  const supabase = await createClient()
  
  if (!supabase) throw new Error('Database not connected')
  
  try {
    const user = await getCurrentUser()
    
    const { error } = await supabase
      .from('drips')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deleteDrip')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/marketing/drips')
  } catch (error) {
    logDatabaseError(error, 'deleteDrip')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}


