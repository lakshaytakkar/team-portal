"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { FormFieldError } from "@/components/ui/form-field-error"
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
} from "@/lib/utils/validation"
import { cn } from "@/lib/utils"
import { createProject } from "@/lib/actions/projects"
import { getManagers } from "@/lib/actions/hr"
import type { ProjectStatus, ProjectPriority } from "@/lib/types/project"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectName: "",
    status: "planning" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    dueDate: "",
    description: "",
    projectManager: "",
    teamMembers: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Fetch managers/users for dropdowns
  const { data: managers = [] } = useQuery({
    queryKey: ["managers"],
    queryFn: getManagers,
    enabled: open,
  })

  const validateField = (name: string, value: string | string[]) => {
    // Skip validation for array fields
    if (Array.isArray(value)) return ""
    let error = ""
    
    switch (name) {
      case "projectName":
        const nameRequired = validateRequired(value)
        if (!nameRequired.isValid) {
          error = nameRequired.error || ""
        } else {
          const nameMin = validateMinLength(value, 3)
          if (!nameMin.isValid) {
            error = nameMin.error || ""
          } else {
            const nameMax = validateMaxLength(value, 100)
            if (!nameMax.isValid) {
              error = nameMax.error || ""
            }
          }
        }
        break
      case "description":
        if (value) {
          const descMax = validateMaxLength(value, 200)
          if (!descMax.isValid) {
            error = descMax.error || ""
          }
        }
        break
      case "status":
      case "priority":
      case "dueDate":
      case "projectManager":
        const required = validateRequired(value)
        if (!required.isValid) {
          error = required.error || ""
        }
        break
    }
    
    return error
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name as keyof typeof formData])
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        newErrors[key] = error
      }
    })
    
    setErrors(newErrors)
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>)
    )
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some fields have validation errors. Please check and try again.",
        duration: 5000,
      })
      return
    }
    
    if (!formData.projectManager) {
      toast.error("Project manager is required")
      return
    }
    
    setIsSubmitting(true)
    try {
      await createProject({
        name: formData.projectName,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        ownerId: formData.projectManager,
        teamMemberIds: formData.teamMembers,
      })
      
      toast.success("Project created successfully", {
        description: `Your project **${formData.projectName}** has been created`,
        duration: 3000,
      })
      
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      
      // Reset form
      setFormData({
        projectName: "",
        status: "planning" as ProjectStatus,
        priority: "medium" as ProjectPriority,
        dueDate: "",
        description: "",
        projectManager: "",
        teamMembers: [],
      })
      setErrors({})
      setTouched({})
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Failed to create project", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      projectName: "",
      status: "planning" as ProjectStatus,
      priority: "medium" as ProjectPriority,
      dueDate: "",
      description: "",
      projectManager: "",
      teamMembers: [],
    })
    setErrors({})
    setTouched({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Name <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.projectName}
                onChange={(e) => handleChange("projectName", e.target.value)}
                onBlur={() => handleBlur("projectName")}
                placeholder="Enter project name"
                className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]",
                  errors.projectName && touched.projectName && "border-destructive"
                )}
                required
              />
              {touched.projectName && errors.projectName && <FormFieldError message={errors.projectName} />}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Status <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as ProjectStatus)}
              >
                <SelectTrigger className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                  errors.status && touched.status && "border-destructive"
                )}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {touched.status && errors.status && <FormFieldError message={errors.status} />}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Priority <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value as ProjectPriority)}
              >
                <SelectTrigger className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                  errors.priority && touched.priority && "border-destructive"
                )}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {touched.priority && errors.priority && <FormFieldError message={errors.priority} />}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Due Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                onBlur={() => handleBlur("dueDate")}
                className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]",
                  errors.dueDate && touched.dueDate && "border-destructive"
                )}
                required
              />
              {touched.dueDate && errors.dueDate && <FormFieldError message={errors.dueDate} />}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
                placeholder="Enter project description"
                className={cn(
                  "min-h-[180px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]",
                  errors.description && touched.description && "border-destructive"
                )}
                maxLength={200}
              />
              <div className="flex items-end justify-between">
                <span className="text-xs text-[#a4acb9] tracking-[0.24px]">
                  {formData.description.length}/200
                </span>
              </div>
              {touched.description && errors.description && <FormFieldError message={errors.description} />}
            </div>

            {/* Project Manager */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Manager <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.projectManager}
                onValueChange={(value) => handleChange("projectManager", value)}
              >
                <SelectTrigger className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                  errors.projectManager && touched.projectManager && "border-destructive"
                )}>
                  <SelectValue placeholder="Select project manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name || manager.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.projectManager && errors.projectManager && <FormFieldError message={errors.projectManager} />}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              size="md"
              className="w-[128px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              className="w-[128px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

