"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-5 tracking-[0.28px]">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} size="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}

