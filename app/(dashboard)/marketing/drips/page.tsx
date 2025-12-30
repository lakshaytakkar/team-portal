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
  Droplets,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Drip } from "@/lib/types/marketing"
import { initialDrips } from "@/lib/data/marketing"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchDrips() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialDrips
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }> = {
  active: { label: "Active", variant: "default", icon: PlayCircle },
  paused: { label: "Paused", variant: "secondary", icon: PauseCircle },
  draft: { label: "Draft", variant: "outline", icon: PauseCircle },
}

export default function MarketingDripsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: drips, isLoading, error, refetch } = useQuery({
    queryKey: ["drips"],
    queryFn: fetchDrips,
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
        title="Failed to load drips"
        message="We couldn't load drips. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredDrips = drips?.filter(
    (drip) =>
      drip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drip.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Drips</h1>
            <p className="text-xs text-white/90 mt-0.5">Create email sequence campaigns (multi-step automated sequences)</p>
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
            New Drip
          </Button>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Drip Sequences</h2>
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
          {filteredDrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDrips.map((drip) => {
                const status = statusConfig[drip.status] || statusConfig.draft
                const StatusIcon = status.icon
                return (
                  <Card key={drip.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                              {drip.name}
                            </h3>
                          </div>
                          {drip.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {drip.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span>{drip.steps} steps</span>
                            <span>{drip.recipients || 0} recipients</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                        <RowActionsMenu
                          entityType="drip"
                          entityId={drip.id}
                          entityName={drip.name}
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
              icon={Droplets}
              title="No drip sequences yet"
              description="Create multi-step email drip sequences to engage leads over time."
            />
          )}
        </div>
      </Card>
    </div>
  )
}
