"use client"

import React, { useState, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskStatus, TaskPriority } from "@/lib/types/task"
import type { CreateTaskInput } from "@/lib/actions/tasks"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { cn } from "@/lib/utils"
import { 
  Circle, 
  ArrowDown, 
  ArrowUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Plus,
  X
} from "lucide-react"

interface CreateTaskFormProps {
  formData: Partial<CreateTaskInput>
  setFormData: (data: Partial<CreateTaskInput>) => void
  assignableUsers: Array<{
    id: string
    name: string
    email?: string
    avatar?: string
  }>
  projects: Array<{
    id: string
    name: string
  }>
  usersLoading: boolean
  projectsLoading: boolean
  subtasks?: Subtask[]
  onSubtasksChange?: (subtasks: Subtask[]) => void
}

interface Subtask {
  id: string
  name: string
  completed: boolean
}

// Priority configuration with icons and colors
const priorityConfig: Record<TaskPriority, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  low: { label: "Low", icon: ArrowDown, color: "text-muted-foreground" },
  medium: { label: "Medium", icon: Circle, color: "text-blue-500" },
  high: { label: "High", icon: ArrowUp, color: "text-yellow-500" },
  urgent: { label: "Urgent", icon: AlertCircle, color: "text-red-500" },
}

// Status configuration with icons and colors
const statusConfig: Record<TaskStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  "not-started": { label: "Not Started", icon: Circle, color: "text-muted-foreground" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-blue-500" },
  "in-review": { label: "In Review", icon: AlertCircle, color: "text-yellow-500" },
  "completed": { label: "Completed", icon: CheckCircle2, color: "text-green-500" },
  "blocked": { label: "Blocked", icon: XCircle, color: "text-red-500" },
}

export function CreateTaskForm({
  formData,
  setFormData,
  assignableUsers,
  projects,
  usersLoading,
  projectsLoading,
  subtasks: externalSubtasks,
  onSubtasksChange,
}: CreateTaskFormProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(externalSubtasks || [])
  const [newSubtaskInput, setNewSubtaskInput] = useState("")
  
  // Sync external subtasks if provided
  React.useEffect(() => {
    if (externalSubtasks) {
      setSubtasks(externalSubtasks)
    }
  }, [externalSubtasks])
  
  const handleAssigneeChange = (userId: string) => {
    setFormData({ ...formData, assignedTo: userId })
  }
  
  const selectedAssignee = assignableUsers.find(u => u.id === formData.assignedTo)
  
  const updateSubtasks = (newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks)
    onSubtasksChange?.(newSubtasks)
  }
  
  const handleAddSubtask = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSubtaskInput.trim()) {
      e.preventDefault()
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        name: newSubtaskInput.trim(),
        completed: false,
      }
      const updated = [...subtasks, newSubtask]
      updateSubtasks(updated)
      setNewSubtaskInput("")
    }
  }
  
  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    )
    updateSubtasks(updated)
  }
  
  const handleDeleteSubtask = (id: string) => {
    const updated = subtasks.filter(st => st.id !== id)
    updateSubtasks(updated)
  }
  
  return (
    <div className="space-y-6">
      {/* Task Name */}
      <div className="space-y-2">
        <Label htmlFor="task-name" className="text-sm font-medium text-foreground">
          Task Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter task name"
          className="h-14 text-base"
          required
        />
      </div>
      
      {/* Project & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project" className="text-sm font-medium text-foreground">
            Project
          </Label>
          <Select
            value={formData.projectId || "__none__"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                projectId: value === "__none__" ? undefined : value,
              })
            }
            disabled={projectsLoading}
          >
            <SelectTrigger id="project" className="h-14">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No Project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-foreground">
            Category
          </Label>
          <Input
            id="category"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value || undefined })
            }
            placeholder="Enter category"
            className="h-14 text-base"
          />
        </div>
      </div>
      
      {/* Assignee To */}
      <div className="space-y-2">
        <Label htmlFor="assignee" className="text-sm font-medium text-foreground">
          Assignee To <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.assignedTo || ""}
          onValueChange={handleAssigneeChange}
          disabled={usersLoading}
        >
          <SelectTrigger id="assignee" className="h-14 w-full">
            <SelectValue placeholder="Select assignee">
              {selectedAssignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={selectedAssignee.avatar || getAvatarForUser(selectedAssignee.id || selectedAssignee.email || selectedAssignee.name)} 
                      alt={selectedAssignee.name}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedAssignee.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedAssignee.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {assignableUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={user.avatar || getAvatarForUser(user.id || user.email || user.name)} 
                      alt={user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                  {user.email && (
                    <span className="text-muted-foreground text-sm">({user.email})</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </Label>
          <Select
            value={formData.status || "not-started"}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as TaskStatus })
            }
          >
            <SelectTrigger id="status" className="h-14">
              <SelectValue>
                {formData.status && (() => {
                  const config = statusConfig[formData.status as TaskStatus]
                  const Icon = config.icon
                  return (
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  )
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([value, config]) => {
                const Icon = config.icon
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-medium text-foreground">
            Priority
          </Label>
          <Select
            value={formData.priority || "medium"}
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value as TaskPriority })
            }
          >
            <SelectTrigger id="priority" className="h-14">
              <SelectValue>
                {formData.priority && (() => {
                  const config = priorityConfig[formData.priority as TaskPriority]
                  const Icon = config.icon
                  return (
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  )
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityConfig).map(([value, config]) => {
                const Icon = config.icon
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Start Date & Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm font-medium text-foreground">
            Start Date
          </Label>
          <div className="relative">
            <DatePicker
              value={formData.startDate ? new Date(formData.startDate) : undefined}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  startDate: date ? date.toISOString().split("T")[0] : undefined,
                })
              }
              placeholder="Select start date"
              className="h-14 w-full"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="due-date" className="text-sm font-medium text-foreground">
            Due Date
          </Label>
          <div className="relative">
            <DatePicker
              value={formData.dueDate ? new Date(formData.dueDate) : undefined}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  dueDate: date ? date.toISOString().split("T")[0] : undefined,
                })
              }
              placeholder="Select due date"
              className="h-14 w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Subtasks */}
      <div className="space-y-2">
        <Label htmlFor="subtasks" className="text-sm font-medium text-foreground">
          Subtasks
        </Label>
        <div className="space-y-2 border border-border rounded-lg p-3 bg-background">
          {/* Add new subtask input */}
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              id="subtasks"
              value={newSubtaskInput}
              onChange={(e) => setNewSubtaskInput(e.target.value)}
              onKeyDown={handleAddSubtask}
              placeholder="Add a subtask and press Enter"
              className="h-10 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
          </div>
          
          {/* Subtasks list */}
          {subtasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 group hover:bg-muted/50 rounded-md p-1.5 -mx-1.5"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    className="shrink-0"
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 hover:bg-destructive/10 rounded"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Detail Task */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-foreground">
          Detail Task
        </Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value || undefined })
          }
          placeholder="Enter task details..."
          className="min-h-[120px] text-base resize-none"
        />
      </div>
    </div>
  )
}

