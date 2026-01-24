'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TaskAttachment, CreateTaskAttachmentInput } from '@/lib/types/task-attachment'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'

/**
 * Get current user from session
 */
async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}

/**
 * Get user role from profile
 */
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

/**
 * Get team member IDs for a manager
 */
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

/**
 * Check if user can view/edit a task (same permission logic as getTaskById)
 */
async function canAccessTask(taskId: string, requireEdit: boolean = false): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    const role = await getUserRole(user.id)
    
    const { data: task, error } = await supabase
      .from('tasks')
      .select('assigned_to_id')
      .eq('id', taskId)
      .is('deleted_at', null)
      .single()
    
    if (error || !task) {
      return false
    }
    
    // Check permissions (same as getTaskById)
    if (role === 'executive') {
      return task.assigned_to_id === user.id
    }
    
    if (role === 'manager') {
      const teamMemberIds = await getTeamMemberIds(user.id)
      return task.assigned_to_id === user.id || teamMemberIds.includes(task.assigned_to_id)
    }
    
    // SuperAdmin can access all tasks
    return true
  } catch (error) {
    logDatabaseError(error, 'canAccessTask')
    return false
  }
}

/**
 * Upload a file to Supabase Storage for task attachments
 */
export async function uploadTaskAttachment(
  file: File,
  taskId: string
): Promise<{ url: string; fileName: string; fileSize: number; mimeType: string }> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Check if user can access the task
    const canAccess = await canAccessTask(taskId, true)
    if (!canAccess) {
      throw new Error('Not authorized to upload attachments to this task')
    }
    
    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024 // 25MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 25MB limit')
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, ZIP')
    }
    
    // Generate unique file name
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${taskId}/${timestamp}_${sanitizedFileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })
    
    if (error) {
      logDatabaseError(error, 'uploadTaskAttachment')
      throw new Error(`Failed to upload file: ${error.message}`)
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(fileName)
    
    if (!urlData?.publicUrl) {
      throw new Error('Failed to get file URL')
    }
    
    return {
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }
  } catch (error) {
    logDatabaseError(error, 'uploadTaskAttachment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Create a task attachment record in the database
 */
export async function createTaskAttachment(
  input: CreateTaskAttachmentInput
): Promise<TaskAttachment> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Check if user can access the task
    const canAccess = await canAccessTask(input.taskId, true)
    if (!canAccess) {
      throw new Error('Not authorized to add attachments to this task')
    }
    
    const { data: attachment, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: input.taskId,
        file_name: input.fileName,
        file_url: input.fileUrl,
        file_size: input.fileSize,
        mime_type: input.mimeType,
        uploaded_by: user.id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      logDatabaseError(error, 'createTaskAttachment')
      throw new Error(`Failed to create attachment: ${error.message}`)
    }
    
    revalidatePath(`/tasks/${input.taskId}`)
    
    return {
      id: attachment.id,
      taskId: attachment.task_id,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      fileSize: attachment.file_size,
      mimeType: attachment.mime_type,
      uploadedBy: attachment.uploaded_by || undefined,
      createdAt: attachment.created_at,
      updatedAt: attachment.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createTaskAttachment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Get all attachments for a task
 */
export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const supabase = await createClient()
  
  try {
    // Check if user can access the task
    const canAccess = await canAccessTask(taskId, false)
    if (!canAccess) {
      throw new Error('Not authorized to view attachments for this task')
    }
    
    const { data: attachments, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      logDatabaseError(error, 'getTaskAttachments')
      throw new Error(`Failed to fetch attachments: ${error.message}`)
    }
    
    return (attachments || []).map((att) => ({
      id: att.id,
      taskId: att.task_id,
      fileName: att.file_name,
      fileUrl: att.file_url,
      fileSize: att.file_size,
      mimeType: att.mime_type,
      uploadedBy: att.uploaded_by || undefined,
      createdAt: att.created_at,
      updatedAt: att.updated_at,
    }))
  } catch (error) {
    logDatabaseError(error, 'getTaskAttachments')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

/**
 * Delete a task attachment
 */
export async function deleteTaskAttachment(attachmentId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const user = await getCurrentUser()
    
    // Get attachment to find task_id for revalidation and permission check
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('task_id, file_url')
      .eq('id', attachmentId)
      .single()
    
    if (!attachment) {
      throw new Error('Attachment not found')
    }
    
    // Check if user can access the task
    const canAccess = await canAccessTask(attachment.task_id, true)
    if (!canAccess) {
      throw new Error('Not authorized to delete attachments from this task')
    }
    
    // Soft delete the attachment record
    const { error: deleteError } = await supabase
      .from('task_attachments')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', attachmentId)
    
    if (deleteError) {
      logDatabaseError(deleteError, 'deleteTaskAttachment')
      throw new Error(`Failed to delete attachment: ${deleteError.message}`)
    }
    
    // Optionally delete from storage (or keep for audit)
    // For now, we'll keep files in storage but mark as deleted in DB
    
    revalidatePath(`/tasks/${attachment.task_id}`)
  } catch (error) {
    logDatabaseError(error, 'deleteTaskAttachment')
    throw new Error(getUserFriendlyErrorMessage(error))
  }
}

