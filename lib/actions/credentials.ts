'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  Credential,
  CredentialCategory,
  MaskedCredential,
  CreateCredentialInput,
  UpdateCredentialInput,
  CreateCredentialCategoryInput,
  UpdateCredentialCategoryInput,
  JobPortalCredential,
} from '@/lib/types/credentials'

// ============================================================================
// CREDENTIAL CATEGORIES
// ============================================================================

export async function getCredentialCategories(): Promise<CredentialCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credential_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createCredentialCategory(input: CreateCredentialCategoryInput): Promise<CredentialCategory> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credential_categories')
    .insert({
      name: input.name,
      description: input.description,
      icon: input.icon,
      color: input.color,
      sort_order: input.sortOrder ?? 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/credentials')

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? undefined,
    icon: data.icon ?? undefined,
    color: data.color ?? undefined,
    sortOrder: data.sort_order ?? 0,
    isActive: data.is_active ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateCredentialCategory(input: UpdateCredentialCategoryInput): Promise<CredentialCategory> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) update.name = input.name
  if (input.description !== undefined) update.description = input.description
  if (input.icon !== undefined) update.icon = input.icon
  if (input.color !== undefined) update.color = input.color
  if (input.sortOrder !== undefined) update.sort_order = input.sortOrder
  if (input.isActive !== undefined) update.is_active = input.isActive

  const { data, error } = await supabase
    .from('credential_categories')
    .update(update)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/credentials')

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? undefined,
    icon: data.icon ?? undefined,
    color: data.color ?? undefined,
    sortOrder: data.sort_order ?? 0,
    isActive: data.is_active ?? true,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteCredentialCategory(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('credential_categories')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/credentials')
}

// ============================================================================
// CREDENTIALS (with sensitive field masking)
// ============================================================================

export async function getCredentials(): Promise<MaskedCredential[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credentials')
    .select(`
      *,
      category:credential_categories(id, name, icon, color),
      last_used_by_profile:profiles!credentials_last_used_by_fkey(id, full_name)
    `)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    categoryId: row.category_id ?? undefined,
    category: row.category ? {
      id: row.category.id,
      name: row.category.name,
      icon: row.category.icon ?? undefined,
      color: row.category.color ?? undefined,
      sortOrder: 0,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    } : undefined,
    name: row.name,
    description: row.description ?? undefined,
    credentialType: row.credential_type,
    username: row.username ?? undefined,
    email: row.email ?? undefined,
    url: row.url ?? undefined,
    apiEndpoint: row.api_endpoint ?? undefined,
    additionalFields: row.additional_fields ?? undefined,
    accessLevel: row.access_level,
    isActive: row.is_active ?? true,
    expiresAt: row.expires_at ?? undefined,
    lastUsedAt: row.last_used_at ?? undefined,
    lastUsedBy: row.last_used_by_profile ? {
      id: row.last_used_by_profile.id,
      name: row.last_used_by_profile.full_name ?? 'Unknown',
    } : undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
    // Masked sensitive fields
    hasPassword: !!row.password,
    hasApiKey: !!row.api_key,
    hasApiSecret: !!row.api_secret,
    hasAccessToken: !!row.access_token,
    hasRefreshToken: !!row.refresh_token,
  }))
}

export async function getCredentialById(id: string): Promise<Credential | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credentials')
    .select(`
      *,
      category:credential_categories(id, name, icon, color),
      last_used_by_profile:profiles!credentials_last_used_by_fkey(id, full_name)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    categoryId: data.category_id ?? undefined,
    category: data.category ? {
      id: data.category.id,
      name: data.category.name,
      icon: data.category.icon ?? undefined,
      color: data.category.color ?? undefined,
      sortOrder: 0,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    } : undefined,
    name: data.name,
    description: data.description ?? undefined,
    credentialType: data.credential_type,
    username: data.username ?? undefined,
    password: data.password ?? undefined,
    email: data.email ?? undefined,
    apiKey: data.api_key ?? undefined,
    apiSecret: data.api_secret ?? undefined,
    accessToken: data.access_token ?? undefined,
    refreshToken: data.refresh_token ?? undefined,
    url: data.url ?? undefined,
    apiEndpoint: data.api_endpoint ?? undefined,
    additionalFields: data.additional_fields ?? undefined,
    accessLevel: data.access_level,
    isActive: data.is_active ?? true,
    expiresAt: data.expires_at ?? undefined,
    lastUsedAt: data.last_used_at ?? undefined,
    lastUsedBy: data.last_used_by_profile ? {
      id: data.last_used_by_profile.id,
      name: data.last_used_by_profile.full_name ?? 'Unknown',
    } : undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by ?? undefined,
    updatedBy: data.updated_by ?? undefined,
  }
}

// Get a specific sensitive field (for copying)
export async function getCredentialSecret(id: string, field: 'password' | 'apiKey' | 'apiSecret' | 'accessToken' | 'refreshToken'): Promise<string | null> {
  const supabase = await createClient()

  const fieldMap: Record<string, string> = {
    password: 'password',
    apiKey: 'api_key',
    apiSecret: 'api_secret',
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  }

  const { data, error } = await supabase
    .from('credentials')
    .select(fieldMap[field])
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null

  // Update last used
  await supabase
    .from('credentials')
    .update({
      last_used_at: new Date().toISOString(),
      // TODO: Set last_used_by from current user session
    })
    .eq('id', id)

  return data[fieldMap[field] as keyof typeof data] as string | null
}

export async function createCredential(input: CreateCredentialInput): Promise<Credential> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credentials')
    .insert({
      category_id: input.categoryId,
      name: input.name,
      description: input.description,
      credential_type: input.credentialType,
      username: input.username,
      password: input.password,
      email: input.email,
      api_key: input.apiKey,
      api_secret: input.apiSecret,
      access_token: input.accessToken,
      refresh_token: input.refreshToken,
      url: input.url,
      api_endpoint: input.apiEndpoint,
      additional_fields: input.additionalFields,
      access_level: input.accessLevel || 'superadmin_only',
      expires_at: input.expiresAt,
      notes: input.notes,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/credentials')

  return {
    id: data.id,
    categoryId: data.category_id ?? undefined,
    name: data.name,
    description: data.description ?? undefined,
    credentialType: data.credential_type,
    username: data.username ?? undefined,
    password: data.password ?? undefined,
    email: data.email ?? undefined,
    apiKey: data.api_key ?? undefined,
    apiSecret: data.api_secret ?? undefined,
    accessToken: data.access_token ?? undefined,
    refreshToken: data.refresh_token ?? undefined,
    url: data.url ?? undefined,
    apiEndpoint: data.api_endpoint ?? undefined,
    additionalFields: data.additional_fields ?? undefined,
    accessLevel: data.access_level,
    isActive: data.is_active ?? true,
    expiresAt: data.expires_at ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by ?? undefined,
    updatedBy: data.updated_by ?? undefined,
  }
}

export async function updateCredential(input: UpdateCredentialInput): Promise<Credential> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.categoryId !== undefined) update.category_id = input.categoryId
  if (input.name !== undefined) update.name = input.name
  if (input.description !== undefined) update.description = input.description
  if (input.credentialType !== undefined) update.credential_type = input.credentialType
  if (input.username !== undefined) update.username = input.username
  if (input.password !== undefined) update.password = input.password
  if (input.email !== undefined) update.email = input.email
  if (input.apiKey !== undefined) update.api_key = input.apiKey
  if (input.apiSecret !== undefined) update.api_secret = input.apiSecret
  if (input.accessToken !== undefined) update.access_token = input.accessToken
  if (input.refreshToken !== undefined) update.refresh_token = input.refreshToken
  if (input.url !== undefined) update.url = input.url
  if (input.apiEndpoint !== undefined) update.api_endpoint = input.apiEndpoint
  if (input.additionalFields !== undefined) update.additional_fields = input.additionalFields
  if (input.accessLevel !== undefined) update.access_level = input.accessLevel
  if (input.expiresAt !== undefined) update.expires_at = input.expiresAt
  if (input.notes !== undefined) update.notes = input.notes
  if (input.isActive !== undefined) update.is_active = input.isActive

  const { data, error } = await supabase
    .from('credentials')
    .update(update)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/credentials')

  return {
    id: data.id,
    categoryId: data.category_id ?? undefined,
    name: data.name,
    description: data.description ?? undefined,
    credentialType: data.credential_type,
    username: data.username ?? undefined,
    password: data.password ?? undefined,
    email: data.email ?? undefined,
    apiKey: data.api_key ?? undefined,
    apiSecret: data.api_secret ?? undefined,
    accessToken: data.access_token ?? undefined,
    refreshToken: data.refresh_token ?? undefined,
    url: data.url ?? undefined,
    apiEndpoint: data.api_endpoint ?? undefined,
    additionalFields: data.additional_fields ?? undefined,
    accessLevel: data.access_level,
    isActive: data.is_active ?? true,
    expiresAt: data.expires_at ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by ?? undefined,
    updatedBy: data.updated_by ?? undefined,
  }
}

export async function deleteCredential(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('credentials')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/credentials')
}

// ============================================================================
// JOB PORTAL CREDENTIALS (linking)
// ============================================================================

export async function getJobPortalCredentials(jobPortalId: string): Promise<JobPortalCredential[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_portal_credentials')
    .select(`
      *,
      credential:credentials(
        id, name, credential_type, username, email, url, is_active,
        category:credential_categories(name, icon, color)
      )
    `)
    .eq('job_portal_id', jobPortalId)

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    jobPortalId: row.job_portal_id,
    credentialId: row.credential_id,
    credential: row.credential ? {
      id: row.credential.id,
      name: row.credential.name,
      credentialType: row.credential.credential_type,
      username: row.credential.username ?? undefined,
      email: row.credential.email ?? undefined,
      url: row.credential.url ?? undefined,
      isActive: row.credential.is_active ?? true,
      accessLevel: 'superadmin_only' as const,
      createdAt: '',
      updatedAt: '',
      category: row.credential.category ? {
        id: '',
        name: row.credential.category.name,
        icon: row.credential.category.icon ?? undefined,
        color: row.credential.category.color ?? undefined,
        sortOrder: 0,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      } : undefined,
    } : undefined,
    isPrimary: row.is_primary ?? false,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function linkCredentialToPortal(
  jobPortalId: string,
  credentialId: string,
  isPrimary: boolean = false,
  notes?: string
): Promise<JobPortalCredential> {
  const supabase = await createClient()

  // If setting as primary, unset other primary credentials for this portal
  if (isPrimary) {
    await supabase
      .from('job_portal_credentials')
      .update({ is_primary: false })
      .eq('job_portal_id', jobPortalId)
  }

  const { data, error } = await supabase
    .from('job_portal_credentials')
    .insert({
      job_portal_id: jobPortalId,
      credential_id: credentialId,
      is_primary: isPrimary,
      notes,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/credentials')
  revalidatePath('/recruitment/job-portals')

  return {
    id: data.id,
    jobPortalId: data.job_portal_id,
    credentialId: data.credential_id,
    isPrimary: data.is_primary ?? false,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function unlinkCredentialFromPortal(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('job_portal_credentials')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/credentials')
  revalidatePath('/recruitment/job-portals')
}

// ============================================================================
// CREDENTIALS BY CATEGORY (for UI grouping)
// ============================================================================

export async function getCredentialsByCategory(): Promise<{
  category: CredentialCategory
  credentials: MaskedCredential[]
}[]> {
  const [categories, credentials] = await Promise.all([
    getCredentialCategories(),
    getCredentials(),
  ])

  const grouped = categories.map((category) => ({
    category,
    credentials: credentials.filter((c) => c.categoryId === category.id),
  }))

  // Add uncategorized credentials
  const uncategorized = credentials.filter((c) => !c.categoryId)
  if (uncategorized.length > 0) {
    grouped.push({
      category: {
        id: 'uncategorized',
        name: 'Uncategorized',
        icon: 'HelpCircle',
        color: 'gray',
        sortOrder: 999,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      credentials: uncategorized,
    })
  }

  return grouped
}
