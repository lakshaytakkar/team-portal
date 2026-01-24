"use client"

import { use, useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Skeleton } from "@/components/ui/skeleton"
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
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

  const handleDelete = () => {
    // TODO: Implement actual delete logic
    // For now, just invalidate and redirect
    queryClient.invalidateQueries({ queryKey: ["dev-projects"] })
    router.push("/dev/projects")
    setDeleteDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Tasks Section Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </CardContent>
        </Card>
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
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="destructive"
        icon={<Trash2 className="w-full h-full" />}
      />

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

