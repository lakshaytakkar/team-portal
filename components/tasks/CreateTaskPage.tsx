"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { CreateTaskForm } from "./CreateTaskForm"
import { TaskFileUpload } from "./TaskFileUpload"
import { createTask, saveTaskAsDraft, getAssignableUsers, getProjectsForTasks } from "@/lib/actions/tasks"
import { useUser } from "@/lib/hooks/useUser"
import type { CreateTaskInput } from "@/lib/actions/tasks"
import { Loader2 } from "lucide-react"

export function CreateTaskPage() {
  const router = useRouter()
  const { user } = useUser()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState<Partial<CreateTaskInput>>({
    name: "",
    description: "",
    status: "not-started",
    priority: "medium",
    projectId: undefined,
    assignedTo: user?.id,
    dueDate: undefined,
    startDate: undefined,
    category: undefined,
    isDraft: false,
  })
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [subtasks, setSubtasks] = useState<Array<{ id: string; name: string; completed: boolean }>>([])
  
  // Fetch data for dropdowns
  const { data: assignableUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
  })
  
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects-for-tasks"],
    queryFn: getProjectsForTasks,
  })
  
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async (task) => {
      // Upload files after task creation
      if (uploadedFiles.length > 0 && task.id) {
        try {
          const { uploadTaskAttachment, createTaskAttachment } = await import("@/lib/actions/task-attachments")
          for (const file of uploadedFiles) {
            const uploadResult = await uploadTaskAttachment(file, task.id)
            await createTaskAttachment({
              taskId: task.id,
              fileName: uploadResult.fileName,
              fileUrl: uploadResult.url,
              fileSize: uploadResult.fileSize,
              mimeType: uploadResult.mimeType,
            })
          }
        } catch (error) {
          console.error("Failed to upload files:", error)
          toast.error("Task created but some files failed to upload", {
            description: error instanceof Error ? error.message : "Please try uploading files again",
            duration: 5000,
          })
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] })
      toast.success("Task created successfully", {
        description: `Your task **${formData.name || "Task"}** has been created`,
        duration: 3000,
      })
      router.push("/tasks")
    },
    onError: (error: Error) => {
      toast.error("Failed to create task", {
        description: error.message,
        duration: 5000,
      })
    },
  })
  
  const saveDraftMutation = useMutation({
    mutationFn: saveTaskAsDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task saved as draft", {
        description: "You can continue editing it later",
        duration: 3000,
      })
      router.push("/tasks")
    },
    onError: (error: Error) => {
      toast.error("Failed to save draft", {
        description: error.message,
        duration: 5000,
      })
    },
  })
  
  const handleSubmit = async (isDraft: boolean) => {
    if (!formData.name || formData.name.trim().length < 3) {
      toast.error("Validation error", {
        description: "Task name must be at least 3 characters",
        duration: 5000,
      })
      return
    }
    
    if (!formData.assignedTo) {
      toast.error("Validation error", {
        description: "Please assign the task to someone",
        duration: 5000,
      })
      return
    }
    
    // Validate dates
    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate)
      const due = new Date(formData.dueDate)
      if (start > due) {
        toast.error("Validation error", {
          description: "Start date cannot be after due date",
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
      projectId: formData.projectId || undefined,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate || undefined,
      startDate: formData.startDate || undefined,
      category: formData.category || undefined,
      isDraft: isDraft,
    }
    
    if (isDraft) {
      saveDraftMutation.mutate(input)
    } else {
      createMutation.mutate(input)
    }
  }
  
  const isLoading = createMutation.isPending || saveDraftMutation.isPending
  
  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-semibold text-foreground">Create New Task</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="h-11 px-6"
          >
            {saveDraftMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="h-11 px-6"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Submit Task"
            )}
          </Button>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="flex-1 flex gap-6 p-6 overflow-auto">
        {/* Left Column - Form (745px) */}
        <div className="flex-shrink-0" style={{ width: "745px" }}>
          <CreateTaskForm
            formData={formData}
            setFormData={setFormData}
            assignableUsers={assignableUsers || []}
            projects={projects || []}
            usersLoading={usersLoading}
            projectsLoading={projectsLoading}
            subtasks={subtasks}
            onSubtasksChange={setSubtasks}
          />
        </div>
        
        {/* Right Column - File Upload (423px) */}
        <div className="flex-shrink-0" style={{ width: "423px" }}>
          <TaskFileUpload
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            taskId={undefined}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

