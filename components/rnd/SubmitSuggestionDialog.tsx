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

interface SubmitSuggestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitSuggestionDialog({ open, onOpenChange }: SubmitSuggestionDialogProps) {
  const [formData, setFormData] = useState({
    suggestionTitle: "", category: "", description: "",
    impactAnalysis: "", resourcesNeeded: "", timeline: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Submit suggestion:", formData)
      toast.success("Suggestion submitted successfully", { description: "Your suggestion has been submitted", duration: 3000 })
      onOpenChange(false)
      setFormData({ suggestionTitle: "", category: "", description: "", impactAnalysis: "", resourcesNeeded: "", timeline: "" })
    } catch (error) {
      toast.error("Failed to submit suggestion", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0"><DialogTitle>Submit Suggestion</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Suggestion Title <span className="text-[#df1c41]">*</span></Label><Input value={formData.suggestionTitle} onChange={(e) => setFormData({ ...formData, suggestionTitle: e.target.value })} placeholder="Enter suggestion title" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Category <span className="text-[#df1c41]">*</span></Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="product">Product</SelectItem><SelectItem value="process">Process</SelectItem><SelectItem value="technology">Technology</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Description <span className="text-[#df1c41]">*</span></Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter description" className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" required /></div>
          <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Impact Analysis</Label><Textarea value={formData.impactAnalysis} onChange={(e) => setFormData({ ...formData, impactAnalysis: e.target.value })} placeholder="Enter impact analysis" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Resources Needed</Label><Textarea value={formData.resourcesNeeded} onChange={(e) => setFormData({ ...formData, resourcesNeeded: e.target.value })} placeholder="Enter resources needed" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Timeline</Label><Input value={formData.timeline} onChange={(e) => setFormData({ ...formData, timeline: e.target.value })} placeholder="Enter timeline" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
          </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


