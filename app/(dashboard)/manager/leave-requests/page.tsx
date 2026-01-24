"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Search, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileDown, AlertCircle, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { DetailDialog } from "@/components/details/DetailDialog"
import { LeaveRequestDetail } from "@/components/leave-requests/LeaveRequestDetail"
import { ApproveLeaveRequestDialog } from "@/components/leave-requests/ApproveLeaveRequestDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getLeaveRequests } from "@/lib/actions/leave-requests"
import type { LeaveRequest } from "@/lib/types/leave-requests"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { useUser } from "@/lib/hooks/useUser"
import { createClient } from "@/lib/supabase/client"

const typeLabels = {
  vacation: "Vacation",
  sick: "Sick Leave",
  personal: "Personal",
  other: "Other",
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const },
  approved: { label: "Approved", variant: "default" as const },
  rejected: { label: "Rejected", variant: "destructive" as const },
  cancelled: { label: "Cancelled", variant: "secondary" as const },
}

async function fetchTeamMembers(managerId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('manager_id', managerId)
  
  if (error || !data) return []
  return data.map(p => p.id)
}

async function fetchTeamLeaveRequests(activeTab: 'pending' | 'team' | 'upcoming' | 'past', managerId: string) {
  // Get team member IDs
  const teamMemberIds = await fetchTeamMembers(managerId)
  
  if (teamMemberIds.length === 0) return []
  
  // Get all leave requests
  const filter = activeTab === 'team' ? 'all' : activeTab === 'pending' ? 'pending' : activeTab === 'upcoming' ? 'active' : 'past'
  const allRequests = await getLeaveRequests(undefined, 'all', filter)
  
  // Filter to only team members
  const teamRequests = allRequests.filter(r => teamMemberIds.includes(r.userId))
  
  // Apply additional filters
  if (activeTab === 'upcoming') {
    const today = new Date()
    return teamRequests.filter(r => {
      const startDate = new Date(r.startDate)
      return startDate > today && (r.status === 'pending' || r.status === 'approved')
    })
  }
  
  return teamRequests
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string | number
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function ManagerLeaveRequestsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<'pending' | 'team' | 'upcoming' | 'past'>('pending')
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve')
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const currentUserId = user?.id || ''

  const { data: leaveRequests, isLoading, error, refetch } = useQuery({
    queryKey: ["manager-leave-requests", activeTab, currentUserId],
    queryFn: () => fetchTeamLeaveRequests(activeTab, currentUserId),
    enabled: !!currentUserId,
  })

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(() => [
    {
      accessorKey: "user",
      header: "Team Member",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={request.user?.avatar} />
              <AvatarFallback>
                {request.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{request.user?.name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{request.user?.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm">{typeLabels[row.original.type]}</span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <span className="text-sm">{format(new Date(row.original.startDate), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <span className="text-sm">{format(new Date(row.original.endDate), 'MMM dd, yyyy')}</span>
      ),
    },
    {
      accessorKey: "days",
      header: "Days",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.days}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = statusConfig[row.original.status]
        return (
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original
        return (
          <RowActionsMenu
            entityType="leave-request"
            entityId={request.id}
            entityName={request.user?.name || 'Leave Request'}
            customActions={[
              {
                label: 'View Details',
                onClick: () => {
                  setSelectedRequest(request)
                  setDetailDialogOpen(true)
                },
              },
              ...(request.status === 'pending' ? [
                {
                  label: 'Approve',
                  onClick: () => {
                    setSelectedRequest(request)
                    setApproveAction('approve')
                    setApproveDialogOpen(true)
                  },
                },
                {
                  label: 'Reject',
                  onClick: () => {
                    setSelectedRequest(request)
                    setApproveAction('reject')
                    setApproveDialogOpen(true)
                  },
                  variant: 'destructive' as const,
                },
              ] : []),
            ]}
          />
        )
      },
    },
  ], [refetch])

  const table = useReactTable({
    data: leaveRequests || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter: searchQuery,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Calculate stats
  const stats = useMemo(() => {
    const requests = leaveRequests || []
    const today = new Date()
    
    return {
      pendingApprovals: requests.filter(r => r.status === 'pending').length,
      teamOnLeave: requests.filter(r => {
        if (r.status !== 'approved') return false
        const start = new Date(r.startDate)
        const end = new Date(r.endDate)
        return start <= today && end >= today
      }).length,
      upcomingLeaves: requests.filter(r => {
        const startDate = new Date(r.startDate)
        return startDate > today && (r.status === 'pending' || r.status === 'approved')
      }).length,
    }
  }, [leaveRequests])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <Card className="border border-border rounded-[14px]">
          <div className="p-12">
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load leave requests"
        message="We couldn't load team leave requests. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Team Leave Requests</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage and approve leave requests from your team members</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={AlertCircle} />
        <StatCard title="Team On Leave" value={stats.teamOnLeave} icon={Clock} />
        <StatCard title="Upcoming Leaves" value={stats.upcomingLeaves} icon={Calendar} />
      </div>

      <Card className="border border-border rounded-[14px]">
        {/* Tabs */}
        <div className="border-b border-border px-5 pt-4 pb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="bg-muted p-0.5 rounded-xl">
              <TabsTrigger 
                value="pending"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Pending Approval
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Team Requests
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by team member name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[38px] border border-border pl-10 pr-3 text-sm"
              />
            </div>
            <Button variant="secondary" size="sm" className="h-[38px] border border-border gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter</span>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="h-10 border border-border">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        {!leaveRequests || leaveRequests.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={CalendarIcon}
              title="No leave requests"
              description={`No ${activeTab === 'team' ? 'team ' : activeTab + ' '}leave requests found.`}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b border-border bg-muted hover:bg-muted">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="h-10 px-3 text-sm font-medium text-muted-foreground">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-b border-border hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <div className="text-sm text-muted-foreground">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{" "}
                {table.getFilteredRowModel().rows.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Dialogs */}
      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title="Leave Request Details"
      >
        {selectedRequest && (
          <LeaveRequestDetail
            leaveRequest={selectedRequest}
            currentUserId={currentUserId}
            userRole={user?.role || 'manager'}
            userDepartment={user?.department}
            onApprove={() => {
              setDetailDialogOpen(false)
              setApproveAction('approve')
              setApproveDialogOpen(true)
            }}
            onReject={() => {
              setDetailDialogOpen(false)
              setApproveAction('reject')
              setApproveDialogOpen(true)
            }}
          />
        )}
      </DetailDialog>

      <ApproveLeaveRequestDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        leaveRequest={selectedRequest}
        action={approveAction}
      />
    </div>
  )
}

