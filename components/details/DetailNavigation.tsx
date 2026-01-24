"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DetailNavigationProps {
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  currentIndex?: number
  totalItems?: number
  className?: string
}

export function DetailNavigation({
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  currentIndex,
  totalItems,
  className,
}: DetailNavigationProps) {
  if (!hasNext && !hasPrev) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {currentIndex !== undefined && totalItems !== undefined && (
        <span className="text-sm text-muted-foreground font-medium mr-2">
          {currentIndex + 1} of {totalItems}
        </span>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={!hasPrev}
        className="h-9 w-9 border border-border rounded-lg"
        aria-label="Previous item"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!hasNext}
        className="h-9 w-9 border border-border rounded-lg"
        aria-label="Next item"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

