"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface DashboardStatCardProps {
  title: string
  value: string | number
  change?: string
  changeLabel?: string
  icon: LucideIcon
  variant?: "default" | "positive" | "negative"
  className?: string
}

export function DashboardStatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  className,
}: DashboardStatCardProps) {
  const changeColor =
    variant === "positive"
      ? "text-[#10b981]"
      : variant === "negative"
      ? "text-[#ef4444]"
      : "text-[#10b981]"

  return (
    <Card
      className={cn(
        "border border-border rounded-[14px] flex-1 group",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground flex-1 leading-[1.5] tracking-[0.28px]">
            {title}
          </p>
          <button className="w-4 h-4 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-semibold text-foreground leading-[1.3]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center gap-2 text-sm font-medium leading-[1.5] tracking-[0.28px]">
              <span className={changeColor}>{change}</span>
              {changeLabel && (
                <span className="text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
