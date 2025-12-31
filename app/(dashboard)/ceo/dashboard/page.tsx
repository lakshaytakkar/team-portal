import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getBusinessOverviewMetrics,
  getRisksAndAlerts,
  getGrowthEngines,
  getRevenueTrends,
} from "@/lib/actions/ceo-dashboard"
import { CeoDashboardClient } from "./CeoDashboardClient"

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
  }
}

function DashboardSkeleton() {
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

async function DashboardContent() {
  const dashboard = await fetchDashboardData()

  return (
    <CeoDashboardClient
      metrics={dashboard.metrics}
      alerts={dashboard.alerts}
      engines={dashboard.engines}
      trends={dashboard.trends}
    />
  )
}

export default function CeoDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
