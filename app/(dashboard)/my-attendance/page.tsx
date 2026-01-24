"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, LogIn, LogOut, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequestLeaveDialog } from "@/components/attendance/RequestLeaveDialog"
import { Badge } from "@/components/ui/badge"
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
import { getAttendance, checkIn, checkOut } from "@/lib/actions/attendance"
import type { Attendance } from "@/lib/types/attendance"
import { useUser } from "@/lib/hooks/useUser"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { format } from "date-fns"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"

const statusConfig: Record<string, { label: string; variant: "neutral-outline" | "primary-outline" | "green-outline" | "red-outline" | "yellow-outline" }> = {
  present: { label: "Present", variant: "green-outline" },
  absent: { label: "Absent", variant: "red-outline" },
  late: { label: "Late", variant: "yellow-outline" },
  "half-day": { label: "Half Day", variant: "primary-outline" },
  leave: { label: "Leave", variant: "neutral-outline" },
}

export default function MyAttendancePage() {
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filters = useMemo(() => {
    const f: any = {}
    if (globalFilter.trim().length >= 2) {
      f.search = globalFilter.trim()
    }
    if (statusFilter !== "all") {
      f.status = [statusFilter]
    }
    return f
  }, [globalFilter, statusFilter])

  const { data: attendanceData, isLoading, error, refetch } = useQuery({
    queryKey: ["my-attendance", filters, user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      return await getAttendance(filters, user.id)
    },
    enabled: !userLoading && !!user?.id,
  })

  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success("Checked in successfully")
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] })
    },
    onError: (error: Error) => {
      toast.error("Failed to check in", { description: error.message })
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      toast.success("Checked out successfully")
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] })
    },
    onError: (error: Error) => {
      toast.error("Failed to check out", { description: error.message })
    },
  })

  const handleCheckIn = () => {
    if (!user?.id) return
    checkInMutation.mutate(user.id)
  }

  const handleCheckOut = () => {
    if (!user?.id) return
    checkOutMutation.mutate(user.id)
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-"
    return format(new Date(timeString), "h:mm a")
  }

  const formatWorkHours = (hours?: number) => {
    if (!hours) return "-"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const columns = useMemo<ColumnDef<Attendance>[]>(() => [
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {format(new Date(row.original.date), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "checkIn",
      header: "Clock In",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatTime(row.original.checkInTime)}
        </span>
      ),
    },
    {
      id: "checkOut",
      header: "Clock Out",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatTime(row.original.checkOutTime)}
        </span>
      ),
    },
    {
      id: "workHours",
      header: "Work Hours",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatWorkHours(row.original.workHours)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = statusConfig[row.original.status] || statusConfig.present
        return (
          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
            {status.label}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActionsMenu
          entityType="attendance"
          entityId={row.original.id}
          entityName={`Attendance ${format(new Date(row.original.date), "MMM dd")}`}
          detailUrl={`/my-attendance/${row.original.id}`}
        />
      ),
    },
  ], [])

  const table = useReactTable({
    data: attendanceData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (userLoading || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-[14px] border border-border bg-white overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load attendance"
        message="We couldn't load your attendance records. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">My Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily attendance and work hours</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Check In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckOut}
            disabled={checkOutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Check Out
          </Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-[38px] border border-border pl-10 pr-3 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-[38px] w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-10" onClick={() => setIsRequestLeaveOpen(true)}>
              Request Leave
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border bg-muted hover:bg-muted"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-3 text-sm font-medium text-muted-foreground tracking-[0.28px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.getCanSort() ? (
                            <button
                              className="flex items-center gap-1.5"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "asc" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                              {header.column.getIsSorted() === "desc" && (
                                <ArrowUpDown className="h-3 w-3 rotate-180" />
                              )}
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-border hover:bg-transparent"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="h-16 px-3"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <EmptyState
                      icon={Clock}
                      title="No attendance records"
                      description="Your attendance records will appear here once you check in."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex h-16 items-center justify-between border-t border-border px-5 py-4">
          <p className="text-sm font-medium text-foreground tracking-[0.28px]">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <div className="border-r border-border px-2 py-2">
                <span className="text-xs font-medium text-foreground tracking-[0.24px]">Per page</span>
              </div>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[60px] border-0 rounded-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 border border-border p-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                {(() => {
                  const pageIndex = table.getState().pagination.pageIndex
                  const pageCount = table.getPageCount()
                  const pages: (number | string)[] = []

                  if (pageCount <= 5) {
                    for (let i = 1; i <= pageCount; i++) {
                      pages.push(i)
                    }
                  } else {
                    pages.push(1)

                    if (pageIndex < 2) {
                      pages.push(2, 3)
                      pages.push("...")
                      pages.push(pageCount)
                    } else if (pageIndex > pageCount - 3) {
                      pages.push("...")
                      pages.push(pageCount - 2, pageCount - 1, pageCount)
                    } else {
                      pages.push("...")
                      pages.push(pageIndex, pageIndex + 1, pageIndex + 2)
                      pages.push("...")
                      pages.push(pageCount)
                    }
                  }

                  return pages.map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (typeof page === "number") {
                          table.setPageIndex(page - 1)
                        }
                      }}
                      disabled={typeof page === "string"}
                      className={`h-8 w-8 border-r border-border last:border-r-0 text-xs font-medium transition-colors ${
                        page === pageIndex + 1
                          ? "bg-primary text-white font-semibold"
                          : "text-foreground hover:bg-muted"
                      } ${typeof page === "string" ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {page}
                    </button>
                  ))
                })()}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 border border-border p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RequestLeaveDialog open={isRequestLeaveOpen} onOpenChange={setIsRequestLeaveOpen} />
    </div>
  )
}
