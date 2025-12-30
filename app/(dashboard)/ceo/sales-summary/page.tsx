"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { initialDeals, initialLeads } from "@/lib/data/sales"

async function fetchSalesSummary() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const totalRevenue = initialDeals.reduce((sum, deal) => sum + (deal.stage === "closed-won" ? deal.value : 0), 0)
  const pipelineValue = initialDeals.filter(d => !d.stage.startsWith("closed")).reduce((sum, deal) => sum + deal.value, 0)
  return {
    totalRevenue,
    pipelineValue,
    totalLeads: initialLeads.length,
    qualifiedLeads: initialLeads.filter(l => l.status === "qualified").length,
    conversionRate: 34.2,
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

export default function CeoSalesSummaryPage() {
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ["sales-summary"],
    queryFn: fetchSalesSummary,
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
        title="Failed to load sales summary"
        message="We couldn't load sales summary data. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Sales Summary</h1>
            <p className="text-xs text-white/90 mt-0.5">Sales department summary and metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(summary?.totalRevenue || 0).toLocaleString("en-US")}`}
          icon={DollarSign}
        />
        <StatCard
          title="Pipeline Value"
          value={`$${(summary?.pipelineValue || 0).toLocaleString("en-US")}`}
          icon={Target}
        />
        <StatCard
          title="Total Leads"
          value={(summary?.totalLeads || 0).toString()}
          icon={Users}
        />
        <StatCard
          title="Conversion Rate"
          value={`${summary?.conversionRate || 0}%`}
          icon={TrendingUp}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-base font-medium text-muted-foreground mb-2">Sales Department Summary</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive sales metrics and executive insights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
