"use client"

import { DevProjectForm } from "@/components/forms/DevProjectForm"
import { initialDevProjects } from "@/lib/data/dev-projects"
import { DevProject } from "@/lib/types/dev-project"

async function createProject(data: Partial<DevProject>) {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const newProject: DevProject = {
    id: `dev-proj-${Date.now()}`,
    name: data.name || "",
    description: data.description,
    status: data.status || "planning",
    priority: data.priority || "medium",
    progress: data.progress || 0,
    startDate: data.startDate,
    dueDate: data.dueDate,
    linkedBusinessFeature: data.linkedBusinessFeature,
    team: [],
    owner: {
      id: "dev-user-1",
      name: "Developer",
      email: "dev@example.com",
      role: "Developer",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // In real app, this would be an API call
  initialDevProjects.projects.push(newProject)
  
  return newProject
}

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <DevProjectForm onSubmit={async (data) => { await createProject(data) }} />
    </div>
  )
}

