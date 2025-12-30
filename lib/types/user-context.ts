/**
 * User context types for v1 authorization
 * Simplified to support superadmin (including CEO) and employee roles
 */

export type UserRole = 'superadmin' | 'employee'

export interface UserContext {
  userId: string
  email: string
  name: string
  avatar?: string | null
  role: UserRole
  isSuperadmin: boolean
  // Future-proofing: these can be added later
  departmentId?: string | null
  departmentCode?: string | null
  verticalIds?: string[]
  permissions?: Record<string, boolean>
}

