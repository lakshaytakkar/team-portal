"use client"

import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CreateResearchDocDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateResearchDocDialog({ open, onOpenChange }: CreateResearchDocDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>New Research Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Document Title <span className="text-[#df1c41]">*</span></Label><Input value={formData.documentTitle} onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })} placeholder="Enter document title" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Category <span className="text-[#df1c41]">*</span></Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="market-research">Market Research</SelectItem><SelectItem value="technology">Technology</SelectItem><SelectItem value="competitor">Competitor Analysis</SelectItem><SelectItem value="trends">Trends</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Content/Summary <span className="text-[#df1c41]">*</span></Label><Textarea value={formData.contentSummary} onChange={(e) => setFormData({ ...formData, contentSummary: e.target.value })} placeholder="Enter content or summary" className="min-h-[180px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" required /></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tags</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Enter tags" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Related Projects</Label><Input value={formData.relatedProjects} onChange={(e) => setFormData({ ...formData, relatedProjects: e.target.value })} placeholder="Enter related projects" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Research Date</Label><Input type="date" value={formData.researchDate} onChange={(e) => setFormData({ ...formData, researchDate: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Document</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
