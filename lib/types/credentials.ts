export type CredentialType = 'login' | 'api_key' | 'oauth' | 'ssh_key' | 'token' | 'other'
export type CredentialAccessLevel = 'superadmin_only' | 'managers' | 'hr_team' | 'all_staff'

export interface CredentialCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Credential {
  id: string
  categoryId?: string
  category?: CredentialCategory

  // Basic info
  name: string
  description?: string
  credentialType: CredentialType

  // Login credentials
  username?: string
  password?: string
  email?: string

  // API credentials
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  refreshToken?: string

  // URLs
  url?: string
  apiEndpoint?: string

  // Additional data
  additionalFields?: Record<string, unknown>

  // Security
  accessLevel: CredentialAccessLevel
  isActive: boolean

  // Expiry tracking
  expiresAt?: string
  lastUsedAt?: string
  lastUsedBy?: {
    id: string
    name: string
  }

  // Notes
  notes?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface JobPortalCredential {
  id: string
  jobPortalId: string
  credentialId: string
  credential?: Credential
  isPrimary: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

// For displaying credentials with masked sensitive fields
export interface MaskedCredential extends Omit<Credential, 'password' | 'apiKey' | 'apiSecret' | 'accessToken' | 'refreshToken'> {
  hasPassword: boolean
  hasApiKey: boolean
  hasApiSecret: boolean
  hasAccessToken: boolean
  hasRefreshToken: boolean
}

// Input types for creating/updating
export interface CreateCredentialInput {
  categoryId?: string
  name: string
  description?: string
  credentialType: CredentialType
  username?: string
  password?: string
  email?: string
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  refreshToken?: string
  url?: string
  apiEndpoint?: string
  additionalFields?: Record<string, unknown>
  accessLevel?: CredentialAccessLevel
  expiresAt?: string
  notes?: string
}

export interface UpdateCredentialInput extends Partial<CreateCredentialInput> {
  id: string
  isActive?: boolean
}

export interface CreateCredentialCategoryInput {
  name: string
  description?: string
  icon?: string
  color?: string
  sortOrder?: number
}

export interface UpdateCredentialCategoryInput extends Partial<CreateCredentialCategoryInput> {
  id: string
  isActive?: boolean
}
