"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  LayoutGrid,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { getLLCClients, updateLLCClientStatus } from "@/lib/actions/llc-clients"
import {
  LLC_STATUS_CONFIG,
  LLC_HEALTH_CONFIG,
  type LLCClient,
  type LLCClientStatus,
  type LLCClientHealth,
} from "@/lib/types/llc-clients"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { toast } from "@/components/ui/sonner"

// Pipeline stages in order
const PIPELINE_STAGES: LLCClientStatus[] = [
  "llc_booked",
  "onboarded",
  "under_ein",
  "under_boi",
  "under_banking",
  "under_payment_gateway",
  "delivered",
]

export default function LLCApplicationsPipelinePage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [healthFilter, setHealthFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ["llc-clients-pipeline"],
    queryFn: () => getLLCClients({}),
    staleTime: 5 * 60 * 1000,
  })

  // Filter clients
  const filteredClients = clients.filter((client) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        client.clientName.toLowerCase().includes(query) ||
        client.llcName?.toLowerCase().includes(query) ||
        client.clientCode.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Health filter
    if (healthFilter !== "all" && client.health !== healthFilter) {
      return false
    }

    return true
  })

  // Group clients by status for Kanban view
  const clientsByStatus = PIPELINE_STAGES.reduce((acc, status) => {
    acc[status] = filteredClients.filter((c) => c.status === status)
    return acc
  }, {} as Record<LLCClientStatus, LLCClient[]>)

  const handleStatusChange = async (clientId: string, newStatus: LLCClientStatus) => {
    try {
      await updateLLCClientStatus(clientId, newStatus)
      toast.success("Status updated")
      queryClient.invalidateQueries({ queryKey: ["llc-clients-pipeline"] })
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })
  }

  if (isLoading) {
    return <PipelineSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load pipeline"
        message="We couldn't load the applications pipeline. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Applications Pipeline
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Track LLC formation progress across all stages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={viewMode === "kanban" ? "" : "text-white hover:bg-white/10"}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "" : "text-white hover:bg-white/10"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-[38px] border-border rounded-lg"
          />
        </div>
        <Select value={healthFilter} onValueChange={setHealthFilter}>
          <SelectTrigger className="w-32 h-[38px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health</SelectItem>
            {Object.entries(LLC_HEALTH_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground ml-auto">
          {filteredClients.length} clients
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            {PIPELINE_STAGES.map((status) => {
              const stageConfig = LLC_STATUS_CONFIG[status]
              const stageClients = clientsByStatus[status]

              return (
                <div
                  key={status}
                  className="w-[300px] flex-shrink-0"
                >
                  <Card className="border border-border rounded-[14px] h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "h-6 px-2 py-0.5 rounded-md text-xs font-medium",
                              stageConfig.bgColor,
                              stageConfig.color
                            )}
                          >
                            {stageConfig.label}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">
                          {stageClients.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                      {stageClients.length > 0 ? (
                        stageClients.map((client) => (
                          <ClientCard
                            key={client.id}
                            client={client}
                            onStatusChange={handleStatusChange}
                            currentStatus={status}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No clients in this stage
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/legal-nations/clients/${client.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {client.clientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{client.clientName}</p>
                        <p className="text-xs text-muted-foreground">{client.llcName || client.clientCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {client.health && (
                        <Badge
                          variant={LLC_HEALTH_CONFIG[client.health]?.variant}
                          className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                        >
                          {LLC_HEALTH_CONFIG[client.health]?.label}
                        </Badge>
                      )}
                      <Badge
                        className={cn(
                          "h-5 px-2 py-0.5 rounded-md text-xs",
                          LLC_STATUS_CONFIG[client.status]?.bgColor,
                          LLC_STATUS_CONFIG[client.status]?.color
                        )}
                      >
                        {LLC_STATUS_CONFIG[client.status]?.label}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No clients found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ClientCardProps {
  client: LLCClient
  onStatusChange: (clientId: string, newStatus: LLCClientStatus) => void
  currentStatus: LLCClientStatus
}

function ClientCard({ client, onStatusChange, currentStatus }: ClientCardProps) {
  const currentIndex = PIPELINE_STAGES.indexOf(currentStatus)
  const nextStatus = PIPELINE_STAGES[currentIndex + 1]
  const prevStatus = PIPELINE_STAGES[currentIndex - 1]

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <Card
      className={cn(
        "border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer",
        client.health === "critical" && "border-red-300 bg-red-50/50",
        client.health === "at_risk" && "border-yellow-300 bg-yellow-50/50"
      )}
    >
      <Link href={`/legal-nations/clients/${client.id}`}>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium leading-tight">{client.clientName}</p>
              <p className="text-xs text-muted-foreground">{client.llcName || client.clientCode}</p>
            </div>
            {client.health && (
              <Badge
                variant={LLC_HEALTH_CONFIG[client.health]?.variant}
                className="h-5 px-1.5 py-0 rounded text-[10px]"
              >
                {LLC_HEALTH_CONFIG[client.health]?.label}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {client.country && (
              <span className="flex items-center gap-1">
                <span className="text-base">
                  {client.country === "India" ? "🇮🇳" :
                   client.country === "USA" ? "🇺🇸" :
                   client.country === "Canada" ? "🇨🇦" :
                   client.country === "United Kingdom" ? "🇬🇧" :
                   client.country === "Australia" ? "🇦🇺" : "🌍"}
                </span>
                {client.country}
              </span>
            )}
          </div>

          {client.onboardingDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Onboarded: {formatDate(client.onboardingDate)}
            </div>
          )}

          {client.assignedTo && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={client.assignedTo.avatar || getAvatarForUser(client.assignedTo.fullName)}
                  alt={client.assignedTo.fullName}
                />
                <AvatarFallback className="text-[10px]">
                  {client.assignedTo.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {client.assignedTo.fullName}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Quick Actions */}
      {currentStatus !== "delivered" && (
        <div className="flex gap-1 mt-3 pt-2 border-t">
          {prevStatus && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.preventDefault()
                onStatusChange(client.id, prevStatus)
              }}
            >
              ← Back
            </Button>
          )}
          {nextStatus && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.preventDefault()
                onStatusChange(client.id, nextStatus)
              }}
            >
              Next →
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

function PipelineSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-[300px] flex-shrink-0">
            <Card className="border border-border rounded-[14px]">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
