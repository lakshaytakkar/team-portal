'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  LLCClient,
  LLCClientDocument,
  LLCClientTimelineEntry,
  LLCBank,
  LLCDocumentType,
  LLCClientStats,
  LLCClientFilters,
  LLCDocumentFilters,
  CreateLLCClientInput,
  UpdateLLCClientInput,
  AddTimelineEntryInput,
  LLCClientStatus,
  LLCClientHealth,
  LLCServicePlan,
  LLCBankStatus,
  LLCDocumentCategory,
  LLCDocumentStatus,
} from '@/lib/types/llc-clients'
import { getAvatarForUser } from '@/lib/utils/avatars'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    result[snakeKey] = obj[key]
  }
  return result
}

function transformClient(row: Record<string, unknown>): LLCClient {
  const client = snakeToCamel(row) as unknown as LLCClient

  // Transform nested assignee
  if (row.assigned_to && typeof row.assigned_to === 'object') {
    const assignee = row.assigned_to as Record<string, unknown>
    const profile = assignee.profile as Record<string, unknown> | undefined
    client.assignedTo = {
      id: assignee.id as string,
      employeeId: assignee.employee_id as string,
      fullName: profile?.full_name as string || 'Unknown',
      email: profile?.email as string,
      avatar: profile?.avatar_url as string || getAvatarForUser(profile?.full_name as string || 'U'),
    }
  }

  // Transform nested bank
  if (row.bank && typeof row.bank === 'object') {
    client.bank = snakeToCamel(row.bank as Record<string, unknown>) as unknown as LLCBank
  }

  return client
}

function transformDocument(row: Record<string, unknown>): LLCClientDocument {
  const doc = snakeToCamel(row) as unknown as LLCClientDocument

  if (row.document_type && typeof row.document_type === 'object') {
    doc.documentType = snakeToCamel(row.document_type as Record<string, unknown>) as unknown as LLCDocumentType
  }

  return doc
}

function transformTimelineEntry(row: Record<string, unknown>): LLCClientTimelineEntry {
  const entry = snakeToCamel(row) as unknown as LLCClientTimelineEntry

  if (row.performed_by_profile && typeof row.performed_by_profile === 'object') {
    const profile = row.performed_by_profile as Record<string, unknown>
    entry.performedByProfile = {
      id: profile.id as string,
      fullName: profile.full_name as string || 'Unknown',
      avatar: profile.avatar_url as string || getAvatarForUser(profile.full_name as string || 'U'),
    }
  }

  return entry
}

// ============================================================================
// BANKS & DOCUMENT TYPES (Master Data)
// ============================================================================

export async function getLLCBanks(): Promise<LLCBank[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llc_banks')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => snakeToCamel(row) as unknown as LLCBank)
}

export async function getLLCDocumentTypes(category?: LLCDocumentCategory): Promise<LLCDocumentType[]> {
  const supabase = await createClient()

  let query = supabase
    .from('llc_document_types')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => snakeToCamel(row) as unknown as LLCDocumentType)
}

// ============================================================================
// LLC CLIENTS - CRUD
// ============================================================================

export async function getLLCClients(filters?: LLCClientFilters): Promise<LLCClient[]> {
  const supabase = await createClient()

  let query = supabase
    .from('llc_clients')
    .select(`
      *,
      bank:llc_banks(*),
      assigned_to:employees(
        id,
        employee_id,
        profile:profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters) {
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    if (filters.health) {
      if (Array.isArray(filters.health)) {
        query = query.in('health', filters.health)
      } else {
        query = query.eq('health', filters.health)
      }
    }

    if (filters.plan) {
      query = query.eq('plan', filters.plan)
    }

    if (filters.bankStatus) {
      query = query.eq('bank_status', filters.bankStatus)
    }

    if (filters.assignedToId) {
      query = query.eq('assigned_to_id', filters.assignedToId)
    }

    if (filters.country) {
      query = query.eq('country', filters.country)
    }

    if (filters.searchQuery) {
      query = query.or(`client_name.ilike.%${filters.searchQuery}%,llc_name.ilike.%${filters.searchQuery}%,client_code.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%`)
    }

    if (filters.dateFrom) {
      query = query.gte('payment_date', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('payment_date', filters.dateTo)
    }
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []).map(transformClient)
}

export async function getLLCClientById(id: string): Promise<LLCClient | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llc_clients')
    .select(`
      *,
      bank:llc_banks(*),
      assigned_to:employees(
        id,
        employee_id,
        profile:profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data ? transformClient(data) : null
}

export async function getLLCClientByCode(clientCode: string): Promise<LLCClient | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llc_clients')
    .select(`
      *,
      bank:llc_banks(*),
      assigned_to:employees(
        id,
        employee_id,
        profile:profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq('client_code', clientCode)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data ? transformClient(data) : null
}

export async function createLLCClient(input: CreateLLCClientInput): Promise<LLCClient> {
  const supabase = await createClient()

  // Generate client code if not provided
  let clientCode = input.clientCode
  if (!clientCode) {
    const { data: lastClient } = await supabase
      .from('llc_clients')
      .select('client_code')
      .order('client_code', { ascending: false })
      .limit(1)
      .single()

    if (lastClient?.client_code) {
      const lastNumber = parseInt(lastClient.client_code.replace('SUPLLC', ''), 10)
      clientCode = `SUPLLC${(lastNumber + 1).toString().padStart(4, '0')}`
    } else {
      clientCode = 'SUPLLC1001'
    }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  const insertData = {
    client_code: clientCode,
    client_name: input.clientName,
    email: input.email,
    phone: input.phone,
    country: input.country,
    llc_name: input.llcName,
    plan: input.plan || 'elite',
    website_included: input.websiteIncluded ?? true,
    payment_date: input.paymentDate,
    amount_received: input.amountReceived || 0,
    remaining_payment: input.remainingPayment || 0,
    currency: input.currency || 'INR',
    assigned_to_id: input.assignedToId,
    notes: input.notes,
    status: 'llc_booked',
    created_by: user?.id,
    updated_by: user?.id,
  }

  const { data, error } = await supabase
    .from('llc_clients')
    .insert(insertData)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/legal-nations')
  return transformClient(data)
}

export async function updateLLCClient(id: string, input: UpdateLLCClientInput): Promise<LLCClient> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const updateData = camelToSnake({
    ...input,
    updatedBy: user?.id,
  })

  const { data, error } = await supabase
    .from('llc_clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/legal-nations')
  revalidatePath(`/legal-nations/clients/${id}`)
  return transformClient(data)
}

export async function deleteLLCClient(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('llc_clients')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user?.id,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/legal-nations')
}

export async function updateLLCClientStatus(id: string, status: LLCClientStatus): Promise<LLCClient> {
  return updateLLCClient(id, { status })
}

export async function updateLLCClientHealth(id: string, health: LLCClientHealth): Promise<LLCClient> {
  return updateLLCClient(id, { health })
}

export async function updateLLCClientBankStatus(id: string, bankStatus: LLCBankStatus, bankId?: string): Promise<LLCClient> {
  const input: UpdateLLCClientInput = { bankStatus }
  if (bankId) input.bankId = bankId
  if (bankStatus === 'approved') {
    input.bankApprovalDate = new Date().toISOString().split('T')[0]
  }
  return updateLLCClient(id, input)
}

// ============================================================================
// LLC CLIENT DOCUMENTS
// ============================================================================

export async function getLLCClientDocuments(filters: LLCDocumentFilters): Promise<LLCClientDocument[]> {
  const supabase = await createClient()

  let query = supabase
    .from('llc_client_documents')
    .select(`
      *,
      document_type:llc_document_types(*)
    `)
    .eq('client_id', filters.clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.documentTypeId) {
    query = query.eq('document_type_id', filters.documentTypeId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []).map(transformDocument)
}

export async function createLLCClientDocument(input: {
  clientId: string
  documentTypeId?: string
  name: string
  fileName?: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  category: LLCDocumentCategory
  status?: LLCDocumentStatus
  notes?: string
}): Promise<LLCClientDocument> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const insertData = {
    client_id: input.clientId,
    document_type_id: input.documentTypeId,
    name: input.name,
    file_name: input.fileName,
    file_path: input.filePath,
    file_size: input.fileSize || 0,
    mime_type: input.mimeType,
    category: input.category,
    status: input.status || 'pending',
    notes: input.notes,
    created_by: user?.id,
    updated_by: user?.id,
  }

  const { data, error } = await supabase
    .from('llc_client_documents')
    .insert(insertData)
    .select(`
      *,
      document_type:llc_document_types(*)
    `)
    .single()

  if (error) throw new Error(error.message)

  // Add timeline entry
  await addLLCClientTimelineEntry({
    clientId: input.clientId,
    eventType: 'document_uploaded',
    title: `Document added: ${input.name}`,
    description: `Document "${input.name}" was added to ${input.category.replace('_', ' ')} category`,
  })

  revalidatePath(`/legal-nations/clients/${input.clientId}`)
  return transformDocument(data)
}

export async function updateLLCClientDocument(
  id: string,
  input: {
    name?: string
    status?: LLCDocumentStatus
    verifiedDate?: string
    issuedDate?: string
    notes?: string
    rejectionReason?: string
  }
): Promise<LLCClientDocument> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const updateData: Record<string, unknown> = {
    updated_by: user?.id,
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.status !== undefined) updateData.status = input.status
  if (input.verifiedDate !== undefined) {
    updateData.verified_date = input.verifiedDate
    updateData.verified_by = user?.id
  }
  if (input.issuedDate !== undefined) {
    updateData.issued_date = input.issuedDate
    updateData.issued_by = user?.id
  }
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.rejectionReason !== undefined) updateData.rejection_reason = input.rejectionReason

  const { data, error } = await supabase
    .from('llc_client_documents')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      document_type:llc_document_types(*)
    `)
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/legal-nations')
  return transformDocument(data)
}

export async function deleteLLCClientDocument(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('llc_client_documents')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user?.id,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/legal-nations')
}

// ============================================================================
// LLC CLIENT TIMELINE
// ============================================================================

export async function getLLCClientTimeline(clientId: string): Promise<LLCClientTimelineEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llc_client_timeline')
    .select(`
      *,
      performed_by_profile:profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(transformTimelineEntry)
}

export async function addLLCClientTimelineEntry(input: AddTimelineEntryInput): Promise<LLCClientTimelineEntry> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const insertData = {
    client_id: input.clientId,
    event_type: input.eventType,
    title: input.title,
    description: input.description,
    metadata: input.metadata,
    performed_by: user?.id,
  }

  const { data, error } = await supabase
    .from('llc_client_timeline')
    .insert(insertData)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/legal-nations/clients/${input.clientId}`)
  return transformTimelineEntry(data)
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getLLCClientStats(assignedToId?: string): Promise<LLCClientStats> {
  const supabase = await createClient()

  let query = supabase
    .from('llc_clients')
    .select('status, health, plan, amount_received, remaining_payment, onboarding_date, delivery_date')
    .is('deleted_at', null)

  if (assignedToId) {
    query = query.eq('assigned_to_id', assignedToId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  const clients = data ?? []
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats: LLCClientStats = {
    total: clients.length,
    byStatus: {
      llc_booked: 0,
      onboarded: 0,
      under_ein: 0,
      under_boi: 0,
      under_banking: 0,
      under_payment_gateway: 0,
      delivered: 0,
    },
    byHealth: {
      healthy: 0,
      neutral: 0,
      at_risk: 0,
      critical: 0,
    },
    byPlan: {
      elite: 0,
      llc: 0,
    },
    totalRevenue: 0,
    pendingPayments: 0,
    thisMonthOnboarded: 0,
    thisMonthDelivered: 0,
  }

  clients.forEach((client) => {
    // By status
    if (client.status && stats.byStatus[client.status as LLCClientStatus] !== undefined) {
      stats.byStatus[client.status as LLCClientStatus]++
    }

    // By health
    if (client.health && stats.byHealth[client.health as LLCClientHealth] !== undefined) {
      stats.byHealth[client.health as LLCClientHealth]++
    }

    // By plan
    if (client.plan && stats.byPlan[client.plan as LLCServicePlan] !== undefined) {
      stats.byPlan[client.plan as LLCServicePlan]++
    }

    // Revenue
    stats.totalRevenue += parseFloat(client.amount_received) || 0
    stats.pendingPayments += parseFloat(client.remaining_payment) || 0

    // This month stats
    if (client.onboarding_date) {
      const onboardingDate = new Date(client.onboarding_date)
      if (onboardingDate >= startOfMonth) {
        stats.thisMonthOnboarded++
      }
    }

    if (client.delivery_date) {
      const deliveryDate = new Date(client.delivery_date)
      if (deliveryDate >= startOfMonth) {
        stats.thisMonthDelivered++
      }
    }
  })

  return stats
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function getAssignableEmployees(): Promise<Array<{ id: string; name: string; email?: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .select(`
      id,
      profile:profiles(
        full_name,
        email
      )
    `)
    .eq('status', 'active')
    .is('deleted_at', null)

  if (error) throw new Error(error.message)

  return (data ?? []).map((emp) => ({
    id: emp.id,
    name: (emp.profile as { full_name?: string })?.full_name || 'Unknown',
    email: (emp.profile as { email?: string })?.email,
  }))
}

export async function getUniqueCountries(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('llc_clients')
    .select('country')
    .is('deleted_at', null)
    .not('country', 'is', null)

  if (error) throw new Error(error.message)

  const countries = [...new Set((data ?? []).map((c) => c.country).filter(Boolean))]
  return countries.sort()
}
