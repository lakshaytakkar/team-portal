"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserPlus, TrendingUp, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { initialEmployees } from "@/lib/data/hr"

async function fetchHrSummary() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    totalEmployees: initialEmployees.length,
    newHires: initialEmployees.filter(e => {
      const hireDate = new Date(e.hireDate)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return hireDate > monthAgo
    }).length,
    avgTenure: 2.5,
    departments: [...new Set(initialEmployees.map(e => e.department))].length,
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function CeoHrSummaryPage() {
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ["hr-summary"],
    queryFn: fetchHrSummary,
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
                <Skeleton className="h-8 w-32" />
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
        title="Failed to load HR summary"
        message="We couldn't load HR summary data. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">HR Summary</h1>
            <p className="text-xs text-white/90 mt-0.5">HR department summary and metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={(summary?.totalEmployees || 0).toString()}
          icon={Users}
        />
        <StatCard
          title="New Hires (30 days)"
          value={(summary?.newHires || 0).toString()}
          icon={UserPlus}
        />
        <StatCard
          title="Avg Tenure (years)"
          value={(summary?.avgTenure || 0).toFixed(1)}
          icon={Clock}
        />
        <StatCard
          title="Departments"
          value={(summary?.departments || 0).toString()}
          icon={TrendingUp}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-base font-medium text-muted-foreground mb-2">HR Department Summary</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive HR metrics and executive insights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
