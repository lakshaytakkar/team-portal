"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, MousePointerClick, Globe, MoreVertical } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { initialWebsiteTraffic } from "@/lib/data/analytics"

async function fetchAnalytics() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const traffic = initialWebsiteTraffic[0]
  return {
    totalVisitors: 1250,
    totalPageViews: 3420,
    totalSessions: 1380,
    avgBounceRate: 32.5,
  }
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  changeLabel: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-foreground leading-[1.35]">
            {value}
          </p>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="text-[#10b981] font-medium">{change}</span>
            <span className="text-muted-foreground font-medium">{changeLabel}</span>
          </div>
        </div>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function AnalyticsDashboardPage() {
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: fetchAnalytics,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load analytics"
        message="We couldn't load analytics data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Analytics Dashboard</h1>
            <p className="text-xs text-white/90 mt-0.5">Overview dashboard for all managed websites</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Visitors"
          value={analytics?.totalVisitors.toLocaleString() || "0"}
          change="+12.5%"
          changeLabel="vs last month"
          icon={Users}
        />
        <StatCard
          title="Page Views"
          value={analytics?.totalPageViews.toLocaleString() || "0"}
          change="+8.2%"
          changeLabel="vs last month"
          icon={MousePointerClick}
        />
        <StatCard
          title="Sessions"
          value={analytics?.totalSessions.toLocaleString() || "0"}
          change="+10.1%"
          changeLabel="vs last month"
          icon={Globe}
        />
        <StatCard
          title="Avg Bounce Rate"
          value={`${analytics?.avgBounceRate.toFixed(1) || "0"}%`}
          change="−2.3%"
          changeLabel="vs last month"
          icon={TrendingUp}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-base font-medium text-muted-foreground mb-2">
              Analytics Dashboard
            </p>
            <p className="text-sm text-muted-foreground">
              Multi-website dashboard with overview metrics and quick insights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
