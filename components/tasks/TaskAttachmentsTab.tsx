"use client"

import { useState, useCallback, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Upload, X, File, Loader2, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/sonner"
import { 
  uploadTaskAttachment, 
  createTaskAttachment, 
  getTaskAttachments, 
  deleteTaskAttachment 
} from "@/lib/actions/task-attachments"
import type { TaskAttachment } from "@/lib/types/task-attachment"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface TaskAttachmentsTabProps {
  taskId: string
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
]

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip"]

export function TaskAttachmentsTab({ taskId }: TaskAttachmentsTabProps) {
  const queryClient = useQueryClient()
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState<TaskAttachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch existing attachments
  const { data: attachments = [], isLoading, refetch } = useQuery({
    queryKey: ["task-attachments", taskId],
    queryFn: () => getTaskAttachments(taskId),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTaskAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] })
      toast.success("Attachment deleted", {
        description: "The attachment has been removed",
        duration: 3000,
      })
      setDeleteDialogOpen(false)
      setAttachmentToDelete(null)
    },
    onError: (error: Error) => {
      toast.error("Failed to delete attachment", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 25MB limit`
    }
    
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `File "${file.name}" is not a supported type. Allowed: PDF, DOC, DOCX, XLS, XLSX, ZIP`
    }
    
    return null
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast.error("File validation failed", {
        description: validationError,
        duration: 5000,
      })
      return
    }

    setUploadingFiles((prev) => new Set(prev).add(file.name))

    try {
      // Upload to storage
      const uploadResult = await uploadTaskAttachment(file, taskId)
      
      // Create attachment record
      await createTaskAttachment({
        taskId,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.url,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
      })
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] })
      await refetch()
      
      toast.success("File uploaded successfully", {
        description: `"${file.name}" has been uploaded`,
        duration: 3000,
      })
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Failed to upload file",
        duration: 5000,
      })
    } finally {
      setUploadingFiles((prev) => {
        const next = new Set(prev)
        next.delete(file.name)
        return next
      })
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)
      
      const files = Array.from(e.dataTransfer.files)
      files.forEach((file) => {
        handleFileUpload(file)
      })
    },
    [taskId]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      files.forEach((file) => {
        handleFileUpload(file)
      })
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [taskId]
  )

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDelete = (attachment: TaskAttachment) => {
    setAttachmentToDelete(attachment)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (attachmentToDelete) {
      deleteMutation.mutate(attachmentToDelete.id)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄"
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝"
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊"
    if (mimeType.includes("zip")) return "📦"
    return "📎"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading attachments...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border border-border rounded-2xl">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Upload Attachments</h3>
              <p className="text-sm text-muted-foreground">
                Upload files related to this task (PDF, Doc, Excel, Zip)
              </p>
            </div>
            
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button type="button" variant="outline" size="sm">
                Upload Files
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Max file size: 25MB
              </p>
            </div>
            
            {/* Uploading Files List */}
            {uploadingFiles.size > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Uploading...</h4>
                {Array.from(uploadingFiles).map((fileName) => (
                  <div
                    key={fileName}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50"
                  >
                    <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Attachments List */}
      {attachments.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Attachments ({attachments.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              Files attached to this task
            </p>
          </div>
          
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="border border-border rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl shrink-0">
                        {getFileIcon(attachment.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(attachment.fileUrl, "_blank")}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(attachment)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-8 text-center">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No attachments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload files using the area above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Attachment"
        description={`Are you sure you want to delete "${attachmentToDelete?.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        icon={<Trash2 className="w-full h-full" />}
      />
    </div>
  )
}

