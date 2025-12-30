"use client"

import { Button } from "@/components/ui/button"
import { Settings, FileDown, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DashboardHeaderProps {
  title: string
  onManageDashboard?: () => void
  onExport?: () => void
  onShare?: () => void
  timePeriod?: string
  onTimePeriodChange?: (period: string) => void
  className?: string
}

export function DashboardHeader({
  title,
  onManageDashboard,
  onExport,
  onShare,
  timePeriod,
  onTimePeriodChange,
  className,
}: DashboardHeaderProps) {
  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Default export behavior
      const data = document.querySelector('[data-dashboard-content]')
      // You can implement PDF/CSV export here
      console.log('Export dashboard data')
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: title,
          text: 'Check out this dashboard',
          url: window.location.href,
        }).catch(() => {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href)
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
      }
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between relative shrink-0 w-full flex-wrap gap-3",
        className
      )}
    >
      <h2 className="text-xl font-semibold text-foreground leading-[1.35] tracking-[0.32px]">
        {title}
      </h2>
      <div className="flex gap-3 items-center relative shrink-0 flex-wrap">
        {timePeriod !== undefined && onTimePeriodChange && (
          <Select value={timePeriod} onValueChange={onTimePeriodChange}>
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        )}
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-10 px-4 py-2 gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-semibold leading-[1.5] tracking-[0.28px]">
              Share
            </span>
          </Button>
        )}
        {(onExport || onExport === undefined) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-10 px-4 py-2 gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span className="text-sm font-semibold leading-[1.5] tracking-[0.28px]">
              Download
            </span>
          </Button>
        )}
        {onManageDashboard && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onManageDashboard}
            className="h-10 px-4 py-2 gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm font-semibold leading-[1.5] tracking-[0.28px]">
              Manage Dashboard
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
