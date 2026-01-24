"use client"

import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CheckInOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "check-in" | "check-out"
}

export function CheckInOutDialog({ open, onOpenChange, type }: CheckInOutDialogProps) {
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log(`${type}:`, { notes, timestamp: new Date().toISOString() })
      toast.success(`${type === "check-in" ? "Checked in" : "Checked out"} successfully`, {
        description: `You have ${type === "check-in" ? "checked in" : "checked out"} at ${new Date().toLocaleTimeString()}`,
        duration: 3000,
      })
      onOpenChange(false)
      setNotes("")
    } catch (error) {
      console.error(`Error ${type}:`, error)
      toast.error(`Failed to ${type}`, {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleCancel = () => {
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{type === "check-in" ? "Check In" : "Check Out"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
              Notes (Optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Add any notes for ${type === "check-in" ? "check-in" : "check-out"}`}
              className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
            />
          </div>

          <div className="flex items-center justify-end gap-3.5 pt-4">
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
              {type === "check-in" ? "Check In" : "Check Out"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


