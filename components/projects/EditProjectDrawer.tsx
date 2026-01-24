"use client"

import { useState, useEffect } from "react"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { X } from "lucide-react"
import { Project, ProjectStatus, ProjectPriority } from "@/lib/types/project"

interface EditProjectDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export function EditProjectDrawer({ open, onOpenChange, project }: EditProjectDrawerProps) {
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
    dueDate: "",
    description: "",
    projectManager: "",
    teamMembers: "",
    startDate: "",
    priority: "medium" as ProjectPriority,
    status: "planning" as ProjectStatus,
  })

  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.name || "",
        projectType: "",
        dueDate: project.dueDate || "",
        description: project.description || "",
        projectManager: project.owner?.id || "",
        teamMembers: "",
        startDate: project.startDate || "",
        priority: project.priority,
        status: project.status,
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Update project:", formData)
      toast.success("Project updated successfully", {
        description: `Your project **${formData.projectName || "Project"}** has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating project:", error)
      toast.error("Failed to update project", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!project) return null

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
            Edit Project
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
            {/* Required Fields */}
            
            {/* Project Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Name <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="Enter project name"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Type <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
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
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Due Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Description <span className="text-[#df1c41]">*</span>
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                className="min-h-[180px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                maxLength={200}
                required
              />
              <div className="flex items-end justify-between">
                <span className="text-xs text-[#a4acb9] tracking-[0.24px]">
                  {formData.description.length}/200
                </span>
              </div>
            </div>

            {/* Project Manager */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Manager <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.projectManager} onValueChange={(value) => setFormData({ ...formData, projectManager: value })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select project manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                  <SelectItem value="user3">Robert Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Team Members <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.teamMembers} onValueChange={(value) => setFormData({ ...formData, teamMembers: value })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Development Team</SelectItem>
                  <SelectItem value="team2">Design Team</SelectItem>
                  <SelectItem value="team3">Marketing Team</SelectItem>
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
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Priority
                    </Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: ProjectPriority) => setFormData({ ...formData, priority: value })}
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

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Status
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
              Update Project
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


