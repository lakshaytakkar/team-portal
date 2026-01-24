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

interface CreateResearchDocDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateResearchDocDrawer({ open, onOpenChange }: CreateResearchDocDrawerProps) {
  const [formData, setFormData] = useState({
    documentTitle: "", category: "", contentSummary: "",
    tags: "", relatedProjects: "", researchDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create research doc:", formData)
      toast.success("Research document created successfully", { description: `Document **${formData.documentTitle}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ documentTitle: "", category: "", contentSummary: "", tags: "", relatedProjects: "", researchDate: "" })
    } catch (error) {
      toast.error("Failed to create document", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">New Research Document</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Document Title <span className="text-[#df1c41]">*</span></Label><Input value={formData.documentTitle} onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })} placeholder="Enter document title" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Category <span className="text-[#df1c41]">*</span></Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="market-research">Market Research</SelectItem><SelectItem value="technology">Technology</SelectItem><SelectItem value="competitor">Competitor Analysis</SelectItem><SelectItem value="trends">Trends</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Content/Summary <span className="text-[#df1c41]">*</span></Label><Textarea value={formData.contentSummary} onChange={(e) => setFormData({ ...formData, contentSummary: e.target.value })} placeholder="Enter content or summary" className="min-h-[180px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" required /></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tags</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Enter tags" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Related Projects</Label><Input value={formData.relatedProjects} onChange={(e) => setFormData({ ...formData, relatedProjects: e.target.value })} placeholder="Enter related projects" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Research Date</Label><Input type="date" value={formData.researchDate} onChange={(e) => setFormData({ ...formData, researchDate: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Document</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}


