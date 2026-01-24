"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/sonner"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { updateFaireStore } from "@/lib/actions/faire"
import type { FaireStore, UpdateFaireStoreInput } from "@/lib/types/faire"

interface EditFaireStoreDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: FaireStore | null
  onSuccess?: () => void
}

export function EditFaireStoreDrawer({
  open,
  onOpenChange,
  store,
  onSuccess,
}: EditFaireStoreDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    faireBrandId: "",
    apiToken: "",
    description: "",
    isActive: true,
    autoSyncEnabled: false,
  })

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        code: store.code || "",
        faireBrandId: store.faireBrandId || "",
        apiToken: store.apiToken || "",
        description: store.description || "",
        isActive: store.isActive ?? true,
        autoSyncEnabled: store.autoSyncEnabled ?? false,
      })
    }
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return

    setIsSubmitting(true)
    try {
      const updateData: UpdateFaireStoreInput = {
        name: formData.name,
        code: formData.code || undefined,
        faireBrandId: formData.faireBrandId || undefined,
        apiToken: formData.apiToken || undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
        autoSyncEnabled: formData.autoSyncEnabled,
      }

      await updateFaireStore(store.id, updateData)
      toast.success("Store updated successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update store"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!store) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 flex flex-col" hideCloseButton>
        {/* Header */}
        <div className="border-b border-border h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-foreground leading-[1.4]">
            Edit Store
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="border border-border rounded-full size-10 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Store Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Faire Store"
                className="h-[52px] rounded-xl"
                required
              />
            </div>

            {/* Store Code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Store Code
              </Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="STORE-001"
                className="h-[52px] rounded-xl font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for internal reference
              </p>
            </div>

            {/* Faire Brand ID */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Faire Brand ID
              </Label>
              <Input
                value={formData.faireBrandId}
                onChange={(e) =>
                  setFormData({ ...formData, faireBrandId: e.target.value })
                }
                placeholder="b_xxxxxxxx"
                className="h-[52px] rounded-xl font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Your brand ID from Faire (starts with b_)
              </p>
            </div>

            {/* API Token */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                API Token
              </Label>
              <Input
                type="password"
                value={formData.apiToken}
                onChange={(e) =>
                  setFormData({ ...formData, apiToken: e.target.value })
                }
                placeholder="Enter API token"
                className="h-[52px] rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                API token for syncing with Faire
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this store..."
                className="min-h-[100px] rounded-xl resize-none"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable this store for operations
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Auto Sync</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically sync with Faire API
                  </p>
                </div>
                <Switch
                  checked={formData.autoSyncEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoSyncEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="default"
              className="w-[128px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="default"
              className="w-[128px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
