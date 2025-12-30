"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ApplicationStatus, InterviewStatus } from "@/lib/types/recruitment"
import type { CandidateStatus } from "@/lib/types/candidate"

export interface StatusFlowIndicatorProps {
  currentStatus: CandidateStatus | ApplicationStatus | InterviewStatus
  statuses: Array<{ value: string; label: string }>
  className?: string
}

export function StatusFlowIndicator({
  currentStatus,
  statuses,
  className,
}: StatusFlowIndicatorProps) {
  const currentIndex = statuses.findIndex((s) => s.value === currentStatus)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {statuses.map((status, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isUpcoming = index > currentIndex

        return (
          <div key={status.value} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary",
                  isCurrent && "bg-primary/20 border-primary",
                  isUpcoming && "bg-muted border-border"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Circle className={cn("h-5 w-5", isCurrent && "text-primary", isUpcoming && "text-muted-foreground")} />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCompleted && "text-foreground",
                  isCurrent && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {status.label}
              </span>
            </div>
            {index < statuses.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 mx-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

