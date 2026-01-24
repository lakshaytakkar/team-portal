'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logDatabaseError, getUserFriendlyErrorMessage } from '@/lib/utils/errors'
import type {
  DocumentCollection,
  DocumentType,
  EmployeeDocument,
  UploadEmployeeDocumentInput,
  CreateEmployeeDocumentInput,
  UpdateDocumentStatusInput,
  DocumentFilters,
} from '@/lib/types/employee-documents'

/**
 * Get all document collections
 */
export async function getDocumentCollections(): Promise<DocumentCollection[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('document_collections')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      logDatabaseError(error, 'getDocumentCollections')
      throw new Error(`Failed to fetch document collections: ${error.message}`)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by ?? undefined,
      updatedBy: row.updated_by ?? undefined,
    }))
  } catch (error) {
    logDatabaseError(error, 'getDocumentCollections')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get all document types, optionally filtered by collection
 */
export async function getDocumentTypes(collectionId?: string): Promise<DocumentType[]> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('document_types')
      .select(`
        *,
        collection:document_collections(id, name, description)
      `)
      .order('name', { ascending: true })

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getDocumentTypes')
      throw new Error(`Failed to fetch document types: ${error.message}`)
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      collectionId: row.collection_id ?? undefined,
      collection: row.collection
        ? {
            id: row.collection.id,
            name: row.collection.name,
            description: row.collection.description ?? undefined,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          }
        : undefined,
      isKyc: row.is_kyc,
      isSignedDocument: row.is_signed_document,
      expiryTracking: row.expiry_tracking,
      createdAt: row.created_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getDocumentTypes')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get all documents for an employee, with optional filters
 */
export async function getEmployeeDocuments(
  employeeId: string,
  filters?: DocumentFilters
): Promise<EmployeeDocument[]> {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('employee_documents')
      .select(`
        *,
        document_type:document_types(
          id,
          name,
          collection_id,
          is_kyc,
          is_signed_document,
          expiry_tracking,
          collection:document_collections(id, name, description)
        ),
        collection:document_collections(id, name, description),
        uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(id, full_name, email),
        issued_by_profile:profiles!employee_documents_issued_by_fkey(id, full_name, email),
        signed_by_profile:profiles!employee_documents_signed_by_fkey(id, full_name, email)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })

    if (filters?.collectionId) {
      query = query.eq('collection_id', filters.collectionId)
    }

    if (filters?.collectionStatus) {
      query = query.eq('collection_status', filters.collectionStatus)
    }

    if (filters?.documentStatus) {
      query = query.eq('document_status', filters.documentStatus)
    }

    if (filters?.documentTypeId) {
      query = query.eq('document_type_id', filters.documentTypeId)
    }

    const { data, error } = await query

    if (error) {
      logDatabaseError(error, 'getEmployeeDocuments')
      throw new Error(`Failed to fetch employee documents: ${error.message}`)
    }

    // Apply search filter in memory if provided
    let documents = data || []
    if (filters?.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      documents = documents.filter(
        (doc: any) =>
          doc.name.toLowerCase().includes(searchLower) ||
          doc.file_name.toLowerCase().includes(searchLower) ||
          doc.document_type?.name.toLowerCase().includes(searchLower)
      )
    }

    return documents.map((row: any) => ({
      id: row.id,
      employeeId: row.employee_id,
      documentTypeId: row.document_type_id,
      documentType: row.document_type
        ? {
            id: row.document_type.id,
            name: row.document_type.name,
            collectionId: row.document_type.collection_id ?? undefined,
            isKyc: row.document_type.is_kyc,
            isSignedDocument: row.document_type.is_signed_document,
            expiryTracking: row.document_type.expiry_tracking,
            createdAt: '',
          }
        : undefined,
      collectionId: row.collection_id,
      collection: row.collection
        ? {
            id: row.collection.id,
            name: row.collection.name,
            description: row.collection.description ?? undefined,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          }
        : undefined,
      name: row.name,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      collectionStatus: row.collection_status,
      documentStatus: row.document_status ?? undefined,
      expiryDate: row.expiry_date ?? undefined,
      issuedDate: row.issued_date ?? undefined,
      signedDate: row.signed_date ?? undefined,
      uploadedBy: row.uploaded_by ?? undefined,
      uploadedByProfile: row.uploaded_by_profile
        ? {
            id: row.uploaded_by_profile.id,
            name: row.uploaded_by_profile.full_name || '',
            email: row.uploaded_by_profile.email ?? undefined,
          }
        : undefined,
      issuedBy: row.issued_by ?? undefined,
      issuedByProfile: row.issued_by_profile
        ? {
            id: row.issued_by_profile.id,
            name: row.issued_by_profile.full_name || '',
            email: row.issued_by_profile.email ?? undefined,
          }
        : undefined,
      signedBy: row.signed_by ?? undefined,
      signedByProfile: row.signed_by_profile
        ? {
            id: row.signed_by_profile.id,
            name: row.signed_by_profile.full_name || '',
            email: row.signed_by_profile.email ?? undefined,
          }
        : undefined,
      notes: row.notes ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by ?? undefined,
      updatedBy: row.updated_by ?? undefined,
    }))
  } catch (error) {
    logDatabaseError(error, 'getEmployeeDocuments')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Upload document file to Supabase Storage
 * Returns the file path in storage
 */
export async function uploadDocumentFile(
  file: File,
  employeeId: string,
  documentId: string
): Promise<string> {
  const supabase = await createClient()

  try {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit')
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ]
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed types: PDF, PNG, JPEG, JPG')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedFileName}`
    const filePath = `${employeeId}/${documentId}/${filename}`

    // Upload to Supabase Storage bucket 'employee-documents'
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logDatabaseError(error, 'uploadDocumentFile')
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    return filePath
  } catch (error) {
    logDatabaseError(error, 'uploadDocumentFile')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Get signed URL for document download
 */
export async function getDocumentUrl(documentId: string): Promise<string> {
  const supabase = await createClient()

  try {
    // First get the document to retrieve file_path
    const { data: document, error: docError } = await supabase
      .from('employee_documents')
      .select('file_path')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      throw new Error('Document not found')
    }

    // Get signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .createSignedUrl(document.file_path, 3600)

    if (error || !data) {
      logDatabaseError(error, 'getDocumentUrl')
      throw new Error(`Failed to generate document URL: ${error?.message || 'Unknown error'}`)
    }

    return data.signedUrl
  } catch (error) {
    logDatabaseError(error, 'getDocumentUrl')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Upload employee document (for KYC/docs collected from employees)
 */
export async function uploadEmployeeDocument(
  input: UploadEmployeeDocumentInput
): Promise<EmployeeDocument> {
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!input.employeeId || !input.documentTypeId || !input.collectionId || !input.name || !input.file) {
      throw new Error('Employee ID, document type, collection, name, and file are required')
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    const uploadedBy = user?.id ?? null

    // Create document record first (to get ID for file path)
    const { data: newDocument, error: createError } = await supabase
      .from('employee_documents')
      .insert({
        employee_id: input.employeeId,
        document_type_id: input.documentTypeId,
        collection_id: input.collectionId,
        name: input.name,
        file_name: input.file.name,
        file_path: '', // Will be updated after upload
        file_size: input.file.size,
        mime_type: input.file.type,
        collection_status: input.collectionStatus,
        expiry_date: input.expiryDate || null,
        notes: input.notes || null,
        uploaded_by: uploadedBy,
        created_by: uploadedBy,
        updated_by: uploadedBy,
      })
      .select('id')
      .single()

    if (createError || !newDocument) {
      logDatabaseError(createError, 'uploadEmployeeDocument')
      throw new Error(getUserFriendlyErrorMessage(createError || new Error('Failed to create document record')))
    }

    // Upload file to storage
    const filePath = await uploadDocumentFile(input.file, input.employeeId, newDocument.id)

    // Update document record with file path
    const { data: updatedDocument, error: updateError } = await supabase
      .from('employee_documents')
      .update({ file_path: filePath })
      .eq('id', newDocument.id)
      .select(`
        *,
        document_type:document_types(*),
        collection:document_collections(*)
      `)
      .single()

    if (updateError || !updatedDocument) {
      // Clean up: delete the document record if file upload succeeded but update failed
      await supabase.from('employee_documents').delete().eq('id', newDocument.id)
      logDatabaseError(updateError, 'uploadEmployeeDocument')
      throw new Error(getUserFriendlyErrorMessage(updateError || new Error('Failed to update document record')))
    }

    revalidatePath(`/hr/employees/${input.employeeId}`)

    // Return formatted document
    const fullDocument = await getEmployeeDocuments(input.employeeId)
    const document = fullDocument.find((d) => d.id === newDocument.id)
    if (!document) {
      throw new Error('Failed to retrieve uploaded document')
    }

    return document
  } catch (error) {
    logDatabaseError(error, 'uploadEmployeeDocument')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Create employee document (for issued documents like contracts)
 * Accepts either filePath (for pre-uploaded files) or file (to upload)
 */
export async function createEmployeeDocument(
  input: CreateEmployeeDocumentInput
): Promise<EmployeeDocument> {
  const supabase = await createClient()

  try {
    // Validate required fields
    if (!input.employeeId || !input.documentTypeId || !input.collectionId || !input.name) {
      throw new Error('Employee ID, document type, collection, and name are required')
    }

    if (!input.filePath && !input.file) {
      throw new Error('Either file path or file is required')
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    const issuedBy = user?.id ?? null

    let filePath = input.filePath
    let fileName = input.fileName
    let fileSize = input.fileSize
    let mimeType = input.mimeType

    // If file is provided, upload it
    if (input.file) {
      // Create document record first (to get ID for file path)
      const { data: tempDoc, error: tempError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: input.employeeId,
          document_type_id: input.documentTypeId,
          collection_id: input.collectionId,
          name: input.name,
          file_name: input.file.name,
          file_path: '', // Will be updated after upload
          file_size: input.file.size,
          mime_type: input.file.type,
          collection_status: 'collected',
          document_status: 'draft',
          issued_date: input.issuedDate || null,
          issued_by: issuedBy,
          notes: input.notes || null,
          created_by: issuedBy,
          updated_by: issuedBy,
        })
        .select('id')
        .single()

      if (tempError || !tempDoc) {
        logDatabaseError(tempError, 'createEmployeeDocument')
        throw new Error(getUserFriendlyErrorMessage(tempError || new Error('Failed to create document record')))
      }

      // Upload file using the document ID
      filePath = await uploadDocumentFile(input.file, input.employeeId, tempDoc.id)
      fileName = input.file.name
      fileSize = input.file.size
      mimeType = input.file.type

      // Update document record with file path
      const { data: updatedDoc, error: updateError } = await supabase
        .from('employee_documents')
        .update({ file_path: filePath })
        .eq('id', tempDoc.id)
        .select(`
          *,
          document_type:document_types(*),
          collection:document_collections(*)
        `)
        .single()

      if (updateError || !updatedDoc) {
        // Clean up: delete the document record if update failed
        await supabase.from('employee_documents').delete().eq('id', tempDoc.id)
        logDatabaseError(updateError, 'createEmployeeDocument')
        throw new Error(getUserFriendlyErrorMessage(updateError || new Error('Failed to update document record')))
      }

      revalidatePath(`/hr/employees/${input.employeeId}`)

      // Return formatted document
      const fullDocument = await getEmployeeDocuments(input.employeeId)
      const document = fullDocument.find((d) => d.id === tempDoc.id)
      if (!document) {
        throw new Error('Failed to retrieve created document')
      }

      return document
    } else {
      // Use provided file path (file already uploaded)
      const { data: newDocument, error: createError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: input.employeeId,
          document_type_id: input.documentTypeId,
          collection_id: input.collectionId,
          name: input.name,
          file_name: fileName,
          file_path: filePath!,
          file_size: fileSize,
          mime_type: mimeType,
          collection_status: 'collected',
          document_status: 'draft',
          issued_date: input.issuedDate || null,
          issued_by: issuedBy,
          notes: input.notes || null,
          created_by: issuedBy,
          updated_by: issuedBy,
        })
        .select(`
          *,
          document_type:document_types(*),
          collection:document_collections(*)
        `)
        .single()

      if (createError || !newDocument) {
        logDatabaseError(createError, 'createEmployeeDocument')
        throw new Error(getUserFriendlyErrorMessage(createError || new Error('Failed to create document')))
      }

      revalidatePath(`/hr/employees/${input.employeeId}`)

      // Return formatted document
      const fullDocument = await getEmployeeDocuments(input.employeeId)
      const document = fullDocument.find((d) => d.id === newDocument.id)
      if (!document) {
        throw new Error('Failed to retrieve created document')
      }

      return document
    }
  } catch (error) {
    logDatabaseError(error, 'createEmployeeDocument')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  input: UpdateDocumentStatusInput
): Promise<EmployeeDocument> {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    const updatedBy = user?.id ?? null

    // Build update object
    const updateData: any = {
      updated_by: updatedBy,
    }

    if (input.collectionStatus) {
      updateData.collection_status = input.collectionStatus
    }

    if (input.documentStatus) {
      updateData.document_status = input.documentStatus

      // If marking as signed, set signed_date
      if (input.documentStatus === 'signed') {
        updateData.signed_date = input.signedDate || new Date().toISOString().split('T')[0]
        // Also set signed_by to the current user (or employee if different)
        updateData.signed_by = updatedBy
      }
    }

    // Update document
    const { data: updatedDocument, error: updateError } = await supabase
      .from('employee_documents')
      .update(updateData)
      .eq('id', input.documentId)
      .select(`
        *,
        document_type:document_types(*),
        collection:document_collections(*)
      `)
      .single()

    if (updateError || !updatedDocument) {
      logDatabaseError(updateError, 'updateDocumentStatus')
      throw new Error(getUserFriendlyErrorMessage(updateError || new Error('Failed to update document status')))
    }

    // Get employee_id for revalidation
    const employeeId = updatedDocument.employee_id
    revalidatePath(`/hr/employees/${employeeId}`)

    // Return formatted document
    const fullDocument = await getEmployeeDocuments(employeeId)
    const document = fullDocument.find((d) => d.id === input.documentId)
    if (!document) {
      throw new Error('Failed to retrieve updated document')
    }

    return document
  } catch (error) {
    logDatabaseError(error, 'updateDocumentStatus')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

/**
 * Delete employee document (and file from storage)
 */
export async function deleteEmployeeDocument(documentId: string): Promise<void> {
  const supabase = await createClient()

  try {
    // Get document to retrieve file_path and employee_id
    const { data: document, error: docError } = await supabase
      .from('employee_documents')
      .select('file_path, employee_id, document_status')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      throw new Error('Document not found')
    }

    // Prevent deletion of signed documents (suggest archiving instead)
    if (document.document_status === 'signed') {
      throw new Error('Cannot delete signed documents. Please archive them instead.')
    }

    // Delete file from storage
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('employee-documents')
        .remove([document.file_path])

      if (storageError) {
        // Log but don't fail - file might already be deleted
        console.warn('Failed to delete file from storage:', storageError)
      }
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      logDatabaseError(deleteError, 'deleteEmployeeDocument')
      throw new Error(getUserFriendlyErrorMessage(deleteError))
    }

    revalidatePath(`/hr/employees/${document.employee_id}`)
  } catch (error) {
    logDatabaseError(error, 'deleteEmployeeDocument')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}
