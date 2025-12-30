export type EmployeeStatus = "active" | "on-leave" | "terminated" | "resigned"
export type OnboardingStatus = "pending" | "in-progress" | "completed" | "on-hold"
export type RoleType = "client_facing" | "internal" | "hybrid"

export interface HRUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Employee {
  id: string
  employeeId: string
  fullName: string
  email: string
  phone?: string
  department: string // Deprecated: use positions[].team.department.name instead
  position: string // Deprecated: use positions[].role.name instead
  status: EmployeeStatus
  roleType: RoleType
  hireDate: string
  manager?: HRUser
  avatar?: string
  candidateId?: string
  createdAt: string
  updatedAt: string
  // New hierarchy fields
  positions?: import('./hierarchy').Position[]
  primaryPosition?: import('./hierarchy').Position
  vertical?: import('./hierarchy').Vertical | null
  team?: import('./hierarchy').Team | null
  role?: import('./hierarchy').Role | null
}

export interface OnboardingTask {
  id: string
  title: string
  description?: string
  assignedTo?: HRUser
  dueDate?: string
  completed: boolean
  completedAt?: string
}

export interface Onboarding {
  id: string
  employeeId: string
  employeeName: string
  status: OnboardingStatus
  startDate: string
  completionDate?: string
  tasks: OnboardingTask[]
  assignedTo: HRUser
  notes?: string
  createdAt: string
  updatedAt: string
}

export type HRTemplateType = 'message' | 'form' | 'policy' | 'printable'

export interface HRTemplate {
  id: string
  name: string
  type: HRTemplateType
  category: string
  description?: string
  content: string
  channel?: 'whatsapp' | 'email'
  variables?: Record<string, string>
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: HRUser
}

export type AssetStatus = "available" | "assigned" | "maintenance" | "retired"

export interface AssetType {
  id: string
  name: string
  icon?: string
}

export interface Asset {
  id: string
  name: string
  assetType: AssetType
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  status: AssetStatus
  imageUrl: string
  notes?: string
  assignedTo?: HRUser
  assignmentDate?: string
  createdAt: string
  updatedAt: string
}

export interface AssetAssignment {
  id: string
  asset: Asset
  employee: Employee
  assignedDate: string
  returnDate?: string
  assignedBy?: HRUser
  returnNotes?: string
  createdAt: string
  updatedAt: string
}

