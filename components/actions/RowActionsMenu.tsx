"use client"

import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
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

type EntityType =
  | "project" | "task" | "call" | "employee" | "candidate" | "job-posting" | "lead" | "deal"
  | "quotation" | "invoice" | "expense" | "vendor" | "campaign" | "template" | "event" | "goal"
  | "resource" | "daily-report" | "research-doc" | "user" | "conversion" | "domain" | "traffic"
  | "transaction" | "tax" | "sales-order" | "automation-log" | "suggestion" | "strategic-planning"
  | "whatsapp-template" | "new-vertical" | "whatsapp-automation" | "mindmap" | "page" | "drip"
  | "market-research" | "email-automation" | "application" | "email-template" | "financial-planning"
  | "evaluation" | "job-role" | "interview" | "job-portal" | "onboarding" | "asset" | "organization"
  | "leave-request" | "training" | "client" | "attendance" | "playlist" | "meeting-note" | "personal-document"

interface RowActionsMenuProps {
  entityType: EntityType
  entityId: string
  entityName: string
  onEdit?: () => void
  onDelete?: () => Promise<void>
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
  detailUrl?: string
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive"
  }>
}

export function RowActionsMenu({
  entityType,
  entityId,
  entityName,
  onEdit,
  onDelete,
  canView = true,
  canEdit = true,
  canDelete = false,
  detailUrl,
  customActions = [],
}: RowActionsMenuProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = () => {
    if (detailUrl) {
      router.push(detailUrl)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else if (detailUrl) {
      router.push(`${detailUrl}/edit`)
    }
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
        description: `${entityName} has been deleted`,
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

  const hasActions = canView || canEdit || canDelete || customActions.length > 0

  if (!hasActions) {
    return null
  }

  return (
    <>
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
          {canView && detailUrl && (
            <DropdownMenuItem onClick={handleView}>
              <Eye className="h-4 w-4 mr-2" />
              View Detail
            </DropdownMenuItem>
          )}
          {canEdit && (onEdit || detailUrl) && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {customActions.length > 0 && (
            <>
              {(canView && detailUrl) || (canEdit && (onEdit || detailUrl)) ? (
                <DropdownMenuSeparator />
              ) : null}
              {customActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </>
          )}
          {canDelete && onDelete && (
            <>
              {(canView && detailUrl) || (canEdit && (onEdit || detailUrl)) || customActions.length > 0 ? (
                <DropdownMenuSeparator />
              ) : null}
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
            <DialogTitle>Delete {entityName}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{entityName}"? This action cannot be undone.
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
