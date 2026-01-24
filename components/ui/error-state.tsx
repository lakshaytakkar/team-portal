"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  supportLink?: {
    label: string
    href: string
  }
  className?: string
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
  supportLink,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-5 tracking-[0.28px]">
        {message}
      </p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" size="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
        {supportLink && (
          <Button
            variant="outline"
            size="default"
            asChild
          >
            <a href={supportLink.href} target="_blank" rel="noopener noreferrer">
              {supportLink.label}
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

