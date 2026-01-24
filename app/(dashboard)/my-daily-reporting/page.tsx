"use client"

import { useState, useMemo } from "react"
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
import { Plus, FileText, Search, ArrowUpDown, Calendar, CheckCircle2, Clock } from "lucide-react"
import { DailyReport, DailyReportStatus, DailyReportFilters, DailyReportSort } from "@/lib/types/daily-reports"
import { cn } from "@/lib/utils"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import {
  getDailyReports,
  getDailyReportStats,
  deleteDailyReport,
} from "@/lib/actions/daily-reports"
import { useUser } from "@/lib/hooks/useUser"
import { format } from "date-fns"
import { CreateDailyReportDialog } from "@/components/daily-reports/CreateDailyReportDialog"

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

export default function MyDailyReportingPage() {
  const { user } = useUser()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<ReportFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DailyReportStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<DailyReportSort['field']>("date")
  const [sortDirection, setSortDirection] = useState<DailyReportSort['direction']>("desc")
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false)

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: async () => {
      const { getDailyReportCategories } = await import("@/lib/actions/daily-reports")
      return getDailyReportCategories()
    },
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
  }, [searchQuery, statusFilter, categoryFilter, activeFilter])

  const sort: DailyReportSort = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection])

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ["my-daily-reports", filters, sort, user?.id],
    queryFn: () => getDailyReports(filters, sort, user?.id),
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ["my-daily-report-stats", user?.id],
    queryFn: () => getDailyReportStats(filters),
    enabled: !!user,
  })

  const handleDelete = async (reportId: string) => {
    try {
      await deleteDailyReport(reportId)
      toast.success("Daily report deleted")
      queryClient.invalidateQueries({ queryKey: ["my-daily-reports"] })
      queryClient.invalidateQueries({ queryKey: ["my-daily-report-stats"] })
    } catch (error) {
      toast.error("Failed to delete report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleView = (reportId: string) => {
    router.push(`/my-daily-reporting/${reportId}`)
  }

  // Calculate counts
  const totalCount = stats?.total || 0
  const submittedCount = stats?.submitted || 0
  const draftsCount = stats?.drafts || 0

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
              <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-5 gap-4 py-3">
                  <Skeleton className="h-4 flex-1" />
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
        message="We couldn't load your daily reports. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">My Daily Reporting</h1>
            <p className="text-xs text-white/90 mt-0.5">Submit and track your daily work reports</p>
          </div>
          <Button onClick={() => setIsCreateReportOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Daily Report
          </Button>
        </div>
      </div>

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
            <CardTitle>My Daily Reports</CardTitle>
            <CardDescription>
              View and manage your daily work reports. Click on a report to view details.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports && reports.length > 0 ? (
                reports.map((report) => {
                  const status = statusConfig[report.status]
                  return (
                    <TableRow
                      key={report.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleView(report.id)}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(report.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {report.category?.name || 'Standard'}
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
                            detailUrl={`/my-daily-reporting/${report.id}`}
                            onDelete={() => handleDelete(report.id)}
                            canView={true}
                            canEdit={report.status === 'draft'}
                            canDelete={report.status === 'draft'}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24">
                    <EmptyState
                      icon={FileText}
                      title="No daily reports yet"
                      description="Get started by creating your first daily report to track your work."
                      action={{
                        label: "Create Report",
                        onClick: () => setIsCreateReportOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateDailyReportDialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen} />
    </div>
  )
}
