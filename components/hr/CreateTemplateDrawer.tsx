"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createHRTemplate } from "@/lib/actions/hr"
import type { HRTemplateType } from "@/lib/types/hr"

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultType?: HRTemplateType
}

export function CreateTemplateDialog({ open, onOpenChange, defaultType }: CreateTemplateDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    templateName: "",
    type: defaultType || ("message" as HRTemplateType),
    category: "",
    description: "",
    content: "",
    channel: "email" as "whatsapp" | "email",
  })

  const createMutation = useMutation({
    mutationFn: createHRTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-templates"] })
      toast.success("Template created successfully", {
        description: `Template "${formData.templateName}" has been created`,
        duration: 3000,
      })
      onOpenChange(false)
      setFormData({
        templateName: "",
        type: defaultType || ("message" as HRTemplateType),
        category: "",
        description: "",
        content: "",
        channel: "email" as "whatsapp" | "email",
      })
    },
    onError: (error: Error) => {
      toast.error("Failed to create template", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.templateName || !formData.type || !formData.category || !formData.content) {
      toast.error("Please fill in all required fields")
      return
    }
    if (formData.type === 'message' && !formData.channel) {
      toast.error("Please select a channel for message templates")
      return
    }

    createMutation.mutate({
      name: formData.templateName,
      type: formData.type,
      category: formData.category,
      description: formData.description || undefined,
      content: formData.content,
      channel: formData.type === 'message' ? formData.channel : undefined,
      isActive: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>New Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Template Name <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                placeholder="Enter template name"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Type <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as HRTemplateType, channel: value === 'message' ? formData.channel : 'email' })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">Message Template</SelectItem>
                  <SelectItem value="form">Form Template</SelectItem>
                  <SelectItem value="policy">Policy Template</SelectItem>
                  <SelectItem value="printable">Printable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'message' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Channel <span className="text-[#df1c41]">*</span>
                </Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) => setFormData({ ...formData, channel: value as "whatsapp" | "email" })}
                >
                  <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Category <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="exit">Exit</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional">
                <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                  Additional Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Description
                    </Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter description"
                      className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                      Content <span className="text-[#df1c41]">*</span>
                    </Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter template content. Use {{variable_name}} for placeholders."
                      className="min-h-[200px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Use double curly braces for variables, e.g., {"{{employee_name}}"}, {"{{date}}"}
                    </p>
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="md" className="w-[128px]" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

