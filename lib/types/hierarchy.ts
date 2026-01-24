/**
 * Type definitions for organizational hierarchy
 * Organization → Vertical → Department → Team → Role → Position
 */

export interface Organization {
  id: string
  name: string
  code: string | null
  description: string | null
  country: string | null
  registrationNumber: string | null
  taxId: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  phone: string | null
  email: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  deletedAt: string | null
}

export type VerticalType = 'service' | 'product' | 'saas' | 'dropship'

export interface Vertical {
  id: string
  name: string
  code: string | null
  description: string | null
  type: VerticalType | null
  organizationId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  deletedAt: string | null
}

export interface Role {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  deletedAt: string | null
}

export interface Team {
  id: string
  departmentId: string
  verticalId: string | null
  name: string
  code: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  deletedAt: string | null
  // Joined data
  department?: {
    id: string
    name: string
    code: string | null
  }
  vertical?: {
    id: string
    name: string
    code: string | null
  } | null
}

export interface Position {
  id: string
  employeeId: string
  teamId: string
  roleId: string
  title: string | null
  isPrimary: boolean
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  deletedAt: string | null
  // Joined data
  team?: Team
  role?: Role
  employee?: {
    id: string
    employeeId: string
    fullName: string
    email: string
  }
}

// Form input types
export interface CreateOrganizationInput {
  name: string
  code?: string
  description?: string
  country?: string
  registrationNumber?: string
  taxId?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
}

export interface UpdateOrganizationInput {
  id: string
  name?: string
  code?: string
  description?: string
  country?: string
  registrationNumber?: string
  taxId?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
  isActive?: boolean
}

export interface CreateVerticalInput {
  name: string
  code?: string
  description?: string
  type?: VerticalType | null
  organizationId?: string | null
}

export interface UpdateVerticalInput {
  id: string
  name?: string
  code?: string
  description?: string
  type?: VerticalType | null
  organizationId?: string | null
  isActive?: boolean
}

export interface CreateRoleInput {
  name: string
  description?: string
}

export interface UpdateRoleInput {
  id: string
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreatePositionInput {
  employeeId: string
  teamId: string
  roleId: string
  title?: string
  isPrimary?: boolean
  startDate?: string
  endDate?: string
}

export interface UpdatePositionInput {
  id: string
  teamId?: string
  roleId?: string
  title?: string
  isPrimary?: boolean
  startDate?: string
  endDate?: string
  isActive?: boolean
}


