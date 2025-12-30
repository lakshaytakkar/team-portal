"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import {
  DashboardHeader,
  DashboardTable,
} from "@/components/dashboard"
import { BusinessOverview } from "@/components/dashboard/BusinessOverview"
import { RisksAlerts } from "@/components/dashboard/RisksAlerts"
import { GrowthEngines } from "@/components/dashboard/GrowthEngines"
import { ARRGrowthChart } from "@/components/dashboard/ARRGrowthChart"
import {
  getBusinessOverviewMetrics,
  getRisksAndAlerts,
  getGrowthEngines,
  getRevenueTrends,
} from "@/lib/actions/ceo-dashboard"
import { recentActivities, type Activity } from "@/lib/data/dashboard/main-dashboard"
import { Badge } from "@/components/ui/badge"

async function fetchDashboardData() {
  const [metrics, alerts, engines, trends] = await Promise.all([
    getBusinessOverviewMetrics(),
    getRisksAndAlerts(),
    getGrowthEngines(),
    getRevenueTrends('monthly'),
  ])

  return {
    metrics,
    alerts,
    engines,
    trends,
    activities: recentActivities, // Keep mock data for now, can be replaced later
  }
}

export default function CeoDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("ytd")

  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["ceo-dashboard", timePeriod],
    queryFn: fetchDashboardData,
    refetchOnWindowFocus: false,
  })

  const filteredActivities = dashboard?.activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

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

  if (isLoading) {
    return (
      <div className="space-y-5" data-dashboard-content>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load dashboard data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!dashboard) {
    return (
      <ErrorState
        title="No data available"
        message="Dashboard data is not available at this time."
        onRetry={() => refetch()}
      />
    )
  }

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
      <BusinessOverview metrics={dashboard.metrics} />

      {/* Risks & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RisksAlerts alerts={dashboard.alerts} />
        <div className="lg:col-span-2">
          <ARRGrowthChart trends={dashboard.trends} onRefresh={() => refetch()} />
        </div>
      </div>

      {/* Growth Engines */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Growth Engines</h3>
        <GrowthEngines engines={dashboard.engines} />
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
