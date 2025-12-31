"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Plus,
  Search,
  Filter,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getLLCClients, getLLCClientStats, deleteLLCClient } from "@/lib/actions/llc-clients"
import {
  LLC_STATUS_CONFIG,
  LLC_HEALTH_CONFIG,
  LLC_PLAN_CONFIG,
  type LLCClient,
  type LLCClientStatus,
  type LLCClientHealth,
} from "@/lib/types/llc-clients"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { CreateLLCClientDialog } from "@/components/llc-clients/CreateLLCClientDialog"

export default function LLCClientsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [healthFilter, setHealthFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ["llc-clients", statusFilter, healthFilter],
    queryFn: () => getLLCClients({
      status: statusFilter !== "all" ? statusFilter as LLCClientStatus : undefined,
      health: healthFilter !== "all" ? healthFilter as LLCClientHealth : undefined,
    }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: stats } = useQuery({
    queryKey: ["llc-client-stats"],
    queryFn: () => getLLCClientStats(),
    staleTime: 5 * 60 * 1000,
  })

  const handleDeleteClient = async (clientId: string) => {
    await deleteLLCClient(clientId)
    await queryClient.invalidateQueries({ queryKey: ["llc-clients"] })
    await queryClient.invalidateQueries({ queryKey: ["llc-client-stats"] })
  }

  const filteredClients = clients?.filter((client) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      client.clientName.toLowerCase().includes(query) ||
      client.llcName?.toLowerCase().includes(query) ||
      client.clientCode.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.includes(query)
    )
  }) || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return <ClientsPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load clients"
        message="We couldn't load the clients. Please check your connection and try again."
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
              LLC Clients
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Manage all LLC formation clients across the organization
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Clients</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats?.total || 0}</p>
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
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats?.byStatus.delivered || 0}</p>
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
              {(stats?.total || 0) - (stats?.byStatus.delivered || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Revenue</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[80px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Code</span>
                </TableHead>
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
                  <span className="text-sm font-medium text-muted-foreground">Plan</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-b border-border">
                    <TableCell className="px-3">
                      <Link href={`/legal-nations/clients/${client.id}`} className="hover:underline">
                        <span className="text-xs font-mono text-muted-foreground">{client.clientCode}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      <Link href={`/legal-nations/clients/${client.id}`} className="hover:underline">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {client.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">{client.clientName}</span>
                            {client.country && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{client.country}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-foreground">{client.llcName || "—"}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex flex-col gap-0.5">
                        {client.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{client.phone}</span>
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
                      <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {LLC_PLAN_CONFIG[client.plan]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(client.amountReceived)}
                      </span>
                      {client.remainingPayment > 0 && (
                        <span className="text-xs text-yellow-600 ml-1">
                          (+{formatCurrency(client.remainingPayment)})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-3">
                      {client.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={client.assignedTo.avatar || getAvatarForUser(client.assignedTo.fullName)}
                              alt={client.assignedTo.fullName}
                            />
                            <AvatarFallback className="text-xs">
                              {client.assignedTo.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{client.assignedTo.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3">
                      <RowActionsMenu
                        entityType="client"
                        entityId={client.id}
                        entityName={client.clientName}
                        detailUrl={`/legal-nations/clients/${client.id}`}
                        canView={true}
                        canEdit={true}
                        canDelete={true}
                        onDelete={() => handleDeleteClient(client.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24">
                    <EmptyState
                      icon={Users}
                      title="No clients found"
                      description={searchQuery || statusFilter !== "all" || healthFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "Get started by adding your first LLC client."
                      }
                      action={!searchQuery && statusFilter === "all" && healthFilter === "all" ? {
                        label: "Add Client",
                        onClick: () => setIsCreateDialogOpen(true),
                      } : undefined}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateLLCClientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}

function ClientsPageSkeleton() {
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
