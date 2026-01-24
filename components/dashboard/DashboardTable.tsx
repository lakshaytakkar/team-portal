"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface Column<T> {
  key: string
  label: string
  render?: (item: T, index: number) => ReactNode
  className?: string
}

interface DashboardTableProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onFilter?: () => void
  onSort?: () => void
  className?: string
}

export function DashboardTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  searchPlaceholder = "Search",
  onSearch,
  onFilter,
  onSort,
  className,
}: DashboardTableProps<T>) {
  return (
    <Card
      className={cn(
        "border border-border rounded-[14px] flex flex-col overflow-hidden shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-5 py-2 relative shrink-0 w-full">
        <h3 className="text-base font-semibold text-foreground leading-[1.5] tracking-[0.32px]">
          {title}
        </h3>
        <div className="flex gap-2.5 items-center relative shrink-0">
          {onSearch && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10 h-[38px] border-border rounded-[8px]"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          {onFilter && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onFilter}
              className="h-[38px] px-3 pr-3.5 py-2 gap-2 border-border rounded-[8px]"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium leading-[1.5] tracking-[0.28px]">
                Filter
              </span>
            </Button>
          )}
          {onSort && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSort}
              className="h-[38px] px-3 pr-3.5 py-2 gap-2 border-border rounded-[8px]"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-sm font-medium leading-[1.5] tracking-[0.28px]">
                Sort by
              </span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start relative shrink-0 w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "h-10 px-3 py-0 text-sm font-medium text-muted-foreground leading-[1.5] tracking-[0.28px]",
                    column.className
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  className="border-b border-border h-16 hover:bg-muted/30"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "px-3 py-0 text-sm font-medium text-foreground leading-[1.5] tracking-[0.28px]",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(item, index)
                        : item[column.key] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
