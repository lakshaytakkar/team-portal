"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { approveLeaveRequest, rejectLeaveRequest } from "@/lib/actions/leave-requests"
import type { LeaveRequest } from "@/lib/types/leave-requests"

interface ApproveLeaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leaveRequest: LeaveRequest | null
  action: 'approve' | 'reject'
}

export function ApproveLeaveRequestDialog({
  open,
  onOpenChange,
  leaveRequest,
  action,
}: ApproveLeaveRequestDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState("")

  const handleSubmit = async () => {
    if (!leaveRequest) return

    setIsSubmitting(true)
    try {
      if (action === 'approve') {
        await approveLeaveRequest(leaveRequest.id, { approvalNotes: notes || undefined })
        toast.success("Leave request approved", {
          description: `Leave request for ${leaveRequest.user?.name} has been approved`,
          duration: 3000,
        })
      } else {
        await rejectLeaveRequest(leaveRequest.id, { approvalNotes: notes || undefined })
        toast.success("Leave request rejected", {
          description: `Leave request for ${leaveRequest.user?.name} has been rejected`,
          duration: 3000,
        })
      }

      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
      queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
      onOpenChange(false)
      setNotes("")
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error)
      toast.error(`Failed to ${action} leave request`, {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!leaveRequest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' 
              ? `Approve leave request for ${leaveRequest.user?.name} from ${leaveRequest.startDate} to ${leaveRequest.endDate}?`
              : `Reject leave request for ${leaveRequest.user?.name} from ${leaveRequest.startDate} to ${leaveRequest.endDate}?`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              {action === 'approve' ? 'Approval' : 'Rejection'} Notes (Optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Add notes for ${action === 'approve' ? 'approval' : 'rejection'}...`}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setNotes("")
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'approve' ? 'default' : 'destructive'}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? `${action === 'approve' ? 'Approving' : 'Rejecting'}...` : `${action === 'approve' ? 'Approve' : 'Reject'} Request`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

