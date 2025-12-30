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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, Label, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Plus, Minus, ExternalLink, User, CheckCircle2, Clock, AlertCircle, ListTodo, Search, ArrowUpDown, Download, Trash2 } from "lucide-react"
import { Task, TaskLevel0, TaskLevel1, TaskLevel2, TaskStatus, TaskPriority } from "@/lib/types/task"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { ExportButton } from "@/components/exports/ExportButton"
import { BulkActionsToolbar } from "@/components/tasks/BulkActionsToolbar"
import { getTasks, updateTaskStatus, deleteTask, getTaskAnalytics, getAssignableUsers, getProjectsForTasks, type TaskFilters, type TaskSort } from "@/lib/actions/tasks"
import { useUser } from "@/lib/hooks/useUser"
import { DashboardChartWidget } from "@/components/dashboard"
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

const TASK_STATUS_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const taskStatusChartConfig = {
  "not-started": {
    label: "Not Started",
    color: "var(--chart-3)",
  },
  "in-progress": {
    label: "In Progress",
    color: "var(--chart-2)",
  },
  "in-review": {
    label: "In Review",
    color: "var(--chart-1)",
  },
  "completed": {
    label: "Completed",
    color: "var(--chart-4)",
  },
  "blocked": {
    label: "Blocked",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

interface ExpandedRows {
  [key: string]: boolean
}

type TaskFilter = "all" | "today" | "this-week" | "overdue" | "completed" | "blocked"

interface TaskRowProps {
  task: Task
  level: number
  expandedRows: ExpandedRows
  onToggleExpand: (taskId: string) => void
  onEdit?: (task: Task) => void
  onStatusUpdate?: (taskId: string, status: TaskStatus) => void
  onDelete?: (taskId: string) => void
  isSelected?: boolean
  onSelect?: (taskId: string, selected: boolean) => void
  isLast?: boolean
}

function TaskRow({ task, level, expandedRows, onToggleExpand, onEdit, onStatusUpdate, onDelete, isSelected, onSelect, isLast }: TaskRowProps) {
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
          level === 2 && "text-sm",
          isSelected && "bg-primary/5"
        )}
        onClick={() => {
          if (level === 0) {
            window.location.href = `/tasks/${task.id}`
          }
        }}
      >
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected || false}
            onCheckedChange={(checked) => {
              if (onSelect) {
                onSelect(task.id, checked as boolean)
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
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
          <Select
            value={task.status}
            onValueChange={(value: TaskStatus) => {
              if (onStatusUpdate) {
                onStatusUpdate(task.id, value)
              }
            }}
            onClick={(e) => e.stopPropagation()}
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
              onDelete={onDelete ? () => onDelete(task.id) : undefined}
              canView={true}
              canEdit={true}
              canDelete={true}
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
                onDelete={onDelete}
                isSelected={isSelected}
                onSelect={onSelect}
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
                onDelete={onDelete}
                isSelected={isSelected}
                onSelect={onSelect}
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

export default function AdminTasksPage() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<TaskSort['field']>("updated_at")
  const [sortDirection, setSortDirection] = useState<TaskSort['direction']>("desc")
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  
  // Fetch assignable users and projects
  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
  })
  
  const { data: projects } = useQuery({
    queryKey: ["projects-for-tasks"],
    queryFn: getProjectsForTasks,
  })
  
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
    
    if (assignedToFilter !== "all") {
      f.assignedTo = [assignedToFilter]
    }
    
    if (projectFilter !== "all") {
      f.projectId = [projectFilter]
    }
    
    if (activeFilter === "today") {
      f.dueDate = { type: "today" }
    } else if (activeFilter === "this-week") {
      f.dueDate = { type: "this-week" }
    } else if (activeFilter === "overdue") {
      f.dueDate = { type: "overdue" }
    } else if (activeFilter === "completed") {
      f.status = ["completed"]
    } else if (activeFilter === "blocked") {
      f.status = ["blocked"]
    }
    
    return f
  }, [searchQuery, statusFilter, priorityFilter, assignedToFilter, projectFilter, activeFilter])
  
  const sort: TaskSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection])
  
  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-tasks", filters, sort],
    queryFn: () => getTasks(filters, sort),
  })
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["task-analytics"],
    queryFn: getTaskAnalytics,
  })
  
  const statusUpdateMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] })
      toast.success("Task status updated")
    },
    onError: (error: Error) => {
      toast.error("Failed to update task status", {
        description: error.message,
      })
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] })
      toast.success("Task deleted")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete task", {
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
  
  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      deleteMutation.mutate(taskId)
    }
  }
  
  const handleSelectTask = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(taskId)
      } else {
        newSet.delete(taskId)
      }
      return newSet
    })
  }
  
  const handleSelectAll = (selected: boolean) => {
    if (!tasks) return
    const allTaskIds = new Set<string>()
    const collectTaskIds = (task: Task) => {
      allTaskIds.add(task.id)
      if (task.level === 0 && (task as TaskLevel0).subtasks) {
        (task as TaskLevel0).subtasks!.forEach(collectTaskIds)
      } else if (task.level === 1 && (task as TaskLevel1).subtasks) {
        (task as TaskLevel1).subtasks!.forEach(collectTaskIds)
      }
    }
    tasks.forEach(collectTaskIds)
    setSelectedTaskIds(selected ? allTaskIds : new Set())
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
  
  const blockedCount = useMemo(() => {
    if (!tasks) return 0
    return tasks.reduce((acc, task) => {
      const countBlocked = (t: Task): number => {
        let total = t.status === "blocked" ? 1 : 0
        if (t.level === 0 && (t as TaskLevel0).subtasks) {
          total += (t as TaskLevel0).subtasks!.reduce((sum, st) => sum + countBlocked(st), 0)
        } else if (t.level === 1 && (t as TaskLevel1).subtasks) {
          total += (t as TaskLevel1).subtasks!.reduce((sum, st) => sum + countBlocked(st), 0)
        }
        return total
      }
      return acc + countBlocked(task)
    }, 0)
  }, [tasks])
  
  // Prepare analytics data
  const statusChartData = useMemo(() => {
    if (!analytics) return []
    return Object.entries(analytics.byStatus).map(([status, count]) => ({
      status: statusConfig[status as TaskStatus].label,
      count,
    }))
  }, [analytics])
  
  const priorityChartData = useMemo(() => {
    if (!analytics) return []
    return Object.entries(analytics.byPriority).map(([priority, count]) => ({
      priority: priorityConfig[priority as TaskPriority].label,
      count,
    }))
  }, [analytics])
  
  // Prepare export data
  const exportData = useMemo(() => {
    if (!tasks) return []
    const flattenTasks = (taskList: Task[]): any[] => {
      const result: any[] = []
      taskList.forEach((task) => {
        result.push({
          name: task.name,
          status: statusConfig[task.status].label,
          priority: priorityConfig[task.priority].label,
          assignedTo: task.resource?.name || "Unassigned",
          dueDate: task.dueDate || "",
          updatedAt: new Date(task.updatedAt).toLocaleDateString(),
        })
        if (task.level === 0 && (task as TaskLevel0).subtasks) {
          result.push(...flattenTasks((task as TaskLevel0).subtasks!))
        } else if (task.level === 1 && (task as TaskLevel1).subtasks) {
          result.push(...flattenTasks((task as TaskLevel1).subtasks!))
        }
      })
      return result
    }
    return flattenTasks(tasks)
  }, [tasks])
  
  const exportColumns = [
    { key: "name", label: "Task Name" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "dueDate", label: "Due Date" },
    { key: "updatedAt", label: "Last Updated" },
  ]
  
  // Filter tasks based on active filter
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
    queryClient.setQueryData<Task[]>(["admin-tasks", filters, sort], (oldTasks) => {
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <div className="grid grid-cols-8 gap-4 pb-2 border-b">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-8 gap-4 py-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
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
        message="We couldn't load tasks. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">All Tasks</h1>
            <p className="text-xs text-white/90 mt-0.5">Eagle view of all tasks across the organization</p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              data={exportData}
              columns={exportColumns}
              filename="tasks-export"
              userRole={user?.role || "superadmin"}
              page="/admin/tasks"
              variant="secondary"
              size="sm"
            />
            <Button onClick={() => setIsCreateTaskOpen(true)} variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </div>
      
      {/* Analytics Section */}
      {analytics && !analyticsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardChartWidget
            title="Task Status Distribution"
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["task-analytics"] })}
            className="h-[400px]"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <ChartContainer config={taskStatusChartConfig} className="w-full max-w-[232px] aspect-square">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusChartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-muted-foreground text-xs"
                              >
                                Total Tasks
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 16}
                                className="fill-foreground text-2xl font-semibold"
                              >
                                {analytics.total}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TASK_STATUS_COLORS[index % TASK_STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex gap-6 items-center justify-center flex-wrap">
                {statusChartData.map((item, index) => (
                  <div key={item.status} className="flex gap-2 items-center">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: TASK_STATUS_COLORS[index % TASK_STATUS_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.status} ({item.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardChartWidget>
          
          <DashboardChartWidget
            title="Task Priority Distribution"
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["task-analytics"] })}
            className="h-[400px]"
          >
            <ChartContainer
              config={{
                priority: {
                  label: "Priority",
                  color: "var(--chart-1)",
                },
              }}
              className="h-full w-full"
            >
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--chart-1)" />
              </BarChart>
            </ChartContainer>
          </DashboardChartWidget>
        </div>
      )}
      
      {/* Team Performance Table */}
      {analytics && analytics.teamPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Task completion rates by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Total Tasks</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.teamPerformance.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell className="font-medium">{member.userName}</TableCell>
                    <TableCell>{member.totalTasks}</TableCell>
                    <TableCell>{member.completedTasks}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {member.completionRate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
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
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
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
        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}
        >
          <SelectTrigger className="w-[180px]">
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
        <Select
          value={assignedToFilter}
          onValueChange={setAssignedToFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {assignableUsers?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={projectFilter}
          onValueChange={setProjectFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
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
            <SelectItem value="assigned_to-asc">Assigned To</SelectItem>
            <SelectItem value="created_at-desc">Created (Newest)</SelectItem>
            <SelectItem value="created_at-asc">Created (Oldest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Bulk Actions Toolbar */}
      {selectedTaskIds.size > 0 && (
        <BulkActionsToolbar
          selectedTaskIds={Array.from(selectedTaskIds)}
          onClearSelection={() => setSelectedTaskIds(new Set())}
        />
      )}
      
      {/* Stats Cards as Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
        <StatCard
          title="Blocked"
          value={blockedCount}
          icon={AlertCircle}
          onClick={() => setActiveFilter(activeFilter === "blocked" ? "all" : "blocked")}
          isActive={activeFilter === "blocked"}
        />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>
                {viewMode === "table" 
                  ? "Expand or collapse task groups to view subtasks. Select tasks to perform bulk operations."
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTaskIds.size > 0 && selectedTaskIds.size === totalCount}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
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
                    onDelete={handleDelete}
                    isSelected={selectedTaskIds.has(task.id)}
                    onSelect={handleSelectTask}
                    isLast={index === filteredTasks.length - 1}
                  />
                ))
              ) : tasks && tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
                    <EmptyState
                      icon={ListTodo}
                      title="No tasks yet"
                      description="Get started by creating your first task to track your work."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
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

