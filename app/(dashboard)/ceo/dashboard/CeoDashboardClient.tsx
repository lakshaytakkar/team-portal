"use client"

import { useState } from "react"
import {
  DashboardHeader,
  DashboardTable,
} from "@/components/dashboard"
import { BusinessOverview } from "@/components/dashboard/BusinessOverview"
import { RisksAlerts } from "@/components/dashboard/RisksAlerts"
import { GrowthEngines } from "@/components/dashboard/GrowthEngines"
import { ARRGrowthChart } from "@/components/dashboard/ARRGrowthChart"
import { recentActivities, type Activity } from "@/lib/data/dashboard/main-dashboard"
import { Badge } from "@/components/ui/badge"
import type {
  BusinessOverviewMetrics,
  RiskAlert,
  GrowthEngine,
  RevenueTrends,
} from "@/lib/types/ceo-dashboard"

interface CeoDashboardClientProps {
  metrics: BusinessOverviewMetrics
  alerts: RiskAlert[]
  engines: GrowthEngine[]
  trends: RevenueTrends
}

export function CeoDashboardClient({
  metrics,
  alerts,
  engines,
  trends,
}: CeoDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("ytd")

  const filteredActivities = recentActivities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activityColumns = [
    {
      key: "type",
      label: "Type",
      render: (activity: Activity) => (
        <Badge variant="outline" className="capitalize">
          {activity.type}
        </Badge>
      ),
    },
    { key: "title", label: "Title" },
    { key: "assignee", label: "Assignee" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
  ]

  return (
    <div className="space-y-5" data-dashboard-content>
      <DashboardHeader
        title="Business Overview"
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: 'CEO Dashboard',
              text: 'Check out this dashboard',
              url: window.location.href,
            }).catch(() => {})
          } else {
            navigator.clipboard.writeText(window.location.href)
          }
        }}
        onExport={() => {
          console.log('Export dashboard')
        }}
      />

      {/* Business Overview KPIs */}
      <BusinessOverview metrics={metrics} />

      {/* Risks & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RisksAlerts alerts={alerts} />
        <div className="lg:col-span-2">
          <ARRGrowthChart trends={trends} />
        </div>
      </div>

      {/* Growth Engines */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Growth Engines</h3>
        <GrowthEngines engines={engines} />
      </div>

      {/* Recent Activities Table */}
      <DashboardTable
        title="Recent Company Activities"
        columns={activityColumns}
        data={filteredActivities}
        searchPlaceholder="Search activities..."
        onSearch={setSearchQuery}
        onFilter={() => {}}
        onSort={() => {}}
        className="h-[436px]"
      />
    </div>
  )
}

