"use client"

import { use, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { DevProjectForm } from "@/components/forms/DevProjectForm"
import { Skeleton } from "@/components/ui/skeleton"
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

  // Handle 404 for missing projects
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !project) {
      notFound()
    }
  }, [error, isLoading, project])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Form Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <DevProjectForm project={project} onSubmit={async (data) => { await updateProject(id, data) }} />
    </div>
  )
}

