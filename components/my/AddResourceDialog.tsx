"use client"

import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface AddResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddResourceDialog({ open, onOpenChange }: AddResourceDialogProps) {
  const [formData, setFormData] = useState({
    resourceName: "", type: "", urlLocation: "",
    description: "", tags: "", accessLevel: "", notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Add resource:", formData)
      toast.success("Resource added successfully", { description: `Resource **${formData.resourceName}** has been added`, duration: 3000 })
      onOpenChange(false)
      setFormData({ resourceName: "", type: "", urlLocation: "", description: "", tags: "", accessLevel: "", notes: "" })
    } catch (error) {
      toast.error("Failed to add resource", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
              Resource Name <span className="text-[#df1c41]">*</span>
            </Label>
            <Input
              value={formData.resourceName}
              onChange={(e) => setFormData({ ...formData, resourceName: e.target.value })}
              placeholder="Enter resource name"
              className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
              Type <span className="text-[#df1c41]">*</span>
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
              URL/Location <span className="text-[#df1c41]">*</span>
            </Label>
            <Input
              value={formData.urlLocation}
              onChange={(e) => setFormData({ ...formData, urlLocation: e.target.value })}
              placeholder="Enter URL or location"
              className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              required
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional">
              <AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Tags</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Enter tags"
                    className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Access Level</Label>
                  <Select value={formData.accessLevel} onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}>
                    <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter notes"
                    className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </div>

          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="md"
              className="w-[128px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              className="w-[128px]"
            >
              Add Resource
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

