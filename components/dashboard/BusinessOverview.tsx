"use client"

import { TrendingUp, Users, DollarSign, Briefcase, Target, Activity as ActivityIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { BusinessOverviewMetrics } from "@/lib/types/ceo-dashboard"
import { cn } from "@/lib/utils"

interface BusinessOverviewProps {
  metrics: BusinessOverviewMetrics
}

export function BusinessOverview({ metrics }: BusinessOverviewProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          ARR
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {formatCurrency(metrics.arr.current)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className={cn(
                metrics.arr.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              )}>
                {formatChange(metrics.arr.change)}
              </span>
              <span className="ml-1">{metrics.arr.changeLabel}</span>
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          MRR
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {formatCurrency(metrics.mrr.current)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className={cn(
                metrics.mrr.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              )}>
                {formatChange(metrics.mrr.change)}
              </span>
              <span className="ml-1">{metrics.mrr.changeLabel}</span>
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Customer Growth
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {metrics.customerGrowth.current.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className={cn(
                metrics.customerGrowth.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              )}>
                {formatChange(metrics.customerGrowth.change)}
              </span>
              <span className="ml-1">{metrics.customerGrowth.changeLabel}</span>
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Employee Growth
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {metrics.employeeGrowth.current.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className={cn(
                metrics.employeeGrowth.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              )}>
                {formatChange(metrics.employeeGrowth.change)}
              </span>
              <span className="ml-1">{metrics.employeeGrowth.changeLabel}</span>
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Project Health
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {metrics.projectHealth.score.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {metrics.projectHealth.onTrack}/{metrics.projectHealth.total} on track
              {metrics.projectHealth.atRisk > 0 && (
                <span className="ml-1 text-[#ef4444]">• {metrics.projectHealth.atRisk} at risk</span>
              )}
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Team Productivity
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex flex-col">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {metrics.teamProductivity.current.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className={cn(
                metrics.teamProductivity.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              )}>
                {formatChange(metrics.teamProductivity.change)}
              </span>
              <span className="ml-1">{metrics.teamProductivity.changeLabel}</span>
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <ActivityIcon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  )
}

