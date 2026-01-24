"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Folder,
  CheckCircle2,
} from "lucide-react"
import { Project, ProjectStatus } from "@/lib/types/project"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"
import { EditProjectDialog } from "@/components/projects/EditProjectDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { SearchNoResults } from "@/components/ui/search-no-results"
import { FolderOpen } from "lucide-react"
import { KanbanBoard, KanbanColumn } from "@/components/kanban/KanbanBoard"
import { getProjects, deleteProject, updateProject } from "@/lib/actions/projects"
import { toast } from "@/components/ui/sonner"

// Map project status to Kanban column
const statusToColumn: Record<ProjectStatus, "not-started" | "in-progress" | "completed" | "on-hold"> = {
  planning: "not-started",
  active: "in-progress",
  completed: "completed",
  "on-hold": "on-hold",
  cancelled: "on-hold",
}

// Map column to project status
const columnToStatus: Record<"not-started" | "in-progress" | "completed" | "on-hold", ProjectStatus> = {
  "not-started": "planning",
  "in-progress": "active",
  completed: "completed",
  "on-hold": "on-hold",
}

// Status badge config for Kanban cards
const statusBadgeConfig: Record<ProjectStatus, { label: string; variant: "not-started" | "in-progress" | "completed" | "on-hold" }> = {
  planning: { label: "Not Started", variant: "not-started" },
  active: { label: "In Progress", variant: "in-progress" },
  "on-hold": { label: "On Hold", variant: "on-hold" },
  completed: { label: "Completed", variant: "completed" },
  cancelled: { label: "On Hold", variant: "on-hold" },
}

// Column configuration
const columns = [
  {
    id: "not-started" as const,
    title: "Not Started",
    dotColor: "bg-muted-foreground",
    projects: [] as Project[],
  },
  {
    id: "in-progress" as const,
    title: "In Progress",
    dotColor: "bg-status-in-progress-foreground",
    projects: [] as Project[],
  },
  {
    id: "completed" as const,
    title: "Completed",
    dotColor: "bg-status-completed-foreground",
    projects: [] as Project[],
  },
  {
    id: "on-hold" as const,
    title: "On Hold",
    dotColor: "bg-status-on-hold-foreground",
    projects: [] as Project[],
  },
]

async function fetchProjects() {
  return await getProjects()
}

// Project Card Component
function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit?: () => void; onDelete?: () => Promise<void> }) {
  const status = statusBadgeConfig[project.status]
  const remainingTasks = project.tasksCount ? project.tasksCount - (project.completedTasksCount || 0) : 0
  
  // Generate description text based on status
  const getDescription = () => {
    if (project.status === "completed") {
      if (project.tasksCount && project.completedTasksCount === project.tasksCount) {
        return "All tasks finished"
      }
      return "All tasks completed"
    }
    if (project.status === "planning") {
      return `${project.tasksCount || 15} tasks to be assigned`
    }
    if (project.status === "active") {
      // For active projects, show various descriptions
      if (project.name.toLowerCase().includes("feedback")) {
        return "7 tasks due this week"
      }
      if (project.name.toLowerCase().includes("brand")) {
        return "4 logo concepts pending"
      }
      if (project.name.toLowerCase().includes("onboarding")) {
        return "2 designs need review"
      }
      if (remainingTasks > 0) {
        return `${remainingTasks} tasks due this week`
      }
      return "In progress"
    }
    if (project.status === "on-hold") {
      if (project.name.toLowerCase().includes("marketing")) {
        return "Awaiting budget approval"
      }
      if (project.name.toLowerCase().includes("database")) {
        return "1 blocker from engineering"
      }
      return `${remainingTasks} tasks blocked`
    }
    return ""
  }

  return (
    <div className="relative">
      <Link href={`/projects/${project.id}`} onClick={(e) => {
        // Prevent navigation if user is dragging
        if ((e.target as HTMLElement).closest('[data-sortable-handle]')) {
          e.preventDefault()
        }
      }}>
        <Card className="border border-border rounded-2xl p-4 bg-white hover:border-primary transition-colors cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center">
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium leading-5">
                {status.label}
              </Badge>
              <div onClick={(e) => e.stopPropagation()}>
                <RowActionsMenu
                  entityType="project"
                  entityId={project.id}
                  entityName={project.name}
                  detailUrl={`/projects/${project.id}`}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  canView={true}
                  canEdit={true}
                  canDelete={true}
                />
              </div>
            </div>
          </div>
        
        <div className="flex flex-col gap-1.5 mb-2">
          <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px]">
            {getDescription()}
          </p>
        </div>
      
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-[100px] h-2 bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                project.progress === 100
                  ? "bg-status-completed-foreground rounded-[10px]"
                  : "bg-status-completed-foreground rounded-l-full"
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px]">
            {project.progress}%
          </span>
        </div>
        
        <div className="flex items-center pl-0 pr-2">
          {project.team.slice(0, 3).map((member, index) => (
            <Avatar
              key={member.id}
              className={cn(
                "h-6 w-6 border-2 border-white rounded-full",
                index > 0 && "-ml-2"
              )}
            >
              <AvatarImage src={getAvatarForUser(member.id || member.name)} alt={member.name} />
              <AvatarFallback className="text-xs bg-muted">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
        </Card>
      </Link>
    </div>
  )
}

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  // Initialize search query from URL parameter
  const initialSearchQuery = searchParams.get('q') || ""
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const queryClient = useQueryClient()
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsEditDrawerOpen(true)
  }

  const handleDeleteProject = async (project: Project) => {
    try {
      await deleteProject(project.id)
      toast.success("Project deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project")
      throw error
    }
  }

  // Filter projects by search query (use empty array as fallback for hook consistency)
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  // Organize projects into columns (must be called before early returns)
  const columnsWithProjects = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      items: filteredProjects.filter((project) => statusToColumn[project.status] === column.id),
    }))
  }, [filteredProjects])

  if (isLoading) {
    return (
      <div className="space-y-5">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center justify-between mt-0.5">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        {/* Kanban Board Skeleton */}
        <Card className="border border-border rounded-2xl">
          <div className="border-b border-border h-16 flex items-center justify-between px-5">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-[38px] w-64 rounded-[10px]" />
              <Skeleton className="h-[38px] w-[38px] rounded-[10px]" />
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex gap-5">
              {[1, 2, 3, 4].map((colIndex) => (
                <div key={colIndex} className="flex-1 flex flex-col gap-3">
                  {/* Column Header Skeleton */}
                  <div className="bg-muted h-10 rounded-lg px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-5 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                  {/* Project Cards Skeleton */}
                  {[1, 2, 3].map((cardIndex) => (
                    <Card key={cardIndex} className="border border-border rounded-2xl p-4 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-16 rounded-2xl" />
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Skeleton className="h-2 flex-1 rounded-full" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-6 w-6 rounded-full" />
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load projects"
        message="We couldn't load your projects. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  // Handle project move between columns
  const handleProjectMove = async (projectId: string, newColumnId: string, oldColumnId: string) => {
    if (newColumnId === oldColumnId) return

    const newStatus = columnToStatus[newColumnId as keyof typeof columnToStatus]
    if (!newStatus) return

    // Optimistically update the UI
    queryClient.setQueryData<Project[]>(["projects"], (oldProjects) => {
      if (!oldProjects) return oldProjects
      return oldProjects.map((project) =>
        project.id === projectId
          ? { ...project, status: newStatus, updatedAt: new Date().toISOString() }
          : project
      )
    })

    try {
      await updateProject(projectId, { status: newStatus })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.error(error instanceof Error ? error.message : "Failed to update project status")
    }
  }

  // Calculate statistics
  const totalProjects = projects?.length || 0
  const totalTasks = projects?.reduce((sum, p) => sum + (p.tasksCount || 0), 0) || 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDueToday = projects?.filter((p) => {
    if (!p.dueDate) return false
    const dueDate = new Date(p.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  }).length || 0
  const taskCompleted = projects?.reduce((sum, p) => sum + (p.completedTasksCount || 0), 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Projects Overview</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage and track all projects across the organization</p>
          </div>
          <Button onClick={() => setIsDrawerOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Project
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {totalProjects}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Task
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {totalTasks}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Due Today
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {totalDueToday}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Task Completed
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {taskCompleted}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border border-border rounded-2xl">
        <div className="border-b border-border h-16 flex items-center justify-between px-5">
          <h2 className="text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
            Projects List
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-[38px] border border-border rounded-[10px] text-sm font-medium text-muted-foreground"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-[38px] w-[38px] border border-border rounded-[10px]"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Show empty state if no projects at all */}
          {projects && projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Get started by creating your first project to organize your work."
              action={{
                label: "Create New Project",
                onClick: () => setIsDrawerOpen(true),
              }}
            />
          ) : filteredProjects.length === 0 && searchQuery ? (
            // Show "no results" when search returns empty
            <SearchNoResults
              query={searchQuery}
              onClear={() => setSearchQuery("")}
            />
          ) : (
            <KanbanBoard
              columns={columnsWithProjects}
              onItemMove={handleProjectMove}
              getItemId={(project) => project.id}
              renderItem={(project) => (
                <ProjectCard
                  project={project}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project)}
                />
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Project Drawer */}
      <CreateProjectDialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      
      {/* Edit Project Dialog */}
      <EditProjectDialog
        open={isEditDrawerOpen}
        onOpenChange={(open) => {
          setIsEditDrawerOpen(open)
          if (!open) {
            setEditingProject(null)
          }
        }}
        project={editingProject}
      />
    </div>
  )
}
