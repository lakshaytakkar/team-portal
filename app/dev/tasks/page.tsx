"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
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
import { Plus, Minus, ExternalLink, User, FileText, Sparkles, Edit, Trash2, MoreVertical, CheckSquare } from "lucide-react"
import { DevTask, DevTaskLevel0, DevTaskLevel1, DevTaskLevel2 } from "@/lib/types/dev-task"
import { initialDevTasks } from "@/lib/data/dev-tasks"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Button } from "@/components/ui/button"

const statusConfig = {
  "not-started": { label: "Not Started", variant: "neutral-outline" as const },
  "in-progress": { label: "In Progress", variant: "primary-outline" as const },
  "in-review": { label: "In Review", variant: "yellow-outline" as const },
  "completed": { label: "Completed", variant: "green-outline" as const },
  "blocked": { label: "Blocked", variant: "red-outline" as const },
}

const priorityConfig = {
  low: { label: "Low", variant: "neutral" as const },
  medium: { label: "Medium", variant: "secondary" as const },
  high: { label: "High", variant: "yellow" as const },
  urgent: { label: "Urgent", variant: "red" as const },
}

interface ExpandedRows {
  [key: string]: boolean
}

async function fetchDevTasks() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialDevTasks.tasks
}

interface DevTaskRowProps {
  task: DevTask
  level: number
  expandedRows: ExpandedRows
  onToggleExpand: (taskId: string) => void
  isLast?: boolean
}

function DevTaskRow({ task, level, expandedRows, onToggleExpand, isLast }: DevTaskRowProps) {
  const hasSubtasks =
    (task.level === 0 && (task as DevTaskLevel0).subtasks && (task as DevTaskLevel0).subtasks!.length > 0) ||
    (task.level === 1 && (task as DevTaskLevel1).subtasks && (task as DevTaskLevel1).subtasks!.length > 0)

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
        <TableCell className={cn("font-bold max-w-md py-4", indentClass)}>
          <div className="flex items-center gap-3">
            {hasSubtasks ? (
              <button
                onClick={() => onToggleExpand(task.id)}
                className="p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <Minus className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <div className="w-5.5 flex-shrink-0" />
            )}
            <span className={cn(
              "tracking-tight transition-colors",
              level === 0 ? "text-foreground text-sm" : "text-muted-foreground text-[13px] font-medium"
            )}>
              {task.name}
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              {task.figmaLink && (
                <a
                  href={task.figmaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {task.docLinks && task.docLinks.length > 0 && (
                <span title={`${task.docLinks.length} doc(s)`}>
                  <FileText className="h-3 w-3 text-primary/60" />
                </span>
              )}
              {task.promptUsed && (
                <span title="Prompt used">
                  <Sparkles className="h-3 w-3 text-primary/60" />
                </span>
              )}
            </div>
          </div>
          {task.description && (
            <div className={cn(
              "text-muted-foreground/60 text-[11px] mt-1 font-medium leading-relaxed max-w-xs truncate",
              level > 0 && "ml-0"
            )}>
              {task.description}
            </div>
          )}
        </TableCell>
        <TableCell className="py-4">
          <Badge variant="outline" className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-border/50 text-muted-foreground">
            {status.label}
          </Badge>
        </TableCell>
        <TableCell className="py-4">
          <Badge variant="outline" className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider border-border/50 text-muted-foreground">
            {priority.label}
          </Badge>
        </TableCell>
        <TableCell className="py-4">
          {task.assignedTo ? (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-6 w-6 border border-border/50">
                <AvatarImage src={getAvatarForUser(task.assignedTo.id || task.assignedTo.name)} alt={task.assignedTo.name} />
                <AvatarFallback className="text-[10px] bg-secondary font-bold">
                  {task.assignedTo.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-muted-foreground tracking-tight">{task.assignedTo.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/40 text-[11px] font-bold uppercase tracking-widest">
              Open
            </span>
          )}
        </TableCell>
        <TableCell className="py-4 px-6 text-right">
          <span className="text-[11px] font-bold text-muted-foreground/60 tabular-nums">
            {new Date(task.updatedAt).toLocaleDateString()}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Link href={`/dev/tasks/${task.id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {hasSubtasks && isExpanded && (
        <>
          {task.level === 0 &&
            (task as DevTaskLevel0).subtasks?.map((subtask, index) => (
              <DevTaskRow
                key={subtask.id}
                task={subtask}
                level={1}
                expandedRows={expandedRows}
                onToggleExpand={onToggleExpand}
                isLast={index === (task as DevTaskLevel0).subtasks!.length - 1}
              />
            ))}
          {task.level === 1 &&
            (task as DevTaskLevel1).subtasks?.map((subtask, index) => (
              <DevTaskRow
                key={subtask.id}
                task={subtask}
                level={2}
                expandedRows={expandedRows}
                onToggleExpand={onToggleExpand}
                isLast={index === (task as DevTaskLevel1).subtasks!.length - 1}
              />
            ))}
        </>
      )}
    </>
  )
}

export default function DevTasksPage() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["dev-tasks"],
    queryFn: fetchDevTasks,
  })

  const [expandedRows, setExpandedRows] = useState<ExpandedRows>(() => {
    return {}
  })

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

  if (isLoading) {
    return (
      <div className="space-y-10 pb-12">
        {/* Header Skeleton */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-secondary/20 border-border/40 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Card className="bg-secondary/20 border-border/40 overflow-hidden">
            <CardContent className="p-0">
              <div className="space-y-3 p-6">
                {/* Table Header Skeleton */}
                <div className="grid grid-cols-6 gap-4 pb-4 border-b border-border/40">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                {/* Table Rows Skeleton */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive font-bold">Failed to synchronize tasks.</div>
      </div>
    )
  }

  const completedCount = tasks?.reduce((acc, task) => {
    const countCompleted = (t: DevTask): number => {
      let total = t.status === "completed" ? 1 : 0
      if (t.level === 0 && (t as DevTaskLevel0).subtasks) {
        total += (t as DevTaskLevel0).subtasks!.reduce((sum, st) => sum + countCompleted(st), 0)
      } else if (t.level === 1 && (t as DevTaskLevel1).subtasks) {
        total += (t as DevTaskLevel1).subtasks!.reduce((sum, st) => sum + countCompleted(st), 0)
      }
      return total
    }
    return acc + countCompleted(task)
  }, 0) || 0

  const totalCount = tasks?.reduce((acc, task) => {
    const countTotal = (t: DevTask): number => {
      let total = 1
      if (t.level === 0 && (t as DevTaskLevel0).subtasks) {
        total += (t as DevTaskLevel0).subtasks!.reduce((sum, st) => sum + countTotal(st), 0)
      } else if (t.level === 1 && (t as DevTaskLevel1).subtasks) {
        total += (t as DevTaskLevel1).subtasks!.reduce((sum, st) => sum + countTotal(st), 0)
      }
      return total
    }
    return acc + countTotal(task)
  }, 0) || 0

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="tracking-tighter">Development Tasks</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Granular task tracking with integrated resources and AI-driven insights.
          </p>
        </div>
        <Link href="/dev/tasks/new">
          <Button className="font-bold tracking-tight px-6 h-11 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4.5 w-4.5 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Total Backlog", value: totalCount, icon: FileText, color: "text-primary" },
          { label: "Shipped", value: completedCount, icon: CheckSquare, color: "text-emerald-500" },
          { label: "In Flight", value: tasks?.filter((t) => t.status === "in-progress").length || 0, icon: Sparkles, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-secondary/20 border-border/40 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className="bg-secondary p-3 rounded-xl border border-border/50">
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">System Tasks</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 border-border/40 bg-secondary/20 font-bold tracking-tight">
              Export CSV
            </Button>
          </div>
        </div>
        <Card className="bg-secondary/20 border-border/40 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/40 border-b border-border/40">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Issue Name</TableHead>
                  <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</TableHead>
                  <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Owner</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <DevTaskRow
                      key={task.id}
                      task={task}
                      level={0}
                      expandedRows={expandedRows}
                      onToggleExpand={onToggleExpand}
                      isLast={index === tasks.length - 1}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-secondary rounded-full border border-border/40">
                          <FileText className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold tracking-tight">No issues found</p>
                          <p className="text-sm text-muted-foreground">The backlog is currently clear.</p>
                        </div>
                        <Link href="/dev/tasks/new" className="mt-2">
                          <Button variant="outline" size="sm" className="font-bold tracking-tight px-6 h-10 border-border/40">
                            <Plus className="h-4 w-4 mr-2" />
                            Initialize Task
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

