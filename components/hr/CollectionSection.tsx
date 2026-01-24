"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, FileText, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { DocumentCard } from "./DocumentCard"
import type { EmployeeDocument } from "@/lib/types/employee-documents"
import type { CollectionCompleteness } from "@/lib/types/employee-documents"
import { cn } from "@/lib/utils"

interface CollectionSectionProps {
  collection: CollectionCompleteness
  documents: EmployeeDocument[]
  onPreview: (document: EmployeeDocument) => void
  onDownload: (document: EmployeeDocument) => void
  onPrint: (document: EmployeeDocument) => void
  onDelete: (document: EmployeeDocument) => void
}

export function CollectionSection({
  collection,
  documents,
  onPreview,
  onDownload,
  onPrint,
  onDelete,
}: CollectionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Get status indicator
  const getStatusIndicator = () => {
    if (collection.isComplete) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm text-muted-foreground">Complete</span>
        </div>
      )
    }

    if (collection.expired > 0) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-muted-foreground">{collection.expired} expired</span>
        </div>
      )
    }

    if (collection.missing > 0) {
      return (
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-muted-foreground">{collection.missing} missing</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Incomplete</span>
      </div>
    )
  }

  return (
    <Card className="border border-border rounded-2xl">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-base text-foreground">{collection.collectionName}</h3>
            </div>
            <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
              {collection.collected}/{collection.totalRequired}
            </Badge>
          </div>
          {getStatusIndicator()}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {documents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No documents in this collection
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onPrint={onPrint}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

