"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Playlist } from "@/lib/types/trainings"
import { createPlaylist, updatePlaylist } from "@/lib/actions/trainings"

interface PlaylistFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playlist?: Playlist | null
  onSuccess?: () => void
}

export function PlaylistForm({
  open,
  onOpenChange,
  playlist,
  onSuccess,
}: PlaylistFormProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    orderIndex: "0",
  })

  // Populate form when editing
  useEffect(() => {
    if (playlist && open) {
      setFormData({
        name: playlist.name || "",
        description: playlist.description || "",
        orderIndex: playlist.orderIndex?.toString() || "0",
      })
    } else if (open) {
      // Reset form for new playlist
      setFormData({
        name: "",
        description: "",
        orderIndex: "0",
      })
    }
  }, [playlist, open])

  const createMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      toast.success("Playlist created successfully")
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error("Failed to create playlist", {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) =>
      updatePlaylist(id, input),
    onSuccess: () => {
      toast.success("Playlist updated successfully")
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error("Failed to update playlist", {
        description: error.message,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error("Please enter a playlist name")
      return
    }

    const input = {
      name: formData.name,
      description: formData.description || undefined,
      orderIndex: parseInt(formData.orderIndex) || 0,
    }

    if (playlist) {
      await updateMutation.mutateAsync({ id: playlist.id, input })
    } else {
      await createMutation.mutateAsync(input)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {playlist ? "Edit Playlist" : "Create Playlist"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter playlist name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter playlist description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Order Index</Label>
            <Input
              type="number"
              value={formData.orderIndex}
              onChange={(e) =>
                setFormData({ ...formData, orderIndex: e.target.value })
              }
              placeholder="0"
              min="0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {playlist ? "Update" : "Create"} Playlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

