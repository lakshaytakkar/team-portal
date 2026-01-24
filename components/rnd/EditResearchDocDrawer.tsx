"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { ResearchDoc, DocumentStatus } from "@/lib/types/rnd"
import { updateResearchDoc } from "@/lib/actions/rnd"

interface EditResearchDocDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: ResearchDoc | null
}

export function EditResearchDocDrawer({ open, onOpenChange, doc }: EditResearchDocDrawerProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    content: "",
    status: "draft" as DocumentStatus,
    tags: [] as string[],
    fileUrl: "",
    tagsInput: "",
  })

  useEffect(() => {
    if (doc) {
      setFormData({
        title: doc.title || "",
        description: doc.description || "",
        category: doc.category || "",
        content: "",
        status: doc.status,
        tags: doc.tags || [],
        fileUrl: doc.fileUrl || "",
        tagsInput: (doc.tags || []).join(", "),
      })
    }
  }, [doc])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => updateResearchDoc(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-doc", doc?.id] })
      queryClient.invalidateQueries({ queryKey: ["research-docs"] })
      queryClient.invalidateQueries({ queryKey: ["all-research-docs"] })
      toast.success("Research document updated successfully", {
        description: `Document **${formData.title || "Document"}** has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update research document", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!doc) return
    
    if (!formData.title) {
      toast.error("Title is required")
      return
    }
    
    const tags = formData.tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0)
    
    updateMutation.mutate({
      id: doc.id,
      input: {
        title: formData.title.trim(),
        description: formData.description || undefined,
        category: formData.category || undefined,
        content: formData.content || undefined,
        status: formData.status,
        tags,
        fileUrl: formData.fileUrl || undefined,
      },
    })
  }

  if (!doc) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col w-full sm:w-[640px]"
        hideCloseButton={true}
      >
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            Edit Research Document
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
          >
            <X className="h-6 w-6 text-[#666d80]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Title <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter document title"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Category
                </Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Enter category"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as DocumentStatus })}
                >
                  <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Content
              </Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter document content"
                className="min-h-[300px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9] font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Tags (comma-separated)
              </Label>
              <Input
                value={formData.tagsInput}
                onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                File URL
              </Label>
              <Input
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="Enter file URL"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              />
            </div>
          </div>

          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}









