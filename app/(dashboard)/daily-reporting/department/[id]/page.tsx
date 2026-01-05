"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { getDepartmentReport, deleteDepartmentReport, submitDepartmentReport } from "@/lib/actions/department-reports"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { useUserContext } from "@/lib/providers/UserContextProvider"
import { format } from "date-fns"
import { CreateDepartmentReportDialog } from "@/components/daily-reports/CreateDepartmentReportDialog"
import { getIndividualReportsForDepartmentReport } from "@/lib/services/department-report-aggregator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DepartmentReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUserContext()
  const queryClient = useQueryClient()
  const reportId = params.id as string
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ["department-report", reportId],
    queryFn: () => getDepartmentReport(reportId),
    enabled: !!reportId,
  })

  const { data: individualReports } = useQuery({
    queryKey: ["department-report-individual-reports", reportId, report?.departmentId, report?.reportDate],
    queryFn: () => {
      if (!report?.departmentId || !report?.reportDate) return []
      return getIndividualReportsForDepartmentReport(report.departmentId, report.reportDate)
    },
    enabled: !!report && (report.reportType === 'aggregated' || report.reportType === 'hybrid'),
  })

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this department report?')) return

    setIsDeleting(true)
    try {
      await deleteDepartmentReport(reportId)
      toast.success("Department report deleted")
      queryClient.invalidateQueries({ queryKey: ["department-reports"] })
      queryClient.invalidateQueries({ queryKey: ["department-report-stats"] })
      router.push('/daily-reporting?tab=department')
    } catch (error) {
      toast.error("Failed to delete report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit this report? It cannot be edited after submission.')) return

    setIsSubmitting(true)
    try {
      await submitDepartmentReport(reportId)
      toast.success("Department report submitted successfully")
      queryClient.invalidateQueries({ queryKey: ["department-report", reportId] })
      queryClient.invalidateQueries({ queryKey: ["department-reports"] })
      queryClient.invalidateQueries({ queryKey: ["department-report-stats"] })
      refetch()
    } catch (error) {
      toast.error("Failed to submit report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load department report"
        message="We couldn't load this department report. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!report) {
    notFound()
  }

  // Check permissions
  const canEdit = user?.isSuperadmin || (report.status === 'draft' && user?.departmentId === report.departmentId)
  const canDelete = user?.isSuperadmin
  const canSubmit = canEdit && report.status === 'draft'

  const statusConfig = {
    draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
    submitted: { label: "Submitted", variant: "default" as const, icon: CheckCircle2 },
    late: { label: "Late", variant: "destructive" as const, icon: AlertCircle },
  }

  const status = statusConfig[report.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/daily-reporting?tab=department')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Department Report</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(report.reportDate), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Overview</CardTitle>
              <CardDescription>
                Basic information about this department report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <p className="font-medium">{report.department?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{report.category?.name || 'Standard'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Report Type</p>
                  <Badge variant="outline">{report.reportType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                  <p className="font-medium">
                    {format(new Date(report.deadline), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {report.submittedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submitted At</p>
                    <p className="font-medium">
                      {format(new Date(report.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {report.submittedBy && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submitted By</p>
                    <p className="font-medium">{report.submittedBy.name}</p>
                  </div>
                )}
              </div>

              {report.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aggregated Summary */}
          {(report.reportType === 'aggregated' || report.reportType === 'hybrid') && report.summaryData && (
            <Card>
              <CardHeader>
                <CardTitle>Aggregated Summary</CardTitle>
                <CardDescription>
                  Summary data compiled from individual reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typeof report.summaryData === 'object' && report.summaryData !== null && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {'totalReports' in report.summaryData && (
                        <div>
                          <p className="text-sm text-muted-foreground">Total Reports</p>
                          <p className="text-2xl font-semibold">
                            {(report.summaryData as any).totalReports || 0}
                          </p>
                        </div>
                      )}
                      {'submittedReports' in report.summaryData && (
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="text-2xl font-semibold">
                            {(report.summaryData as any).submittedReports || 0}
                          </p>
                        </div>
                      )}
                      {'totalTasksCompleted' in report.summaryData && (
                        <div>
                          <p className="text-sm text-muted-foreground">Tasks Completed</p>
                          <p className="text-2xl font-semibold">
                            {(report.summaryData as any).totalTasksCompleted || 0}
                          </p>
                        </div>
                      )}
                      {'totalBlockers' in report.summaryData && (
                        <div>
                          <p className="text-sm text-muted-foreground">Blockers</p>
                          <p className="text-2xl font-semibold">
                            {(report.summaryData as any).totalBlockers || 0}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {'summary' in report.summaryData && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Summary</p>
                      <p className="text-sm">{(report.summaryData as any).summary}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Reports (if aggregated) */}
          {individualReports && individualReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Individual Reports</CardTitle>
                <CardDescription>
                  {individualReports.length} individual report{individualReports.length !== 1 ? 's' : ''} included in this department report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualReports.map((indReport) => (
                      <TableRow key={indReport.id}>
                        <TableCell className="font-medium">{indReport.userName}</TableCell>
                        <TableCell>{indReport.categoryName || 'Standard'}</TableCell>
                        <TableCell>
                          <Badge variant={indReport.status === 'submitted' ? 'default' : 'secondary'}>
                            {indReport.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {indReport.tasksCompleted} completed, {indReport.tasksPlanned} planned
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Custom Data (if separate) */}
          {report.reportType === 'separate' && report.customData && Object.keys(report.customData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Data</CardTitle>
                <CardDescription>
                  Additional data for this separate department report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(report.customData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Submission Info */}
        <div className="space-y-6">
          {/* Submission Status */}
          {report.submission && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expected Deadline</p>
                  <p className="font-medium">
                    {format(new Date(report.submission.expectedDeadline), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {report.submission.actualSubmissionTime && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Actual Submission</p>
                    <p className="font-medium">
                      {format(new Date(report.submission.actualSubmissionTime), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">On Time</p>
                  <Badge variant={report.submission.isOnTime ? 'default' : 'destructive'}>
                    {report.submission.isOnTime ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {report.submission.daysLate !== undefined && report.submission.daysLate > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Days Late</p>
                    <p className="font-medium text-destructive">
                      {report.submission.daysLate} day{report.submission.daysLate !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reminders Sent</p>
                  <p className="font-medium">{report.submission.reminderSentCount}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {report.metadata && Object.keys(report.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                  {JSON.stringify(report.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <CreateDepartmentReportDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        reportId={reportId}
      />
    </div>
  )
}




