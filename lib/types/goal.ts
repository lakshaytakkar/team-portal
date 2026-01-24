export type GoalStatus = "not-started" | "in-progress" | "completed" | "cancelled"
export type GoalPriority = "low" | "medium" | "high"

export interface GoalUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  status: GoalStatus
  priority: GoalPriority
  targetDate?: string
  progress: number // 0-100
  assignedTo: GoalUser
  createdAt: string
  updatedAt: string
}

export interface GoalData {
  goals: Goal[]
}

