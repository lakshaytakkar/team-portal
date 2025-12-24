"use client"

import { DevTaskForm } from "@/components/forms/DevTaskForm"
import { initialDevTasks } from "@/lib/data/dev-tasks"
import { DevTask } from "@/lib/types/dev-task"

async function createTask(data: Partial<DevTask>) {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const newTask: DevTask = {
    id: `dev-task-${Date.now()}`,
    name: data.name || "",
    description: data.description,
    status: data.status || "not-started",
    priority: data.priority || "medium",
    level: 0,
    projectId: data.projectId,
    dueDate: data.dueDate,
    figmaLink: data.figmaLink,
    docLinks: data.docLinks,
    relatedFiles: data.relatedFiles,
    promptUsed: data.promptUsed,
    phase: data.phase,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // In real app, this would be an API call
  initialDevTasks.tasks.push(newTask)
  
  return newTask
}

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <DevTaskForm onSubmit={async (data) => { await createTask(data) }} />
    </div>
  )
}

