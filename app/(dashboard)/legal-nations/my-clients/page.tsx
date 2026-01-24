"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getLLCClients, getLLCClientStats } from "@/lib/actions/llc-clients"
import {
  LLC_STATUS_CONFIG,
  LLC_HEALTH_CONFIG,
  type LLCClientStatus,
  type LLCClientHealth,
} from "@/lib/types/llc-clients"
import { useUser } from "@/lib/hooks/useUser"

export default function MyLLCClientsPage() {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [healthFilter, setHealthFilter] = useState<string>("all")

  // In a real implementation, we'd filter by current user's employee ID
  // For now, we'll show all clients and explain the filtering would happen server-side
  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ["llc-my-clients", statusFilter, healthFilter],
    queryFn: () => getLLCClients({
      status: statusFilter !== "all" ? statusFilter as LLCClientStatus : undefined,
      health: healthFilter !== "all" ? healthFilter as LLCClientHealth : undefined,
      // assignedToId: currentEmployeeId  // Would be set server-side based on auth
    }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: stats } = useQuery({
    queryKey: ["llc-my-client-stats"],
    queryFn: () => getLLCClientStats(),
    staleTime: 5 * 60 * 1000,
  })

  const filteredClients = clients?.filter((client) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      client.clientName.toLowerCase().includes(query) ||
      client.llcName?.toLowerCase().includes(query) ||
      client.clientCode.toLowerCase().includes(query)
    )
  }) || []

  // Count clients needing attention
  const needsAttention = filteredClients.filter(
    (c) => c.health === "at_risk" || c.health === "critical"
  ).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return <MyClientsPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load clients"
        message="We couldn't load your clients. Please try again."
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
              My Clients
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              LLC formation clients assigned to you
            </p>
          </div>
          <Link href="/legal-nations/applications">
            <Button variant="secondary" size="sm">
              View Pipeline
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">My Clients</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{filteredClients.length}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-orange-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">In Progress</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {filteredClients.filter((c) => c.status !== "delivered").length}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Delivered</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {filteredClients.filter((c) => c.status === "delivered").length}
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border rounded-[14px]",
          needsAttention > 0 ? "border-yellow-300 bg-yellow-50" : "border-border"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn(
                "rounded-full w-9 h-9 flex items-center justify-center shrink-0",
                needsAttention > 0 ? "bg-yellow-200" : "bg-gray-100"
              )}>
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  needsAttention > 0 ? "text-yellow-600" : "text-gray-600"
                )} />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Needs Attention</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{needsAttention}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white rounded-t-[14px]">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-[38px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(LLC_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-32 h-[38px]">
                <SelectValue placeholder="All Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                {Object.entries(LLC_HEALTH_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Client</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">LLC Name</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Health</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Next Action</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  // Determine next action based on status
                  const getNextAction = () => {
                    switch (client.status) {
                      case "llc_booked": return "Schedule onboarding call"
                      case "onboarded": return "Collect documents"
                      case "under_ein": return "Apply for EIN"
                      case "under_boi": return "Complete BOI filing"
                      case "under_banking": return "Setup bank account"
                      case "under_payment_gateway": return "Configure payment gateway"
                      case "delivered": return "Complete"
                      default: return "—"
                    }
                  }

                  return (
                    <TableRow
                      key={client.id}
                      className={cn(
                        "border-b border-border",
                        (client.health === "at_risk" || client.health === "critical") && "bg-yellow-50/50"
                      )}
                    >
                      <TableCell className="px-3">
                        <Link href={`/legal-nations/clients/${client.id}`} className="hover:underline">
                          <div>
                            <span className="text-sm font-medium text-foreground">{client.clientName}</span>
                            <p className="text-xs text-muted-foreground">{client.clientCode}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm text-foreground">{client.llcName || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex flex-col gap-0.5">
                          {client.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{client.phone}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{client.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge
                          className={cn(
                            "h-5 px-2 py-0.5 rounded-md text-xs",
                            LLC_STATUS_CONFIG[client.status]?.bgColor,
                            LLC_STATUS_CONFIG[client.status]?.color
                          )}
                        >
                          {LLC_STATUS_CONFIG[client.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        {client.health && (
                          <Badge
                            variant={LLC_HEALTH_CONFIG[client.health]?.variant}
                            className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                          >
                            {LLC_HEALTH_CONFIG[client.health]?.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3">
                        <span className={cn(
                          "text-xs",
                          client.status === "delivered" ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {getNextAction()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="client"
                          entityId={client.id}
                          entityName={client.clientName}
                          detailUrl={`/legal-nations/clients/${client.id}`}
                          canView={true}
                          canEdit={true}
                          canDelete={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={Users}
                      title="No clients assigned"
                      description="You don't have any LLC clients assigned to you yet."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function MyClientsPageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-5">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
