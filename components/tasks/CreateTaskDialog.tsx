"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Loader2 } from "lucide-react"
import { TaskStatus, TaskPriority } from "@/lib/types/task"
import { createTask, getAssignableUsers, getProjectsForTasks, getParentTasks } from "@/lib/actions/tasks"
import { useUser } from "@/lib/hooks/useUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  parentTaskId?: string
}

export function CreateTaskDialog({ open, onOpenChange, projectId, parentTaskId }: CreateTaskDialogProps) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    taskName: "",
    status: "not-started" as TaskStatus,
    priority: "medium" as TaskPriority,
    project: projectId || "__none__",
    description: "",
    dueDate: "",
    assignedTo: "",
    figmaLink: "",
    parentTask: parentTaskId || "__none__",
  })
  
  // Fetch data for dropdowns
  const { data: assignableUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
    enabled: open,
  })
  
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects-for-tasks"],
    queryFn: getProjectsForTasks,
    enabled: open,
  })
  
  const { data: parentTasks, isLoading: parentTasksLoading } = useQuery({
    queryKey: ["parent-tasks"],
    queryFn: () => getParentTasks(),
    enabled: open && !parentTaskId,
  })
  
  // Set default assignedTo to current user for executives
  useEffect(() => {
    if (open && user && user.role === 'executive' && !formData.assignedTo) {
      setFormData(prev => ({ ...prev, assignedTo: user.id }))
    }
  }, [open, user, formData.assignedTo])
  
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] })
      toast.success("Task created successfully", {
        description: `Your task **${formData.taskName || "Task"}** has been created`,
        duration: 3000,
      })
      onOpenChange(false)
      // Reset form
      setFormData({
        taskName: "",
        status: "not-started",
        priority: "medium",
        project: projectId || "__none__",
        description: "",
        dueDate: "",
        assignedTo: "",
        figmaLink: "",
        parentTask: parentTaskId || "__none__",
      })
    },
    onError: (error: Error) => {
      toast.error("Failed to create task", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.taskName || formData.taskName.trim().length < 3) {
      toast.error("Task name must be at least 3 characters")
      return
    }
    
    if (!formData.assignedTo) {
      toast.error("Please assign the task to a team member")
      return
    }
    
    // Convert special values back to undefined
    const projectId = formData.project && formData.project !== "__none__" ? formData.project : undefined
    const parentId = formData.parentTask && formData.parentTask !== "__none__" ? formData.parentTask : undefined
    
      createMutation.mutate({
      name: formData.taskName.trim(),
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      projectId,
      parentId,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate || undefined,
      figmaLink: formData.figmaLink || undefined,
    })
  }

  const handleCancel = () => {
    setFormData({
      taskName: "",
      status: "not-started",
      priority: "medium",
      project: projectId || "__none__",
      description: "",
      dueDate: "",
      assignedTo: "",
      figmaLink: "",
      parentTask: parentTaskId || "__none__",
    })
    onOpenChange(false)
  }
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        taskName: "",
        status: "not-started",
        priority: "medium",
        project: projectId || "__none__",
        description: "",
        dueDate: "",
        assignedTo: "",
        figmaLink: "",
        parentTask: parentTaskId || "__none__",
      })
    }
  }, [open, projectId, parentTaskId])
  
  // Get selected user for display
  const selectedUser = assignableUsers?.find(u => u.id === formData.assignedTo)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {/* Task Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Task Name <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                placeholder="Enter task name"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Status <span className="text-[#df1c41]">*</span>
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select status" />
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

            {/* Assigned To */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Assigned To <span className="text-[#df1c41]">*</span>
              </Label>
              <Select 
                value={formData.assignedTo} 
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  {selectedUser ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={getAvatarForUser(selectedUser.id || selectedUser.name)} alt={selectedUser.name} />
                        <AvatarFallback className="text-xs">
                          {selectedUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedUser.name}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select assignee" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="__loading__" disabled>Loading users...</SelectItem>
                  ) : (
                    assignableUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarForUser(user.id || user.name)} alt={user.name} />
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
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Priority <span className="text-[#df1c41]">*</span>
              </Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional Fields - Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-info">
                <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                  Additional Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Project (Optional) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Project
                    </Label>
                    <Select 
                      value={formData.project || "__none__"} 
                      onValueChange={(value) => setFormData({ ...formData, project: value })}
                    >
                      <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                        <SelectValue placeholder="Select project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {projectsLoading ? (
                          <SelectItem value="__loading__" disabled>Loading projects...</SelectItem>
                        ) : (
                          projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Description
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter task description"
                      className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Due Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
                  </div>

                  {/* Figma Link */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Figma Link
                    </Label>
                    <Input
                      type="url"
                      value={formData.figmaLink}
                      onChange={(e) => setFormData({ ...formData, figmaLink: e.target.value })}
                      placeholder="https://figma.com/design/..."
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
                  </div>

                  {/* Parent Task */}
                  {!parentTaskId && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                        Parent Task
                      </Label>
                      <Select 
                        value={formData.parentTask || "__none__"} 
                        onValueChange={(value) => setFormData({ ...formData, parentTask: value })}
                      >
                        <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                          <SelectValue placeholder="Select parent task (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {parentTasksLoading ? (
                            <SelectItem value="__loading__" disabled>Loading tasks...</SelectItem>
                          ) : (
                            parentTasks?.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.name} {task.level === 0 ? '(Level 0)' : '(Level 1)'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              size="md"
              className="w-[128px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              className="w-[128px]"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



