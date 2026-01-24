"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
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
import { Plus, Minus, ExternalLink, User, CheckCircle2, Clock, AlertCircle, ListTodo, Search, ArrowUpDown, Paperclip, MessageSquare, MoreVertical, ChevronDown, ChevronUp } from "lucide-react"
import { Task, TaskLevel0, TaskLevel1, TaskLevel2, TaskStatus, TaskPriority, TaskResource } from "@/lib/types/task"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { useRouter } from "next/navigation"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getTasks, updateTaskStatus, deleteTask, getAssignableUsers, getProjectsForTasks, type TaskFilters, type TaskSort } from "@/lib/actions/tasks"
import { useUserContext } from "@/lib/providers/UserContextProvider"
import { KanbanBoard, KanbanColumn } from "@/components/kanban/KanbanBoard"
import { TaskKanbanCard } from "@/components/tasks/TaskKanbanCard"
import { LayoutList, LayoutGrid } from "lucide-react"

// Status badge variants matching Figma
const statusConfig = {
  "not-started": { label: "To Do", bgColor: "bg-[rgba(158,158,158,0.15)]", textColor: "text-[#9e9e9e]" },
  "in-progress": { label: "In Progress", bgColor: "bg-[rgba(22,120,242,0.15)]", textColor: "text-[#1678f2]" },
  "in-review": { label: "In Review", bgColor: "bg-[rgba(103,58,183,0.15)]", textColor: "text-[#673ab7]" },
  "completed": { label: "Completed", bgColor: "bg-[rgba(76,175,80,0.15)]", textColor: "text-[#4caf50]" },
  "blocked": { label: "Blocked", bgColor: "bg-[rgba(244,67,54,0.15)]", textColor: "text-[#f44336]" },
}

// Priority badge variants with colored dots matching Figma
const priorityConfig = {
  low: { label: "Low", dotColor: "bg-[#9b9b9d]" },
  medium: { label: "Medium", dotColor: "bg-[#1678f2]" },
  high: { label: "High", dotColor: "bg-[#ff9800]" },
  urgent: { label: "Urgent", dotColor: "bg-[#f44336]" },
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

interface TaskRowProps {
  task: Task
  level: number
  expandedRows: ExpandedRows
  onToggleExpand: (taskId: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => Promise<void>
  onStatusUpdate?: (taskId: string, status: TaskStatus) => void
  isLast?: boolean
}

function TaskRow({ task, level, expandedRows, onToggleExpand, onEdit, onDelete, onStatusUpdate, isLast }: TaskRowProps) {
  const hasSubtasks =
    (task.level === 0 && (task as TaskLevel0).subtasks && (task as TaskLevel0).subtasks!.length > 0) ||
    (task.level === 1 && (task as TaskLevel1).subtasks && (task as TaskLevel1).subtasks!.length > 0)

  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const attachmentsCount = task.attachments?.length || 0
  const commentsCount = task.commentsCount || 0

  // Get all assignees (including from subtasks) for overlapping avatars
  const assignees: TaskResource[] = []
  if (task.resource) {
    assignees.push(task.resource)
  }
  if (hasSubtasks && task.level === 0) {
    (task as TaskLevel0).subtasks?.forEach((st) => {
      if (st.resource && !assignees.find((a) => a.id === st.resource!.id)) {
        assignees.push(st.resource)
      }
    })
  }
  // Limit to 4 avatars max
  const displayAssignees = assignees.slice(0, 4)

  return (
    <>
      <TableRow className="h-[60px] hover:bg-muted/30 transition-colors border-b border-[#e0e0e1]">
        {/* Checkbox */}
        <TableCell className="w-[40px] px-4">
          <Checkbox className="h-5 w-5" />
        </TableCell>
        
        {/* Task Name - 320px */}
        <TableCell className="w-[320px] px-4">
          <div className="flex items-center gap-4">
            <p className="font-medium text-sm text-[#191d2b] leading-[1.3]">
              {task.name}
            </p>
          </div>
        </TableCell>
        
        {/* Priority - 140px */}
        <TableCell className="w-[140px] px-4 text-center">
          <div className="flex items-center justify-center gap-2 border border-[#c4c9d6] rounded-xl px-3 py-1 w-fit mx-auto">
            <div className={cn("h-2 w-2 rounded-full shrink-0", priority.dotColor)} />
            <p className="font-medium text-sm text-[#191d2b] leading-[1.3]">
              {priority.label}
            </p>
          </div>
        </TableCell>
        
        {/* Assigned To - 150px */}
        <TableCell className="w-[150px] px-4">
          <div className="flex items-center -space-x-2">
            {displayAssignees.length > 0 ? (
              displayAssignees.map((assignee, idx) => (
                <Avatar
                  key={assignee.id || idx}
                  className="h-6 w-6 border-2 border-white rounded-full"
                >
                  <AvatarImage
                    src={getAvatarForUser(assignee.id || assignee.name)}
                    alt={assignee.name}
                  />
                  <AvatarFallback className="text-xs">
                    {assignee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        </TableCell>
        
        {/* Attachments - 100px */}
        <TableCell className="w-[100px] px-4 text-center">
          <p className="font-medium text-sm text-[#191d2b] leading-[1.3]">
            {attachmentsCount}
          </p>
        </TableCell>
        
        {/* Comments - 100px */}
        <TableCell className="w-[100px] px-4 text-center">
          <p className="font-medium text-sm text-[#191d2b] leading-[1.3]">
            {commentsCount}
          </p>
        </TableCell>
        
        {/* Status - 140px */}
        <TableCell className="w-[140px] px-4">
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={task.status}
              onValueChange={(value: TaskStatus) => {
                if (onStatusUpdate) {
                  onStatusUpdate(task.id, value)
                }
              }}
            >
              <SelectTrigger className="w-full h-auto border-0 p-0 bg-transparent hover:bg-transparent">
                <div className={cn("rounded-full px-2 py-1 w-fit", status.bgColor)}>
                  <p className={cn("font-medium text-sm leading-[1.3] text-center", status.textColor)}>
                    {status.label}
                  </p>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableCell>
        
        {/* Due Date - 170px */}
        <TableCell className="w-[170px] px-4 text-center">
          <p className="font-medium text-sm text-[#191d2b] leading-[1.3]">
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </p>
        </TableCell>
        
        {/* Actions */}
        <TableCell className="px-4">
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
      
      {/* Subtasks Accordion */}
      {hasSubtasks && task.level === 0 && (
        <TableRow className="border-b border-[#e0e0e1]">
          <TableCell colSpan={9} className="p-0">
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={expandedRows[task.id] ? task.id : undefined}
              onValueChange={(value) => {
                if (value === task.id) {
                  onToggleExpand(task.id)
                } else {
                  onToggleExpand(task.id)
                }
              }}
            >
              <AccordionItem value={task.id} className="border-0">
                <AccordionTrigger className="px-4 py-2 hover:no-underline text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>
                      {hasSubtasks && task.level === 0
                        ? `${(task as TaskLevel0).subtasks?.length || 0} subtasks`
                        : ""}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                    {task.level === 0 &&
                      (task as TaskLevel0).subtasks?.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-background transition-colors"
                        >
                          <Checkbox
                            checked={subtask.status === "completed"}
                            onCheckedChange={(checked) => {
                              if (onStatusUpdate) {
                                onStatusUpdate(
                                  subtask.id,
                                  checked ? "completed" : "not-started"
                                )
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <span
                            className={cn(
                              "flex-1 text-sm",
                              subtask.status === "completed" &&
                                "line-through text-muted-foreground"
                            )}
                          >
                            {subtask.name}
                          </span>
                          {subtask.resource && (
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={getAvatarForUser(
                                  subtask.resource.id || subtask.resource.name
                                )}
                                alt={subtask.resource.name}
                              />
                              <AvatarFallback className="text-xs">
                                {subtask.resource.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

type TaskFilter = "all" | "today" | "this-week" | "overdue" | "completed"

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

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: userLoading } = useUserContext()
  const queryClient = useQueryClient()

  // Redirect non-superadmins to my-tasks
  useEffect(() => {
    if (!userLoading && user && !user.isSuperadmin) {
      router.push('/my-tasks')
    }
  }, [user, userLoading, router])
  
  // Initialize search query from URL parameter
  const initialSearchQuery = searchParams.get('q') || ""
  
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all")
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [assignedToFilter, setAssignedToFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<TaskSort['field']>("updated_at")
  const [sortDirection, setSortDirection] = useState<TaskSort['direction']>("desc")
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")
  
  // Determine if user is superadmin
  const isSuperAdmin = !userLoading && user?.isSuperadmin

  // Fetch assignable users and projects (only for superadmin)
  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
    enabled: !userLoading && !!user && user.isSuperadmin,
  })

  const { data: projects } = useQuery({
    queryKey: ["projects-for-tasks"],
    queryFn: getProjectsForTasks,
    enabled: !userLoading && !!user && user.isSuperadmin,
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
    // Note: getTasks handles role-based filtering on server side
    // For superadmin it returns all tasks, for others it filters
    // Only enable query when user is loaded and is superadmin
    enabled: !userLoading && !!user && user.isSuperadmin,
    retry: 1,
    staleTime: 30000, // 30 seconds
  })
  
  const statusUpdateMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
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

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
    await queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
    await queryClient.invalidateQueries({ queryKey: ["my-tasks"] })
  }
  
  const handleStatusUpdate = (taskId: string, status: TaskStatus) => {
    statusUpdateMutation.mutate({ taskId, status })
  }

  const [expandedRows, setExpandedRows] = useState<ExpandedRows>(() => {
    // Expand all level 0 tasks by default - initialize empty, will be set when tasks load
    return {}
  })

  // Expand all level 0 tasks by default when tasks are loaded
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

  // Calculate counts - must be before early returns
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

  // Filter tasks based on active filter - only level 0 tasks for table view
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    // For table view, only show level 0 tasks (parent tasks)
    // Subtasks will be shown in accordion
    return tasks.filter((task): task is TaskLevel0 => task.level === 0)
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
  // Show skeleton while user is loading
  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
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
      </div>
    )
  }

  // Redirect non-superadmins (handled in useEffect, but show loading while redirecting)
  if (!user || !user.isSuperadmin) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }
  
  // Show loading state when query is loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
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

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header Skeleton */}
              <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              {/* Table Rows Skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-5 gap-4 py-3">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    console.error('Tasks query error:', error)
    return (
      <ErrorState
        title="Failed to load tasks"
        message={error instanceof Error ? error.message : "We couldn't load your tasks. Please check your connection and try again."}
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
            <p className="text-xs text-white/90 mt-0.5">SuperAdmin view: Assign and manage tasks across the organization</p>
          </div>
          <Button onClick={() => router.push("/tasks/create")} variant="secondary" size="sm">
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
        <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {assignableUsers?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
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
              <CardTitle>All Tasks Overview</CardTitle>
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
              <TableRow className="h-[60px] border-b border-[#e0e0e1]">
                <TableHead className="w-[40px] px-4">
                  <Checkbox className="h-5 w-5" />
                </TableHead>
                <TableHead className="w-[320px] px-4 text-left">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Task Name</p>
                </TableHead>
                <TableHead className="w-[140px] px-4 text-center">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Priority</p>
                </TableHead>
                <TableHead className="w-[150px] px-4 text-center">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Assigned To</p>
                </TableHead>
                <TableHead className="w-[100px] px-4 text-center">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Attachments</p>
                </TableHead>
                <TableHead className="w-[100px] px-4 text-center">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Comments</p>
                </TableHead>
                <TableHead className="w-[140px] px-4 text-center">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Status</p>
                </TableHead>
                <TableHead className="w-[170px] px-4 text-center">
                  <p className="font-normal text-sm text-[#191d2b] leading-[1.6]">Due Date</p>
                </TableHead>
                <TableHead className="px-4"></TableHead>
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
                    onDelete={handleDeleteTask}
                    onStatusUpdate={handleStatusUpdate}
                    isLast={index === filteredTasks.length - 1}
                  />
                ))
              ) : tasks && tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24">
                    <EmptyState
                      icon={ListTodo}
                      title="No tasks yet"
                      description="Get started by creating your first task to track your work."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24">
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

