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
import { Search, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileDown, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
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
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from "@/lib/actions/leave-requests"
import type { LeaveRequest } from "@/lib/types/leave-requests"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { useUser } from "@/lib/hooks/useUser"
import { exportToCSV, generateExportFilename, type ColumnDefinition } from "@/lib/utils/exports"
import { getDepartments } from "@/lib/actions/hr"
import { bulkApproveLeaveRequests, bulkRejectLeaveRequests } from "@/lib/actions/leave-requests"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

async function fetchLeaveRequests(
  activeTab: 'pending' | 'all' | 'approved' | 'rejected',
  departmentFilter?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const filter = activeTab === 'all' ? 'all' : activeTab === 'pending' ? 'pending' : activeTab === 'approved' ? 'all' : 'all'
  const requests = await getLeaveRequests(undefined, 'all', filter, departmentFilter)
  
  let filtered = requests
  
  // Filter by status if needed
  if (activeTab === 'approved') {
    filtered = filtered.filter(r => r.status === 'approved')
  } else if (activeTab === 'rejected') {
    filtered = filtered.filter(r => r.status === 'rejected')
  }
  
  // Apply date range filter
  if (dateFrom || dateTo) {
    filtered = filtered.filter(r => {
      const startDate = new Date(r.startDate)
      if (dateFrom && startDate < new Date(dateFrom)) return false
      if (dateTo && startDate > new Date(dateTo)) return false
      return true
    })
  }
  
  return filtered
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

export default function HRLeaveRequestsPage() {
  const { user, isLoading: userLoading } = useUser()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending')
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve')
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkOperating, setIsBulkOperating] = useState(false)

  const currentUserId = user?.id || ''

  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  const { data: leaveRequests, isLoading, error, refetch } = useQuery({
    queryKey: ["hr-leave-requests", activeTab, departmentFilter, dateFrom, dateTo],
    queryFn: async () => {
      console.log('HR Leave Requests Query Executing...', { activeTab, departmentFilter, dateFrom, dateTo })
      try {
        const result = await fetchLeaveRequests(
          activeTab,
          departmentFilter === 'all' ? undefined : departmentFilter,
          dateFrom || undefined,
          dateTo || undefined
        )
        console.log('HR Leave Requests Query Result:', result?.length || 0, result)
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
  
  console.log('HR Leave Requests Query State:', { 
    isLoading, 
    hasData: !!leaveRequests, 
    dataLength: leaveRequests?.length || 0,
    error: error?.message,
    userLoading,
    hasUser: !!user,
  })

  const pendingCount = useMemo(() => {
    return leaveRequests?.filter(r => r.status === 'pending').length || 0
  }, [leaveRequests])

  const toggleSelectAll = () => {
    if (!leaveRequests) return
    
    const pendingRequests = leaveRequests.filter(r => r.status === 'pending')
    if (selectedIds.size === pendingRequests.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pendingRequests.map(r => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(() => {
    const cols: ColumnDef<LeaveRequest>[] = []
    
    // Add checkbox column for bulk operations (superadmin only)
    if (user?.role === 'superadmin') {
      cols.push({
        id: "select",
        header: () => (
          <Checkbox
            checked={
              pendingCount > 0 && selectedIds.size === pendingCount
            }
            onCheckedChange={toggleSelectAll}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => {
          const request = row.original
          const isPending = request.status === 'pending'
          return (
            <Checkbox
              checked={selectedIds.has(request.id)}
              onCheckedChange={() => isPending && toggleSelect(request.id)}
              disabled={!isPending}
              aria-label={`Select ${request.user?.name || 'request'}`}
            />
          )
        },
        enableSorting: false,
        enableHiding: false,
      })
    }
    
    cols.push({
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
    })
    
    return cols
  }, [user?.role, selectedIds, pendingCount, leaveRequests])

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

  // Calculate stats - use all requests regardless of filters
  const { data: allRequestsForStats } = useQuery({
    queryKey: ["hr-leave-requests-stats", 'all'],
    queryFn: () => fetchLeaveRequests('all'),
    enabled: !userLoading && !!user,
  })

  const stats = useMemo(() => {
    const requests = allRequestsForStats || []
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approvedThisMonth: requests.filter(r => 
        r.status === 'approved' && 
        r.approvedAt && 
        new Date(r.approvedAt) >= startOfMonth
      ).length,
      rejectedThisMonth: requests.filter(r => 
        r.status === 'rejected' && 
        r.approvedAt && 
        new Date(r.approvedAt) >= startOfMonth
      ).length,
      onLeaveNow: requests.filter(r => {
        if (r.status !== 'approved') return false
        const start = new Date(r.startDate)
        const end = new Date(r.endDate)
        return start <= today && end >= today
      }).length,
    }
  }, [allRequestsForStats])

  // Prepare export data
  const exportData = useMemo(() => {
    if (!leaveRequests) return []
    return leaveRequests.map((request) => ({
      employee: request.user?.name || 'Unknown',
      email: request.user?.email || '',
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
  }, [leaveRequests])

  const exportColumns: ColumnDefinition[] = [
    { key: 'employee', label: 'Employee' },
    { key: 'email', label: 'Email' },
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

  // Temporarily removed userLoading check to debug hooks issue
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

  const handleExport = async () => {
    if (exportData.length === 0) {
      toast.error("No data to export")
      return
    }
    try {
      const filename = generateExportFilename('hr-leave-requests', 'leave-requests')
      await exportToCSV(exportData, exportColumns, filename)
      toast.success("Leave requests exported successfully")
    } catch (error) {
      console.error('Error exporting leave requests:', error)
      toast.error("Failed to export leave requests")
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select leave requests to approve")
      return
    }

    setIsBulkOperating(true)
    try {
      const idsArray = Array.from(selectedIds)
      const result = await bulkApproveLeaveRequests(idsArray)
      
      if (result.success > 0) {
        toast.success(`Successfully approved ${result.success} leave request${result.success !== 1 ? 's' : ''}`)
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to approve ${result.failed} leave request${result.failed !== 1 ? 's' : ''}`)
        if (result.errors.length > 0) {
          console.error('Bulk approve errors:', result.errors)
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Error bulk approving leave requests:', error)
      toast.error("Failed to approve leave requests")
    } finally {
      setIsBulkOperating(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select leave requests to reject")
      return
    }

    setIsBulkOperating(true)
    try {
      const idsArray = Array.from(selectedIds)
      const result = await bulkRejectLeaveRequests(idsArray)
      
      if (result.success > 0) {
        toast.success(`Successfully rejected ${result.success} leave request${result.success !== 1 ? 's' : ''}`)
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to reject ${result.failed} leave request${result.failed !== 1 ? 's' : ''}`)
        if (result.errors.length > 0) {
          console.error('Bulk reject errors:', result.errors)
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Error bulk rejecting leave requests:', error)
      toast.error("Failed to reject leave requests")
    } finally {
      setIsBulkOperating(false)
    }
  }

  // Temporarily removed loading/error checks to debug hooks issue
  // if (isLoading) {
  //   return (
  //     <div className="space-y-5">
  //       <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3">
  //         <Skeleton className="h-6 w-48" />
  //       </div>
  //       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  //         {[1, 2, 3, 4].map((i) => (
  //           <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
  //             <Skeleton className="h-4 w-24 mb-3" />
  //             <Skeleton className="h-8 w-32" />
  //           </Card>
  //         ))}
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Leave Requests</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage all employee leave requests across the organization</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Pending Approval" value={stats.pending} icon={AlertCircle} />
        <StatCard title="Approved This Month" value={stats.approvedThisMonth} icon={CheckCircle} />
        <StatCard title="Rejected This Month" value={stats.rejectedThisMonth} icon={XCircle} />
        <StatCard title="On Leave Now" value={stats.onLeaveNow} icon={Clock} />
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
                value="all"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                All Requests
              </TabsTrigger>
              <TabsTrigger 
                value="approved"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger 
                value="rejected"
                className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by employee name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[38px] border border-border pl-10 pr-3 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-[38px] w-[180px] border border-border">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-[38px] w-[150px] border border-border text-sm"
              />
              <Input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-[38px] w-[150px] border border-border text-sm"
              />
              {(dateFrom || dateTo || departmentFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[38px]"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setDepartmentFilter('all')
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'superadmin' && selectedIds.size > 0 && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="h-10"
                  onClick={handleBulkApprove}
                  disabled={isBulkOperating}
                >
                  Approve ({selectedIds.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-10"
                  onClick={handleBulkReject}
                  disabled={isBulkOperating}
                >
                  Reject ({selectedIds.size})
                </Button>
              </>
            )}
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
      <DetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title="Leave Request Details"
      >
        {selectedRequest && (
          <LeaveRequestDetail
            leaveRequest={selectedRequest}
            currentUserId={currentUserId}
            userRole={user?.role || 'superadmin'}
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
        onOpenChange={(open) => {
          setApproveDialogOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["hr-leave-requests"] })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
          }
        }}
        leaveRequest={selectedRequest}
        action={approveAction}
      />
    </div>
  )
}

