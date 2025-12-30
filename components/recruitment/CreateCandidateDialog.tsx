"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createCandidate } from "@/lib/actions/recruitment"
import { Loader2 } from "lucide-react"

interface CreateCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCandidateDialog({ open, onOpenChange }: CreateCandidateDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", positionApplied: "",
    resume: "", coverLetter: "", linkedIn: "", experience: "", education: "", skills: "", notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createCandidate({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        linkedIn: formData.linkedIn || undefined,
        resume: formData.resume || undefined,
        notes: formData.notes || undefined,
        source: 'website',
      })

      await queryClient.invalidateQueries({ queryKey: ["candidates"] })

      toast.success("Candidate added successfully", { description: `Candidate ${formData.fullName} has been added`, duration: 3000 })
      onOpenChange(false)
      setFormData({ fullName: "", email: "", phone: "", positionApplied: "", resume: "", coverLetter: "", linkedIn: "", experience: "", education: "", skills: "", notes: "" })
    } catch (error) {
      console.error("Error creating candidate:", error)
      toast.error("Failed to add candidate", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Full Name <span className="text-[#df1c41]">*</span></Label>
              <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter full name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required />
            </div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Email <span className="text-[#df1c41]">*</span></Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required />
            </div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Phone <span className="text-[#df1c41]">*</span></Label>
              <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required />
            </div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Position Applied <span className="text-[#df1c41]">*</span></Label>
              <Select value={formData.positionApplied} onValueChange={(value) => setFormData({ ...formData, positionApplied: value })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent><SelectItem value="developer">Developer</SelectItem><SelectItem value="designer">Designer</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent>
              </Select>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Resume</Label><Input type="file" onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0]?.name || "" })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Cover Letter</Label><Textarea value={formData.coverLetter} onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })} placeholder="Enter cover letter" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">LinkedIn</Label><Input type="url" value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })} placeholder="LinkedIn URL" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Experience</Label><Textarea value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} placeholder="Enter experience" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Education</Label><Textarea value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} placeholder="Enter education" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Skills</Label><Input value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="Enter skills" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
                  <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Enter notes" className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]" /></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]">Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



