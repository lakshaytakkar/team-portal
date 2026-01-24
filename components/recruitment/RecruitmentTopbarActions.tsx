"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Download, Upload, MoreVertical, Table2, LayoutGrid, Calendar, List } from "lucide-react"
import type { Action } from "@/lib/utils/actions"
import { cn } from "@/lib/utils"

export type ViewMode = "table" | "kanban" | "calendar" | "timeline"

export interface RecruitmentTopbarActionsProps {
  primary: Action[]
  secondary: Action[]
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  availableViewModes?: ViewMode[]
  className?: string
}

export function RecruitmentTopbarActions({
  primary,
  secondary,
  viewMode = "table",
  onViewModeChange,
  availableViewModes = ["table"],
  className,
}: RecruitmentTopbarActionsProps) {
  const getActionIcon = (type: Action['type']) => {
    switch (type) {
      case 'create':
        return Plus
      case 'export':
        return Download
      case 'import':
        return Upload
      default:
        return null
    }
  }

  const getViewIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'table':
        return Table2
      case 'kanban':
        return LayoutGrid
      case 'calendar':
        return Calendar
      case 'timeline':
        return List
      default:
        return Table2
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

  // View mode toggle buttons
  const viewModeButtons = availableViewModes.length > 1 && (
    <div className="flex items-center gap-1 border border-border rounded-lg p-1">
      {availableViewModes.map((mode) => {
        const Icon = getViewIcon(mode)
        const isActive = viewMode === mode
        return (
          <Button
            key={mode}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange?.(mode)}
            className={cn("h-8 px-3", isActive && "bg-primary text-primary-foreground")}
            title={`Switch to ${mode} view`}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{mode}</span>
          </Button>
        )
      })}
    </div>
  )

  // If there are many secondary actions, group some in a dropdown
  const visibleSecondary = secondaryActions.slice(0, 2)
  const remainingSecondary = secondaryActions.slice(2)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Primary Actions */}
      {primaryActions}

      {/* View Mode Toggle */}
      {viewModeButtons}

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
            {secondary.slice(2).map((action) => (
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

