"use client"

import * as React from "react"
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
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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

// Types
type AttendanceRecord = {
  id: string
  no: number
  employeeName: string
  employeeAvatar?: string
  department: string
  clockIn: string
  clockOut: string
  workHours: string
  status: string
}

// Sample data
const defaultData: AttendanceRecord[] = [
  {
    id: "1",
    no: 1,
    employeeName: "John Doe",
    employeeAvatar: undefined,
    department: "Design",
    clockIn: "9.00 AM",
    clockOut: "4.30 PM",
    workHours: "7h 30m",
    status: "Onsite - Fulltime",
  },
  {
    id: "2",
    no: 2,
    employeeName: "Jane Smith",
    employeeAvatar: undefined,
    department: "Engineering",
    clockIn: "8.45 AM",
    clockOut: "5.15 PM",
    workHours: "8h 30m",
    status: "Hybrid - 3 days onsite",
  },
  {
    id: "3",
    no: 3,
    employeeName: "Carlos Garcia",
    employeeAvatar: undefined,
    department: "Marketing",
    clockIn: "9.30 AM",
    clockOut: "6.00 PM",
    workHours: "8h 30m",
    status: "Remote - Fulltime",
  },
  {
    id: "4",
    no: 4,
    employeeName: "Aisha Khan",
    employeeAvatar: undefined,
    department: "Product",
    clockIn: "10.00 AM",
    clockOut: "2.00 PM",
    workHours: "4h 0m",
    status: "Onsite - Part-time",
  },
  {
    id: "5",
    no: 5,
    employeeName: "Wei Chen",
    employeeAvatar: undefined,
    department: "Data Science",
    clockIn: "9.05 AM",
    clockOut: "5.35 PM",
    workHours: "8h 30m",
    status: "Hybrid - Flexible",
  },
  {
    id: "6",
    no: 6,
    employeeName: "Fatima Al-Sayed",
    employeeAvatar: undefined,
    department: "Human Resources",
    clockIn: "8.30 AM",
    clockOut: "4.30 PM",
    workHours: "8h 0m",
    status: "Onsite - Fulltime",
  },
  {
    id: "7",
    no: 7,
    employeeName: "Liam O'Connell",
    employeeAvatar: undefined,
    department: "Engineering",
    clockIn: "11.00 AM",
    clockOut: "7.00 PM",
    workHours: "8h 0m",
    status: "Remote - Contractor",
  },
  {
    id: "8",
    no: 8,
    employeeName: "Sofia Petrova",
    employeeAvatar: undefined,
    department: "Sales",
    clockIn: "9.15 AM",
    clockOut: "5.45 PM",
    workHours: "8h 30m",
    status: "Onsite - Fulltime",
  },
  {
    id: "9",
    no: 9,
    employeeName: "Kenji Tanaka",
    employeeAvatar: undefined,
    department: "Design",
    clockIn: "9.45 AM",
    clockOut: "1.45 PM",
    workHours: "4h 0m",
    status: "Onsite - Intern",
  },
  {
    id: "10",
    no: 10,
    employeeName: "Chloe Dubois",
    employeeAvatar: undefined,
    department: "Customer Support",
    clockIn: "12.00 PM",
    clockOut: "8.00 PM",
    workHours: "8h 0m",
    status: "Remote - Shift Work",
  },
]

// Table columns definition
const columns: ColumnDef<AttendanceRecord>[] = [
  {
    id: "select",
    size: 72,
    header: ({ table }) => (
      <div className="flex items-center gap-2.5">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          className="h-4 w-4 rounded border-[#dfe1e7] data-[state=checked]:bg-[#897efa] data-[state=checked]:border-[#897efa]"
        />
        <span className="text-sm font-medium text-[#666d80] tracking-[0.28px]">No</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          className="h-4 w-4 rounded border-[#dfe1e7] data-[state=checked]:bg-[#897efa] data-[state=checked]:border-[#897efa]"
        />
        <span className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">{row.original.no}</span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "employeeName",
    size: 184,
    header: "Employee Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8">
          <AvatarImage src={getAvatarForUser(row.original.employeeName || "user")} />
          <AvatarFallback className="bg-[#dad7fd] text-[#897efa]">
            {row.original.employeeName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">{row.original.employeeName}</span>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="inline-flex items-center gap-1 rounded-full border border-[#339d88] bg-white px-2 py-0.5 h-5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#339d88]" />
        <span className="text-xs font-medium leading-[18px] text-[#339d88] tracking-[0.12px]">
          {row.original.department}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "clockIn",
    header: "Clock In",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">{row.original.clockIn}</span>
    ),
  },
  {
    accessorKey: "clockOut",
    header: "Clock Out",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">{row.original.clockOut}</span>
    ),
  },
  {
    accessorKey: "workHours",
    header: "Work Hours",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">{row.original.workHours}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">{row.original.status}</span>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <button className="flex items-center justify-center w-4 h-4">
        <MoreVertical className="h-4 w-4 text-[#666d80]" />
      </button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]

export default function AttendancePage() {
  const [data] = React.useState<AttendanceRecord[]>(defaultData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
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
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div>
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#0d0d12] leading-[1.35]">Attendance</h1>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="h-10 border border-[#dfe1e7]">
              Download
            </Button>
            <Button variant="primary" size="sm" className="h-10 border border-[#897efa]">
              Request for Leave
            </Button>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#dfe1e7] bg-white overflow-hidden">
          {/* Table Header */}
          <div className="flex h-16 items-center justify-between border-b border-[#dfe1e7] px-5 py-2 bg-white">
            <h2 className="text-base font-semibold text-[#0d0d12] tracking-[0.32px]">Attendance Table</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666d80]" />
                <Input
                  placeholder="Search"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-[38px] border border-[#dfe1e7] pl-10 pr-3 text-sm"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="h-[38px] border border-[#dfe1e7] gap-2"
              >
                <Filter className="h-4 w-4 text-[#666d80]" />
                <span className="text-sm font-medium text-[#666d80]">Filter</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-[38px] border border-[#dfe1e7] gap-2"
              >
                <ArrowUpDown className="h-5 w-5 text-[#666d80]" />
                <span className="text-sm font-medium text-[#666d80]">Sort by</span>
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
                      className="border-b border-[#dfe1e7] bg-[#f6f8fa] hover:bg-[#f6f8fa]"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="h-10 px-3 text-sm font-medium text-[#666d80] tracking-[0.28px]"
                          style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
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
                      className="border-b border-[#dfe1e7] hover:bg-transparent"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="h-16 px-3"
                          style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex h-16 items-center justify-between border-t border-[#dfe1e7] px-5 py-4">
            <p className="text-sm font-medium text-[#0d0d12] tracking-[0.28px]">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} results
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#dfe1e7] rounded-lg overflow-hidden">
                <div className="border-r border-[#dfe1e7] px-2 py-2">
                  <span className="text-xs font-medium text-[#0d0d12] tracking-[0.24px]">Per page</span>
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
                  className="h-8 w-8 border border-[#dfe1e7] p-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center border border-[#dfe1e7] rounded-lg overflow-hidden">
                  {(() => {
                    const pageIndex = table.getState().pagination.pageIndex
                    const pageCount = table.getPageCount()
                    const pages: (number | string)[] = []

                    if (pageCount <= 5) {
                      // Show all pages if 5 or fewer
                      for (let i = 1; i <= pageCount; i++) {
                        pages.push(i)
                      }
                    } else {
                      // Always show first page
                      pages.push(1)

                      if (pageIndex < 2) {
                        // Show 1, 2, 3, ..., last
                        pages.push(2, 3)
                        pages.push("...")
                        pages.push(pageCount)
                      } else if (pageIndex > pageCount - 3) {
                        // Show 1, ..., last-2, last-1, last
                        pages.push("...")
                        pages.push(pageCount - 2, pageCount - 1, pageCount)
                      } else {
                        // Show 1, ..., current-1, current, current+1, ..., last
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
                        className={`h-8 w-8 border-r border-[#dfe1e7] last:border-r-0 text-xs font-medium transition-colors ${
                          page === pageIndex + 1
                            ? "bg-[#897efa] text-white font-semibold"
                            : "text-[#0d0d12] hover:bg-[#f6f8fa]"
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
                  className="h-8 w-8 border border-[#dfe1e7] p-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

