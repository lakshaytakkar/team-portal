"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Minus, ExternalLink, User } from "lucide-react"
import { Task, TaskLevel0, TaskLevel1, TaskLevel2 } from "@/lib/types/task"
import { initialTasks } from "@/lib/data/tasks"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"

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

interface ExpandedRows {
  [key: string]: boolean
}

async function fetchTasks() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialTasks.tasks
}

interface TaskRowProps {
  task: Task
  level: number
  expandedRows: ExpandedRows
  onToggleExpand: (taskId: string) => void
  isLast?: boolean
}

function TaskRow({ task, level, expandedRows, onToggleExpand, isLast }: TaskRowProps) {
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
          "hover:bg-muted/30 transition-colors",
          level === 0 && "bg-muted/20 font-semibold",
          level === 1 && "bg-muted/10",
          level === 2 && "text-sm"
        )}
      >
        <TableCell className={cn("font-medium max-w-md", indentClass)}>
          <div className="flex items-center gap-2">
            {hasSubtasks ? (
              <button
                onClick={() => onToggleExpand(task.id)}
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
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
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
                <AvatarImage src={getAvatarForUser(task.resource.id || task.resource.name)} alt={task.resource.name} />
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
          {new Date(task.updatedAt).toLocaleDateString()}
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
                isLast={index === (task as TaskLevel1).subtasks!.length - 1}
              />
            ))}
        </>
      )}
    </>
  )
}

type TaskFilter = "all" | "today" | "this-week" | "overdue" | "completed"

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all")
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["project-tasks"],
    queryFn: fetchTasks,
  })

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

  // Filter tasks based on active filter - must be before early returns
  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

    const filterTask = (task: Task): boolean => {
      // For now, we'll use updatedAt as dueDate proxy since tasks don't have dueDate yet
      const taskDate = new Date(task.updatedAt)
      taskDate.setHours(0, 0, 0, 0)

      switch (activeFilter) {
        case "today":
          return taskDate.getTime() === today.getTime()
        case "this-week":
          return taskDate >= today && taskDate <= endOfWeek
        case "overdue":
          return taskDate < today && task.status !== "completed"
        case "completed":
          return task.status === "completed"
        case "all":
        default:
          return true
      }
    }

    const filterRecursive = (task: Task): Task | null => {
      const matches = filterTask(task)
      const filteredSubtasks: Task[] = []
      
      if (task.level === 0 && (task as TaskLevel0).subtasks) {
        (task as TaskLevel0).subtasks!.forEach((subtask) => {
          const filtered = filterRecursive(subtask)
          if (filtered) filteredSubtasks.push(filtered)
        })
      } else if (task.level === 1 && (task as TaskLevel1).subtasks) {
        (task as TaskLevel1).subtasks!.forEach((subtask) => {
          const filtered = filterRecursive(subtask)
          if (filtered) filteredSubtasks.push(filtered)
        })
      }

      if (matches || filteredSubtasks.length > 0) {
        const filtered = { ...task }
        if (task.level === 0) {
          (filtered as TaskLevel0).subtasks = filteredSubtasks.length > 0 ? filteredSubtasks as TaskLevel1[] : undefined
        } else if (task.level === 1) {
          (filtered as TaskLevel1).subtasks = filteredSubtasks.length > 0 ? filteredSubtasks as TaskLevel2[] : undefined
        }
        return filtered
      }
      return null
    }

    return tasks.map(filterRecursive).filter((task): task is Task => task !== null)
  }, [tasks, activeFilter])

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading tasks. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground leading-[1.35]">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage all your project tasks from design to completion
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as TaskFilter)}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger 
            value="all" 
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="today"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="this-week"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            This Week
          </TabsTrigger>
          <TabsTrigger 
            value="overdue"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Overdue
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tasks?.filter((t) => t.status === "in-progress").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
          <CardDescription>
            Expand or collapse task groups to view subtasks. Click the Figma icon to view designs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Last Updated</TableHead>
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
                    isLast={index === filteredTasks.length - 1}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No tasks found for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

