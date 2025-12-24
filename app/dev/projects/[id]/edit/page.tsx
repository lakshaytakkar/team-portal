"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { DevProjectForm } from "@/components/forms/DevProjectForm"
import { initialDevProjects } from "@/lib/data/dev-projects"
import { DevProject } from "@/lib/types/dev-project"

async function fetchDevProject(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const project = initialDevProjects.projects.find((p) => p.id === id)
  if (!project) throw new Error("Project not found")
  return project
}

async function updateProject(id: string, data: Partial<DevProject>) {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const projectIndex = initialDevProjects.projects.findIndex((p) => p.id === id)
  if (projectIndex === -1) throw new Error("Project not found")
  
  // In real app, this would be an API call
  initialDevProjects.projects[projectIndex] = {
    ...initialDevProjects.projects[projectIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  
  return initialDevProjects.projects[projectIndex]
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["dev-project", id],
    queryFn: () => fetchDevProject(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Project not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DevProjectForm project={project} onSubmit={async (data) => { await updateProject(id, data) }} />
    </div>
  )
}

