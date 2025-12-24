export type DevProjectStatus = "planning" | "active" | "on-hold" | "completed" | "cancelled"
export type DevProjectPriority = "low" | "medium" | "high" | "urgent"

export interface DevProjectMember {
  id: string
  name: string
  email?: string
  avatar?: string
  role: string
}

export interface DevProject {
  id: string
  name: string
  description?: string
  status: DevProjectStatus
  priority: DevProjectPriority
  progress: number // 0-100
  startDate?: string
  endDate?: string
  dueDate?: string
  linkedBusinessFeature?: string // Link to business feature being built
  team: DevProjectMember[]
  owner: DevProjectMember
  tasksCount?: number
  completedTasksCount?: number
  createdAt: string
  updatedAt: string
}

export interface DevProjectData {
  projects: DevProject[]
}

