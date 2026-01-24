"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, FileText, Search, Download, Trash2, File, Image, FileSpreadsheet } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { getPersonalDocuments, deletePersonalDocument, getPersonalDocumentUrl } from "@/lib/actions/personal-documents"
import type { PersonalDocument } from "@/lib/types/personal-documents"
import { useUser } from "@/lib/hooks/useUser"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { UploadPersonalDocumentDialog } from "@/components/personal-documents/UploadPersonalDocumentDialog"
import { EditPersonalDocumentDialog } from "@/components/personal-documents/EditPersonalDocumentDialog"

function getFileIcon(type?: string) {
  if (!type) return File
  switch (type.toLowerCase()) {
    case 'image':
      return Image
    case 'spreadsheet':
      return FileSpreadsheet
    default:
      return FileText
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default function MyDocumentsPage() {
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [activeTab, setActiveTab] = useState("files")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<PersonalDocument | null>(null)

  const filters = useMemo(() => {
    const f: any = {}
    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }
    if (typeFilter !== "all") {
      f.type = [typeFilter]
    }
    return f
  }, [searchQuery, typeFilter])

  const { data: documents, isLoading, error, refetch } = useQuery({
    queryKey: ["my-personal-documents", filters, user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      return await getPersonalDocuments(filters, user.id)
    },
    enabled: !userLoading && !!user?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePersonalDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-personal-documents"] })
      toast.success("Document deleted successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete document", { description: error.message })
    },
  })

  const downloadMutation = useMutation({
    mutationFn: getPersonalDocumentUrl,
    onSuccess: (url) => {
      if (url) {
        window.open(url, '_blank')
      } else {
        toast.error("Failed to get document URL")
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to download document", { description: error.message })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleDownload = async (id: string) => {
    await downloadMutation.mutateAsync(id)
  }

  const handleEdit = (doc: PersonalDocument) => {
    setEditingDoc(doc)
  }

  if (userLoading || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load documents"
        message="We couldn't load your documents. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Documents</h1>
            <p className="text-xs text-white/90 mt-0.5">Access and manage your files, templates, and shared documents</p>
          </div>
          <Button onClick={() => setIsUploadOpen(true)} className="bg-white text-primary hover:bg-white/90">
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="files"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            My Files
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="shared"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium"
          >
            Shared
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* My Files Tab */}
          <TabsContent value="files" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Files</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-9 px-3 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="image">Images</option>
                    <option value="document">Documents</option>
                    <option value="spreadsheet">Spreadsheets</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const Icon = getFileIcon(doc.type)
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <Icon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.size)}
                                </span>
                                {doc.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {doc.type}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc.id)}
                              disabled={downloadMutation.isPending}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <RowActionsMenu
                              entityType="personal-document"
                              entityId={doc.id}
                              entityName={doc.name}
                              canEdit={true}
                              canDelete={true}
                              onEdit={() => handleEdit(doc)}
                              onDelete={() => handleDelete(doc.id)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12">
                    <EmptyState
                      icon={FileText}
                      title="No documents yet"
                      description={
                        searchQuery || typeFilter !== "all"
                          ? "No documents match your search or filters."
                          : "Upload your first document to get started."
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Message & Document Templates</CardTitle>
                <Button className="h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-medium text-muted-foreground mb-2">No templates yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create reusable templates for messages, meeting notes, and documents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared" className="mt-0">
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-base font-medium text-muted-foreground mb-2">No shared documents</p>
                  <p className="text-sm text-muted-foreground">
                    Documents shared with you by your team will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <UploadPersonalDocumentDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
      {editingDoc && (
        <EditPersonalDocumentDialog
          open={!!editingDoc}
          onOpenChange={(open) => {
            if (!open) setEditingDoc(null)
          }}
          document={editingDoc}
        />
      )}
    </div>
  )
}
