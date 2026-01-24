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

interface CreateJobPostingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateJobPostingDrawer({ open, onOpenChange }: CreateJobPostingDrawerProps) {
  const [formData, setFormData] = useState({
    jobTitle: "", department: "", employmentType: "", location: "",
    description: "", requirements: "", salaryRange: "", applicationDeadline: "", responsibilities: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create job posting:", formData)
      toast.success("Job posting created successfully", { description: `Job posting **${formData.jobTitle}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ jobTitle: "", department: "", employmentType: "", location: "", description: "", requirements: "", salaryRange: "", applicationDeadline: "", responsibilities: "" })
    } catch (error) {
      toast.error("Failed to create job posting", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">New Job Posting</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Job Title <span className="text-[#df1c41]">*</span></Label><Input value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="Enter job title" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Department <span className="text-[#df1c41]">*</span></Label><Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent><SelectItem value="engineering">Engineering</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="sales">Sales</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Employment Type <span className="text-[#df1c41]">*</span></Label><Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="internship">Internship</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Location <span className="text-[#df1c41]">*</span></Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter location" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter job description" className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Requirements</Label><Textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} placeholder="Enter requirements" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Salary Range</Label><Input value={formData.salaryRange} onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })} placeholder="e.g., $50,000 - $70,000" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Application Deadline</Label><Input type="date" value={formData.applicationDeadline} onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Responsibilities</Label><Textarea value={formData.responsibilities} onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })} placeholder="Enter responsibilities" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Posting</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


