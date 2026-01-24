"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormFieldError } from "@/components/ui/form-field-error"
import { DevProject, DevProjectStatus, DevProjectPriority } from "@/lib/types/dev-project"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUrl,
  validateDateRange,
  validateNumberRange,
} from "@/lib/utils/validation"
import { cn } from "@/lib/utils"

interface DevProjectFormProps {
  project?: DevProject
  onSubmit: (data: Partial<DevProject>) => Promise<void>
  onCancel?: () => void
}

export function DevProjectForm({ project, onSubmit, onCancel }: DevProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Partial<DevProject>>({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "planning",
    priority: project?.priority || "medium",
    progress: project?.progress || 0,
    startDate: project?.startDate || "",
    dueDate: project?.dueDate || "",
    linkedBusinessFeature: project?.linkedBusinessFeature || "",
  })

  const validateField = (name: string, value: any) => {
    let error = ""
    
    switch (name) {
      case "name":
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
          const descMax = validateMaxLength(value, 500)
          if (!descMax.isValid) {
            error = descMax.error || ""
          }
        }
        break
      case "linkedBusinessFeature":
        if (value) {
          const urlValidation = validateUrl(value)
          if (!urlValidation.isValid) {
            error = urlValidation.error || ""
          }
        }
        break
      case "progress":
        const progressValidation = validateNumberRange(value, 0, 100)
        if (!progressValidation.isValid) {
          error = progressValidation.error || ""
        }
        break
      case "dueDate":
        if (formData.startDate && value) {
          const dateRangeValidation = validateDateRange(formData.startDate, value)
          if (!dateRangeValidation.isValid) {
            error = dateRangeValidation.error || ""
          }
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

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate all fields
    Object.keys(formData).forEach((key) => {
      if (key === "name" || key === "description" || key === "linkedBusinessFeature" || key === "progress" || key === "dueDate") {
        const error = validateField(key, formData[key as keyof typeof formData])
        if (error) {
          newErrors[key] = error
        }
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
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      const isEdit = !!project
      toast.success(
        isEdit ? "Project updated successfully" : "Project created successfully",
        {
          description: `Your project **${formData.name || "Project"}** has been ${isEdit ? "updated" : "created"}`,
          duration: 3000,
        }
      )
      router.push("/dev/projects")
    } catch (error) {
      console.error("Error submitting project:", error)
      const isEdit = !!project
      toast.error(
        isEdit ? "Failed to update project" : "Failed to create project",
        {
          description: error instanceof Error ? error.message : "An error occurred. Please try again.",
          duration: 5000,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dev/projects")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project ? "Edit Project" : "Create New Project"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                required
                placeholder="Enter project name"
                className={cn("mt-1", errors.name && touched.name && "border-destructive")}
              />
              {touched.name && errors.name && <FormFieldError message={errors.name} />}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
                placeholder="Enter project description"
                className={cn("mt-1", errors.description && touched.description && "border-destructive")}
                rows={4}
              />
              {touched.description && errors.description && <FormFieldError message={errors.description} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: DevProjectStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: DevProjectPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  onBlur={() => handleBlur("dueDate")}
                  className={cn("mt-1", errors.dueDate && touched.dueDate && "border-destructive")}
                />
                {touched.dueDate && errors.dueDate && <FormFieldError message={errors.dueDate} />}
              </div>
            </div>

            <div>
              <Label htmlFor="linkedBusinessFeature">Linked Business Feature</Label>
              <Input
                id="linkedBusinessFeature"
                value={formData.linkedBusinessFeature || ""}
                onChange={(e) => handleChange("linkedBusinessFeature", e.target.value)}
                onBlur={() => handleBlur("linkedBusinessFeature")}
                placeholder="e.g., Dashboard Module, Attendance System"
                className={cn("mt-1", errors.linkedBusinessFeature && touched.linkedBusinessFeature && "border-destructive")}
              />
              {touched.linkedBusinessFeature && errors.linkedBusinessFeature && (
                <FormFieldError message={errors.linkedBusinessFeature} />
              )}
            </div>

            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={(e) => handleChange("progress", parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur("progress")}
                className={cn("mt-1", errors.progress && touched.progress && "border-destructive")}
              />
              {touched.progress && errors.progress && <FormFieldError message={errors.progress} />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dev/projects">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  )
}

