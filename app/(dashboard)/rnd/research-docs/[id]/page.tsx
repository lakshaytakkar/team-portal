"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Calendar,
  ArrowLeft,
  Edit,
  Tag,
  User,
} from "lucide-react"
import { ResearchDoc, DocumentStatus } from "@/lib/types/rnd"
import { getResearchDoc, getResearchDocs } from "@/lib/actions/rnd"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  review: { label: "Review", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
}

async function fetchResearchDoc(id: string) {
  const doc = await getResearchDoc(id)
  if (!doc) throw new Error("Research document not found")
  return doc
}

async function fetchAllResearchDocs() {
  return await getResearchDocs()
}

export default function ResearchDocDetailPage() {
  const params = useParams()
  const router = useRouter()
  const docId = params.id as string

  const { data: doc, isLoading, error, refetch } = useQuery({
    queryKey: ["research-doc", docId],
    queryFn: () => fetchResearchDoc(docId),
  })

  const { data: allDocs } = useQuery({
    queryKey: ["all-research-docs"],
    queryFn: fetchAllResearchDocs,
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !doc) {
      notFound()
    }
  }, [error, isLoading, doc])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <ErrorState
        title="Failed to load research document"
        message="We couldn't load this research document. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!doc) {
    return null
  }

  const status = statusConfig[doc.status]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/rnd/research-docs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{doc.title}</h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{doc.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-6 space-y-6">
              {doc.description && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Description</Label>
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
              )}

              {doc.content && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Content</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 min-h-[300px]">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                      {doc.content}
                    </pre>
                  </div>
                </div>
              )}

              {doc.fileUrl && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">File</Label>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View File
                  </a>
                </div>
              )}

              {doc.tags && doc.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Created By
                </Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={doc.createdBy.avatar} />
                    <AvatarFallback>{getAvatarForUser(doc.createdBy.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.createdBy.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Information
                </Label>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="text-foreground font-medium">{doc.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="text-foreground font-medium">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}









