"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  ExternalLink,
  ListTodo,
} from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "@/lib/types/task"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { ErrorState } from "@/components/ui/error-state"
import { DetailPageHeader, DetailQuickTile, DetailTabs } from "@/components/details"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { getTaskTreeById, getTasks } from "@/lib/actions/tasks"
import { TaskAttachmentsTab } from "@/components/tasks/TaskAttachmentsTab"
import { TaskSubtasksTab } from "@/components/tasks/TaskSubtasksTab"
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog"

// Status badge config
const statusConfig: Record<TaskStatus, { label: string; variant: "neutral-outline" | "primary-outline" | "yellow-outline" | "green-outline" | "red-outline" }> = {
  "not-started": { label: "Not Started", variant: "neutral-outline" },
  "in-progress": { label: "In Progress", variant: "primary-outline" },
  "in-review": { label: "In Review", variant: "yellow-outline" },
  completed: { label: "Completed", variant: "green-outline" },
  blocked: { label: "Blocked", variant: "red-outline" },
}

// Priority badge config
const priorityConfig: Record<TaskPriority, { label: string; variant: "neutral" | "secondary" | "yellow" | "red" }> = {
  low: { label: "Low", variant: "neutral" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "yellow" },
  urgent: { label: "Urgent", variant: "red" },
}

// Flatten all tasks for navigation
function flattenTasks(tasks: Task[]): Task[] {
  const allTasks: Task[] = []
  const flatten = (taskList: Task[]) => {
    taskList.forEach((task) => {
      allTasks.push(task)
      if ("subtasks" in task && task.subtasks) {
        flatten(task.subtasks)
      }
    })
  }
  flatten(tasks)
  return allTasks
}

function calculateTaskProgress(task: Task): number {
  if (task.progress !== undefined) return task.progress

  if ("subtasks" in task && task.subtasks && task.subtasks.length > 0) {
    const completed = task.subtasks.filter((st) => st.status === "completed").length
    return Math.round((completed / task.subtasks.length) * 100)
  }

  if (task.status === "completed") return 100
  if (task.status === "in-progress") return 50
  if (task.status === "in-review") return 90
  return 0
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = params.id as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Get active tab from URL, default to "overview"
  const activeTab = searchParams.get("tab") || "overview"

  const { data: task, isLoading, error, refetch } = useQuery({
    queryKey: ["task-tree", taskId],
    queryFn: () => getTaskTreeById(taskId),
    retry: 1,
  })

  const { data: allTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
    retry: 1,
  })

  // Handle 404 for missing tasks
  useEffect(() => {
    if (error && error instanceof Error && (error.message.toLowerCase().includes("not found") || error.message.toLowerCase().includes("not authorized"))) {
      notFound()
    }
    if (!isLoading && !error && !task) {
      notFound()
    }
  }, [error, isLoading, task])

  // Flatten tasks for navigation
  const flattenedTasks = useMemo(() => {
    if (!allTasks) return []
    return flattenTasks(allTasks)
  }, [allTasks])

  const navigation = useDetailNavigation({
    currentId: taskId,
    items: flattenedTasks,
    getId: (t) => t.id,
    basePath: "/tasks",
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-32 w-full" />
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <ErrorState
        title="Failed to load task"
        message="We couldn't load this task. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!task) {
    return null
  }

  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const progress = calculateTaskProgress(task)
  const dueDate = task.dueDate || task.updatedAt

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tasks", href: "/tasks" },
    { label: task.name },
  ]

  // Handle tab change - sync with URL
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId === "overview") {
      params.delete("tab")
    } else {
      params.set("tab", tabId)
    }
    router.replace(`/tasks/${taskId}?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Status</h3>
                  <Badge variant={status.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
                    {status.label}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Priority</h3>
                  <Badge variant={priority.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
                    {priority.label}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Progress</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative w-[100px] h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-l-full transition-all",
                          progress === 100 ? "bg-status-completed-foreground" : "bg-primary"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-foreground font-medium">{progress}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Due Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {new Date(dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {task.figmaLink && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Figma Link</h3>
                  <a
                    href={task.figmaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Open in Figma</span>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "subtasks",
      label: "Subtasks",
      content: <TaskSubtasksTab taskId={taskId} task={task} />,
    },
    {
      id: "attachments",
      label: "Attachments",
      content: <TaskAttachmentsTab taskId={taskId} />,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <DetailPageHeader
        breadcrumbs={breadcrumbs}
        onBack={() => router.push("/tasks")}
        onNext={navigation.navigateNext}
        onPrev={navigation.navigatePrev}
        hasNext={navigation.hasNext}
        hasPrev={navigation.hasPrev}
      />

      {/* Quick Tile */}
      <DetailQuickTile
        thumbnail={
          task.resource ? (
            <Avatar className="w-full h-full">
              <AvatarImage
                src={getAvatarForUser(task.resource.id || task.resource.name)}
                alt={task.resource.name}
              />
              <AvatarFallback className="text-lg font-semibold">
                {task.resource.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-full h-full bg-primary/10 rounded-xl flex items-center justify-center">
              <ListTodo className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
          )
        }
        title={task.name}
        subtitle={task.description}
        status={status}
        metadata={[
          {
            label: "Priority",
            value: (
              <Badge variant={priority.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {priority.label}
              </Badge>
            ),
          },
          {
            label: "Progress",
            value: (
              <div className="flex items-center gap-2">
                <div className="relative w-[100px] h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-l-full transition-all",
                      progress === 100 ? "bg-status-completed-foreground" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm">{progress}%</span>
              </div>
            ),
          },
          {
            label: "Due Date",
            value: (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            ),
          },
          ...(task.resource
            ? [
                {
                  label: "Assigned To",
                  value: (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={getAvatarForUser(task.resource.id || task.resource.name)}
                          alt={task.resource.name}
                        />
                        <AvatarFallback className="text-xs">
                          {task.resource.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.resource.name}</span>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
        onEdit={() => setIsEditDialogOpen(true)}
      />

      {/* Tabs */}
      <DetailTabs 
        tabs={tabs} 
        defaultTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Edit Dialog */}
      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
      />
    </div>
  )
}

