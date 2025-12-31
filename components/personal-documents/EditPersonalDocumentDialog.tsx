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
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updatePersonalDocument } from "@/lib/actions/personal-documents"
import type { PersonalDocument, UpdatePersonalDocumentInput } from "@/lib/types/personal-documents"
import { toast } from "@/components/ui/sonner"

interface EditPersonalDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: PersonalDocument
}

export function EditPersonalDocumentDialog({ open, onOpenChange, document }: EditPersonalDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [type, setType] = useState<string>("")

  useEffect(() => {
    if (document) {
      setName(document.name)
      setType(document.type || "")
    }
  }, [document])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePersonalDocumentInput }) =>
      updatePersonalDocument(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-personal-documents"] })
      queryClient.invalidateQueries({ queryKey: ["admin-personal-documents"] })
      toast.success("Document updated successfully")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update document", { description: error.message })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a name for the document")
      return
    }

    const input: UpdatePersonalDocumentInput = {
      name: name.trim(),
      type: type || undefined,
    }

    updateMutation.mutate({ id: document.id, input })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>Update the document details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Document name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">None</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="other">Other</option>
            </select>
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

