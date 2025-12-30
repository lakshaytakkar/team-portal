"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Project, ProjectStatus, ProjectPriority } from "@/lib/types/project"
import { updateProject } from "@/lib/actions/projects"
import { getManagers } from "@/lib/actions/hr"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export function EditProjectDialog({ open, onOpenChange, project }: EditProjectDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectName: "",
    dueDate: "",
    description: "",
    projectManager: "",
    teamMembers: [] as string[],
    startDate: "",
    priority: "medium" as ProjectPriority,
    status: "planning" as ProjectStatus,
  })

  // Fetch managers/users for dropdowns
  const { data: managers = [] } = useQuery({
    queryKey: ["managers"],
    queryFn: getManagers,
    enabled: open && !!project,
  })

  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.name || "",
        dueDate: project.dueDate || "",
        description: project.description || "",
        projectManager: project.owner?.id || "",
        teamMembers: project.team.filter(m => m.id !== project.owner?.id).map(m => m.id),
        startDate: project.startDate || "",
        priority: project.priority,
        status: project.status,
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    
    if (!formData.projectName || !formData.projectManager) {
      toast.error("Project name and manager are required")
      return
    }
    
    setIsSubmitting(true)
    try {
      await updateProject(project.id, {
        name: formData.projectName,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
        ownerId: formData.projectManager,
        teamMemberIds: formData.teamMembers,
      })
      
      toast.success("Project updated successfully", {
        description: `Your project **${formData.projectName}** has been updated`,
        duration: 3000,
      })
      
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", project.id] })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating project:", error)
      toast.error("Failed to update project", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
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

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Project Manager <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.projectManager} onValueChange={(value) => setFormData({ ...formData, projectManager: value })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
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
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-info">
                <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                  Additional Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
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
              {isSubmitting ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



