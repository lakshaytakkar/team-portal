"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { createEmployeeDocument, getDocumentTypes, getDocumentCollections } from "@/lib/actions/employee-documents"
import { Loader2 } from "lucide-react"

interface CreateEmployeeDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
}

export function CreateEmployeeDocumentDialog({
  open,
  onOpenChange,
  employeeId,
}: CreateEmployeeDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    documentTypeId: "",
    collectionId: "",
    name: "",
    issuedDate: new Date().toISOString().split("T")[0],
    notes: "",
    file: null as File | null,
  })

  // Fetch document types (only signed documents)
  const { data: documentTypes = [] } = useQuery({
    queryKey: ["document-types-signed"],
    queryFn: () => getDocumentTypes().then((types) => types.filter((t) => t.isSignedDocument)),
  })

  // Fetch collections
  const { data: collections = [] } = useQuery({
    queryKey: ["document-collections"],
    queryFn: () => getDocumentCollections(),
  })

  // When document type changes, auto-set collection if available
  const handleDocumentTypeChange = (documentTypeId: string) => {
    setFormData({ ...formData, documentTypeId })
    const selectedType = documentTypes.find((dt) => dt.id === documentTypeId)
    if (selectedType?.collectionId) {
      setFormData((prev) => ({ ...prev, collectionId: selectedType.collectionId || "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
      // Auto-fill document name if empty
      if (!formData.name) {
        setFormData((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.documentTypeId || !formData.collectionId || !formData.name) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.file) {
      toast.error("Please upload a file")
      return
    }

    setIsSubmitting(true)

    try {
      // Create document with file upload (handled internally)
      await createEmployeeDocument({
        employeeId,
        documentTypeId: formData.documentTypeId,
        collectionId: formData.collectionId,
        name: formData.name,
        file: formData.file!,
        filePath: "", // Not needed when file is provided
        fileName: formData.file!.name,
        fileSize: formData.file!.size,
        mimeType: formData.file!.type,
        issuedDate: formData.issuedDate || undefined,
        notes: formData.notes || undefined,
      })

      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] })
      toast.success(`Document "${formData.name}" created successfully`)
      
      // Reset form
      setFormData({
        documentTypeId: "",
        collectionId: "",
        name: "",
        issuedDate: new Date().toISOString().split("T")[0],
        notes: "",
        file: null,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create document")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new document to issue to the employee (contracts, offer letters, NDAs, etc.)
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="documentType">
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.documentTypeId}
              onValueChange={handleDocumentTypeChange}
              required
            >
              <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collection */}
          <div className="space-y-2">
            <Label htmlFor="collection">
              Collection <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.collectionId}
              onValueChange={(value) => setFormData({ ...formData, collectionId: value })}
              required
            >
              <SelectTrigger id="collection">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Document Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter document name"
              required
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              Document File <span className="text-destructive">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="cursor-pointer"
              required
            />
            <p className="text-xs text-muted-foreground">
              Upload the document file (PDF recommended, max 10MB)
            </p>
            {formData.file && (
              <p className="text-sm text-muted-foreground">
                Selected: {formData.file.name}
              </p>
            )}
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="issuedDate">Issue Date</Label>
            <Input
              id="issuedDate"
              type="date"
              value={formData.issuedDate}
              onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          {/* Info message */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              The document will be created with status "draft". You can later update it to "issued" and then "signed" once the employee signs it.
            </p>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Document"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

