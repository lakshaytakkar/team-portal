"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Clock, FileText, CheckCircle, XCircle, X, AlertCircle } from "lucide-react"
import type { LeaveRequest } from "@/lib/types/leave-requests"
import { format } from "date-fns"

interface LeaveRequestDetailProps {
  leaveRequest: LeaveRequest
  currentUserId: string
  userRole: string
  userDepartment?: string
  onEdit?: () => void
  onCancel?: () => void
  onApprove?: () => void
  onReject?: () => void
}

export function LeaveRequestDetail({
  leaveRequest,
  currentUserId,
  userRole,
  userDepartment,
  onEdit,
  onCancel,
  onApprove,
  onReject,
}: LeaveRequestDetailProps) {
  const statusConfig = {
    pending: { label: "Pending", variant: "secondary" as const, icon: AlertCircle },
    approved: { label: "Approved", variant: "default" as const, icon: CheckCircle },
    rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
    cancelled: { label: "Cancelled", variant: "secondary" as const, icon: X },
  }

  const typeLabels = {
    vacation: "Vacation",
    sick: "Sick Leave",
    personal: "Personal",
    other: "Other",
  }

  const status = statusConfig[leaveRequest.status]
  const canEdit = leaveRequest.userId === currentUserId && leaveRequest.status === 'pending'
  const canCancel = leaveRequest.userId === currentUserId && leaveRequest.status === 'pending'
  const canApprove = (userRole === 'superadmin' || userRole === 'manager' || userDepartment?.toLowerCase() === 'hr') && leaveRequest.status === 'pending'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={leaveRequest.user?.avatar} />
            <AvatarFallback>
              {leaveRequest.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{leaveRequest.user?.name || 'Unknown'}</h3>
            <p className="text-sm text-muted-foreground">{leaveRequest.user?.email}</p>
          </div>
        </div>
        <Badge variant={status.variant} className="gap-2">
          <status.icon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>

      <Separator />

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
          <p className="text-sm">{typeLabels[leaveRequest.type]}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Days</p>
          <p className="text-sm">{leaveRequest.days} day{leaveRequest.days !== 1 ? 's' : ''}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Start Date
          </p>
          <p className="text-sm">{format(new Date(leaveRequest.startDate), 'MMM dd, yyyy')}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            End Date
          </p>
          <p className="text-sm">{format(new Date(leaveRequest.endDate), 'MMM dd, yyyy')}</p>
        </div>
      </div>

      <Separator />

      {/* Reason */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Reason
        </p>
        <p className="text-sm whitespace-pre-wrap">{leaveRequest.reason || 'No reason provided'}</p>
      </div>

      {/* Metadata */}
      {leaveRequest.metadata && (
        <>
          {(leaveRequest.metadata.coveragePlan || leaveRequest.metadata.contactDuringLeave) && (
            <>
              <Separator />
              <div className="space-y-4">
                {leaveRequest.metadata.coveragePlan && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Coverage Plan</p>
                    <p className="text-sm whitespace-pre-wrap">{leaveRequest.metadata.coveragePlan}</p>
                  </div>
                )}
                {leaveRequest.metadata.contactDuringLeave && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                    <p className="text-sm">{leaveRequest.metadata.contactDuringLeave}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Approval Info */}
      {leaveRequest.status !== 'pending' && leaveRequest.approvedBy && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Approval Information</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={leaveRequest.approvedBy.avatar} />
                <AvatarFallback>
                  {leaveRequest.approvedBy.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{leaveRequest.approvedBy.name}</p>
                {leaveRequest.approvedAt && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(leaveRequest.approvedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
            {leaveRequest.approvalNotes && (
              <p className="text-sm mt-2 whitespace-pre-wrap">{leaveRequest.approvalNotes}</p>
            )}
          </div>
        </>
      )}

      {/* Timeline */}
      <Separator />
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Timeline
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{format(new Date(leaveRequest.createdAt), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          {leaveRequest.updatedAt && leaveRequest.updatedAt !== leaveRequest.createdAt && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span>{format(new Date(leaveRequest.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {(canEdit || canCancel || canApprove) && (
        <>
          <Separator />
          <div className="flex items-center gap-2 pt-2">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {canApprove && (
              <>
                <Button variant="default" size="sm" onClick={onApprove}>
                  Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={onReject}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

