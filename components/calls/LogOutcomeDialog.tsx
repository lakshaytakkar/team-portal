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

interface LogOutcomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callId?: string
}

export function LogOutcomeDialog({ open, onOpenChange, callId }: LogOutcomeDialogProps) {
  const [formData, setFormData] = useState({
    outcome: "",
    notes: "",
    nextAction: "",
    nextActionDate: "",
    followUpNotes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Log call outcome:", formData, callId)
      toast.success("Call outcome logged successfully", {
        description: "The outcome has been recorded",
        duration: 3000,
      })
      onOpenChange(false)
      setFormData({
        outcome: "",
        notes: "",
        nextAction: "",
        nextActionDate: "",
        followUpNotes: "",
      })
    } catch (error) {
      console.error("Error logging outcome:", error)
      toast.error("Failed to log outcome", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      outcome: "",
      notes: "",
      nextAction: "",
      nextActionDate: "",
      followUpNotes: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Log Call Outcome</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {/* Required Fields */}
          
          {/* Outcome */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
              Outcome <span className="text-[#df1c41]">*</span>
            </Label>
            <Select 
              value={formData.outcome} 
              onValueChange={(value) => setFormData({ ...formData, outcome: value })}
            >
              <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="no-answer">No Answer</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="callback-requested">Callback Requested</SelectItem>
                <SelectItem value="not-interested">Not Interested</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
              Notes <span className="text-[#df1c41]">*</span>
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter call notes"
              className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
              required
            />
          </div>

          {/* Optional Fields - Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="follow-up">
              <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                Follow-up Actions
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Next Action */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                    Next Action
                  </Label>
                  <Select 
                    value={formData.nextAction} 
                    onValueChange={(value) => setFormData({ ...formData, nextAction: value })}
                  >
                    <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                      <SelectValue placeholder="Select next action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="follow-up-call">Follow-up Call</SelectItem>
                      <SelectItem value="send-email">Send Email</SelectItem>
                      <SelectItem value="schedule-meeting">Schedule Meeting</SelectItem>
                      <SelectItem value="send-quote">Send Quote</SelectItem>
                      <SelectItem value="close-deal">Close Deal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Next Action Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                    Next Action Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.nextActionDate}
                    onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                    className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  />
                </div>

                {/* Follow-up Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                    Follow-up Notes
                  </Label>
                  <Textarea
                    value={formData.followUpNotes}
                    onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                    placeholder="Add follow-up notes"
                    className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
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
              Log Outcome
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


