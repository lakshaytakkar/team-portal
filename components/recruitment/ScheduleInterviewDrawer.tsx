"use client"

import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X } from "lucide-react"

interface ScheduleInterviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleInterviewDrawer({ open, onOpenChange }: ScheduleInterviewDrawerProps) {
  const [formData, setFormData] = useState({
    candidate: "", date: "", time: "", interviewers: "", interviewType: "",
    location: "", agenda: "", notes: "", requiredDocuments: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Schedule interview:", formData)
      toast.success("Interview scheduled successfully", { description: `Interview has been scheduled`, duration: 3000 })
      onOpenChange(false)
      setFormData({ candidate: "", date: "", time: "", interviewers: "", interviewType: "", location: "", agenda: "", notes: "", requiredDocuments: "" })
    } catch (error) {
      toast.error("Failed to schedule interview", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">Schedule Interview</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Candidate <span className="text-[#df1c41]">*</span></Label><Select value={formData.candidate} onValueChange={(value) => setFormData({ ...formData, candidate: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select candidate" /></SelectTrigger><SelectContent><SelectItem value="candidate-1">John Doe</SelectItem><SelectItem value="candidate-2">Jane Smith</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Date <span className="text-[#df1c41]">*</span></Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Time <span className="text-[#df1c41]">*</span></Label><Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Interviewer(s) <span className="text-[#df1c41]">*</span></Label><Select value={formData.interviewers} onValueChange={(value) => setFormData({ ...formData, interviewers: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select interviewers" /></SelectTrigger><SelectContent><SelectItem value="interviewer-1">John Doe</SelectItem><SelectItem value="interviewer-2">Jane Smith</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Interview Type <span className="text-[#df1c41]">*</span></Label><Select value={formData.interviewType} onValueChange={(value) => setFormData({ ...formData, interviewType: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="phone">Phone</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="onsite">On-site</SelectItem></SelectContent></Select></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Location/Video Link</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter location or video link" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Agenda</Label><Textarea value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} placeholder="Enter agenda" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Enter notes" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Required Documents</Label><Input value={formData.requiredDocuments} onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })} placeholder="Enter required documents" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Schedule</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

