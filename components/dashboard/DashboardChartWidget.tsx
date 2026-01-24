"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DashboardChartWidgetProps {
  title: string
  children: ReactNode
  timePeriod?: {
    value: string
    options: { label: string; value: string }[]
    onChange?: (value: string) => void
  }
  onRefresh?: () => void
  className?: string
}

export function DashboardChartWidget({
  title,
  children,
  timePeriod,
  onRefresh,
  className,
}: DashboardChartWidgetProps) {
  return (
    <Card
      className={cn(
        "border border-border rounded-[14px] flex flex-col overflow-hidden shadow-[0px_1px_2px_0px_rgba(228,229,231,0.24)]",
        className
      )}
    >
      <div className="border-b border-border h-16 flex items-center justify-between px-5 py-0 relative shrink-0 w-full">
        <h3 className="text-base font-semibold text-foreground leading-[1.5] tracking-[0.32px]">
          {title}
        </h3>
        <div className="flex gap-2.5 items-center relative shrink-0">
          {timePeriod && (
            <Select
              value={timePeriod.value}
              onValueChange={timePeriod.onChange}
            >
              <SelectTrigger className="h-[38px] px-3 pr-3.5 py-2 border-border rounded-[8px] w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timePeriod.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onRefresh && (
            <Button
              variant="secondary"
              size="icon"
              onClick={onRefresh}
              className="h-[38px] w-[38px] border-border rounded-[8px]"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 p-5 relative shrink-0 w-full">{children}</div>
    </Card>
  )
}
