"use client"

import { useState } from "react"
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
import { Loader2, Upload } from "lucide-react"
import { createPersonalDocument } from "@/lib/actions/personal-documents"
import type { CreatePersonalDocumentInput } from "@/lib/types/personal-documents"
import { toast } from "@/components/ui/sonner"

interface UploadPersonalDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadPersonalDocumentDialog({ open, onOpenChange }: UploadPersonalDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<string>("")

  const uploadMutation = useMutation({
    mutationFn: createPersonalDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-personal-documents"] })
      queryClient.invalidateQueries({ queryKey: ["admin-personal-documents"] })
      toast.success("Document uploaded successfully")
      handleClose()
    },
    onError: (error: Error) => {
      toast.error("Failed to upload document", { description: error.message })
    },
  })

  const handleClose = () => {
    setName("")
    setFile(null)
    setType("")
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!name) {
        setName(selectedFile.name)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error("Please select a file to upload")
      return
    }

    if (!name.trim()) {
      toast.error("Please enter a name for the document")
      return
    }

    const input: CreatePersonalDocumentInput = {
      name: name.trim(),
      file,
      type: type || undefined,
    }

    uploadMutation.mutate(input)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Upload a new document to your personal files.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              required
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

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
            <Label htmlFor="type">Type (Optional)</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Auto-detect</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending || !file}>
              {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

