"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "completed"
  | "in-progress"
  | "not-started"
  | "on-hold"
  | "priority-high"
  | "priority-medium"
  | "priority-low"
  | "neutral"
  | "yellow"
  | "red"
  | "green-outline"
  | "primary-outline"
  | "yellow-outline"
  | "red-outline"
  | "neutral-outline"

export interface DetailQuickTileProps {
  thumbnail?: string | React.ReactNode
  title: string
  subtitle?: string
  metadata?: Array<{ label: string; value: string | React.ReactNode }>
  status?: { label: string; variant: BadgeVariant }
  actions?: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function DetailQuickTile({
  thumbnail,
  title,
  subtitle,
  metadata = [],
  status,
  actions,
  onEdit,
  onDelete,
  className,
}: DetailQuickTileProps) {
  const hasActions = onEdit || onDelete || actions

  return (
    <div
      className={cn(
        "border border-border rounded-2xl p-5 bg-white flex flex-col sm:flex-row gap-4 sm:gap-6",
        className
      )}
    >
      {/* Left: Thumbnail */}
      <div className="shrink-0">
        {typeof thumbnail === "string" ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
            {thumbnail.startsWith("http") || thumbnail.startsWith("/") ? (
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Avatar className="w-full h-full">
                <AvatarImage src={thumbnail} alt={title} />
                <AvatarFallback className="text-lg font-semibold">
                  {title
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
            {thumbnail || (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {title[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-[1.3] mb-1 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] truncate">
                {subtitle}
              </p>
            )}
          </div>
          {status && (
            <Badge variant={status.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium leading-5 shrink-0">
              {status.label}
            </Badge>
          )}
        </div>

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {metadata.map((item, index) => (
              <div key={index} className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                  {item.label}
                </span>
                <span className="text-sm text-foreground font-medium leading-5 tracking-[0.28px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      {hasActions && (
        <div className="shrink-0 flex items-start gap-2">
          {actions}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border border-border rounded-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    {onEdit && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={onDelete} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  )
}

