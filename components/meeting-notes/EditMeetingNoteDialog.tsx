"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, X } from "lucide-react"
import { updateMeetingNote } from "@/lib/actions/meeting-notes"
import type { MeetingNote, UpdateMeetingNoteInput } from "@/lib/types/meeting-notes"
import { toast } from "@/components/ui/sonner"

interface EditMeetingNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: MeetingNote
}

export function EditMeetingNoteDialog({ open, onOpenChange, note }: EditMeetingNoteDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [attendees, setAttendees] = useState<Array<{ name: string; role?: string; email?: string }>>([])
  const [attendeeName, setAttendeeName] = useState("")
  const [attendeeRole, setAttendeeRole] = useState("")
  const [attendeeEmail, setAttendeeEmail] = useState("")

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setMeetingDate(note.meetingDate)
      setTags(note.tags || [])
      setAttendees(note.attendees || [])
    }
  }, [note])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMeetingNoteInput }) =>
      updateMeetingNote(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-meeting-notes"] })
      queryClient.invalidateQueries({ queryKey: ["admin-meeting-notes"] })
      toast.success("Meeting note updated successfully")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update meeting note", { description: error.message })
    },
  })

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAddAttendee = () => {
    if (attendeeName.trim()) {
      setAttendees([
        ...attendees,
        {
          name: attendeeName.trim(),
          role: attendeeRole.trim() || undefined,
          email: attendeeEmail.trim() || undefined,
        },
      ])
      setAttendeeName("")
      setAttendeeRole("")
      setAttendeeEmail("")
    }
  }

  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim() || !meetingDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const input: UpdateMeetingNoteInput = {
      title: title.trim(),
      content: content.trim(),
      meetingDate,
      attendees: attendees.length > 0 ? attendees : undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    updateMutation.mutate({ id: note.id, input })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meeting Note</DialogTitle>
          <DialogDescription>Update the meeting note details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingDate">Meeting Date *</Label>
            <Input
              id="meetingDate"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Meeting notes and discussion points..."
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="Name"
                />
                <Input
                  value={attendeeRole}
                  onChange={(e) => setAttendeeRole(e.target.value)}
                  placeholder="Role (optional)"
                />
                <div className="flex gap-2">
                  <Input
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="Email (optional)"
                    type="email"
                  />
                  <Button type="button" variant="outline" onClick={handleAddAttendee}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {attendees.length > 0 && (
                <div className="space-y-1">
                  {attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                    >
                      <span>
                        {attendee.name}
                        {attendee.role && ` (${attendee.role})`}
                        {attendee.email && ` - ${attendee.email}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

