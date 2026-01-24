"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SearchNoResultsProps {
  query: string
  onClear?: () => void
  className?: string
}

export function SearchNoResults({
  query,
  onClear,
  className,
}: SearchNoResultsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
        No results found
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-5 tracking-[0.28px]">
        No results found for <span className="font-medium">"{query}"</span>. Try
        adjusting your search or filters.
      </p>
      {onClear && (
        <Button onClick={onClear} variant="outline" size="default">
          <X className="h-4 w-4 mr-2" />
          Clear Search
        </Button>
      )}
    </div>
  )
}

