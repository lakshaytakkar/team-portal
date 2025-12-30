"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createGoal } from "@/lib/actions/goals"
import type { GoalStatus, GoalPriority } from "@/lib/types/goal"

interface CreateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    goalTitle: "", targetDate: "", status: "not-started" as GoalStatus, priority: "medium" as GoalPriority,
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.goalTitle) {
      toast.error("Goal title is required")
      return
    }
    
    setIsSubmitting(true)
    try {
      await createGoal({
        title: formData.goalTitle,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        targetDate: formData.targetDate || undefined,
      })
      
      toast.success("Goal created successfully", { description: `Goal **${formData.goalTitle}** has been created`, duration: 3000 })
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      onOpenChange(false)
      setFormData({ goalTitle: "", targetDate: "", status: "not-started", priority: "medium", description: "" })
    } catch (error) {
      toast.error("Failed to create goal", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>New Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Goal Title <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.goalTitle}
                onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                placeholder="Enter goal title"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Target Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Status <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as GoalStatus })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Priority <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as GoalPriority })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
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
              {isSubmitting ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

