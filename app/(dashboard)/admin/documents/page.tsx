"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Search, Download, File, Image, FileSpreadsheet } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { getPersonalDocuments, deletePersonalDocument, getPersonalDocumentUrl } from "@/lib/actions/personal-documents"
import type { PersonalDocument } from "@/lib/types/personal-documents"
import { useUser } from "@/lib/hooks/useUser"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getUsers } from "@/lib/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

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

export default function AdminDocumentsPage() {
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [userIdFilter, setUserIdFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filters = useMemo(() => {
    const f: any = {}
    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }
    if (userIdFilter !== "all") {
      f.userId = [userIdFilter]
    }
    if (typeFilter !== "all") {
      f.type = [typeFilter]
    }
    return f
  }, [searchQuery, userIdFilter, typeFilter])

  const { data: documents, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-personal-documents", filters],
    queryFn: async () => await getPersonalDocuments(filters),
    enabled: !userLoading && !!user,
  })

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !userLoading && !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePersonalDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-personal-documents"] })
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

  if (userLoading || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="p-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load documents"
        message="We couldn't load documents. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Documents Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all employee personal documents
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-border rounded-[14px]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={userIdFilter} onValueChange={setUserIdFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents List */}
        <div className="divide-y divide-border">
          {documents && documents.length > 0 ? (
            documents.map((doc) => {
              const Icon = getFileIcon(doc.type)
              return (
                <div
                  key={doc.id}
                  className="p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          {doc.user && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={getAvatarForUser(doc.user.name)} />
                                <AvatarFallback className="text-xs">
                                  {doc.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{doc.user.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
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
                        canView={true}
                        canDelete={true}
                        onDelete={() => handleDelete(doc.id)}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-12">
              <EmptyState
                icon={FileText}
                title="No documents found"
                description={
                  searchQuery || userIdFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "No documents have been uploaded yet."
                }
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

