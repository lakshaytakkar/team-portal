"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { updateLeaveRequest } from "@/lib/actions/leave-requests"
import type { LeaveRequest } from "@/lib/types/leave-requests"

interface EditLeaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leaveRequest: LeaveRequest | null
}

export function EditLeaveRequestDialog({
  open,
  onOpenChange,
  leaveRequest,
}: EditLeaveRequestDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    documents: [] as File[],
    coveragePlan: "",
    contactDuringLeave: "",
  })

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        leaveType: leaveRequest.type,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason || "",
        documents: [],
        coveragePlan: leaveRequest.metadata?.coveragePlan || "",
        contactDuringLeave: leaveRequest.metadata?.contactDuringLeave || "",
      })
    }
  }, [leaveRequest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!leaveRequest || !formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Handle file uploads for documents (store URLs)
      const documentUrls: string[] = leaveRequest.metadata?.documents || [] // Keep existing documents for now

      await updateLeaveRequest(leaveRequest.id, {
        type: formData.leaveType as "vacation" | "sick" | "personal" | "other",
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        coveragePlan: formData.coveragePlan || undefined,
        contactDuringLeave: formData.contactDuringLeave || undefined,
        documents: documentUrls.length > 0 ? documentUrls : undefined,
      })

      toast.success("Leave request updated successfully", {
        description: "Your leave request has been updated",
        duration: 3000,
      })
      
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating leave request:", error)
      toast.error("Failed to update leave request", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (leaveRequest) {
      setFormData({
        leaveType: leaveRequest.type,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason || "",
        documents: [],
        coveragePlan: leaveRequest.metadata?.coveragePlan || "",
        contactDuringLeave: leaveRequest.metadata?.contactDuringLeave || "",
      })
    }
    onOpenChange(false)
  }

  if (!leaveRequest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Edit Leave Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Leave Type <span className="text-[#df1c41]">*</span>
              </Label>
              <Select 
                value={formData.leaveType} 
                onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Start Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                End Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Reason <span className="text-[#df1c41]">*</span>
              </Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter reason for leave"
                className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                required
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-info">
                <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                  Additional Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Supporting Documents
                    </Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setFormData({ ...formData, documents: files })
                      }}
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Coverage Plan
                    </Label>
                    <Textarea
                      value={formData.coveragePlan}
                      onChange={(e) => setFormData({ ...formData, coveragePlan: e.target.value })}
                      placeholder="Describe how your work will be covered during your absence"
                      className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Emergency Contact During Leave
                    </Label>
                    <Input
                      value={formData.contactDuringLeave}
                      onChange={(e) => setFormData({ ...formData, contactDuringLeave: e.target.value })}
                      placeholder="Phone number or email (optional)"
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
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
              {isSubmitting ? "Updating..." : "Update Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

