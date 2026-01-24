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

interface CreateWhatsAppTemplateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWhatsAppTemplateDrawer({ open, onOpenChange }: CreateWhatsAppTemplateDrawerProps) {
  const [formData, setFormData] = useState({
    templateName: "", messageContent: "", category: "",
    headerMedia: "", footer: "", buttons: "", language: "", approvalStatus: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create WhatsApp template:", formData)
      toast.success("WhatsApp template created successfully", { description: `Template **${formData.templateName}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ templateName: "", messageContent: "", category: "", headerMedia: "", footer: "", buttons: "", language: "", approvalStatus: "" })
    } catch (error) {
      toast.error("Failed to create template", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">New WhatsApp Template</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Template Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.templateName} onChange={(e) => setFormData({ ...formData, templateName: e.target.value })} placeholder="Enter template name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Message Content <span className="text-[#df1c41]">*</span></Label><Textarea value={formData.messageContent} onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })} placeholder="Enter message content" className="min-h-[180px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Category <span className="text-[#df1c41]">*</span></Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="utility">Utility</SelectItem><SelectItem value="authentication">Authentication</SelectItem></SelectContent></Select></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Header Media</Label><Input type="file" onChange={(e) => setFormData({ ...formData, headerMedia: e.target.files?.[0]?.name || "" })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Footer</Label><Input value={formData.footer} onChange={(e) => setFormData({ ...formData, footer: e.target.value })} placeholder="Enter footer text" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Buttons</Label><Input value={formData.buttons} onChange={(e) => setFormData({ ...formData, buttons: e.target.value })} placeholder="Enter buttons" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Language</Label><Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Approval Status</Label><Select value={formData.approvalStatus} onValueChange={(value) => setFormData({ ...formData, approvalStatus: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Template</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

