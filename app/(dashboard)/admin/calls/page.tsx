"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Phone, Search, Calendar, User, Building2, Mail, Play, Headphones } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { getCalls } from "@/lib/actions/calls"
import type { Call, CallStatus, CallOutcome } from "@/lib/types/call"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CallDetailModal } from "@/components/calls/CallDetailModal"
import { CALL_STATUS_CONFIG, CALL_OUTCOME_CONFIG } from "@/components/calls/callConfig"
import { Button } from "@/components/ui/button"

export default function AdminCallsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all")
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { data: calls, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-calls"],
    queryFn: () => getCalls(),
  })

  const statusCounts = useMemo(() => {
    const counts: Record<CallStatus, number> = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
    }
    calls?.forEach((call) => {
      counts[call.status] = (counts[call.status] || 0) + 1
    })
    return counts
  }, [calls])

  const filteredCalls = useMemo(() => {
    if (!calls) return []
    
    return calls.filter((call) => {
      // Search filter
      if (searchQuery.trim().length >= 2) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          call.contactName.toLowerCase().includes(query) ||
          call.company?.toLowerCase().includes(query) ||
          call.phone?.toLowerCase().includes(query) ||
          call.email?.toLowerCase().includes(query) ||
          call.notes?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && call.status !== statusFilter) {
        return false
      }

      // Outcome filter
      if (outcomeFilter !== "all" && call.outcome !== outcomeFilter) {
        return false
      }

      return true
    })
  }, [calls, searchQuery, statusFilter, outcomeFilter])

  if (isLoading) {
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
        title="Failed to load calls"
        message="We couldn't load calls. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Calls Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all calls across the organization
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <div className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Calls</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {calls?.length || 0}
            </p>
          </div>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <div className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Scheduled</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {statusCounts.scheduled}
            </p>
          </div>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <div className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Completed</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {statusCounts.completed}
            </p>
          </div>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <div className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Rescheduled</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {statusCounts.rescheduled}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="border border-border rounded-[14px]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by contact, company, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(CALL_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                {Object.entries(CALL_OUTCOME_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calls Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Date & Time</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Company</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Outcome</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Next Action</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Recording</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.length > 0 ? (
                filteredCalls.map((call) => {
                  const statusConfig = CALL_STATUS_CONFIG[call.status]
                  const outcomeConfig = call.outcome ? CALL_OUTCOME_CONFIG[call.outcome] : null
                  
                  return (
                    <TableRow 
                      key={call.id} 
                      className="border-b border-border cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedCall(call)
                        setIsDetailModalOpen(true)
                      }}
                    >
                      <TableCell className="px-3">
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(call.date), "MMM dd, yyyy")}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {call.time || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {call.contactName}
                          </span>
                          {(call.phone || call.email) && (
                            <div className="flex items-center gap-2 mt-1">
                              {call.phone && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {call.phone}
                                </span>
                              )}
                              {call.email && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {call.email}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        {call.company ? (
                          <span className="text-sm text-foreground flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {call.company}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge
                          variant="outline"
                          className={`${statusConfig.color} ${statusConfig.bgColor} border-0`}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        {outcomeConfig ? (
                          <Badge
                            variant="outline"
                            className={`${outcomeConfig.color} ${outcomeConfig.bgColor} border-0`}
                          >
                            {outcomeConfig.label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={call.assignedTo.avatar} />
                            <AvatarFallback className="text-xs">
                              {call.assignedTo.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{call.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        {call.nextAction ? (
                          <div>
                            <span className="text-sm text-foreground">{call.nextAction}</span>
                            {call.nextActionDate && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(call.nextActionDate), "MMM dd, yyyy")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3">
                        {call.recordingUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 h-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCall(call)
                              setIsDetailModalOpen(true)
                            }}
                          >
                            <Headphones className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-muted-foreground">Play</span>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                        <RowActionsMenu
                          entityType="call"
                          entityId={call.id}
                          entityName={call.contactName}
                          detailUrl={`/calls/${call.id}`}
                          canView={true}
                          canEdit={false}
                          canDelete={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24">
                    <EmptyState
                      icon={Phone}
                      title="No calls found"
                      description={
                        searchQuery || statusFilter !== "all" || outcomeFilter !== "all"
                          ? "Try adjusting your search or filters."
                          : "No calls have been logged yet."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Call Detail Modal */}
      <CallDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        call={selectedCall}
      />
    </div>
  )
}

