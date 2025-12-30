"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  FileDown,
  Search,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Application } from "@/lib/types/recruitment"
import { getApplications } from "@/lib/actions/recruitment"
import { exportApplicationsToCSV } from "@/lib/utils/export"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { format } from "date-fns"
import { toast } from "@/components/ui/sonner"

async function fetchApplications() {
  return await getApplications()
}

const statusConfig: Record<
  string,
  {
    label: string
    variant: "green" | "yellow" | "red" | "neutral"
    bgColor: string
    textColor: string
  }
> = {
  applied: { label: "Applied", variant: "neutral", bgColor: "#F6F8FA", textColor: "#0D0D12" },
  screening: { label: "In Review", variant: "yellow", bgColor: "#FFF9ED", textColor: "#A77B2E" },
  interview: { label: "Interview", variant: "green", bgColor: "#ECF9F7", textColor: "#267666" },
  offer: { label: "Offer", variant: "green", bgColor: "#ECF9F7", textColor: "#267666" },
  hired: { label: "Hired", variant: "green", bgColor: "#ECF9F7", textColor: "#267666" },
  rejected: { label: "Rejected", variant: "red", bgColor: "#FCE8EC", textColor: "#B21634" },
}

export default function RecruitmentApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { data: applications, isLoading, error, refetch } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  })

  const handleExportCSV = () => {
    if (!applications || applications.length === 0) {
      toast.error("No applications to export")
      return
    }
    try {
      exportApplicationsToCSV(applications, {
        filename: `applications-${new Date().toISOString().split('T')[0]}`,
      })
      toast.success("Export started", {
        description: "Exporting all applications",
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!applications) return { total: 0, inReview: 0, interview: 0, hired: 0, rejected: 0 }
    
    return {
      total: applications.length,
      inReview: applications.filter((app) => app.status === "screening").length,
      interview: applications.filter((app) => app.status === "interview").length,
      hired: applications.filter((app) => app.status === "hired").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    }
  }, [applications])

  // NOTE: useMemo must be called before any early returns to maintain consistent hook order
  const filteredApplications = useMemo(() => {
    return applications?.filter(
      (app) =>
        app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  }, [applications, searchQuery])

  // Pagination
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredApplications.slice(start, end)
  }, [filteredApplications, currentPage, pageSize])

  const totalPages = Math.ceil(filteredApplications.length / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, filteredApplications.length)

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedApplications.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedApplications.map((app) => app.id)))
    }
  }

  // Early returns for loading and error states - after all hooks
  if (isLoading) {
    return (
      <div className="space-y-5 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 flex-1 rounded-xl" />
          ))}
        </div>
        <Card className="border border-border rounded-xl">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load applications"
        message="We couldn't load applications. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Applications</h1>
            <p className="text-xs text-white/90 mt-0.5">Track and manage all your submitted job applications.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="h-10 px-4 gap-2 border border-border rounded-lg shadow-sm"
        >
          <FileDown className="h-4 w-4" />
          <span className="text-sm font-semibold leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Export CSV
          </span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-5">
        <StatCard
          icon={Briefcase}
          value={stats.total}
          label="Total Applications"
        />
        <StatCard
          icon={Clock}
          value={stats.inReview}
          label="In Review"
        />
        <StatCard
          icon={Calendar}
          value={stats.interview}
          label="Interview Scheduled"
        />
        <StatCard
          icon={CheckCircle2}
          value={stats.hired}
          label="Hired"
        />
        <StatCard
          icon={XCircle}
          value={stats.rejected}
          label="Rejected"
        />
      </div>

      {/* Table */}
      <Card className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex h-16 items-center justify-between px-5 py-2 border-b border-border">
          <h3 className="text-base font-semibold text-foreground leading-[1.5] tracking-[0.32px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Table Header
          </h3>
          <div className="flex gap-2 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 border border-border rounded-lg text-xs"
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 border border-border rounded-lg">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex flex-col">
          <div className="border border-border rounded-lg overflow-hidden mx-5 mt-0 mb-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F6F8FA] hover:bg-[#F6F8FA] border-0">
                  <TableHead className="w-[70px] h-10 px-3 py-0">
                    <div className="flex gap-2.5 items-center">
                      <Checkbox
                        checked={selectedRows.size === paginatedApplications.length && paginatedApplications.length > 0}
                        onCheckedChange={toggleAllSelection}
                        className="h-4 w-4 border-border rounded-[4px]"
                      />
                      <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                        No
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="flex-1 h-10 px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                      Job Title
                    </span>
                  </TableHead>
                  <TableHead className="flex-1 h-10 px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                      Company
                    </span>
                  </TableHead>
                  <TableHead className="flex-1 h-10 px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                      Type
                    </span>
                  </TableHead>
                  <TableHead className="flex-1 h-10 px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                      Date Applied
                    </span>
                  </TableHead>
                  <TableHead className="flex-1 h-10 px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                      Status
                    </span>
                  </TableHead>
                  <TableHead className="flex-1 h-10 px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                      Last Update
                    </span>
                  </TableHead>
                  <TableHead className="w-[44px] h-10 px-3 py-0"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.length > 0 ? (
                  paginatedApplications.map((application, index) => {
                    const status = statusConfig[application.status] || statusConfig.applied
                    const rowNumber = (currentPage - 1) * pageSize + index + 1
                    return (
                      <TableRow
                        key={application.id}
                        className="border-b border-border h-16 hover:bg-muted/30 cursor-pointer"
                        onClick={() => router.push(`/recruitment/applications/${application.id}`)}
                      >
                        <TableCell className="w-[70px] px-3 py-0">
                          <div className="flex gap-2.5 items-center">
                            <Checkbox
                              checked={selectedRows.has(application.id)}
                              onCheckedChange={() => toggleRowSelection(application.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 border-border rounded-[4px]"
                            />
                            <span className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                              {rowNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="flex-1 px-3 py-0">
                          <span className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                            {application.position}
                          </span>
                        </TableCell>
                        <TableCell className="flex-1 px-3 py-0">
                          <span className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                            {application.source || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="flex-1 px-3 py-0">
                          <span className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                            Remote
                          </span>
                        </TableCell>
                        <TableCell className="flex-1 px-3 py-0">
                          <span className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                            {format(new Date(application.appliedDate), "yyyy-MM-dd")}
                          </span>
                        </TableCell>
                        <TableCell className="flex-1 px-3 py-0">
                          <Badge
                            className="h-5 px-2 py-0.5 rounded-2xl text-xs font-medium leading-[18px] tracking-[0.12px] gap-1.5"
                            style={{
                              backgroundColor: status.bgColor,
                              color: status.textColor,
                              border: "none",
                              fontFamily: 'var(--font-inter-tight)',
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.textColor }} />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex-1 px-3 py-0">
                          <span className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                            {format(new Date(application.updatedAt), "yyyy-MM-dd")}
                          </span>
                        </TableCell>
                        <TableCell className="w-[44px] px-3 py-0" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu
                            entityType="application"
                            entityId={application.id}
                            entityName={application.candidateName}
                            detailUrl={`/recruitment/applications/${application.id}`}
                            canView={true}
                            canEdit={true}
                            canDelete={false}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24">
                      <EmptyState
                        icon={FileText}
                        title="No applications found"
                        description={searchQuery ? "Try adjusting your search criteria." : "Job applications will appear here once candidates apply."}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex h-16 items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
              Showing {startItem} to {endItem} of, {filteredApplications.length} results
            </p>
            <div className="flex gap-2 items-center">
              <div className="border border-border rounded-lg flex items-center h-8">
                <div className="border-r border-border px-3 py-2">
                  <span className="text-xs font-medium text-foreground leading-[1.5] tracking-[0.24px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Per page
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className="text-xs font-semibold text-foreground leading-[1.5] tracking-[0.24px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    {pageSize}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 border border-border rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number | string
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 2) {
                      if (i < 3) pageNum = i + 1
                      else if (i === 3) pageNum = "..."
                      else pageNum = totalPages
                    } else if (currentPage >= totalPages - 1) {
                      if (i === 0) pageNum = 1
                      else if (i === 1) pageNum = "..."
                      else pageNum = totalPages - 2 + i
                    } else {
                      if (i === 0) pageNum = 1
                      else if (i === 1) pageNum = "..."
                      else if (i === 2) pageNum = currentPage
                      else if (i === 3) pageNum = "..."
                      else pageNum = totalPages
                    }

                    if (pageNum === "...") {
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-center h-8 w-8 border-r border-border"
                        >
                          <span className="text-xs font-medium text-foreground leading-[1.5] tracking-[0.24px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                            ...
                          </span>
                        </div>
                      )
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum as number)}
                        className={cn(
                          "flex items-center justify-center h-8 w-8 border-r border-border text-xs font-medium leading-[1.5] tracking-[0.24px] transition-colors",
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "bg-white text-foreground hover:bg-muted/50"
                        )}
                        style={{ fontFamily: 'var(--font-inter-tight)' }}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 border border-border rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
}) {
  return (
    <Card className="bg-white border border-border rounded-xl shadow-sm flex-1 overflow-hidden">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="bg-white border border-border rounded-[10px] w-10 h-10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-foreground leading-[1.4] tracking-[0.36px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            {value}
          </p>
          <p className="text-sm text-muted-foreground leading-[1.5] tracking-[0.28px]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
