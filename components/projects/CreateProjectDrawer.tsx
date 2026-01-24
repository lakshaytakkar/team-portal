"use client"

import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
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
import { X } from "lucide-react"
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
} from "@/lib/utils/validation"
import { cn } from "@/lib/utils"

interface CreateProjectDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDrawer({ open, onOpenChange }: CreateProjectDrawerProps) {
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    dueDate: "",
    description: "",
    projectManager: "",
    teamMembers: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string) => {
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
      case "projectType":
      case "dueDate":
      case "projectManager":
      case "teamMembers":
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
    
    try {
      // Handle form submission
      console.log("Create project:", formData)
      toast.success("Project created successfully", {
        description: `Your project **${formData.projectName || "Project"}** has been created`,
        duration: 3000,
      })
      // Reset form
      setFormData({
        projectName: "",
        projectType: "",
        dueDate: "",
        description: "",
        projectManager: "",
        teamMembers: "",
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
    }
  }

  const handleCancel = () => {
    setFormData({
      projectName: "",
      projectType: "",
      dueDate: "",
      description: "",
      projectManager: "",
      teamMembers: "",
    })
    setErrors({})
    setTouched({})
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col"
        hideCloseButton={true}
      >
        {/* Header */}
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            Create New Project
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
          >
            <X className="h-6 w-6 text-[#666d80]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

            {/* Project Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Type <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => handleChange("projectType", value)}
              >
                <SelectTrigger className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                  errors.projectType && touched.projectType && "border-destructive"
                )}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {touched.projectType && errors.projectType && <FormFieldError message={errors.projectType} />}
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
                Description <span className="text-[#df1c41]">*</span>
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
                required
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
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                  <SelectItem value="user3">Robert Johnson</SelectItem>
                </SelectContent>
              </Select>
              {touched.projectManager && errors.projectManager && <FormFieldError message={errors.projectManager} />}
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Team Members <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.teamMembers}
                onValueChange={(value) => handleChange("teamMembers", value)}
              >
                <SelectTrigger className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                  errors.teamMembers && touched.teamMembers && "border-destructive"
                )}>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Development Team</SelectItem>
                  <SelectItem value="team2">Design Team</SelectItem>
                  <SelectItem value="team3">Marketing Team</SelectItem>
                </SelectContent>
              </Select>
              {touched.teamMembers && errors.teamMembers && <FormFieldError message={errors.teamMembers} />}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
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
            >
              Submit
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

