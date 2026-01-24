export type UserRole = "executive" | "manager" | "superadmin"
export type UserStatus = "active" | "inactive" | "suspended"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  department?: string
  phoneNumber?: string
  username?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

