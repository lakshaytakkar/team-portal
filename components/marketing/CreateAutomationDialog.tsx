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

interface CreateAutomationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAutomationDialog({ open, onOpenChange }: CreateAutomationDialogProps) {
  const [formData, setFormData] = useState({
    automationName: "", triggerEvent: "", action: "",
    conditions: "", delay: "", template: "", audience: "", schedule: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create automation:", formData)
      toast.success("Automation created successfully", { description: `Automation **${formData.automationName}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ automationName: "", triggerEvent: "", action: "", conditions: "", delay: "", template: "", audience: "", schedule: "" })
    } catch (error) {
      toast.error("Failed to create automation", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>New Automation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Automation Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.automationName} onChange={(e) => setFormData({ ...formData, automationName: e.target.value })} placeholder="Enter automation name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Trigger Event <span className="text-[#df1c41]">*</span></Label><Select value={formData.triggerEvent} onValueChange={(value) => setFormData({ ...formData, triggerEvent: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select trigger" /></SelectTrigger><SelectContent><SelectItem value="signup">User Signup</SelectItem><SelectItem value="purchase">Purchase</SelectItem><SelectItem value="abandoned-cart">Abandoned Cart</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Action <span className="text-[#df1c41]">*</span></Label><Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select action" /></SelectTrigger><SelectContent><SelectItem value="send-email">Send Email</SelectItem><SelectItem value="send-sms">Send SMS</SelectItem><SelectItem value="send-whatsapp">Send WhatsApp</SelectItem><SelectItem value="webhook">Webhook</SelectItem></SelectContent></Select></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Conditions</Label><Textarea value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} placeholder="Enter conditions" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Delay</Label><Input value={formData.delay} onChange={(e) => setFormData({ ...formData, delay: e.target.value })} placeholder="Enter delay" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Template</Label><Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select template" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem><SelectItem value="template-1">Template 1</SelectItem><SelectItem value="template-2">Template 2</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Audience</Label><Input value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })} placeholder="Enter audience" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Schedule</Label><Input type="datetime-local" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Automation</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
