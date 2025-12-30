"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Printer, Loader2 } from "lucide-react"
import { getDocumentUrl } from "@/lib/actions/employee-documents"
import type { EmployeeDocument } from "@/lib/types/employee-documents"
import { toast } from "@/components/ui/sonner"

interface DocumentPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: EmployeeDocument
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
}: DocumentPreviewDialogProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && document) {
      setIsLoading(true)
      getDocumentUrl(document.id)
        .then((url) => {
          setDocumentUrl(url)
          setIsLoading(false)
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Failed to load document")
          setIsLoading(false)
        })
    } else {
      setDocumentUrl(null)
    }
  }, [open, document])

  const handleDownload = async () => {
    try {
      const url = await getDocumentUrl(document.id)
      const link = document.createElement("a")
      link.href = url
      link.download = document.fileName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      toast.success(`Downloading ${document.name}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download document")
    }
  }

  const handlePrint = async () => {
    try {
      const url = await getDocumentUrl(document.id)
      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open document for printing")
    }
  }

  const isImage = document.mimeType.startsWith("image/")
  const isPdf = document.mimeType === "application/pdf"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{document.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documentUrl ? (
            <>
              {isImage && (
                <div className="flex items-center justify-center">
                  <img
                    src={documentUrl}
                    alt={document.name}
                    className="max-w-full max-h-[calc(90vh-200px)] object-contain"
                  />
                </div>
              )}
              {isPdf && (
                <div className="w-full h-full">
                  <iframe
                    src={documentUrl}
                    className="w-full h-[calc(90vh-200px)] border-0 rounded-lg"
                    title={document.name}
                  />
                </div>
              )}
              {!isImage && !isPdf && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Preview not available for this file type. Please download to view.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Failed to load document</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

