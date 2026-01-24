"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface DetailPageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  onBack: () => void
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  title?: string
  className?: string
}

export function DetailPageHeader({
  breadcrumbs,
  onBack,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  title,
  className,
}: DetailPageHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn("flex items-center justify-between mb-5", className)}>
      {/* Left: Breadcrumbs with Back Icon */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 shrink-0 border border-border rounded-lg hover:bg-muted"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium tracking-[0.28px] min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-muted-foreground/40 font-normal">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    index === breadcrumbs.length - 1
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        {title && (
          <>
            <span className="text-muted-foreground/40 font-normal">/</span>
            <span className="text-foreground font-semibold truncate">{title}</span>
          </>
        )}
      </div>

      {/* Right: Next/Prev Navigation */}
      {(hasNext || hasPrev) && (
        <div className="flex items-center gap-2 shrink-0 ml-4">
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
      )}
    </div>
  )
}

