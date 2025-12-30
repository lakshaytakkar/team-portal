"use client"

import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Calendar, FileText, UserPlus, Mail, Trash2, Link2 } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Candidate } from "@/lib/types/candidate"

interface CandidateRowActionsProps {
  candidate: Candidate
  onEdit?: () => void
  onDelete?: () => Promise<void>
  onScheduleInterview?: () => void
  onAddNote?: () => void
  onChangeStatus?: () => void
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
  showBulkSelect?: boolean
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
}

export function CandidateRowActions({
  candidate,
  onEdit,
  onDelete,
  onScheduleInterview,
  onAddNote,
  onChangeStatus,
  canView = true,
  canEdit = true,
  canDelete = false,
  showBulkSelect = false,
  isSelected = false,
  onSelectChange,
}: CandidateRowActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = () => {
    router.push(`/recruitment/candidates/${candidate.id}`)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/recruitment/candidates/${candidate.id}?edit=true`)
    }
  }

  const handleViewApplications = () => {
    router.push(`/recruitment/applications?candidate=${candidate.id}`)
  }

  const handleViewTimeline = () => {
    router.push(`/recruitment/candidates/${candidate.id}?tab=timeline`)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete()
      toast.success("Deleted successfully", {
        description: `${candidate.fullName} has been deleted`,
        duration: 3000,
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error("Failed to delete", {
        description: error instanceof Error ? error.message : "An error occurred",
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const hasActions = canView || canEdit || canDelete || onScheduleInterview || onAddNote || onChangeStatus

  if (!hasActions && !showBulkSelect) {
    return null
  }

  return (
    <>
      {showBulkSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectChange?.(e.target.checked)}
          className="h-4 w-4 rounded border-border"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-4 h-4 flex items-center justify-center hover:bg-muted rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canView && (
            <DropdownMenuItem onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" />
              View Detail
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {(canView || canEdit) && (
            <DropdownMenuSeparator />
          )}
          {onScheduleInterview && (
            <DropdownMenuItem onClick={onScheduleInterview}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </DropdownMenuItem>
          )}
          {onAddNote && (
            <DropdownMenuItem onClick={onAddNote}>
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </DropdownMenuItem>
          )}
          {onChangeStatus && (
            <DropdownMenuItem onClick={onChangeStatus}>
              <UserPlus className="h-4 w-4 mr-2" />
              Change Status
            </DropdownMenuItem>
          )}
          {(onScheduleInterview || onAddNote || onChangeStatus) && (
            <DropdownMenuSeparator />
          )}
          <DropdownMenuItem onClick={handleViewApplications}>
            <Link2 className="h-4 w-4 mr-2" />
            View Applications
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewTimeline}>
            <FileText className="h-4 w-4 mr-2" />
            View Timeline
          </DropdownMenuItem>
          {canDelete && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteClick} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {candidate.fullName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{candidate.fullName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

