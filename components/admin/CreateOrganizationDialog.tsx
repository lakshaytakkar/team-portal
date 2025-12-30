"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createOrganization, updateOrganization } from "@/lib/actions/hierarchy"
import type { Organization } from "@/lib/types/hierarchy"
import { toast } from "@/components/ui/sonner"

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingOrganization?: Organization | null
  onSuccess?: () => void
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  editingOrganization,
  onSuccess,
}: CreateOrganizationDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingOrganization) {
      setFormData({
        name: editingOrganization.name,
        code: editingOrganization.code || "",
        description: editingOrganization.description || "",
        isActive: editingOrganization.isActive,
      })
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        isActive: true,
      })
    }
  }, [editingOrganization, open])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingOrganization) {
        await updateOrganization({
          id: editingOrganization.id,
          name: formData.name,
          code: formData.code || undefined,
          description: formData.description || undefined,
          isActive: formData.isActive,
        })
        toast.success("Organization updated successfully")
      } else {
        await createOrganization({
          name: formData.name,
          code: formData.code || undefined,
          description: formData.description || undefined,
        })
        toast.success("Organization created successfully")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(`Failed to ${editingOrganization ? "update" : "create"} organization`, {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingOrganization ? "Edit Organization" : "Create Organization"}</DialogTitle>
          <DialogDescription>
            {editingOrganization
              ? "Update the organization information below."
              : "Create a new organization for your system."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Acme Inc."
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code (Optional)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., acme-inc"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              A unique code identifier for this organization (used in URLs and references)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this organization..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          {editingOrganization && (
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? "Saving..." : editingOrganization ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

