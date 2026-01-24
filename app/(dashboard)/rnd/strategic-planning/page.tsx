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
  Target,
} from "lucide-react"
import { StrategicPlanning } from "@/lib/types/rnd"
import { initialStrategicPlanning } from "@/lib/data/rnd"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchStrategicPlanning() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialStrategicPlanning
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  review: { label: "Review", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
}

export default function RndStrategicPlanningPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: plans, isLoading, error, refetch } = useQuery({
    queryKey: ["strategic-planning"],
    queryFn: fetchStrategicPlanning,
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
        title="Failed to load strategic planning"
        message="We couldn't load strategic planning documents. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredPlans = plans?.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.initiative.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Strategic Planning</h1>
            <p className="text-xs text-white/90 mt-0.5">High-level strategic initiatives</p>
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
          New Strategic Plan
        </Button>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Strategic Planning Documents</h2>
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
          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.map((plan) => {
                const status = statusConfig[plan.status] || statusConfig.draft
                return (
                  <Card key={plan.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                              {plan.title}
                            </h3>
                          </div>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                          <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {plan.initiative}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarForUser(plan.createdBy.id || plan.createdBy.name)} alt={plan.createdBy.name} />
                            <AvatarFallback className="text-xs">
                              {plan.createdBy.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <RowActionsMenu
                          entityType="strategic-planning"
                          entityId={plan.id}
                          entityName={plan.title}
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
              icon={Target}
              title="No strategic planning docs yet"
              description="Create high-level strategic planning documents and initiatives."
            />
          )}
        </div>
      </Card>
    </div>
  )
}
