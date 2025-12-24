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
  commentsCount?: number
  progress?: number
  createdAt: string
  updatedAt: string
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

