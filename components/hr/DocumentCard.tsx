"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Printer, Trash2, Eye, Calendar, AlertCircle } from "lucide-react"
import type { EmployeeDocument } from "@/lib/types/employee-documents"
import { cn } from "@/lib/utils"

interface DocumentCardProps {
  document: EmployeeDocument
  onPreview: (document: EmployeeDocument) => void
  onDownload: (document: EmployeeDocument) => void
  onPrint: (document: EmployeeDocument) => void
  onDelete: (document: EmployeeDocument) => void
}

const collectionStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pending", variant: "outline" },
  collected: { label: "Collected", variant: "default" },
  expired: { label: "Expired", variant: "destructive" },
  missing: { label: "Missing", variant: "outline" },
}

const documentStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  issued: { label: "Issued", variant: "secondary" },
  signed: { label: "Signed", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
}

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

export function DocumentCard({ document, onPreview, onDownload, onPrint, onDelete }: DocumentCardProps) {
  const collectionStatus = collectionStatusConfig[document.collectionStatus] || collectionStatusConfig.pending
  const documentStatus = document.documentStatus ? documentStatusConfig[document.documentStatus] : null

  // Check if document is expired
  const isExpired = document.expiryDate && new Date(document.expiryDate) < new Date()

  // Format date helper
  const formatDate = (date?: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className={cn(
      "border border-border rounded-xl hover:border-primary transition-colors",
      isExpired && "border-destructive/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Document info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h4 className="font-semibold text-sm text-foreground truncate">
                {document.name}
              </h4>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {document.documentType && (
                <span className="text-xs text-muted-foreground">
                  {document.documentType.name}
                </span>
              )}
              <Badge variant={collectionStatus.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {collectionStatus.label}
              </Badge>
              {documentStatus && (
                <Badge variant={documentStatus.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                  {documentStatus.label}
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="h-5 px-2 py-0.5 rounded-2xl text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatFileSize(document.fileSize)}</span>
              {formatDate(document.createdAt) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.createdAt)}
                </span>
              )}
              {document.expiryDate && (
                <span className={cn(
                  "flex items-center gap-1",
                  isExpired && "text-destructive font-medium"
                )}>
                  <Calendar className="h-3 w-3" />
                  Expires: {formatDate(document.expiryDate)}
                </span>
              )}
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPreview(document)}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onDownload(document)}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPrint(document)}
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(document)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

