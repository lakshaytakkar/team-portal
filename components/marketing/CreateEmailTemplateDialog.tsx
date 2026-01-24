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

interface CreateEmailTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEmailTemplateDialog({ open, onOpenChange }: CreateEmailTemplateDialogProps) {
  const [formData, setFormData] = useState({
    templateName: "", subject: "", bodyContent: "",
    category: "", tags: "", variables: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create email template:", formData)
      toast.success("Email template created successfully", { description: `Template **${formData.templateName}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ templateName: "", subject: "", bodyContent: "", category: "", tags: "", variables: "" })
    } catch (error) {
      toast.error("Failed to create template", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>New Email Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Template Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.templateName} onChange={(e) => setFormData({ ...formData, templateName: e.target.value })} placeholder="Enter template name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Subject <span className="text-[#df1c41]">*</span></Label><Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Enter email subject" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Body Content <span className="text-[#df1c41]">*</span></Label><Textarea value={formData.bodyContent} onChange={(e) => setFormData({ ...formData, bodyContent: e.target.value })} placeholder="Enter email body content" className="min-h-[180px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" required /></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Category</Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="promotional">Promotional</SelectItem><SelectItem value="transactional">Transactional</SelectItem><SelectItem value="newsletter">Newsletter</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tags</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Enter tags" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Variables/Placeholders</Label><Input value={formData.variables} onChange={(e) => setFormData({ ...formData, variables: e.target.value })} placeholder="Enter variables" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Template</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
