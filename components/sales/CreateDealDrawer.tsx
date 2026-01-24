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

interface CreateDealDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDealDrawer({ open, onOpenChange }: CreateDealDrawerProps) {
  const [formData, setFormData] = useState({
    dealName: "", accountCompany: "", value: "", stage: "", expectedCloseDate: "",
    probability: "", productsServices: "", competitors: "", notes: "", teamMembers: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create deal:", formData)
      toast.success("Deal created successfully", { description: `Deal **${formData.dealName}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ dealName: "", accountCompany: "", value: "", stage: "", expectedCloseDate: "", probability: "", productsServices: "", competitors: "", notes: "", teamMembers: "" })
    } catch (error) {
      toast.error("Failed to create deal", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">New Deal</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Deal Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.dealName} onChange={(e) => setFormData({ ...formData, dealName: e.target.value })} placeholder="Enter deal name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Account/Company <span className="text-[#df1c41]">*</span></Label><Input value={formData.accountCompany} onChange={(e) => setFormData({ ...formData, accountCompany: e.target.value })} placeholder="Enter company name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Value <span className="text-[#df1c41]">*</span></Label><Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="Enter deal value" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Stage <span className="text-[#df1c41]">*</span></Label><Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent><SelectItem value="prospecting">Prospecting</SelectItem><SelectItem value="qualification">Qualification</SelectItem><SelectItem value="proposal">Proposal</SelectItem><SelectItem value="negotiation">Negotiation</SelectItem><SelectItem value="closed-won">Closed Won</SelectItem><SelectItem value="closed-lost">Closed Lost</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Expected Close Date <span className="text-[#df1c41]">*</span></Label><Input type="date" value={formData.expectedCloseDate} onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Probability (%)</Label><Input type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: e.target.value })} placeholder="Enter probability" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Products/Services</Label><Textarea value={formData.productsServices} onChange={(e) => setFormData({ ...formData, productsServices: e.target.value })} placeholder="Enter products/services" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Competitors</Label><Input value={formData.competitors} onChange={(e) => setFormData({ ...formData, competitors: e.target.value })} placeholder="Enter competitors" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Enter notes" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Team Members</Label><Select value={formData.teamMembers} onValueChange={(value) => setFormData({ ...formData, teamMembers: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem><SelectItem value="team-1">Sales Team</SelectItem><SelectItem value="team-2">Marketing Team</SelectItem></SelectContent></Select></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Deal</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


