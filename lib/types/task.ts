import type { TaskAttachment } from './task-attachment'

export type TaskStatus = "not-started" | "in-progress" | "in-review" | "completed" | "blocked"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface TaskResource {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface BaseTask {
  id: string
  name: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  resource?: TaskResource
  figmaLink?: string
  dueDate?: string
  startDate?: string
  category?: string
  isDraft?: boolean
  commentsCount?: number
  progress?: number
  createdAt: string
  updatedAt: string
  // Additional fields from database schema
  projectId?: string
  parentId?: string
  createdBy?: string
  updatedBy?: string
  attachments?: TaskAttachment[]
}

// Level 2 task (subtask of a subtask - deepest level)
export interface TaskLevel2 extends BaseTask {
  level: 2
}

// Level 1 task (subtask - can have level 2 tasks)
export interface TaskLevel1 extends BaseTask {
  level: 1
  subtasks?: TaskLevel2[]
}

// Level 0 task (top-level task - can have level 1 tasks)
export interface TaskLevel0 extends BaseTask {
  level: 0
  subtasks?: TaskLevel1[]
}

export type Task = TaskLevel0 | TaskLevel1 | TaskLevel2

export interface ProjectTaskData {
  tasks: TaskLevel0[]
}

// Analytics types for SuperAdmin view
export interface TaskAnalytics {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  completionRate: number
  overdueCount: number
  teamPerformance: Array<{
    userId: string
    userName: string
    totalTasks: number
    completedTasks: number
    completionRate: number
  }>
}

