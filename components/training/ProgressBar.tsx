"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showLabel?: boolean
  variant?: "default" | "success"
}

export function ProgressBar({
  progress,
  className,
  showLabel = false,
  variant = "default",
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium text-foreground">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-l-full transition-all",
            variant === "success" || clampedProgress === 100
              ? "bg-status-completed-foreground"
              : "bg-primary"
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}

