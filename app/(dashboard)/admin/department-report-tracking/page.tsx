"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock, FileDown } from "lucide-react"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import {
  getDepartmentReportStats,
  checkLateSubmissions,
} from "@/lib/actions/department-reports"
import { getDepartments } from "@/lib/actions/hr"
import { useUser } from "@/lib/hooks/useUser"
import { format } from "date-fns"

export default function DepartmentReportTrackingPage() {
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("this-month")

  const filters = useMemo(() => {
    const f: any = {}
    if (departmentFilter !== "all") {
      f.departmentId = [departmentFilter]
    }
    if (dateRange === "today") {
      f.date = { type: "today" }
    } else if (dateRange === "this-week") {
      f.date = { type: "this-week" }
    } else if (dateRange === "this-month") {
      f.date = { type: "this-month" }
    }
    return f
  }, [departmentFilter, dateRange])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["department-report-stats", filters],
    queryFn: () => getDepartmentReportStats(filters),
    enabled: !userLoading && !!user,
  })

  const { data: lateSubmissions, isLoading: lateLoading } = useQuery({
    queryKey: ["late-submissions"],
    queryFn: checkLateSubmissions,
    enabled: !userLoading && !!user,
  })

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    enabled: !userLoading && !!user,
  })

  const filteredLateSubmissions = useMemo(() => {
    if (!lateSubmissions) return []
    if (!searchQuery.trim()) return lateSubmissions

    const query = searchQuery.toLowerCase()
    return lateSubmissions.filter(
      (submission) =>
        submission.departmentName.toLowerCase().includes(query) ||
        submission.reportDate.includes(query)
    )
  }, [lateSubmissions, searchQuery])

  if (userLoading || statsLoading || lateLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Department Report Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor submission compliance and track late or missing reports
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
                <p className="text-2xl font-semibold">{stats?.total || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On-Time</p>
                <p className="text-2xl font-semibold text-green-600">{stats?.onTime || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Late</p>
                <p className="text-2xl font-semibold text-destructive">{stats?.late || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Compliance Rate</p>
                <p className="text-2xl font-semibold">{stats?.complianceRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search late submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Department" />
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
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Department Stats */}
      {stats && Object.keys(stats.byDepartment).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>By Department</CardTitle>
            <CardDescription>
              Submission statistics broken down by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead>Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(stats.byDepartment).map(([deptId, deptStats]) => {
                  const department = departments?.find(d => d.id === deptId)
                  const compliance = deptStats.submitted > 0
                    ? Math.round((deptStats.submitted / deptStats.total) * 100)
                    : 0
                  return (
                    <TableRow key={deptId}>
                      <TableCell className="font-medium">
                        {department?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{deptStats.total}</TableCell>
                      <TableCell>{deptStats.submitted}</TableCell>
                      <TableCell>
                        <Badge variant={deptStats.late > 0 ? "destructive" : "secondary"}>
                          {deptStats.late}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={deptStats.missing > 0 ? "destructive" : "secondary"}>
                          {deptStats.missing}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${compliance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {compliance}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Late Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Late & Missing Submissions</CardTitle>
          <CardDescription>
            Reports that are overdue or missing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLateSubmissions && filteredLateSubmissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Expected Deadline</TableHead>
                  <TableHead>Days Late</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLateSubmissions.map((submission) => (
                  <TableRow key={`${submission.departmentId}-${submission.reportDate}`}>
                    <TableCell className="font-medium">
                      {submission.departmentName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(submission.reportDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(submission.expectedDeadline), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {submission.daysLate} day{submission.daysLate !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.status === 'missing' ? "destructive" : "secondary"}>
                        {submission.status === 'missing' ? 'Missing' : 'Late'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No late submissions"
              description="All reports are submitted on time."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}




