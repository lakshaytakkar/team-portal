export type ProjectStatus = "planning" | "active" | "on-hold" | "completed" | "cancelled"
export type ProjectPriority = "low" | "medium" | "high" | "urgent"

export interface ProjectMember {
  id: string
  name: string
  email?: string
  avatar?: string
  role: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number // 0-100
  startDate: string
  endDate?: string
  dueDate?: string
  team: ProjectMember[]
  owner: ProjectMember
  tasksCount?: number
  completedTasksCount?: number
  createdAt: string
  updatedAt: string
}

export interface ProjectData {
  projects: Project[]
}

