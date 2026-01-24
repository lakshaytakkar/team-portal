"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Training } from "@/lib/types/trainings"
import { createTraining, updateTraining, getPlaylists } from "@/lib/actions/trainings"

interface TrainingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  training?: Training | null
  onSuccess?: () => void
}

export function TrainingForm({
  open,
  onOpenChange,
  training,
  onSuccess,
}: TrainingFormProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    videoUrl: "",
    thumbnailUrl: "",
    playlistId: "__none__",
    orderIndex: "0",
  })

  const { data: playlists } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => await getPlaylists({ isActive: true }),
    enabled: open,
  })

  // Populate form when editing
  useEffect(() => {
    if (training && open) {
      setFormData({
        title: training.title || "",
        description: training.description || "",
        category: training.category || "",
        duration: training.duration?.toString() || "",
        videoUrl: training.videoUrl || "",
        thumbnailUrl: training.thumbnailUrl || "",
        playlistId: training.playlistId || "__none__",
        orderIndex: training.orderIndex?.toString() || "0",
      })
    } else if (open) {
      // Reset form for new training
      setFormData({
        title: "",
        description: "",
        category: "",
        duration: "",
        videoUrl: "",
        thumbnailUrl: "",
        playlistId: "__none__",
        orderIndex: "0",
      })
    }
  }, [training, open])

  const createMutation = useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      toast.success("Training created successfully")
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error("Failed to create training", {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) =>
      updateTraining(id, input),
    onSuccess: () => {
      toast.success("Training updated successfully")
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error("Failed to update training", {
        description: error.message,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.videoUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    const input = {
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      videoUrl: formData.videoUrl,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      playlistId: formData.playlistId !== "__none__" ? formData.playlistId : undefined,
      orderIndex: parseInt(formData.orderIndex) || 0,
    }

    if (training) {
      await updateMutation.mutateAsync({ id: training.id, input })
    } else {
      await createMutation.mutateAsync(input)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>{training ? "Edit Training" : "Create Training"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter training title"
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
                placeholder="Enter training description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Onboarding, Sales"
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="Duration in minutes"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Video URL <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Playlist</Label>
                <Select
                  value={formData.playlistId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, playlistId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Playlist</SelectItem>
                    {playlists?.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
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
              {training ? "Update" : "Create"} Training
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

