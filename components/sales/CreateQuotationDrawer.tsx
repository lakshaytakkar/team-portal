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

interface CreateQuotationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateQuotationDrawer({ open, onOpenChange }: CreateQuotationDrawerProps) {
  const [formData, setFormData] = useState({
    clientName: "", quotationNumber: "", validUntil: "", items: "",
    termsConditions: "", discount: "", tax: "", notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create quotation:", formData)
      toast.success("Quotation created successfully", { description: `Quotation **${formData.quotationNumber}** has been created`, duration: 3000 })
      onOpenChange(false)
      setFormData({ clientName: "", quotationNumber: "", validUntil: "", items: "", termsConditions: "", discount: "", tax: "", notes: "" })
    } catch (error) {
      toast.error("Failed to create quotation", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">New Quotation</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Client Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} placeholder="Enter client name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Quotation Number <span className="text-[#df1c41]">*</span></Label><Input value={formData.quotationNumber} onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })} placeholder="Enter quotation number" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Valid Until <span className="text-[#df1c41]">*</span></Label><Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Items <span className="text-[#df1c41]">*</span></Label><Textarea value={formData.items} onChange={(e) => setFormData({ ...formData, items: e.target.value })} placeholder="Enter items (one per line)" className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" required /></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Terms & Conditions</Label><Textarea value={formData.termsConditions} onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })} placeholder="Enter terms and conditions" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Discount</Label><Input value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="Enter discount" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tax</Label><Input value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: e.target.value })} placeholder="Enter tax" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Enter notes" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Create Quotation</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

