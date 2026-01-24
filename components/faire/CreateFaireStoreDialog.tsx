"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/sonner"
import { createFaireStore } from "@/lib/actions/faire"
import type { CreateFaireStoreInput } from "@/lib/types/faire"

interface CreateFaireStoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFaireStoreDialog({ open, onOpenChange }: CreateFaireStoreDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFaireStoreInput>({
    defaultValues: {
      isActive: true,
      autoSyncEnabled: false,
    },
  })

  const isActive = watch("isActive")
  const autoSyncEnabled = watch("autoSyncEnabled")

  const onSubmit = async (data: CreateFaireStoreInput) => {
    setIsSubmitting(true)
    try {
      await createFaireStore(data)
      toast.success("Store created successfully")
      queryClient.invalidateQueries({ queryKey: ["faire-stores"] })
      queryClient.invalidateQueries({ queryKey: ["faire-overview-stats"] })
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create store")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Faire Store</DialogTitle>
          <DialogDescription>
            Connect a Faire Wholesale seller account to manage orders and products
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                placeholder="My Faire Store"
                {...register("name", { required: "Store name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Store Code</Label>
              <Input
                id="code"
                placeholder="Auto-generated"
                {...register("code")}
              />
              <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
            </div>
          </div>

          {/* Faire Connection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faireBrandId">Faire Brand ID</Label>
              <Input
                id="faireBrandId"
                placeholder="b_xxxxxxxx"
                {...register("faireBrandId")}
              />
              <p className="text-xs text-muted-foreground">From your Faire account</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Enter API token"
                {...register("apiToken")}
              />
              <p className="text-xs text-muted-foreground">For future API sync</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this store..."
              rows={2}
              {...register("description")}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">Enable this store</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-medium">Auto Sync</Label>
                <p className="text-xs text-muted-foreground">Sync with Faire API</p>
              </div>
              <Switch
                checked={autoSyncEnabled}
                onCheckedChange={(checked) => setValue("autoSyncEnabled", checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Store"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
