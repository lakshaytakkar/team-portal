"use client"

import { TrendingUp, Users, DollarSign, Briefcase, Target, Activity as ActivityIcon } from "lucide-react"
import { DashboardStatCard } from "./DashboardStatCard"
import type { BusinessOverviewMetrics } from "@/lib/types/ceo-dashboard"

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <DashboardStatCard
        title="ARR"
        value={formatCurrency(metrics.arr.current)}
        change={formatChange(metrics.arr.change)}
        changeLabel={metrics.arr.changeLabel}
        icon={DollarSign}
        variant={metrics.arr.change >= 0 ? "positive" : "negative"}
      />
      <DashboardStatCard
        title="MRR"
        value={formatCurrency(metrics.mrr.current)}
        change={formatChange(metrics.mrr.change)}
        changeLabel={metrics.mrr.changeLabel}
        icon={DollarSign}
        variant={metrics.mrr.change >= 0 ? "positive" : "negative"}
      />
      <DashboardStatCard
        title="CUSTOMER GROWTH"
        value={metrics.customerGrowth.current.toLocaleString()}
        change={formatChange(metrics.customerGrowth.change)}
        changeLabel={metrics.customerGrowth.changeLabel}
        icon={Users}
        variant={metrics.customerGrowth.change >= 0 ? "positive" : "negative"}
      />
      <DashboardStatCard
        title="EMPLOYEE GROWTH"
        value={metrics.employeeGrowth.current.toLocaleString()}
        change={formatChange(metrics.employeeGrowth.change)}
        changeLabel={metrics.employeeGrowth.changeLabel}
        icon={Users}
        variant={metrics.employeeGrowth.change >= 0 ? "positive" : "negative"}
      />
      <DashboardStatCard
        title="PROJECT HEALTH"
        value={`${metrics.projectHealth.score.toFixed(0)}%`}
        change={`${metrics.projectHealth.onTrack}/${metrics.projectHealth.total} on track`}
        changeLabel={`${metrics.projectHealth.atRisk} at risk`}
        icon={Briefcase}
        variant={metrics.projectHealth.score >= 70 ? "positive" : metrics.projectHealth.score >= 50 ? "default" : "negative"}
      />
      <DashboardStatCard
        title="TEAM PRODUCTIVITY"
        value={`${metrics.teamProductivity.current.toFixed(1)}%`}
        change={formatChange(metrics.teamProductivity.change)}
        changeLabel={metrics.teamProductivity.changeLabel}
        icon={ActivityIcon}
        variant={metrics.teamProductivity.change >= 0 ? "positive" : "negative"}
      />
    </div>
  )
}

