"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CATEGORY_LABELS } from "@/lib/utils/sidebar-context"

interface CategoryTabsProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-lg",
            activeCategory === category
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          {CATEGORY_LABELS[category] || category}
        </button>
      ))}
    </div>
  )
}



