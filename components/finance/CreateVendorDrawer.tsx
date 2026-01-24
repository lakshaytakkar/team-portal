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

interface CreateVendorDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorDrawer({ open, onOpenChange }: CreateVendorDrawerProps) {
  const [formData, setFormData] = useState({
    vendorName: "", contactEmail: "", contactPhone: "", paymentTerms: "",
    address: "", taxId: "", bankDetails: "", notes: "", categories: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Create vendor:", formData)
      toast.success("Vendor created successfully", { description: `Vendor **${formData.vendorName}** has been added`, duration: 3000 })
      onOpenChange(false)
      setFormData({ vendorName: "", contactEmail: "", contactPhone: "", paymentTerms: "", address: "", taxId: "", bankDetails: "", notes: "", categories: "" })
    } catch (error) {
      toast.error("Failed to create vendor", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton={true}>
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">Add Vendor</h2>
          <button onClick={() => onOpenChange(false)} className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"><X className="h-6 w-6 text-[#666d80]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Vendor Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} placeholder="Enter vendor name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Contact Email/Phone <span className="text-[#df1c41]">*</span></Label><Input value={formData.contactEmail || formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value, contactPhone: e.target.value })} placeholder="Enter email or phone" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Payment Terms <span className="text-[#df1c41]">*</span></Label><Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select payment terms" /></SelectTrigger><SelectContent><SelectItem value="net30">Net 30</SelectItem><SelectItem value="net60">Net 60</SelectItem><SelectItem value="due-on-receipt">Due on Receipt</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Address</Label><Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter address" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tax ID</Label><Input value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} placeholder="Enter tax ID" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Bank Details</Label><Textarea value={formData.bankDetails} onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })} placeholder="Enter bank details" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Enter notes" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Categories</Label><Input value={formData.categories} onChange={(e) => setFormData({ ...formData, categories: e.target.value })} placeholder="Enter categories" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Add Vendor</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

