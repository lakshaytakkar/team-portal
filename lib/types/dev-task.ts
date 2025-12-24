export type DevTaskStatus = "not-started" | "in-progress" | "in-review" | "completed" | "blocked"
export type DevTaskPriority = "low" | "medium" | "high" | "urgent"

export interface DevUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface BaseDevTask {
  id: string
  name: string
  description?: string
  status: DevTaskStatus
  priority: DevTaskPriority
  level: 0 | 1 | 2 // Hierarchical structure
  parentId?: string // For subtasks
  projectId?: string // Link to dev project
  assignedTo?: DevUser
  dueDate?: string
  
  // Resource links
  figmaLink?: string
  docLinks?: string[] // Links to related docs
  relatedFiles?: string[] // File paths in repo
  promptUsed?: string // Which prompt was used
  phase?: 1 | 2 | 3 | 4 // Which phase this task belongs to
  
  createdAt: string
  updatedAt: string
}

// Level 2 task (subtask of a subtask - deepest level)
export interface DevTaskLevel2 extends BaseDevTask {
  level: 2
}

// Level 1 task (subtask - can have level 2 tasks)
export interface DevTaskLevel1 extends BaseDevTask {
  level: 1
  subtasks?: DevTaskLevel2[]
}

// Level 0 task (top-level task - can have level 1 tasks)
export interface DevTaskLevel0 extends BaseDevTask {
  level: 0
  subtasks?: DevTaskLevel1[]
}

export type DevTask = DevTaskLevel0 | DevTaskLevel1 | DevTaskLevel2

export interface DevTaskData {
  tasks: DevTaskLevel0[]
}

