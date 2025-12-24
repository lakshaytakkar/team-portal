"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code, ExternalLink, Edit, Trash2, Plus } from "lucide-react"
import { initialDevProjects } from "@/lib/data/dev-projects"
import { DevProjectStatus } from "@/lib/types/dev-project"

async function fetchDevProject(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const project = initialDevProjects.projects.find((p) => p.id === id)
  if (!project) throw new Error("Project not found")
  return project
}

export default function DevProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const statusBadgeConfig: Record<DevProjectStatus, { label: string; variant: "not-started" | "in-progress" | "completed" | "on-hold" }> = {
    planning: { label: "Not Started", variant: "not-started" },
    active: { label: "In Progress", variant: "in-progress" },
    "on-hold": { label: "On Hold", variant: "on-hold" },
    completed: { label: "Completed", variant: "completed" },
    cancelled: { label: "On Hold", variant: "on-hold" },
  }

  const status = statusBadgeConfig[project.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dev/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dev/projects/${project.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <Badge variant={status.variant} className="mt-2">
              {status.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Progress</p>
            <p className="text-2xl font-bold">{project.progress}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Tasks</p>
            <p className="text-2xl font-bold">
              {project.completedTasksCount || 0} / {project.tasksCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {project.linkedBusinessFeature && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Linked Business Feature</p>
            <p className="font-semibold">{project.linkedBusinessFeature}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <div className="flex gap-2">
              <Link href="/dev/tasks/new">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </Link>
              <Link href="/dev/tasks">
                <Button variant="outline" size="sm">
                  View All Tasks
                </Button>
              </Link>
            </div>
          </div>
          {project.tasksCount && project.tasksCount > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {project.completedTasksCount || 0} of {project.tasksCount} tasks completed
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${project.tasksCount > 0 ? ((project.completedTasksCount || 0) / project.tasksCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tasks assigned to this project yet</p>
              <Link href="/dev/tasks/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

