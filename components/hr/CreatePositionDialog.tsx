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
import { PositionForm } from "./PositionForm"
import { createPosition } from "@/lib/actions/hr"
import type { CreatePositionInput } from "@/lib/types/hierarchy"
import { Loader2 } from "lucide-react"

interface CreatePositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
}

export function CreatePositionDialog({ open, onOpenChange, employeeId }: CreatePositionDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<CreatePositionInput>>({
    employeeId,
    teamId: undefined,
    roleId: undefined,
    title: undefined,
    isPrimary: false,
    startDate: undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.teamId || !formData.roleId) {
      toast.error("Validation failed", {
        description: "Team and Role are required",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createPosition({
        employeeId,
        teamId: formData.teamId,
        roleId: formData.roleId,
        title: formData.title,
        isPrimary: formData.isPrimary,
        startDate: formData.startDate,
      })

      await queryClient.invalidateQueries({ queryKey: ["employees"] })
      await queryClient.invalidateQueries({ queryKey: ["positions", employeeId] })

      toast.success("Position created successfully", {
        description: "The position has been added to the employee",
        duration: 3000,
      })
      
      onOpenChange(false)
      setFormData({
        employeeId,
        teamId: undefined,
        roleId: undefined,
        title: undefined,
        isPrimary: false,
        startDate: undefined,
      })
    } catch (error) {
      console.error("Error creating position:", error)
      toast.error("Failed to create position", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      employeeId,
      teamId: undefined,
      roleId: undefined,
      title: undefined,
      isPrimary: false,
      startDate: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add Position</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <PositionForm
              employeeId={employeeId}
              value={formData}
              onChange={setFormData}
            />
          </div>

          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={handleCancel} variant="outline" size="md" className="w-[128px]">
              Cancel
            </Button>
            <Button type="submit" size="md" className="w-[128px]" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}




