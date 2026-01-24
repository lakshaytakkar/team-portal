/**
 * Employee Documents Types
 */

export type CollectionStatus = 'pending' | 'collected' | 'expired' | 'missing'
export type DocumentStatus = 'draft' | 'issued' | 'signed' | 'archived'

export interface DocumentCollection {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface DocumentType {
  id: string
  name: string
  collectionId?: string
  collection?: DocumentCollection
  isKyc: boolean
  isSignedDocument: boolean
  expiryTracking: boolean
  createdAt: string
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  documentTypeId: string
  documentType?: DocumentType
  collectionId: string
  collection?: DocumentCollection
  name: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  collectionStatus: CollectionStatus
  documentStatus?: DocumentStatus
  expiryDate?: string
  issuedDate?: string
  signedDate?: string
  uploadedBy?: string
  uploadedByProfile?: {
    id: string
    name: string
    email?: string
  }
  issuedBy?: string
  issuedByProfile?: {
    id: string
    name: string
    email?: string
  }
  signedBy?: string
  signedByProfile?: {
    id: string
    name: string
    email?: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateDocumentCollectionInput {
  name: string
  description?: string
}

export interface CreateDocumentTypeInput {
  name: string
  collectionId?: string
  isKyc?: boolean
  isSignedDocument?: boolean
  expiryTracking?: boolean
}

export interface UploadEmployeeDocumentInput {
  employeeId: string
  documentTypeId: string
  collectionId: string
  name: string
  file: File
  collectionStatus: CollectionStatus
  expiryDate?: string
  notes?: string
}

export interface CreateEmployeeDocumentInput {
  employeeId: string
  documentTypeId: string
  collectionId: string
  name: string
  filePath?: string // Optional if file is provided
  fileName?: string // Optional if file is provided
  fileSize?: number // Optional if file is provided
  mimeType?: string // Optional if file is provided
  file?: File // Optional if filePath is provided
  issuedDate?: string
  notes?: string
}

export interface UpdateDocumentStatusInput {
  documentId: string
  collectionStatus?: CollectionStatus
  documentStatus?: DocumentStatus
  signedDate?: string
}

export interface CollectionCompleteness {
  collectionId: string
  collectionName: string
  totalRequired: number
  collected: number
  pending: number
  expired: number
  missing: number
  isComplete: boolean
}

export interface DocumentFilters {
  collectionId?: string
  collectionStatus?: CollectionStatus
  documentStatus?: DocumentStatus
  documentTypeId?: string
  searchQuery?: string
}
