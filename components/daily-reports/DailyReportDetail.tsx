"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, Calendar, User, Building2, FileText, CheckCircle2, Clock } from "lucide-react"
import { DailyReport } from "@/lib/types/daily-reports"
import { format } from "date-fns"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { deleteDailyReport } from "@/lib/actions/daily-reports"
import { toast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DailyReportDetailProps {
  report: DailyReport
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
  showEmployeeInfo?: boolean
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
  submitted: { label: "Submitted", variant: "default" as const, icon: CheckCircle2 },
}

export function DailyReportDetail({
  report,
  currentUserId,
  onEdit,
  onDelete,
  showEmployeeInfo = false,
}: DailyReportDetailProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const status = statusConfig[report.status]
  const StatusIcon = status.icon

  const canEdit = report.status === 'draft' && (report.userId === currentUserId || !currentUserId)
  const canDelete = report.status === 'draft' && (report.userId === currentUserId || !currentUserId)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return

    setIsDeleting(true)
    try {
      await deleteDailyReport(report.id)
      toast.success("Daily report deleted")
      queryClient.invalidateQueries({ queryKey: ["my-daily-reports"] })
      queryClient.invalidateQueries({ queryKey: ["daily-reports"] })
      queryClient.invalidateQueries({ queryKey: ["my-daily-report-stats"] })
      
      if (onDelete) {
        onDelete()
      } else {
        router.push('/my-daily-reporting')
      }
    } catch (error) {
      toast.error("Failed to delete report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Daily Report</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={status.variant} size="sm" className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(report.date), 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showEmployeeInfo && report.user && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <div className="flex items-center gap-2 mt-1">
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
                    <p className="text-sm font-medium">{report.user.name}</p>
                  </div>
                </div>
              </div>
            )}
            {report.category && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-sm font-medium mt-1">{report.category.name}</p>
                </div>
              </div>
            )}
            {report.department && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-sm font-medium mt-1">{report.department.name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium mt-1">
                  {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department-Specific Fields */}
      {report.fieldValues && report.fieldValues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metrics & Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.fieldValues.map((fv) => (
                <div key={fv.id} className="space-y-1">
                  <p className="text-sm text-muted-foreground capitalize">
                    {fv.fieldKey.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-medium">
                    {fv.fieldType === 'array' && Array.isArray(fv.fieldValue)
                      ? fv.fieldValue.join(', ')
                      : fv.fieldType === 'number'
                      ? fv.fieldValue
                      : String(fv.fieldValue || '-')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Completed */}
      {report.tasksCompleted && report.tasksCompleted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.tasksCompleted.map((task, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{task}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tasks Planned */}
      {report.tasksPlanned && report.tasksPlanned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.tasksPlanned.map((task, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{task}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Blockers */}
      {report.blockers && report.blockers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blockers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.blockers.map((blocker, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0">⚠</span>
                  <span className="text-sm">{blocker}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {report.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

