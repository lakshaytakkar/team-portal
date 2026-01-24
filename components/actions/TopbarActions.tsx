"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Plus, Download, Upload, Settings } from "lucide-react"
import type { Action } from "@/lib/utils/actions"
import { cn } from "@/lib/utils"

export interface TopbarActionsProps {
  primary: Action[]
  secondary: Action[]
  className?: string
}

export function TopbarActions({
  primary,
  secondary,
  className,
}: TopbarActionsProps) {
  const getActionIcon = (type: Action['type']) => {
    switch (type) {
      case 'create':
        return Plus
      case 'export':
        return Download
      case 'import':
        return Upload
      case 'bulk-update':
        return Settings
      default:
        return null
    }
  }

  // Render primary actions (prominent buttons)
  const primaryActions = primary.map((action) => {
    const Icon = getActionIcon(action.type)
    return (
      <Button
        key={action.id}
        onClick={action.onClick}
        variant={action.variant || 'default'}
        className={cn(action.type === 'create' && "gap-2")}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {action.label}
      </Button>
    )
  })

  // Render secondary actions (icon buttons or dropdown)
  const secondaryActions = secondary.map((action) => {
    const Icon = getActionIcon(action.type)
    if (!Icon) return null

    // For export, import, and other icon actions, render as icon button
    if (action.type === 'export' || action.type === 'import') {
      return (
        <Button
          key={action.id}
          variant="outline"
          size="icon"
          onClick={action.onClick}
          title={action.label}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{action.label}</span>
        </Button>
      )
    }

    // For bulk actions, render in dropdown
    return (
      <Button
        key={action.id}
        variant="outline"
        onClick={action.onClick}
      >
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {action.label}
      </Button>
    )
  })

  // If there are many secondary actions, group some in a dropdown
  const visibleSecondary = secondaryActions.slice(0, 3)
  const remainingSecondary = secondaryActions.slice(3)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Primary Actions */}
      {primaryActions}

      {/* Secondary Actions */}
      {visibleSecondary}

      {/* More Actions Dropdown */}
      {remainingSecondary.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {secondary.slice(3).map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

