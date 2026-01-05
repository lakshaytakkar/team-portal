"use client"

import { TableHead } from "@/components/ui/table"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableTableHeaderProps {
  label: string
  sortKey: string
  currentSortBy: string
  currentSortOrder: "asc" | "desc"
  onSort: (sortKey: string) => void
  className?: string
}

export function SortableTableHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSortBy === sortKey

  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4 text-primary" />
          ) : (
            <ArrowDown className="h-4 w-4 text-primary" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
        )}
      </div>
    </TableHead>
  )
}
