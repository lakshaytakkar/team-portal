"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { createLeaveRequest } from "@/lib/actions/leave-requests"
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

interface RequestLeaveDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestLeaveDrawer({ open, onOpenChange }: RequestLeaveDrawerProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Handle file uploads for documents (store URLs)
      const documentUrls: string[] = [] // Placeholder for uploaded document URLs

      await createLeaveRequest({
        type: formData.leaveType as "vacation" | "sick" | "personal" | "other",
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        coveragePlan: formData.coveragePlan || undefined,
        contactDuringLeave: formData.contactDuringLeave || undefined,
        documents: documentUrls.length > 0 ? documentUrls : undefined,
      })

      toast.success("Leave request submitted successfully", {
        description: "Your leave request has been submitted for approval",
        duration: 3000,
      })
      
      // Invalidate and refetch leave requests
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
      
      onOpenChange(false)
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        documents: [],
        coveragePlan: "",
        contactDuringLeave: "",
      })
    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast.error("Failed to submit leave request", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      documents: "",
      coveragePlan: "",
      contactDuringLeave: "",
    })
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
            Request Leave
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
            
            {/* Leave Type */}
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

            {/* Start Date */}
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

            {/* End Date */}
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

            {/* Reason */}
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

            {/* Optional Fields - Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-info">
                <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                  Additional Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Documents */}
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

                  {/* Coverage Plan */}
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

                  {/* Contact During Leave */}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


