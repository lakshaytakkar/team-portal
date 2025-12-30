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
  GitBranch,
} from "lucide-react"
import { Mindmap } from "@/lib/types/rnd"
import { initialMindmaps } from "@/lib/data/rnd"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchMindmaps() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialMindmaps
}

export default function RndMindmapsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: mindmaps, isLoading, error, refetch } = useQuery({
    queryKey: ["mindmaps"],
    queryFn: fetchMindmaps,
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
        title="Failed to load mindmaps"
        message="We couldn't load mindmaps. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredMindmaps = mindmaps?.filter(
    (mindmap) =>
      mindmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mindmap.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mindmap.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Mindmaps</h1>
            <p className="text-xs text-white/90 mt-0.5">Visual research planning, brainstorming</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="default" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Mindmap
          </Button>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Mindmaps</h2>
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
          {filteredMindmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMindmaps.map((mindmap) => (
                <Card key={mindmap.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                            {mindmap.title}
                          </h3>
                        </div>
                        {mindmap.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {mindmap.description}
                          </p>
                        )}
                        <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {mindmap.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getAvatarForUser(mindmap.createdBy.id || mindmap.createdBy.name)} alt={mindmap.createdBy.name} />
                        <AvatarFallback className="text-xs">
                          {mindmap.createdBy.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <RowActionsMenu
                        entityType="mindmap"
                        entityId={mindmap.id}
                        entityName={mindmap.title}
                        canView={true}
                        canEdit={true}
                        canDelete={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={GitBranch}
              title="No mindmaps yet"
              description="Create visual mindmaps for research planning and brainstorming."
            />
          )}
        </div>
      </Card>
    </div>
  )
}
