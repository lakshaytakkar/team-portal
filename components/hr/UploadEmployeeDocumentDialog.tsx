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
import { uploadEmployeeDocument, getDocumentTypes, getDocumentCollections } from "@/lib/actions/employee-documents"
import { Loader2, Upload, X } from "lucide-react"
import type { CollectionStatus } from "@/lib/types/employee-documents"

interface UploadEmployeeDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
}

export function UploadEmployeeDocumentDialog({
  open,
  onOpenChange,
  employeeId,
}: UploadEmployeeDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    documentTypeId: "",
    collectionId: "",
    name: "",
    collectionStatus: "pending" as CollectionStatus,
    expiryDate: "",
    notes: "",
  })

  // Fetch document types
  const { data: documentTypes = [] } = useQuery({
    queryKey: ["document-types"],
    queryFn: () => getDocumentTypes(),
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
    if (!file) return

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit")
      return
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed types: PDF, PNG, JPEG, JPG")
      return
    }

    setSelectedFile(file)
    // Auto-fill document name if empty
    if (!formData.name) {
      setFormData((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }

    if (!formData.documentTypeId || !formData.collectionId || !formData.name) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate expiry date is in future if provided
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate)
      if (expiryDate < new Date()) {
        toast.error("Expiry date must be in the future")
        return
      }
    }

    setIsSubmitting(true)

    try {
      await uploadEmployeeDocument({
        employeeId,
        documentTypeId: formData.documentTypeId,
        collectionId: formData.collectionId,
        name: formData.name,
        file: selectedFile,
        collectionStatus: formData.collectionStatus,
        expiryDate: formData.expiryDate || undefined,
        notes: formData.notes || undefined,
      })

      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] })
      toast.success(`Document "${formData.name}" uploaded successfully`)
      
      // Reset form
      setFormData({
        documentTypeId: "",
        collectionId: "",
        name: "",
        collectionStatus: "pending",
        expiryDate: "",
        notes: "",
      })
      setSelectedFile(null)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload document")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected document type to check if expiry tracking is enabled
  const selectedDocumentType = documentTypes.find((dt) => dt.id === formData.documentTypeId)
  const showExpiryDate = selectedDocumentType?.expiryTracking ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
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
              File <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate max-w-xs">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Allowed: PDF, PNG, JPEG, JPG (Max 10MB)
            </p>
          </div>

          {/* Collection Status */}
          <div className="space-y-2">
            <Label htmlFor="collectionStatus">
              Collection Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.collectionStatus}
              onValueChange={(value) => setFormData({ ...formData, collectionStatus: value as CollectionStatus })}
              required
            >
              <SelectTrigger id="collectionStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expiry Date (conditional) */}
          {showExpiryDate && (
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

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
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

