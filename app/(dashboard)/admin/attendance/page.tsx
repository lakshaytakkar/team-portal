"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Clock } from "lucide-react"
import type { Attendance } from "@/lib/types/attendance"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { getAttendance, deleteAttendance } from "@/lib/actions/attendance"
import { useUser } from "@/lib/hooks/useUser"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

const statusConfig: Record<string, { label: string; variant: "neutral-outline" | "primary-outline" | "green-outline" | "red-outline" | "yellow-outline" }> = {
  present: { label: "Present", variant: "green-outline" },
  absent: { label: "Absent", variant: "red-outline" },
  late: { label: "Late", variant: "yellow-outline" },
  "half-day": { label: "Half Day", variant: "primary-outline" },
  leave: { label: "Leave", variant: "neutral-outline" },
}

export default function AdminAttendancePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const filters = useMemo(() => {
    const f: any = {}
    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }
    if (statusFilter !== "all") {
      f.status = [statusFilter]
    }
    if (dateFrom) {
      f.dateFrom = dateFrom
    }
    if (dateTo) {
      f.dateTo = dateTo
    }
    return f
  }, [searchQuery, statusFilter, dateFrom, dateTo])

  const { data: attendanceData, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-attendance", filters],
    queryFn: async () => await getAttendance(filters),
    enabled: !userLoading && !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attendance"] })
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] })
      toast.success("Attendance record deleted successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete attendance", {
        description: error.message,
      })
    },
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      await deleteMutation.mutateAsync(id)
    }
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

  if (userLoading || isLoading) {
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
        title="Failed to load attendance"
        message="We couldn't load attendance records. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Attendance Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all employee attendance records
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Attendance Records</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
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
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="h-[38px] w-[150px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="h-[38px] w-[150px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {attendanceData && attendanceData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={getAvatarForUser(attendance.user?.name || "user")}
                          />
                          <AvatarFallback>
                            {attendance.user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {attendance.user?.name || "Unknown"}
                          </p>
                          {attendance.user?.email && (
                            <p className="text-xs text-muted-foreground">
                              {attendance.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {format(new Date(attendance.date), "MMM dd, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {formatTime(attendance.checkInTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {formatTime(attendance.checkOutTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {formatWorkHours(attendance.workHours)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const status = statusConfig[attendance.status] || statusConfig.present
                        return (
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        entityType="attendance"
                        entityId={attendance.id}
                        entityName={`${attendance.user?.name || "Employee"} - ${format(new Date(attendance.date), "MMM dd")}`}
                        canView={true}
                        canEdit={true}
                        canDelete={true}
                        detailUrl={`/admin/attendance/${attendance.id}`}
                        onDelete={() => handleDelete(attendance.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12">
              <EmptyState
                icon={Clock}
                title="No attendance records found"
                description={
                  searchQuery || statusFilter !== "all" || dateFrom || dateTo
                    ? "Try adjusting your search or filters."
                    : "No attendance records have been created yet."
                }
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

