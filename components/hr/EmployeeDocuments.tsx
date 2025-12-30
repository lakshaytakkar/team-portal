"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Search, Filter } from "lucide-react"
import { getEmployeeDocuments, getDocumentCollections, getDocumentTypes } from "@/lib/actions/employee-documents"
import { CollectionSection } from "./CollectionSection"
import { UploadEmployeeDocumentDialog } from "./UploadEmployeeDocumentDialog"
import { CreateEmployeeDocumentDialog } from "./CreateEmployeeDocumentDialog"
import { DocumentPreviewDialog } from "./DocumentPreviewDialog"
import { EmptyState } from "@/components/ui/empty-state"
import { getAllCollectionCompleteness } from "@/lib/utils/document-collections"
import type { EmployeeDocument, DocumentFilters } from "@/lib/types/employee-documents"
import { toast } from "@/components/ui/sonner"
import { deleteEmployeeDocument, getDocumentUrl } from "@/lib/actions/employee-documents"

interface EmployeeDocumentsProps {
  employeeId: string
}

export function EmployeeDocuments({ employeeId }: EmployeeDocumentsProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<EmployeeDocument | null>(null)
  const [filters, setFilters] = useState<DocumentFilters>({})
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["employee-documents", employeeId, filters],
    queryFn: () => getEmployeeDocuments(employeeId, filters),
  })

  // Fetch collections for filter
  const { data: collections = [] } = useQuery({
    queryKey: ["document-collections"],
    queryFn: () => getDocumentCollections(),
  })

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.fileName.toLowerCase().includes(query) ||
      doc.documentType?.name.toLowerCase().includes(query) ||
      doc.collection?.name.toLowerCase().includes(query)
    )
  })

  // Group documents by collection
  const collectionCompleteness = getAllCollectionCompleteness(filteredDocuments)
  const documentsByCollection = new Map<string, EmployeeDocument[]>()
  filteredDocuments.forEach((doc) => {
    const collectionId = doc.collectionId
    if (!documentsByCollection.has(collectionId)) {
      documentsByCollection.set(collectionId, [])
    }
    documentsByCollection.get(collectionId)!.push(doc)
  })

  const handlePreview = (document: EmployeeDocument) => {
    setPreviewDocument(document)
    setPreviewDialogOpen(true)
  }

  const handleDownload = async (document: EmployeeDocument) => {
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

  const handlePrint = async (document: EmployeeDocument) => {
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

  const handleDelete = async (document: EmployeeDocument) => {
    if (!confirm(`Are you sure you want to delete "${document.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteEmployeeDocument(document.id)
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] })
      toast.success(`${document.name} has been deleted successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete document")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-border rounded-2xl">
              <CardContent className="p-4">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.collectionId || "all"}
            onValueChange={(value) =>
                setFilters({ ...filters, collectionId: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Collections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.collectionStatus || "all"}
            onValueChange={(value) =>
                setFilters({ ...filters, collectionStatus: value === "all" ? undefined : value as any })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Documents grouped by collection */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload or create a document to get started."
              action={{
                label: "Upload Document",
                onClick: () => setUploadDialogOpen(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {collectionCompleteness.map((completeness) => {
            const collectionDocuments = documentsByCollection.get(completeness.collectionId) || []
            if (collectionDocuments.length === 0) return null

            return (
              <CollectionSection
                key={completeness.collectionId}
                collection={completeness}
                documents={collectionDocuments}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onPrint={handlePrint}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <UploadEmployeeDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        employeeId={employeeId}
      />
      <CreateEmployeeDocumentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        employeeId={employeeId}
      />
      {previewDocument && (
        <DocumentPreviewDialog
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          document={previewDocument}
        />
      )}
    </div>
  )
}

