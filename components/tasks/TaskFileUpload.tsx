"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/sonner"
import { uploadTaskAttachment, createTaskAttachment } from "@/lib/actions/task-attachments"

interface TaskFileUploadProps {
  uploadedFiles: File[]
  setUploadedFiles: (files: File[]) => void
  taskId?: string
  disabled?: boolean
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

export function TaskFileUpload({
  uploadedFiles,
  setUploadedFiles,
  taskId,
  disabled = false,
}: TaskFileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  
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
    if (disabled) {
      toast.error("Please wait", {
        description: "Task is being created. Please wait before uploading files.",
        duration: 3000,
      })
      return
    }
    
    const validationError = validateFile(file)
    if (validationError) {
      toast.error("File validation failed", {
        description: validationError,
        duration: 5000,
      })
      return
    }
    
    if (!taskId) {
      // If task hasn't been created yet, just add to local state
      // Files will be uploaded after task creation
      setUploadedFiles([...uploadedFiles, file])
      toast.success("File added", {
        description: `"${file.name}" will be uploaded after task creation`,
        duration: 3000,
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
      
      setUploadedFiles([...uploadedFiles, file])
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
  
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
    [taskId, uploadedFiles]
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
    [taskId, uploadedFiles]
  )
  
  const handleClick = () => {
    fileInputRef.current?.click()
  }
  
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
  }
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Attachments</h3>
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
      
      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => {
              const isUploading = uploadingFiles.has(file.name)
              const progress = uploadProgress[file.name] || 0
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {isUploading && (
                        <div className="mt-1">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

