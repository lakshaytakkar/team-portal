"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Minus, ExternalLink, User, CheckCircle2, Clock, AlertCircle, ListTodo, Search, ArrowUpDown } from "lucide-react"
import { Task, TaskLevel0, TaskLevel1, TaskLevel2, TaskStatus, TaskPriority } from "@/lib/types/task"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { getTasks, updateTaskStatus, type TaskFilters, type TaskSort } from "@/lib/actions/tasks"
import { useUser } from "@/lib/hooks/useUser"
import { KanbanBoard, KanbanColumn } from "@/components/kanban/KanbanBoard"
import { TaskKanbanCard } from "@/components/tasks/TaskKanbanCard"
import { LayoutList, LayoutGrid } from "lucide-react"

// Status badge variants
const statusConfig = {
  "not-started": { label: "Not Started", variant: "neutral-outline" as const },
  "in-progress": { label: "In Progress", variant: "primary-outline" as const },
  "in-review": { label: "In Review", variant: "yellow-outline" as const },
  "completed": { label: "Completed", variant: "green-outline" as const },
  "blocked": { label: "Blocked", variant: "red-outline" as const },
}

// Priority badge variants
const priorityConfig = {
  low: { label: "Low", variant: "neutral" as const },
  medium: { label: "Medium", variant: "secondary" as const },
  high: { label: "High", variant: "yellow" as const },
  urgent: { label: "Urgent", variant: "red" as const },
}

// Map task status to Kanban column
const statusToColumn: Record<TaskStatus, "not-started" | "in-progress" | "in-review" | "blocked" | "completed"> = {
  "not-started": "not-started",
  "in-progress": "in-progress",
  "in-review": "in-review",
  "blocked": "blocked",
  "completed": "completed",
}

// Map column to task status
const columnToStatus: Record<"not-started" | "in-progress" | "in-review" | "blocked" | "completed", TaskStatus> = {
  "not-started": "not-started",
  "in-progress": "in-progress",
  "in-review": "in-review",
  "blocked": "blocked",
  "completed": "completed",
}

// Kanban column configuration
const kanbanColumns: Array<KanbanColumn<TaskLevel0>> = [
  {
    id: "not-started",
    title: "Not Started",
    dotColor: "bg-muted-foreground",
    items: [],
  },
  {
    id: "in-progress",
    title: "In Progress",
    dotColor: "bg-status-in-progress-foreground",
    items: [],
  },
  {
    id: "in-review",
    title: "In Review",
    dotColor: "bg-status-on-hold-foreground", // Using yellow color for in-review
    items: [],
  },
  {
    id: "blocked",
    title: "Blocked",
    dotColor: "bg-destructive", // Using red color for blocked
    items: [],
  },
  {
    id: "completed",
    title: "Completed",
    dotColor: "bg-status-completed-foreground",
    items: [],
  },
]

interface ExpandedRows {
  [key: string]: boolean
}

type TaskFilter = "all" | "today" | "this-week" | "overdue" | "completed"

interface TaskRowProps {
  task: Task
  level: number
  expandedRows: ExpandedRows
  onToggleExpand: (taskId: string) => void
  onEdit?: (task: Task) => void
  onStatusUpdate?: (taskId: string, status: TaskStatus) => void
  isLast?: boolean
}

function TaskRow({ task, level, expandedRows, onToggleExpand, onEdit, onStatusUpdate, isLast }: TaskRowProps) {
  const hasSubtasks =
    (task.level === 0 && (task as TaskLevel0).subtasks && (task as TaskLevel0).subtasks!.length > 0) ||
    (task.level === 1 && (task as TaskLevel1).subtasks && (task as TaskLevel1).subtasks!.length > 0)

  const isExpanded = expandedRows[task.id] ?? (level === 0 ? true : false)
  const indentClass = level === 0 ? "" : level === 1 ? "pl-16" : "pl-32"

  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <>
      <TableRow
        className={cn(
          "hover:bg-muted/30 transition-colors cursor-pointer",
          level === 0 && "bg-muted/20 font-semibold",
          level === 1 && "bg-muted/10",
          level === 2 && "text-sm"
        )}
        onClick={() => {
          if (level === 0) {
            window.location.href = `/tasks/${task.id}`
          }
        }}
      >
        <TableCell className={cn("font-medium max-w-md", indentClass)}>
          <div className="flex items-center gap-2">
            {hasSubtasks ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand(task.id)
                }}
                className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
              >
                {isExpanded ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6 flex-shrink-0" />
            )}
            {task.name}
            {task.figmaLink && (
              <a
                href={task.figmaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          {task.description && (
            <div className="text-muted-foreground text-xs mt-1 font-normal">
              {task.description}
            </div>
          )}
        </TableCell>
        <TableCell>
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={task.status}
              onValueChange={(value: TaskStatus) => {
                if (onStatusUpdate) {
                  onStatusUpdate(task.id, value)
                }
              }}
            >
              <SelectTrigger className="w-[140px] h-7 border-0 p-0 bg-transparent hover:bg-muted/50">
                <Badge variant={status.variant} size="sm" className="cursor-pointer">
                  {status.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={priority.variant} size="sm">
            {priority.label}
          </Badge>
        </TableCell>
        <TableCell>
          {task.resource ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.resource.avatar || getAvatarForUser(task.resource.name)} alt={task.resource.name} />
                <AvatarFallback className="text-xs">
                  {task.resource.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{task.resource.name}</span>
                {task.resource.email && (
                  <span className="text-xs text-muted-foreground">{task.resource.email}</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Unassigned
            </span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {new Date(task.updatedAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <div onClick={(e) => e.stopPropagation()}>
            <RowActionsMenu
              entityType="task"
              entityId={task.id}
              entityName={task.name}
              detailUrl={`/tasks/${task.id}`}
              onEdit={onEdit ? () => onEdit(task) : undefined}
              canView={true}
              canEdit={true}
              canDelete={false}
            />
          </div>
        </TableCell>
      </TableRow>
      {hasSubtasks && isExpanded && (
        <>
          {task.level === 0 &&
            (task as TaskLevel0).subtasks?.map((subtask, index) => (
              <TaskRow
                key={subtask.id}
                task={subtask}
                level={1}
                expandedRows={expandedRows}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onStatusUpdate={onStatusUpdate}
                isLast={index === (task as TaskLevel0).subtasks!.length - 1}
              />
            ))}
          {task.level === 1 &&
            (task as TaskLevel1).subtasks?.map((subtask, index) => (
              <TaskRow
                key={subtask.id}
                task={subtask}
                level={2}
                expandedRows={expandedRows}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onStatusUpdate={onStatusUpdate}
                isLast={index === (task as TaskLevel1).subtasks!.length - 1}
              />
            ))}
        </>
      )}
    </>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl p-[18px] bg-white transition-all",
        isActive
          ? "border-primary shadow-md bg-primary/5 cursor-pointer"
          : "border-border hover:border-primary/50 hover:shadow-sm cursor-pointer"
      )}
      onClick={onClick}
    >
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div
          className={cn(
            "rounded-lg w-9 h-9 flex items-center justify-center transition-colors",
            isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export default function MyTasksPage() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [sortField, setSortField] = useState<TaskSort['field']>("updated_at")
  const [sortDirection, setSortDirection] = useState<TaskSort['direction']>("desc")
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  
  // Build filters
  const filters: TaskFilters = useMemo(() => {
    const f: TaskFilters = {}
    
    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }
    
    if (statusFilter !== "all") {
      f.status = [statusFilter]
    }
    
    if (priorityFilter !== "all") {
      f.priority = [priorityFilter]
    }
    
    if (activeFilter === "today") {
      f.dueDate = { type: "today" }
    } else if (activeFilter === "this-week") {
      f.dueDate = { type: "this-week" }
    } else if (activeFilter === "overdue") {
      f.dueDate = { type: "overdue" }
    } else if (activeFilter === "completed") {
      f.status = ["completed"]
    }
    
    return f
  }, [searchQuery, statusFilter, priorityFilter, activeFilter])
  
  const sort: TaskSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection])
  
  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ["my-tasks", filters, sort],
    queryFn: () => getTasks(filters, sort),
  })
  
  const statusUpdateMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] })
      toast.success("Task status updated")
    },
    onError: (error: Error) => {
      toast.error("Failed to update task status", {
        description: error.message,
      })
    },
  })
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditTaskOpen(true)
  }
  
  const handleStatusUpdate = (taskId: string, status: TaskStatus) => {
    statusUpdateMutation.mutate({ taskId, status })
  }
  
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({})
  
  useEffect(() => {
    if (tasks) {
      setExpandedRows((prev) => {
        const newExpanded: ExpandedRows = { ...prev }
        tasks.forEach((task) => {
          if (!(task.id in newExpanded)) {
            newExpanded[task.id] = true
          }
        })
        return newExpanded
      })
    }
  }, [tasks])
  
  const onToggleExpand = (taskId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }
  
  // Calculate counts
  const completedCount = useMemo(() => {
    if (!tasks) return 0
    return tasks.reduce((acc, task) => {
      const countCompleted = (t: Task): number => {
        let total = t.status === "completed" ? 1 : 0
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countCompleted(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countCompleted(st), 0)
        }
        return total
      }
      return acc + countCompleted(task)
    }, 0)
  }, [tasks])
  
  const totalCount = useMemo(() => {
    if (!tasks) return 0
    return tasks.reduce((acc, task) => {
      const countTotal = (t: Task): number => {
        let total = 1
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countTotal(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countTotal(st), 0)
        }
        return total
      }
      return acc + countTotal(task)
    }, 0)
  }, [tasks])
  
  const inProgressCount = useMemo(() => {
    if (!tasks) return 0
    return tasks.reduce((acc, task) => {
      const countInProgress = (t: Task): number => {
        let total = t.status === "in-progress" ? 1 : 0
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countInProgress(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countInProgress(st), 0)
        }
        return total
      }
      return acc + countInProgress(task)
    }, 0)
  }, [tasks])
  
  const dueTodayCount = useMemo(() => {
    if (!tasks) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return tasks.reduce((acc, task) => {
      const countDueToday = (t: Task): number => {
        if (!t.dueDate) return 0
        const taskDate = new Date(t.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        let total = taskDate.getTime() === today.getTime() && t.status !== "completed" ? 1 : 0
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countDueToday(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countDueToday(st), 0)
        }
        return total
      }
      return acc + countDueToday(task)
    }, 0)
  }, [tasks])
  
  const thisWeekCount = useMemo(() => {
    if (!tasks) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
    
    return tasks.reduce((acc, task) => {
      const countThisWeek = (t: Task): number => {
        if (!t.dueDate) return 0
        const taskDate = new Date(t.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        let total = taskDate >= today && taskDate <= endOfWeek && t.status !== "completed" ? 1 : 0
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countThisWeek(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countThisWeek(st), 0)
        }
        return total
      }
      return acc + countThisWeek(task)
    }, 0)
  }, [tasks])
  
  const overdueCount = useMemo(() => {
    if (!tasks) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return tasks.reduce((acc, task) => {
      const countOverdue = (t: Task): number => {
        if (!t.dueDate) return 0
        const taskDate = new Date(t.dueDate)
        taskDate.setHours(0, 0, 0, 0)
        let total = taskDate < today && t.status !== "completed" ? 1 : 0
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countOverdue(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countOverdue(st), 0)
        }
        return total
      }
      return acc + countOverdue(task)
    }, 0)
  }, [tasks])
  
  // Filter tasks based on active filter - must be before early returns
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    return tasks
  }, [tasks])

  // Organize tasks into Kanban columns (only level 0 tasks)
  const columnsWithTasks = useMemo(() => {
    if (!tasks) return kanbanColumns.map(col => ({ ...col, items: [] }))
    
    // Only include level 0 tasks for Kanban
    const level0Tasks = tasks.filter((task): task is TaskLevel0 => task.level === 0)
    
    return kanbanColumns.map((column) => ({
      ...column,
      items: level0Tasks.filter((task) => statusToColumn[task.status] === column.id),
    }))
  }, [tasks])

  // Handle task move between columns
  const handleTaskMove = (taskId: string, newColumnId: string, oldColumnId: string) => {
    if (newColumnId === oldColumnId) return

    const newStatus = columnToStatus[newColumnId as keyof typeof columnToStatus]
    if (!newStatus) return

    // Optimistically update the UI
    queryClient.setQueryData<Task[]>(["my-tasks", filters, sort], (oldTasks) => {
      if (!oldTasks) return oldTasks
      
      const updateTaskStatus = (task: Task): Task => {
        if (task.id === taskId) {
          return { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        }
        if (task.level === 0 && (task as TaskLevel0).subtasks) {
          return {
            ...task,
            subtasks: (task as TaskLevel0).subtasks!.map(updateTaskStatus),
          } as TaskLevel0
        }
        if (task.level === 1 && (task as TaskLevel1).subtasks) {
          return {
            ...task,
            subtasks: (task as TaskLevel1).subtasks!.map(updateTaskStatus),
          } as TaskLevel1
        }
        return task
      }
      
      return oldTasks.map(updateTaskStatus)
    })

    // Update status via mutation
    statusUpdateMutation.mutate({ taskId, status: newStatus })
  }
  
  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center justify-between mt-0.5">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-4 pb-2 border-b">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-7 gap-4 py-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
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
        title="Failed to load tasks"
        message="We couldn't load your tasks. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Tasks</h1>
            <p className="text-xs text-white/90 mt-0.5">Track and manage all your assigned tasks</p>
          </div>
          <Button onClick={() => setIsCreateTaskOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
          const [field, direction] = value.split('-')
          setSortField(field as TaskSort['field'])
          setSortDirection(direction as TaskSort['direction'])
        }}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at-desc">Last Updated (Newest)</SelectItem>
            <SelectItem value="updated_at-asc">Last Updated (Oldest)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="due_date-asc">Due Date (Earliest)</SelectItem>
            <SelectItem value="due_date-desc">Due Date (Latest)</SelectItem>
            <SelectItem value="priority-desc">Priority (High to Low)</SelectItem>
            <SelectItem value="priority-asc">Priority (Low to High)</SelectItem>
            <SelectItem value="status-asc">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stats Cards as Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Tasks"
          value={totalCount}
          icon={ListTodo}
          onClick={() => setActiveFilter("all")}
          isActive={activeFilter === "all"}
        />
        <StatCard
          title="Due Today"
          value={dueTodayCount}
          icon={AlertCircle}
          onClick={() => setActiveFilter(activeFilter === "today" ? "all" : "today")}
          isActive={activeFilter === "today"}
        />
        <StatCard
          title="This Week"
          value={thisWeekCount}
          icon={Clock}
          onClick={() => setActiveFilter(activeFilter === "this-week" ? "all" : "this-week")}
          isActive={activeFilter === "this-week"}
        />
        <StatCard
          title="Overdue"
          value={overdueCount}
          icon={AlertCircle}
          onClick={() => setActiveFilter(activeFilter === "overdue" ? "all" : "overdue")}
          isActive={activeFilter === "overdue"}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          onClick={() => setActiveFilter(activeFilter === "completed" ? "all" : "completed")}
          isActive={activeFilter === "completed"}
        />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>
                {viewMode === "table" 
                  ? "Expand or collapse task groups to view subtasks. Click the Figma icon to view designs."
                  : "Drag tasks between columns to update their status. Only top-level tasks are shown in Kanban view."}
              </CardDescription>
            </div>
            {/* View Switcher */}
            <div className="bg-muted p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors flex items-center gap-2",
                  viewMode === "table"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground font-medium hover:text-foreground"
                )}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors flex items-center gap-2",
                  viewMode === "kanban"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground font-medium hover:text-foreground"
                )}
                title="Kanban view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Kanban</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "kanban" ? (
            tasks && tasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                description="Get started by creating your first task to track your work."
              />
            ) : (
              <KanbanBoard
                columns={columnsWithTasks}
                onItemMove={handleTaskMove}
                getItemId={(task) => task.id}
                renderItem={(task) => (
                  <TaskKanbanCard
                    task={task}
                    onEdit={() => handleEditTask(task)}
                  />
                )}
              />
            )
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    level={0}
                    expandedRows={expandedRows}
                    onToggleExpand={onToggleExpand}
                    onEdit={handleEditTask}
                    onStatusUpdate={handleStatusUpdate}
                    isLast={index === filteredTasks.length - 1}
                  />
                ))
              ) : tasks && tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={ListTodo}
                      title="No tasks yet"
                      description="Get started by creating your first task to track your work."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No tasks found for this filter. Try selecting a different filter.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      
      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
      
      <EditTaskDialog
        open={isEditTaskOpen}
        onOpenChange={(open) => {
          setIsEditTaskOpen(open)
          if (!open) {
            setEditingTask(null)
          }
        }}
        task={editingTask}
      />
    </div>
  )
}

