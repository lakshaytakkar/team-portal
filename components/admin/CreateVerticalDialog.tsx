"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createVertical, updateVertical, getOrganizations } from "@/lib/actions/hierarchy"
import type { Vertical } from "@/lib/types/hierarchy"
import { toast } from "@/components/ui/sonner"

interface CreateVerticalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingVertical?: Vertical | null
  onSuccess?: () => void
}

export function CreateVerticalDialog({
  open,
  onOpenChange,
  editingVertical,
  onSuccess,
}: CreateVerticalDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    organizationId: "",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  })

  useEffect(() => {
    if (editingVertical) {
      setFormData({
        name: editingVertical.name,
        code: editingVertical.code || "",
        description: editingVertical.description || "",
        organizationId: editingVertical.organizationId || "",
        isActive: editingVertical.isActive,
      })
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        organizationId: "",
        isActive: true,
      })
    }
  }, [editingVertical, open])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingVertical) {
        await updateVertical({
          id: editingVertical.id,
          name: formData.name,
          code: formData.code || undefined,
          description: formData.description || undefined,
          organizationId: formData.organizationId || null,
          isActive: formData.isActive,
        })
        toast.success("Vertical updated successfully")
      } else {
        await createVertical({
          name: formData.name,
          code: formData.code || undefined,
          description: formData.description || undefined,
          organizationId: formData.organizationId || null,
        })
        toast.success("Vertical created successfully")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(`Failed to ${editingVertical ? "update" : "create"} vertical`, {
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
          <DialogTitle>{editingVertical ? "Edit Vertical" : "Create Vertical"}</DialogTitle>
          <DialogDescription>
            {editingVertical
              ? "Update the vertical information below."
              : "Create a new business vertical for your organization."}
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
              placeholder="e.g., Legal Nations"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationId">Organization (Optional)</Label>
            <Select
              value={formData.organizationId}
              onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Assign this vertical to an organization (optional)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code (Optional)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., legalnations"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              A unique code identifier for this vertical (used in URLs and references)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this vertical..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          {editingVertical && (
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
            {isSubmitting ? "Saving..." : editingVertical ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

