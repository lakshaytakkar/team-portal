"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Search,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getLLCClients, getLLCBanks, updateLLCClientBankStatus } from "@/lib/actions/llc-clients"
import {
  LLC_BANK_STATUS_CONFIG,
  LLC_STATUS_CONFIG,
  type LLCBankStatus,
} from "@/lib/types/llc-clients"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { toast } from "@/components/ui/sonner"

export default function LLCBankApprovalsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [bankFilter, setBankFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ["llc-clients-banking"],
    queryFn: () => getLLCClients({}),
    staleTime: 5 * 60 * 1000,
    // Only include clients that are at the banking stage or beyond
    select: (data) => data.filter((c) =>
      c.status === "under_banking" ||
      c.status === "under_payment_gateway" ||
      c.status === "delivered" ||
      c.bankStatus !== "not_started"
    ),
  })

  const { data: banks = [] } = useQuery({
    queryKey: ["llc-banks"],
    queryFn: getLLCBanks,
    staleTime: 30 * 60 * 1000,
  })

  // Filter clients
  const filteredClients = clients.filter((client) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        client.clientName.toLowerCase().includes(query) ||
        client.llcName?.toLowerCase().includes(query) ||
        client.clientCode.toLowerCase().includes(query) ||
        client.bankApproved?.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    if (bankFilter !== "all" && !client.bankApproved?.toLowerCase().includes(bankFilter.toLowerCase())) {
      return false
    }

    if (statusFilter !== "all" && client.bankStatus !== statusFilter) {
      return false
    }

    return true
  })

  // Stats
  const stats = {
    total: clients.length,
    approved: clients.filter((c) => c.bankStatus === "approved").length,
    pending: clients.filter((c) =>
      c.bankStatus === "application_submitted" ||
      c.bankStatus === "under_review" ||
      c.bankStatus === "documents_pending"
    ).length,
    notStarted: clients.filter((c) => c.bankStatus === "not_started").length,
    rejected: clients.filter((c) => c.bankStatus === "rejected").length,
  }

  const handleBankStatusChange = async (clientId: string, newStatus: LLCBankStatus) => {
    try {
      await updateLLCClientBankStatus(clientId, newStatus)
      toast.success("Bank status updated")
      queryClient.invalidateQueries({ queryKey: ["llc-clients-banking"] })
    } catch (error) {
      toast.error("Failed to update bank status")
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (isLoading) {
    return <BankApprovalsPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load bank approvals"
        message="We couldn't load the bank approvals data. Please try again."
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
              Bank Approvals
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Track US bank account applications for LLC clients
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Approved</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats.approved}</p>
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
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-gray-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Not Started</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats.notStarted}</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border rounded-[14px]",
          stats.rejected > 0 ? "border-red-300 bg-red-50" : "border-border"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn(
                "rounded-full w-9 h-9 flex items-center justify-center shrink-0",
                stats.rejected > 0 ? "bg-red-200" : "bg-gray-100"
              )}>
                <XCircle className={cn(
                  "h-4 w-4",
                  stats.rejected > 0 ? "text-red-600" : "text-gray-600"
                )} />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Rejected</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white rounded-t-[14px]">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients or banks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger className="w-40 h-[38px]">
                <SelectValue placeholder="All Banks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Banks</SelectItem>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-[38px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(LLC_BANK_STATUS_CONFIG).map(([key, config]) => (
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
                  <span className="text-sm font-medium text-muted-foreground">Bank</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Bank Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Application Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Approval Date</span>
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
                      <span className="text-sm font-medium text-foreground">
                        {client.bankApproved || "Not selected"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <Select
                        value={client.bankStatus}
                        onValueChange={(value) => handleBankStatusChange(client.id, value as LLCBankStatus)}
                      >
                        <SelectTrigger className="w-36 h-8">
                          <Badge
                            className={cn(
                              "h-5 px-2 py-0.5 rounded-md text-xs",
                              LLC_BANK_STATUS_CONFIG[client.bankStatus]?.bgColor,
                              LLC_BANK_STATUS_CONFIG[client.bankStatus]?.color
                            )}
                          >
                            {LLC_BANK_STATUS_CONFIG[client.bankStatus]?.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LLC_BANK_STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <span className={config.color}>{config.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(client.bankApplicationDate)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(client.bankApprovalDate)}
                      </span>
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
                              {client.assignedTo.fullName.charAt(0)}
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
                        canDelete={false}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
                    <EmptyState
                      icon={Building2}
                      title="No bank applications found"
                      description={searchQuery || bankFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "Bank applications will appear here when clients reach the banking stage."
                      }
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

function BankApprovalsPageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
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
