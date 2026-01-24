/**
 * Task attachment types
 */

export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskAttachmentInput {
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

