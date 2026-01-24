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

interface CreateLeadDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLeadDrawer({ open, onOpenChange }: CreateLeadDrawerProps) {
  const [formData, setFormData] = useState({
    contactName: "", company: "", email: "", phone: "", leadSource: "",
    title: "", industry: "", budget: "", timeline: "", notes: "", tags: "", assignTo: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create lead:", formData)
      toast.success("Lead created successfully", { description: `Lead **${formData.contactName}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ contactName: "", company: "", email: "", phone: "", leadSource: "", title: "", industry: "", budget: "", timeline: "", notes: "", tags: "", assignTo: "" })
    } catch (error) {
      toast.error("Failed to create lead", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">New Lead</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Contact Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} placeholder="Enter contact name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Company <span className="text-[#df1c41]">*</span></Label><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Enter company name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Email or Phone <span className="text-[#df1c41]">*</span></Label><Input value={formData.email || formData.phone} onChange={(e) => setFormData({ ...formData, email: e.target.value, phone: e.target.value })} placeholder="Enter email or phone" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Lead Source <span className="text-[#df1c41]">*</span></Label><Select value={formData.leadSource} onValueChange={(value) => setFormData({ ...formData, leadSource: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select source" /></SelectTrigger><SelectContent><SelectItem value="website">Website</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="social">Social Media</SelectItem><SelectItem value="email">Email Campaign</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter title" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Industry</Label><Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select industry" /></SelectTrigger><SelectContent><SelectItem value="tech">Technology</SelectItem><SelectItem value="finance">Finance</SelectItem><SelectItem value="healthcare">Healthcare</SelectItem><SelectItem value="retail">Retail</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Budget</Label><Input value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="Enter budget" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Timeline</Label><Input value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} placeholder="Enter timeline" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Enter notes" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tags</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Enter tags" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Assign To</Label><Select value={formData.assignTo} onValueChange={(value) => setFormData({ ...formData, assignTo: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select assignee" /></SelectTrigger><SelectContent><SelectItem value="">Unassigned</SelectItem><SelectItem value="user-1">John Doe</SelectItem><SelectItem value="user-2">Jane Smith</SelectItem></SelectContent></Select></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Lead</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


