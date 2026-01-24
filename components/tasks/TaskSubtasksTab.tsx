"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, ListTodo, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/sonner"
import { createTask, getAssignableUsers, getTaskTreeById } from "@/lib/actions/tasks"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types/task"
import { getAvatarForUser } from "@/lib/utils/avatars"
import type { CreateTaskInput } from "@/lib/actions/tasks"

interface TaskSubtasksTabProps {
  taskId: string
  task: Task | null
}

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

export function TaskSubtasksTab({ taskId, task }: TaskSubtasksTabProps) {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateTaskInput>>({
    name: "",
    description: "",
    status: "not-started",
    priority: "medium",
    assignedTo: undefined,
    dueDate: undefined,
  })

  // Fetch assignable users
  const { data: assignableUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
  })

  // Create subtask mutation
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-tree", taskId] })
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Subtask created successfully", {
        description: `"${formData.name}" has been added`,
        duration: 3000,
      })
      setFormData({
        name: "",
        description: "",
        status: "not-started",
        priority: "medium",
        assignedTo: undefined,
        dueDate: undefined,
      })
      setShowCreateForm(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to create subtask", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.name.trim().length < 3) {
      toast.error("Validation error", {
        description: "Subtask name must be at least 3 characters",
        duration: 5000,
      })
      return
    }

    // Check if task can have more subtasks (max level is 2)
    if (task) {
      const currentLevel = task.level
      if (currentLevel >= 2) {
        toast.error("Cannot create subtask", {
          description: "Maximum task depth is 2 levels",
          duration: 5000,
        })
        return
      }
    }

    const input: CreateTaskInput = {
      name: formData.name.trim(),
      description: formData.description || undefined,
      status: formData.status || "not-started",
      priority: formData.priority || "medium",
      parentId: taskId,
      assignedTo: formData.assignedTo || undefined,
      dueDate: formData.dueDate || undefined,
    }

    createMutation.mutate(input)
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      status: "not-started",
      priority: "medium",
      assignedTo: undefined,
      dueDate: undefined,
    })
    setShowCreateForm(false)
  }

  // Get subtasks from task
  const subtasks: Task[] = []
  if (task) {
    if ("subtasks" in task && task.subtasks) {
      if (task.level === 0) {
        subtasks.push(...(task.subtasks as any))
      } else if (task.level === 1) {
        subtasks.push(...(task.subtasks as any))
      }
    }
  }

  const selectedAssignee = assignableUsers.find(u => u.id === formData.assignedTo)

  return (
    <div className="space-y-6">
      {/* Create Subtask Button */}
      {!showCreateForm && (
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Subtask
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Subtask Form */}
      {showCreateForm && (
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Create New Subtask</h3>
              </div>

              {/* Task Name */}
              <div className="space-y-2">
                <Label htmlFor="subtask-name" className="text-sm font-medium text-foreground">
                  Subtask Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subtask-name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter subtask name"
                  className="h-11"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="subtask-description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="subtask-description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value || undefined })
                  }
                  placeholder="Enter subtask description"
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtask-status" className="text-sm font-medium text-foreground">
                    Status
                  </Label>
                  <Select
                    value={formData.status || "not-started"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as TaskStatus })
                    }
                  >
                    <SelectTrigger id="subtask-status" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtask-priority" className="text-sm font-medium text-foreground">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority || "medium"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value as TaskPriority })
                    }
                  >
                    <SelectTrigger id="subtask-priority" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtask-assignee" className="text-sm font-medium text-foreground">
                    Assign To
                  </Label>
                  <Select
                    value={formData.assignedTo || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assignedTo: value || undefined })
                    }
                    disabled={usersLoading}
                  >
                    <SelectTrigger id="subtask-assignee" className="h-11">
                      <SelectValue placeholder="Select assignee">
                        {selectedAssignee && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={getAvatarForUser(selectedAssignee.id || selectedAssignee.name)}
                                alt={selectedAssignee.name}
                              />
                              <AvatarFallback className="text-xs">
                                {selectedAssignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{selectedAssignee.name}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {assignableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={getAvatarForUser(user.id || user.name)}
                                alt={user.name}
                              />
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtask-due-date" className="text-sm font-medium text-foreground">
                    Due Date
                  </Label>
                  <DatePicker
                    value={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        dueDate: date ? date.toISOString().split("T")[0] : undefined,
                      })
                    }
                    placeholder="Select due date"
                    className="h-11 w-full"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Subtask"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subtasks List */}
      {subtasks.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Subtasks ({subtasks.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              Child tasks of this task
            </p>
          </div>

          <div className="space-y-3">
            {subtasks.map((subtask) => {
              const subtaskStatus = statusConfig[subtask.status]
              const subtaskPriority = priorityConfig[subtask.priority]
              return (
                <Card key={subtask.id} className="border border-border rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{subtask.name}</h4>
                        {subtask.description && (
                          <p className="text-sm text-muted-foreground">{subtask.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <Badge
                          variant={subtaskStatus.variant}
                          className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                        >
                          {subtaskStatus.label}
                        </Badge>
                        <Badge
                          variant={subtaskPriority.variant}
                          className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                        >
                          {subtaskPriority.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {subtask.resource && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={getAvatarForUser(subtask.resource.id || subtask.resource.name)}
                              alt={subtask.resource.name}
                            />
                            <AvatarFallback className="text-xs">
                              {subtask.resource.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{subtask.resource.name}</span>
                        </div>
                      )}
                      {subtask.dueDate && (
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(subtask.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {subtask.figmaLink && (
                        <a
                          href={subtask.figmaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Figma
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-8 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No subtasks yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {!showCreateForm && "Click 'Create Subtask' to add one"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

