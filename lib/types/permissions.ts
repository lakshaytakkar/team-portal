export interface Permission {
  key: string // e.g., "projects.create"
  label: string
  description?: string
}

export interface ModulePermissionGroup {
  moduleId: string
  moduleName: string
  permissions: Permission[]
}

export interface RolePermissions {
  [permissionKey: string]: boolean
}

export type UserRole = "executive" | "manager" | "superadmin"

