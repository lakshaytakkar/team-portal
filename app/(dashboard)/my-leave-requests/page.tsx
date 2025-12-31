"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { Search, Filter, ChevronLeft, ChevronRight, MoreVertical, Calendar as CalendarIcon, FileDown } from "lucide-react"
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
import { RequestLeaveDialog } from "@/components/attendance/RequestLeaveDialog"
import { DetailDialog } from "@/components/details/DetailDialog"
import { LeaveRequestDetail } from "@/components/leave-requests/LeaveRequestDetail"
import { ApproveLeaveRequestDialog } from "@/components/leave-requests/ApproveLeaveRequestDialog"
import { EditLeaveRequestDialog } from "@/components/leave-requests/EditLeaveRequestDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getLeaveRequests, cancelLeaveRequest } from "@/lib/actions/leave-requests"
import type { LeaveRequest } from "@/lib/types/leave-requests"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { useUser } from "@/lib/hooks/useUser"
import { canViewAllLeaveRequests } from "@/lib/utils/permissions"
import { exportToCSV, generateExportFilename, type ColumnDefinition } from "@/lib/utils/exports"

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

async function fetchLeaveRequests(viewMode: 'my' | 'all', activeTab: 'active' | 'past' | 'pending' | 'all', userId?: string) {
  const filter = activeTab === 'all' ? 'all' : activeTab
  return await getLeaveRequests(userId, viewMode, filter)
}

export default function MyLeaveRequestsPage() {
  const { user, isLoading: userLoading } = useUser()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my')
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'pending' | 'all'>('active')
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve')
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const canViewAll = user ? canViewAllLeaveRequests(user.role, user.department) : false
  const currentUserId = user?.id || ''

  // Set default view mode based on permissions
  React.useEffect(() => {
    if (canViewAll && viewMode === 'my') {
      // Allow user to toggle, but default could be 'all' if desired
      // For now, keep it as 'my' by default
    }
  }, [canViewAll, viewMode])

  const { data: leaveRequests, isLoading, error, refetch } = useQuery({
    queryKey: ["leave-requests", viewMode, activeTab, currentUserId],
    queryFn: async () => {
      console.log('My Leave Requests Query Executing...', { viewMode, activeTab, currentUserId })
      try {
        const result = await fetchLeaveRequests(viewMode, activeTab, currentUserId)
        console.log('My Leave Requests Query Result:', result?.length || 0, result)
        return result
      } catch (err) {
        console.error('Error fetching leave requests:', err)
        throw err
      }
    },
    enabled: !userLoading && !!user,
    retry: 1,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
  
  console.log('My Leave Requests Query State:', { 
    isLoading, 
    hasData: !!leaveRequests, 
    dataLength: leaveRequests?.length || 0,
    error: error?.message,
    userLoading,
    hasUser: !!user,
    currentUserId,
  })

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(() => {
    const baseColumns: ColumnDef<LeaveRequest>[] = []

    if (viewMode === 'all') {
      baseColumns.push({
        accessorKey: "user",
        header: "Employee",
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
      })
    }

    baseColumns.push(
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
              onEdit={() => {
                setSelectedRequest(request)
                setEditDialogOpen(true)
              }}
              onDelete={async () => {
                try {
                  await cancelLeaveRequest(request.id)
                  toast.success("Leave request cancelled")
                  queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
                  queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
                } catch (error) {
                  toast.error("Failed to cancel leave request")
                }
              }}
              customActions={[
                {
                  label: 'View Details',
                  onClick: () => {
                    setSelectedRequest(request)
                    setDetailDialogOpen(true)
                  },
                },
                ...(request.status === 'pending' && request.userId === currentUserId ? [
                  {
                    label: 'Cancel',
                    onClick: async () => {
                      try {
                        await cancelLeaveRequest(request.id)
                        toast.success("Leave request cancelled")
                        queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
                        queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
                      } catch (error) {
                        toast.error("Failed to cancel leave request")
                      }
                    },
                    variant: 'destructive' as const,
                  },
                ] : []),
                ...(request.status === 'pending' && canViewAll ? [
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
      }
    )

    return baseColumns
  }, [viewMode, currentUserId, canViewAll, queryClient])

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

  const stats = useMemo(() => {
    const requests = leaveRequests || []
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
    }
  }, [leaveRequests])

  // Prepare export data
  const exportData = useMemo(() => {
    if (!leaveRequests) return []
    return leaveRequests.map((request) => ({
      employee: viewMode === 'all' ? request.user?.name || 'Unknown' : user?.name || 'Unknown',
      email: viewMode === 'all' ? request.user?.email || '' : user?.email || '',
      type: typeLabels[request.type],
      startDate: format(new Date(request.startDate), 'MMM dd, yyyy'),
      endDate: format(new Date(request.endDate), 'MMM dd, yyyy'),
      days: request.days,
      status: statusConfig[request.status].label,
      reason: request.reason || '',
      approvedBy: request.approvedBy?.name || '',
      approvedAt: request.approvedAt ? format(new Date(request.approvedAt), 'MMM dd, yyyy') : '',
      createdAt: format(new Date(request.createdAt), 'MMM dd, yyyy'),
    }))
  }, [leaveRequests, viewMode, user])

  // Temporarily removed loading/error checks to debug hooks issue
  // if (userLoading || !user) {
  //   return (
  //     <div className="space-y-5">
  //       <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3">
  //         <Skeleton className="h-6 w-48" />
  //       </div>
  //       <Card className="border border-border rounded-[14px]">
  //         <div className="p-12">
  //           <Skeleton className="h-64 w-full" />
  //         </div>
  //       </Card>
  //     </div>
  //   )
  // }

  // if (isLoading) {
  //   return (
  //     <div className="space-y-5">
  //       <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3">
  //         <Skeleton className="h-6 w-48" />
  //       </div>
  //       <Card className="border border-border rounded-[14px]">
  //         <div className="p-12">
  //           <Skeleton className="h-64 w-full" />
  //         </div>
  //       </Card>
  //     </div>
  //   )
  // }

  // if (error) {
  //   const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  //   console.error('Leave requests query error:', error)
  //   return (
  //     <ErrorState
  //       title="Failed to load leave requests"
  //       message={`We couldn't load leave requests. ${errorMessage.includes('permission') || errorMessage.includes('policy') ? 'This might be due to missing RLS policies. Please ensure the database migration has been applied.' : 'Please check your connection and try again.'}`}
  //       onRetry={() => refetch()}
  //     />
  //   )
  // }

  const exportColumns: ColumnDefinition[] = [
    ...(viewMode === 'all' ? [
      { key: 'employee', label: 'Employee' },
      { key: 'email', label: 'Email' },
    ] : []),
    { key: 'type', label: 'Leave Type' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'days', label: 'Days' },
    { key: 'status', label: 'Status' },
    { key: 'reason', label: 'Reason' },
    { key: 'approvedBy', label: 'Approved By' },
    { key: 'approvedAt', label: 'Approved At' },
    { key: 'createdAt', label: 'Created At' },
  ]

  const handleExport = async () => {
    if (exportData.length === 0) {
      toast.error("No data to export")
      return
    }
    try {
      const filename = generateExportFilename('my-leave-requests', viewMode === 'all' ? 'all-leave-requests' : 'my-leave-requests')
      await exportToCSV(exportData, exportColumns, filename)
      toast.success("Leave requests exported successfully")
    } catch (error) {
      console.error('Error exporting leave requests:', error)
      toast.error("Failed to export leave requests")
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Leave Requests</h1>
            <p className="text-xs text-white/90 mt-0.5">View and manage your leave requests</p>
          </div>
        </div>
      </div>

      {/* Stats - Only show for 'all' view or manager/admin roles */}
      {(viewMode === 'all' || canViewAll) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border rounded-[14px] p-4">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-semibold mt-1">{stats.total}</p>
          </Card>
          <Card className="border border-border rounded-[14px] p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
          </Card>
          <Card className="border border-border rounded-[14px] p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-semibold mt-1">{stats.approved}</p>
          </Card>
        </div>
      )}

      {/* View Toggle */}
      {canViewAll && (
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'my' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('my')}
          >
            My Requests
          </Button>
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('all')}
          >
            All Requests
          </Button>
        </div>
      )}

      <Card className="border border-border rounded-[14px]">
        {/* Tabs */}
        <div className="border-b border-border px-5 pt-4 pb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="bg-muted p-0.5 rounded-xl">
              <TabsTrigger 
                value="active"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Active/Upcoming
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Past
              </TabsTrigger>
              {viewMode === 'all' && (
                <TabsTrigger 
                  value="pending"
                  className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
                >
                  Pending Approval
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="all"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                All
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
                placeholder="Search"
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
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-10 border border-border"
              onClick={handleExport}
              disabled={!leaveRequests || leaveRequests.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" size="sm" className="h-10" onClick={() => setIsRequestLeaveOpen(true)}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Table */}
        {!leaveRequests || leaveRequests.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={CalendarIcon}
              title="No leave requests"
              description={`No ${activeTab === 'all' ? '' : activeTab + ' '}leave requests found.`}
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
      <RequestLeaveDialog open={isRequestLeaveOpen} onOpenChange={setIsRequestLeaveOpen} />

      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title="Leave Request Details"
      >
        {selectedRequest && (
          <LeaveRequestDetail
            leaveRequest={selectedRequest}
            currentUserId={currentUserId}
            userRole={user?.role || 'executive'}
            userDepartment={user?.department}
            onEdit={() => {
              setDetailDialogOpen(false)
              setEditDialogOpen(true)
            }}
            onCancel={async () => {
              try {
                await cancelLeaveRequest(selectedRequest.id)
                toast.success("Leave request cancelled")
                setDetailDialogOpen(false)
                queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
                queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
              } catch (error) {
                toast.error("Failed to cancel leave request")
              }
            }}
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

      <EditLeaveRequestDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        leaveRequest={selectedRequest}
      />
    </div>
  )
}
