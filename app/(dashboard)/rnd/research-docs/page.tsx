"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  FileText,
} from "lucide-react"
import { ResearchDoc } from "@/lib/types/rnd"
import { initialResearchDocs } from "@/lib/data/rnd"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateResearchDocDialog } from "@/components/rnd/CreateResearchDocDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchResearchDocs() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialResearchDocs
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  review: { label: "Review", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
}

export default function RndResearchDocsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateResearchDocOpen, setIsCreateResearchDocOpen] = useState(false)
  const { data: docs, isLoading, error, refetch } = useQuery({
    queryKey: ["research-docs"],
    queryFn: fetchResearchDocs,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load research docs"
        message="We couldn't load research docs. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredDocs = docs?.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Research Docs</h1>
            <p className="text-xs text-white/90 mt-0.5">Research findings, papers, studies</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="default" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
        <Button onClick={() => setIsCreateResearchDocOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Research Doc
        </Button>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Research Documents</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="p-5">
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc) => {
                const status = statusConfig[doc.status] || statusConfig.draft
                return (
                  <Card key={doc.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                              {doc.title}
                            </h3>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                              {doc.category}
                            </Badge>
                            {doc.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarForUser(doc.createdBy.id || doc.createdBy.name)} alt={doc.createdBy.name} />
                            <AvatarFallback className="text-xs">
                              {doc.createdBy.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <RowActionsMenu
                          entityType="research-doc"
                          entityId={doc.id}
                          entityName={doc.title}
                          canView={true}
                          canEdit={true}
                          canDelete={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No research docs yet"
              description="Create your first research document to get started."
              action={{
                label: "Create Research Doc",
                onClick: () => setIsCreateResearchDocOpen(true),
              }}
            />
          )}
        </div>
      </Card>

      <CreateResearchDocDialog open={isCreateResearchDocOpen} onOpenChange={setIsCreateResearchDocOpen} />
    </div>
  )
}
