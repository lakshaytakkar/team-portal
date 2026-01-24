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

interface CreateVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVendorDialog({ open, onOpenChange }: CreateVendorDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
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
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Add Vendor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
