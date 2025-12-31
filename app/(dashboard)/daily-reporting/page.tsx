"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, FileText, Search, ArrowUpDown, CheckCircle2, Clock, FileDown, ChevronDown } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { DailyReport, DailyReportStatus, DailyReportFilters, DailyReportSort } from "@/lib/types/daily-reports"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import {
  getDailyReports,
  getDailyReportStats,
  deleteDailyReport,
  getDailyReportCategories,
} from "@/lib/actions/daily-reports"
import {
  getDepartmentReports,
  getDepartmentReportStats,
  deleteDepartmentReport,
  getDepartmentReportAssignments,
} from "@/lib/actions/department-reports"
import type {
  DepartmentReport,
  DepartmentReportStatus,
  DepartmentReportFilters,
  DepartmentReportSort,
} from "@/lib/types/department-reports"
import { useUserContext } from "@/lib/providers/UserContextProvider"
import { format } from "date-fns"
import { exportToCSV, generateExportFilename, type ColumnDefinition } from "@/lib/utils/exports"
import { getDepartments } from "@/lib/actions/hr"
import { CreateDepartmentReportDialog } from "@/components/daily-reports/CreateDepartmentReportDialog"

// Status badge variants
const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  submitted: { label: "Submitted", variant: "default" as const },
}

function StatCard({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl p-[18px] bg-white transition-all",
        isActive
          ? "border-primary shadow-md bg-primary/5 cursor-pointer"
          : "border-border hover:border-primary/50 hover:shadow-sm cursor-pointer"
      )}
      onClick={onClick}
    >
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div
          className={cn(
            "rounded-lg w-9 h-9 flex items-center justify-center transition-colors",
            isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

type ReportFilter = "all" | "today" | "this-week" | "this-month" | "drafts" | "submitted"

export default function DailyReportingPage() {
  const router = useRouter()
  const { user, isLoading: userLoading } = useUserContext()
  const queryClient = useQueryClient()

  const [activeFilter, setActiveFilter] = useState<ReportFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DailyReportStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [employeeFilter, setEmployeeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<DailyReportSort['field']>("date")
  const [sortDirection, setSortDirection] = useState<DailyReportSort['direction']>("desc")
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<string>("individual")

  // Redirect non-superadmins to my-daily-reporting
  useEffect(() => {
    if (!userLoading && user && !user.isSuperadmin) {
      router.push('/my-daily-reporting')
    }
  }, [user, userLoading, router])

  const isSuperAdmin = !userLoading && user?.isSuperadmin

  // Fetch categories, departments, and employees for filters
  const { data: categories } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: getDailyReportCategories,
    enabled: isSuperAdmin,
  })

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    enabled: isSuperAdmin,
  })

  // Fetch all employees for filter
  const { data: employees } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      const { getAssignableUsers } = await import("@/lib/actions/daily-reports")
      return getAssignableUsers()
    },
    enabled: isSuperAdmin,
  })

  // Build filters
  const filters: DailyReportFilters = useMemo(() => {
    const f: DailyReportFilters = {}

    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }

    if (statusFilter !== "all") {
      f.status = [statusFilter]
    }

    if (categoryFilter !== "all") {
      f.categoryId = [categoryFilter]
    }

    if (departmentFilter !== "all") {
      f.departmentId = [departmentFilter]
    }

    if (employeeFilter !== "all") {
      f.userId = [employeeFilter]
    }

    if (activeFilter === "today") {
      f.date = { type: "today" }
    } else if (activeFilter === "this-week") {
      f.date = { type: "this-week" }
    } else if (activeFilter === "this-month") {
      f.date = { type: "this-month" }
    } else if (activeFilter === "drafts") {
      f.status = ["draft"]
    } else if (activeFilter === "submitted") {
      f.status = ["submitted"]
    }

    return f
  }, [searchQuery, statusFilter, categoryFilter, departmentFilter, employeeFilter, activeFilter])

  const sort: DailyReportSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection])

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-daily-reports", filters, sort],
    queryFn: () => getDailyReports(filters, sort),
    enabled: isSuperAdmin,
  })

  const { data: stats } = useQuery({
    queryKey: ["admin-daily-report-stats", filters],
    queryFn: () => getDailyReportStats(filters),
    enabled: isSuperAdmin,
  })

  const handleDelete = async (reportId: string) => {
    try {
      await deleteDailyReport(reportId)
      toast.success("Daily report deleted")
      queryClient.invalidateQueries({ queryKey: ["admin-daily-reports"] })
      queryClient.invalidateQueries({ queryKey: ["my-daily-reports"] })
      queryClient.invalidateQueries({ queryKey: ["admin-daily-report-stats"] })
    } catch (error) {
      toast.error("Failed to delete report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleView = (reportId: string) => {
    router.push(`/daily-reporting/${reportId}`)
  }

  // Prepare export data
  const exportData = useMemo(() => {
    if (!reports) return []
    return reports.map((report) => ({
      employee: report.user?.name || 'Unknown',
      email: report.user?.email || '',
      date: format(new Date(report.date), 'MMM dd, yyyy'),
      category: report.category?.name || 'Standard',
      department: report.department?.name || '',
      status: statusConfig[report.status].label,
      tasksCompleted: report.tasksCompleted?.length || 0,
      tasksPlanned: report.tasksPlanned?.length || 0,
      blockers: report.blockers?.length || 0,
      notes: report.notes || '',
      createdAt: format(new Date(report.createdAt), 'MMM dd, yyyy'),
    }))
  }, [reports])

  const exportColumns: ColumnDefinition[] = [
    { key: 'employee', label: 'Employee' },
    { key: 'email', label: 'Email' },
    { key: 'date', label: 'Date' },
    { key: 'category', label: 'Category' },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status' },
    { key: 'tasksCompleted', label: 'Tasks Completed' },
    { key: 'tasksPlanned', label: 'Tasks Planned' },
    { key: 'blockers', label: 'Blockers' },
    { key: 'notes', label: 'Notes' },
    { key: 'createdAt', label: 'Created At' },
  ]

  const handleExport = async () => {
    if (exportData.length === 0) {
      toast.error("No data to export")
      return
    }
    try {
      const filename = generateExportFilename('daily-reports', 'all-daily-reports')
      await exportToCSV(exportData, exportColumns, filename)
      toast.success("Daily reports exported successfully")
    } catch (error) {
      console.error('Error exporting daily reports:', error)
      toast.error("Failed to export daily reports")
    }
  }

  // Calculate counts
  const totalCount = stats?.total || 0
  const submittedCount = stats?.submitted || 0
  const draftsCount = stats?.drafts || 0

  // Group reports by date with latest first
  const groupedReports = useMemo(() => {
    if (!reports || reports.length === 0) return new Map()

    const grouped = new Map<string, DailyReport[]>()
    
    reports.forEach((report) => {
      const dateKey = report.date // Use date as key (YYYY-MM-DD format)
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(report)
    })

    // Sort dates in descending order (latest first)
    const sortedDates = Array.from(grouped.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })

    // Create a new map with sorted dates
    const sortedMap = new Map<string, DailyReport[]>()
    sortedDates.forEach((date) => {
      sortedMap.set(date, grouped.get(date)!)
    })

    return sortedMap
  }, [reports])

  // Initialize expanded dates - expand today and yesterday by default
  useEffect(() => {
    if (groupedReports.size > 0 && expandedDates.size === 0) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
      const initialExpanded = new Set<string>()
      
      // Expand today and yesterday, and first 3 dates
      const dates = Array.from(groupedReports.keys())
      dates.slice(0, 3).forEach(date => initialExpanded.add(date))
      if (dates.includes(today)) initialExpanded.add(today)
      if (dates.includes(yesterday)) initialExpanded.add(yesterday)
      
      setExpandedDates(initialExpanded)
    }
  }, [groupedReports, expandedDates.size])

  const toggleDateGroup = (dateKey: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  // Show loading state when query is loading
  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  // Redirect non-superadmins (handled in useEffect, but show loading while redirecting)
  if (!user || !user.isSuperadmin) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center justify-between mt-0.5">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-4 pb-2 border-b">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-6 gap-4 py-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load daily reports"
        message="We couldn't load daily reports. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Daily Reporting</h1>
            <p className="text-xs text-white/90 mt-0.5">SuperAdmin view: View and manage all employee and department daily reports</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-0.5 rounded-xl mb-6">
          <TabsTrigger
            value="individual"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Individual Reports
          </TabsTrigger>
          <TabsTrigger
            value="department"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Department Reports
          </TabsTrigger>
        </TabsList>

        {/* Individual Reports Tab */}
        <TabsContent value="individual" className="space-y-6 mt-0">
          {/* Search and Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DailyReportStatus | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
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
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees?.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
          const [field, direction] = value.split('-')
          setSortField(field as DailyReportSort['field'])
          setSortDirection(direction as DailyReportSort['direction'])
        }}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="created_at-desc">Created (Newest)</SelectItem>
            <SelectItem value="created_at-asc">Created (Oldest)</SelectItem>
            <SelectItem value="updated_at-desc">Updated (Newest)</SelectItem>
            <SelectItem value="updated_at-asc">Updated (Oldest)</SelectItem>
            <SelectItem value="status-asc">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={!reports || reports.length === 0}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Reports"
          value={totalCount}
          icon={FileText}
          onClick={() => setActiveFilter("all")}
          isActive={activeFilter === "all"}
        />
        <StatCard
          title="Submitted"
          value={submittedCount}
          icon={CheckCircle2}
          onClick={() => setActiveFilter(activeFilter === "submitted" ? "all" : "submitted")}
          isActive={activeFilter === "submitted"}
        />
        <StatCard
          title="Drafts"
          value={draftsCount}
          icon={Clock}
          onClick={() => setActiveFilter(activeFilter === "drafts" ? "all" : "drafts")}
          isActive={activeFilter === "drafts"}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All Daily Reports</CardTitle>
            <CardDescription>
              View and manage daily reports from all employees. Click on a report to view details.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {groupedReports.size > 0 ? (
            <div className="space-y-4">
              {Array.from(groupedReports.entries()).map(([dateKey, dateReports]) => {
                const dateObj = new Date(dateKey)
                const isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                const isYesterday = format(dateObj, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
                
                let dateLabel = format(dateObj, 'EEEE, MMMM dd, yyyy')
                if (isToday) dateLabel = `Today - ${format(dateObj, 'MMMM dd, yyyy')}`
                else if (isYesterday) dateLabel = `Yesterday - ${format(dateObj, 'MMMM dd, yyyy')}`

                const isExpanded = expandedDates.has(dateKey)

                return (
                  <div key={dateKey} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleDateGroup(dateKey)}
                      className="w-full flex items-center justify-between gap-2 p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <ChevronDown 
                          className={cn(
                            "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )} 
                        />
                        <h3 className="text-lg font-semibold">{dateLabel}</h3>
                        <Badge variant="outline" className="ml-2">
                          {dateReports.length} {dateReports.length === 1 ? 'report' : 'reports'}
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Employee</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Tasks Completed</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateReports.map((report) => {
                              const status = statusConfig[report.status]
                              return (
                                <TableRow
                                  key={report.id}
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => handleView(report.id)}
                                >
                                  <TableCell>
                                    {report.user ? (
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={report.user.avatar} alt={report.user.name} />
                                          <AvatarFallback className="text-xs">
                                            {report.user.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                              .toUpperCase()
                                              .slice(0, 2)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium">{report.user.name}</span>
                                          {report.user.email && (
                                            <span className="text-xs text-muted-foreground">{report.user.email}</span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">Unknown</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {report.category?.name || 'Standard'}
                                  </TableCell>
                                  <TableCell>
                                    {report.department?.name || '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={status.variant} size="sm">
                                      {status.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {report.tasksCompleted?.length || 0}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <RowActionsMenu
                                        entityType="daily-report"
                                        entityId={report.id}
                                        entityName={`Report for ${format(new Date(report.date), 'MMM dd, yyyy')}`}
                                        detailUrl={`/daily-reporting/${report.id}`}
                                        onDelete={() => handleDelete(report.id)}
                                        canView={true}
                                        canEdit={report.status === 'draft'}
                                        canDelete={true}
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <EmptyState
                icon={FileText}
                title="No daily reports yet"
                description="No daily reports found matching your filters."
              />
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Department Reports Tab */}
        <TabsContent value="department" className="space-y-6 mt-0">
          <DepartmentReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Department Reports Tab Component
function DepartmentReportsTab() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DepartmentReportStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<DepartmentReportSort['field']>("report_date")
  const [sortDirection, setSortDirection] = useState<DepartmentReportSort['direction']>("desc")
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Fetch categories and departments for filters
  const { data: categories } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: getDailyReportCategories,
  })

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  })

  // Build filters
  const filters: DepartmentReportFilters = useMemo(() => {
    const f: DepartmentReportFilters = {}

    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }

    if (statusFilter !== "all") {
      f.status = [statusFilter]
    }

    if (categoryFilter !== "all") {
      f.categoryId = [categoryFilter]
    }

    if (departmentFilter !== "all") {
      f.departmentId = [departmentFilter]
    }

    return f
  }, [searchQuery, statusFilter, categoryFilter, departmentFilter])

  const sort: DepartmentReportSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection])

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ["department-reports", filters, sort],
    queryFn: () => getDepartmentReports(filters, sort),
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ["department-report-stats", filters],
    queryFn: () => getDepartmentReportStats(filters),
    enabled: !!user,
  })

  const handleDelete = async (reportId: string) => {
    try {
      await deleteDepartmentReport(reportId)
      toast.success("Department report deleted")
      queryClient.invalidateQueries({ queryKey: ["department-reports"] })
      queryClient.invalidateQueries({ queryKey: ["department-report-stats"] })
    } catch (error) {
      toast.error("Failed to delete report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleView = (reportId: string) => {
    router.push(`/daily-reporting/department/${reportId}`)
  }

  // Group reports by date with latest first
  const groupedReports = useMemo(() => {
    if (!reports || reports.length === 0) return new Map()

    const grouped = new Map<string, DepartmentReport[]>()
    
    reports.forEach((report) => {
      const dateKey = report.reportDate
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(report)
    })

    // Sort dates in descending order (latest first)
    const sortedDates = Array.from(grouped.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })

    // Create a new map with sorted dates
    const sortedMap = new Map<string, DepartmentReport[]>()
    sortedDates.forEach((date) => {
      sortedMap.set(date, grouped.get(date)!)
    })

    return sortedMap
  }, [reports])

  // Initialize expanded dates - expand today and yesterday by default
  useEffect(() => {
    if (groupedReports.size > 0 && expandedDates.size === 0) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
      const initialExpanded = new Set<string>()
      
      // Expand today and yesterday, and first 3 dates
      const dates = Array.from(groupedReports.keys())
      dates.slice(0, 3).forEach(date => initialExpanded.add(date))
      if (dates.includes(today)) initialExpanded.add(today)
      if (dates.includes(yesterday)) initialExpanded.add(yesterday)
      
      setExpandedDates(initialExpanded)
    }
  }, [groupedReports, expandedDates.size])

  const toggleDateGroup = (dateKey: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  // Department report status config
  const deptStatusConfig = {
    draft: { label: "Draft", variant: "secondary" as const },
    submitted: { label: "Submitted", variant: "default" as const },
    late: { label: "Late", variant: "destructive" as const },
  }

  // Calculate counts
  const totalCount = stats?.total || 0
  const submittedCount = stats?.submitted || 0
  const draftsCount = stats?.drafts || 0
  const lateCount = stats?.late || 0
  const missingCount = stats?.missing || 0
  const onTimeCount = stats?.onTime || 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center flex-wrap">
          <Skeleton className="h-10 flex-1 min-w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-12" />
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load department reports"
        message="We couldn't load department reports. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search department reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DepartmentReportStatus | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="late">Late</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
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
        <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
          const [field, direction] = value.split('-')
          setSortField(field as DepartmentReportSort['field'])
          setSortDirection(direction as DepartmentReportSort['direction'])
        }}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="report_date-desc">Date (Newest)</SelectItem>
            <SelectItem value="report_date-asc">Date (Oldest)</SelectItem>
            <SelectItem value="deadline-desc">Deadline (Latest)</SelectItem>
            <SelectItem value="deadline-asc">Deadline (Earliest)</SelectItem>
            <SelectItem value="submitted_at-desc">Submitted (Newest)</SelectItem>
            <SelectItem value="submitted_at-asc">Submitted (Oldest)</SelectItem>
            <SelectItem value="status-asc">Status</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={totalCount}
          icon={FileText}
          isActive={false}
        />
        <StatCard
          title="On-Time"
          value={onTimeCount}
          icon={CheckCircle2}
          isActive={false}
        />
        <StatCard
          title="Late"
          value={lateCount}
          icon={Clock}
          isActive={false}
        />
        <StatCard
          title="Missing"
          value={missingCount}
          icon={FileText}
          isActive={false}
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Department Reports</CardTitle>
            <CardDescription>
              View and manage department-level daily reports. Click on a report to view details.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {groupedReports.size > 0 ? (
            <div className="space-y-4">
              {Array.from(groupedReports.entries()).map(([dateKey, dateReports]) => {
                const dateObj = new Date(dateKey)
                const isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                const isYesterday = format(dateObj, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
                
                let dateLabel = format(dateObj, 'EEEE, MMMM dd, yyyy')
                if (isToday) dateLabel = `Today - ${format(dateObj, 'MMMM dd, yyyy')}`
                else if (isYesterday) dateLabel = `Yesterday - ${format(dateObj, 'MMMM dd, yyyy')}`

                const isExpanded = expandedDates.has(dateKey)

                return (
                  <div key={dateKey} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleDateGroup(dateKey)}
                      className="w-full flex items-center justify-between gap-2 p-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <ChevronDown 
                          className={cn(
                            "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )} 
                        />
                        <h3 className="text-lg font-semibold">{dateLabel}</h3>
                        <Badge variant="outline" className="ml-2">
                          {dateReports.length} {dateReports.length === 1 ? 'report' : 'reports'}
                        </Badge>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Department</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Deadline</TableHead>
                              <TableHead>Submitted</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateReports.map((report) => {
                              const status = deptStatusConfig[report.status]
                              return (
                                <TableRow
                                  key={report.id}
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => handleView(report.id)}
                                >
                                  <TableCell className="font-medium">
                                    {report.department?.name || 'Unknown'}
                                  </TableCell>
                                  <TableCell>
                                    {report.category?.name || 'Standard'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" size="sm">
                                      {report.reportType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={status.variant} size="sm">
                                      {status.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(report.deadline), 'MMM dd, yyyy HH:mm')}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {report.submittedAt 
                                      ? format(new Date(report.submittedAt), 'MMM dd, yyyy HH:mm')
                                      : '-'
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <RowActionsMenu
                                        entityType="department-report"
                                        entityId={report.id}
                                        entityName={`Department report for ${format(new Date(report.reportDate), 'MMM dd, yyyy')}`}
                                        detailUrl={`/daily-reporting/department/${report.id}`}
                                        onDelete={() => handleDelete(report.id)}
                                        canView={true}
                                        canEdit={report.status === 'draft'}
                                        canDelete={true}
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <EmptyState
                icon={FileText}
                title="No department reports yet"
                description="No department reports found matching your filters."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateDepartmentReportDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}

