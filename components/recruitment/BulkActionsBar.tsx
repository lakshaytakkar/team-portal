"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, X, MoreVertical, UserPlus, Tag, Download, Trash2, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkStatusChange?: () => void
  onBulkAssign?: () => void
  onBulkTag?: () => void
  onBulkExport?: () => void
  onBulkDelete?: () => void
  onBulkEmail?: () => void
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
  onBulkAssign,
  onBulkTag,
  onBulkExport,
  onBulkDelete,
  onBulkEmail,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null
  }

  const hasActions = onBulkStatusChange || onBulkAssign || onBulkTag || onBulkExport || onBulkDelete || onBulkEmail

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-7 px-2 text-xs">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>

      {hasActions && (
        <div className="flex items-center gap-2">
          {onBulkStatusChange && (
            <Button variant="outline" size="sm" onClick={onBulkStatusChange} className="h-7 px-3 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Change Status
            </Button>
          )}
          {onBulkAssign && (
            <Button variant="outline" size="sm" onClick={onBulkAssign} className="h-7 px-3 text-xs">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Assign
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                <MoreVertical className="h-3.5 w-3.5 mr-1.5" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onBulkTag && (
                <DropdownMenuItem onClick={onBulkTag}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </DropdownMenuItem>
              )}
              {onBulkExport && (
                <DropdownMenuItem onClick={onBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
              )}
              {onBulkEmail && (
                <DropdownMenuItem onClick={onBulkEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              )}
              {(onBulkTag || onBulkExport || onBulkEmail) && onBulkDelete && (
                <DropdownMenuSeparator />
              )}
              {onBulkDelete && (
                <DropdownMenuItem onClick={onBulkDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

