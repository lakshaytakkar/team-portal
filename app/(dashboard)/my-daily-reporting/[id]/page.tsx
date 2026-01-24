"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { getDailyReport, deleteDailyReport } from "@/lib/actions/daily-reports"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { DailyReportDetail } from "@/components/daily-reports/DailyReportDetail"
import { useUser } from "@/lib/hooks/useUser"
import { format } from "date-fns"

export default function MyDailyReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const queryClient = useQueryClient()
  const reportId = params.id as string
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ["daily-report", reportId],
    queryFn: () => getDailyReport(reportId),
    enabled: !!reportId,
  })

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return

    setIsDeleting(true)
    try {
      await deleteDailyReport(reportId)
      toast.success("Daily report deleted")
      queryClient.invalidateQueries({ queryKey: ["my-daily-reports"] })
      queryClient.invalidateQueries({ queryKey: ["my-daily-report-stats"] })
      router.push('/my-daily-reporting')
    } catch (error) {
      toast.error("Failed to delete report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    // For now, just show a message - edit functionality can be added later
    toast.info("Edit functionality coming soon")
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
        title="Failed to load daily report"
        message="We couldn't load this daily report. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!report) {
    notFound()
  }

  // Check permissions - users can only view their own reports
  if (report.userId !== user?.id) {
    return (
      <ErrorState
        title="Access Denied"
        message="You don't have permission to view this report."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Daily Report Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(report.date), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        {report.status === 'draft' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Report Detail */}
      <DailyReportDetail
        report={report}
        currentUserId={user?.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showEmployeeInfo={false}
      />
    </div>
  )
}

