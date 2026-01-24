export interface PersonalDocument {
  id: string
  userId: string
  name: string
  type?: string
  size: number
  url: string
  mimeType?: string
  uploadedAt: string
  createdAt: string
  updatedAt: string
  createdBy?: { id: string; name: string }
  updatedBy?: { id: string; name: string }
  // Related data
  user?: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
}

// Input types
export interface CreatePersonalDocumentInput {
  name: string
  type?: string
  file: File
  url?: string // Optional if file is provided
}

export interface UpdatePersonalDocumentInput {
  name?: string
  type?: string
}

// Filter types
export interface PersonalDocumentFilters {
  userId?: string[]
  type?: string[]
  search?: string
}

