"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { TaskLevel0, TaskPriority, TaskStatus } from "@/lib/types/task"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Calendar, Paperclip, MessageSquare, ExternalLink, Folder, AlertCircle } from "lucide-react"

// Status badge config
const statusConfig: Record<TaskStatus, { label: string; variant: "neutral-outline" | "primary-outline" | "yellow-outline" | "green-outline" | "red-outline" }> = {
  "not-started": { label: "Not Started", variant: "neutral-outline" },
  "in-progress": { label: "In Progress", variant: "primary-outline" },
  "in-review": { label: "In Review", variant: "yellow-outline" },
  "completed": { label: "Completed", variant: "green-outline" },
  "blocked": { label: "Blocked", variant: "red-outline" },
}

// Priority badge config
const priorityConfig: Record<TaskPriority, { label: string; variant: "neutral" | "secondary" | "yellow" | "red" }> = {
  low: { label: "Low", variant: "neutral" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "yellow" },
  urgent: { label: "Urgent", variant: "red" },
}

// Calculate task progress from subtasks or use progress field
function calculateTaskProgress(task: TaskLevel0): number {
  if (task.progress !== undefined) return task.progress
  
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = task.subtasks.filter((st) => st.status === "completed").length
    return Math.round((completed / task.subtasks.length) * 100)
  }
  
  // Default progress based on status
  if (task.status === "completed") return 100
  if (task.status === "in-progress") return 50
  if (task.status === "in-review") return 90
  return 0
}

// Get relative time for due date
function getRelativeDueDate(dueDate: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return "Overdue"
  } else if (diffDays === 0) {
    return "Due today"
  } else if (diffDays === 1) {
    return "Due tomorrow"
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`
  } else {
    return new Date(dueDate).toLocaleDateString("en-US", { 
      day: "numeric", 
      month: "short" 
    })
  }
}

interface TaskKanbanCardProps {
  task: TaskLevel0
  onEdit?: () => void
  onClick?: () => void
}

export function TaskKanbanCard({ task, onEdit, onClick }: TaskKanbanCardProps) {
  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const attachmentsCount = task.attachments?.length || 0
  const commentsCount = task.commentsCount || 0
  const progress = calculateTaskProgress(task)
  
  // Calculate subtask progress
  const subtaskCount = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter(st => st.status === "completed").length || 0
  const subtaskProgressText = subtaskCount > 0 
    ? completedSubtasks === subtaskCount 
      ? "All done" 
      : `${completedSubtasks}/${subtaskCount} done`
    : null
  
  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
  
  // Get assignees - use task resource and collect unique assignees from subtasks
  const assignees: Array<{ id: string; name: string; email?: string; avatar?: string }> = []
  if (task.resource) {
    assignees.push(task.resource)
  }
  if (task.subtasks) {
    task.subtasks.forEach((st) => {
      if (st.resource && !assignees.find((a) => a.id === st.resource!.id)) {
        assignees.push(st.resource)
      }
    })
  }
  
  // Limit to 4 assignees for display (matching Figma)
  const displayAssignees = assignees.slice(0, 4)
  
  // Parse category tags (if category contains comma-separated values)
  const categoryTags = task.category 
    ? task.category.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 3)
    : []

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action menu or drag handle
    if ((e.target as HTMLElement).closest('[data-sortable-handle]') || 
        (e.target as HTMLElement).closest('[data-action-menu]')) {
      e.preventDefault()
      return
    }
    if (onClick) {
      onClick()
    } else {
      window.location.href = `/tasks/${task.id}`
    }
  }

  return (
    <div className="relative">
      <Link 
        href={`/tasks/${task.id}`} 
        onClick={handleCardClick}
        className="block"
      >
        <Card className="border border-border rounded-2xl p-4 bg-white hover:border-primary transition-colors cursor-pointer">
          {/* Header: Status + Priority + Project + Actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={status.variant} 
                className="h-6 px-2.5 py-0.5 rounded-xl text-xs font-medium leading-[1.3]"
              >
                {status.label}
              </Badge>
              <Badge 
                variant={priority.variant} 
                className="h-6 px-2.5 py-0.5 rounded-xl text-xs font-medium leading-[1.3]"
              >
                {priority.label}
              </Badge>
              {task.projectId && (
                <div className="border border-border rounded-xl px-2.5 py-0.5 flex items-center gap-1.5 h-6">
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground leading-[1.3]">
                    Project
                  </span>
                </div>
              )}
            </div>
            <div onClick={(e) => e.stopPropagation()} data-action-menu>
              <RowActionsMenu
                entityType="task"
                entityId={task.id}
                entityName={task.name}
                detailUrl={`/tasks/${task.id}`}
                onEdit={onEdit}
                canView={true}
                canEdit={true}
                canDelete={false}
              />
            </div>
          </div>

          {/* Task Title with Figma Link */}
          <div className="mb-3">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-base text-foreground leading-[18px] flex-1">
                {task.name}
              </h3>
              {task.figmaLink && (
                <a
                  href={task.figmaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:text-primary/80 flex-shrink-0 mt-0.5"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground font-normal leading-5 mt-1.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {categoryTags.length > 0 && (
            <div className="flex gap-2 items-start mb-3 flex-wrap">
              {categoryTags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-muted rounded-full px-2 py-0.5"
                >
                  <span className="text-xs font-medium text-foreground leading-[1.3]">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Progress and Subtask Summary */}
          <div className="flex items-center gap-3 mb-3">
            {/* Progress Circle */}
            <div className="flex items-center gap-1.5">
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 20 20">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-border"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(
                      progress === 100 ? "text-status-completed-foreground" : 
                      progress >= 60 ? "text-primary" : 
                      "text-status-in-progress-foreground"
                    )}
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-muted-foreground leading-[1.3]">
                {progress}%
              </span>
            </div>
            
            {/* Subtask Summary */}
            {subtaskProgressText && (
              <span className="text-xs font-medium text-muted-foreground leading-[1.3]">
                {subtaskProgressText}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-3" />

          {/* Footer: Due Date + Avatars + Attachment/Comment Counts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Due Date */}
              {task.dueDate && (
                <div className={cn(
                  "border rounded-xl px-2.5 py-1 flex items-center gap-1.5 h-6",
                  isOverdue 
                    ? "border-destructive bg-destructive/10" 
                    : "border-border"
                )}>
                  {isOverdue ? (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "text-xs font-medium leading-[1.3]",
                    isOverdue ? "text-destructive" : "text-foreground"
                  )}>
                    {getRelativeDueDate(task.dueDate)}
                  </span>
                </div>
              )}
              
              {/* Assignee Avatars */}
              <div className="flex items-center pl-0 pr-2">
                {displayAssignees.length > 0 ? (
                  displayAssignees.map((assignee, index) => (
                    <Avatar
                      key={assignee.id}
                      className={cn(
                        "h-6 w-6 border-2 border-white rounded-full",
                        index > 0 && "-ml-2"
                      )}
                    >
                      <AvatarImage 
                        src={assignee.avatar || getAvatarForUser(assignee.id || assignee.name)} 
                        alt={assignee.name} 
                      />
                      <AvatarFallback className="text-xs bg-muted">
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))
                ) : (
                  <div className="h-6 w-6 border-2 border-white rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attachment and Comment Counts */}
            <div className="flex items-center gap-2">
              {attachmentsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground leading-[1.3]">
                    {attachmentsCount}
                  </span>
                </div>
              )}
              {commentsCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground leading-[1.3]">
                    {commentsCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

