'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import type {
  PersonalDocument,
  CreatePersonalDocumentInput,
  UpdatePersonalDocumentInput,
  PersonalDocumentFilters,
} from '@/lib/types/personal-documents'

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

function transformPersonalDocument(row: any): PersonalDocument {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type || undefined,
    size: row.size || 0,
    url: row.url,
    mimeType: row.mime_type || undefined,
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ? {
      id: row.created_by.id,
      name: row.created_by.full_name || 'Unknown',
    } : undefined,
    updatedBy: row.updated_by ? {
      id: row.updated_by.id,
      name: row.updated_by.full_name || 'Unknown',
    } : undefined,
    user: row.user ? {
      id: row.user.id,
      name: row.user.full_name || 'Unknown',
      email: row.user.email || undefined,
      avatar: row.user.avatar_url || undefined,
    } : undefined,
  }
}

// ============================================================================
// PERSONAL DOCUMENTS ACTIONS
// ============================================================================

/**
 * Get personal documents
 */
export async function getPersonalDocuments(
  filters?: PersonalDocumentFilters,
  userId?: string
): Promise<PersonalDocument[]> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    let query = supabase
      .from('personal_documents')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!personal_documents_created_by_fkey(id, full_name),
        updated_by:profiles!personal_documents_updated_by_fkey(id, full_name)
      `)
      .order('uploaded_at', { ascending: false })
    
    // Role-based filtering
    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      // For non-superadmin, only show own records
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'superadmin') {
        query = query.eq('user_id', user.id)
      }
    }
    
    // Apply filters
    if (filters) {
      if (filters.userId && filters.userId.length > 0) {
        query = query.in('user_id', filters.userId)
      }
      
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%`)
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      logDatabaseError(error, 'getPersonalDocuments')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    return (data || []).map(transformPersonalDocument)
  } catch (error) {
    logDatabaseError(error, 'getPersonalDocuments')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get personal document by ID
 */
export async function getPersonalDocumentById(id: string): Promise<PersonalDocument | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('personal_documents')
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!personal_documents_created_by_fkey(id, full_name),
        updated_by:profiles!personal_documents_updated_by_fkey(id, full_name)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logDatabaseError(error, 'getPersonalDocumentById')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    if (!data) return null
    
    return transformPersonalDocument(data)
  } catch (error) {
    logDatabaseError(error, 'getPersonalDocumentById')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create personal document
 * Note: File upload should be handled separately via Supabase Storage
 * This function expects the file to already be uploaded and URL provided
 */
export async function createPersonalDocument(input: CreatePersonalDocumentInput): Promise<PersonalDocument> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // For non-superadmin, only create for self
    let targetUserId = user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'superadmin') {
      targetUserId = user.id
    }
    
    // If file is provided, upload to Supabase Storage first
    let fileUrl = input.url
    let fileName = input.name
    let fileSize = 0
    let mimeType = ''
    
    if (input.file) {
      // Upload file to Supabase Storage
      const fileExt = input.file.name.split('.').pop()
      const filePath = `${targetUserId}/${Date.now()}-${input.file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('personal-documents')
        .upload(filePath, input.file, {
          contentType: input.file.type,
          upsert: false,
        })
      
      if (uploadError) {
        logDatabaseError(uploadError, 'createPersonalDocument - upload')
        throw new Error(`Failed to upload file: ${uploadError.message}`)
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('personal-documents')
        .getPublicUrl(filePath)
      
      fileUrl = urlData.publicUrl
      fileName = input.file.name
      fileSize = input.file.size
      mimeType = input.file.type
    }
    
    if (!fileUrl) {
      throw new Error('File URL is required')
    }
    
    // Determine type from mime type or file extension
    let docType = input.type
    if (!docType && mimeType) {
      if (mimeType.startsWith('image/')) {
        docType = 'image'
      } else if (mimeType.includes('pdf')) {
        docType = 'pdf'
      } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        docType = 'spreadsheet'
      } else if (mimeType.includes('document') || mimeType.includes('word')) {
        docType = 'document'
      } else {
        docType = 'other'
      }
    }
    
    const { data, error } = await supabase
      .from('personal_documents')
      .insert({
        user_id: targetUserId,
        name: fileName,
        type: normalizeOptional(docType),
        size: fileSize,
        url: fileUrl,
        mime_type: normalizeOptional(mimeType),
        uploaded_at: new Date().toISOString(),
        created_by: user.id,
        updated_by: user.id,
      })
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!personal_documents_created_by_fkey(id, full_name),
        updated_by:profiles!personal_documents_updated_by_fkey(id, full_name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'createPersonalDocument')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-documents')
    revalidatePath('/admin/documents')
    
    return transformPersonalDocument(data)
  } catch (error) {
    logDatabaseError(error, 'createPersonalDocument')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Update personal document
 */
export async function updatePersonalDocument(
  id: string,
  input: UpdatePersonalDocumentInput
): Promise<PersonalDocument> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    const updateData: any = {
      updated_by: user.id,
    }
    
    if (input.name !== undefined) {
      updateData.name = input.name
    }
    if (input.type !== undefined) {
      updateData.type = normalizeOptional(input.type)
    }
    
    const { data, error } = await supabase
      .from('personal_documents')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:profiles(id, full_name, email, avatar_url),
        created_by:profiles!personal_documents_created_by_fkey(id, full_name),
        updated_by:profiles!personal_documents_updated_by_fkey(id, full_name)
      `)
      .single()
    
    if (error) {
      logDatabaseError(error, 'updatePersonalDocument')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    revalidatePath('/my-documents')
    revalidatePath('/admin/documents')
    revalidatePath(`/my-documents/${id}`)
    revalidatePath(`/admin/documents/${id}`)
    
    return transformPersonalDocument(data)
  } catch (error) {
    logDatabaseError(error, 'updatePersonalDocument')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete personal document
 */
export async function deletePersonalDocument(id: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    // Get document to delete file from storage
    const { data: document } = await supabase
      .from('personal_documents')
      .select('url')
      .eq('id', id)
      .single()
    
    // Delete from database
    const { error } = await supabase
      .from('personal_documents')
      .delete()
      .eq('id', id)
    
    if (error) {
      logDatabaseError(error, 'deletePersonalDocument')
      throw new Error(getUserFriendlyErrorMessage(error))
    }
    
    // Try to delete file from storage (non-blocking)
    if (document?.url) {
      // Extract file path from URL
      const urlParts = document.url.split('/personal-documents/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage
          .from('personal-documents')
          .remove([filePath])
          .catch((err) => {
            // Log but don't fail if file deletion fails
            console.error('Failed to delete file from storage:', err)
          })
      }
    }
    
    revalidatePath('/my-documents')
    revalidatePath('/admin/documents')
  } catch (error) {
    logDatabaseError(error, 'deletePersonalDocument')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get document download URL (signed URL for private files)
 */
export async function getPersonalDocumentUrl(id: string): Promise<string | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('personal_documents')
      .select('url')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return null
    }
    
    // If URL is already public, return it
    if (data.url.startsWith('http')) {
      return data.url
    }
    
    // Otherwise, generate signed URL
    const urlParts = data.url.split('/personal-documents/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      const { data: signedUrlData } = await supabase.storage
        .from('personal-documents')
        .createSignedUrl(filePath, 3600) // 1 hour expiry
      
      return signedUrlData?.signedUrl || null
    }
    
    return data.url
  } catch (error) {
    logDatabaseError(error, 'getPersonalDocumentUrl')
    return null
  }
}

