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

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDocumentDialog({ open, onOpenChange }: UploadDocumentDialogProps) {
  const [formData, setFormData] = useState({
    file: "", documentName: "", category: "",
    description: "", tags: "", expiryDate: "", accessLevel: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Upload document:", formData)
      toast.success("Document uploaded successfully", { description: `Document **${formData.documentName}** has been uploaded`, duration: 3000 })
      onOpenChange(false)
      setFormData({ file: "", documentName: "", category: "", description: "", tags: "", expiryDate: "", accessLevel: "" })
    } catch (error) {
      toast.error("Failed to upload document", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0"><DialogTitle>Upload Document</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">File <span className="text-[#df1c41]">*</span></Label><Input type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0]?.name || "" })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]" required /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Document Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.documentName} onChange={(e) => setFormData({ ...formData, documentName: e.target.value })} placeholder="Enter document name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Category <span className="text-[#df1c41]">*</span></Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="contract">Contract</SelectItem><SelectItem value="certificate">Certificate</SelectItem><SelectItem value="license">License</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
          <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter description" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tags</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Enter tags" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Access Level</Label><Select value={formData.accessLevel} onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select access level" /></SelectTrigger><SelectContent><SelectItem value="private">Private</SelectItem><SelectItem value="team">Team</SelectItem><SelectItem value="public">Public</SelectItem></SelectContent></Select></div>
          </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]">Upload</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


