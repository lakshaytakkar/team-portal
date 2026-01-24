"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, TrendingUp, Target, UserPlus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import {
  DashboardStatCard,
  DashboardHeader,
  DashboardChartWidget,
  DashboardTable,
} from "@/components/dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Label } from "recharts"
import {
  salesDashboardStats,
  revenueData,
  pipelineData,
  recentDeals,
  type Deal,
} from "@/lib/data/dashboard/sales-dashboard"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

async function fetchSalesDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    stats: salesDashboardStats,
    revenue: revenueData,
    pipeline: pipelineData,
    deals: recentDeals,
  }
}

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const pipelineChartConfig = {
  Qualified: {
    label: "Qualified",
    color: "var(--chart-1)",
  },
  Proposal: {
    label: "Proposal",
    color: "var(--chart-2)",
  },
  Negotiation: {
    label: "Negotiation",
    color: "var(--chart-3)",
  },
  "Closed Won": {
    label: "Closed Won",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const PIPELINE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

export default function SalesDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["sales-dashboard"],
    queryFn: fetchSalesDashboard,
  })

  const filteredDeals = dashboard?.deals.filter((deal) =>
    deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.company.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalPipelineValue = dashboard?.pipeline.reduce((sum, item) => sum + item.value, 0) || 0

  const dealColumns = [
    { key: "name", label: "Deal Name" },
    { key: "company", label: "Company" },
    {
      key: "value",
      label: "Value",
      render: (deal: Deal) => `$${deal.value.toLocaleString()}`,
    },
    {
      key: "stage",
      label: "Stage",
      render: (deal: Deal) => (
        <Badge variant="outline">{deal.stage}</Badge>
      ),
    },
    { key: "owner", label: "Owner" },
    { key: "closeDate", label: "Close Date" },
  ]

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load sales dashboard"
        message="We couldn't load sales dashboard data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      <DashboardHeader
        title="Dashboard"
        onManageDashboard={() => {}}
        onExport={() => {}}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardStatCard
          title="Total Revenue"
          value={`$${(dashboard?.stats.totalRevenue || 0).toLocaleString()}`}
          change={`+${dashboard?.stats.totalRevenueChange || 0}%`}
          changeLabel="vs last month"
          icon={DollarSign}
          variant="positive"
        />
        <DashboardStatCard
          title="Active Deals"
          value={dashboard?.stats.activeDeals || 0}
          change={`+${dashboard?.stats.activeDealsChange || 0}%`}
          changeLabel="vs last month"
          icon={Target}
          variant="positive"
        />
        <DashboardStatCard
          title="Conversion Rate"
          value={`${dashboard?.stats.conversionRate || 0}%`}
          change={`+${dashboard?.stats.conversionRateChange || 0}%`}
          changeLabel="vs last month"
          icon={TrendingUp}
          variant="positive"
        />
        <DashboardStatCard
          title="New Leads"
          value={dashboard?.stats.newLeads || 0}
          change={`+${dashboard?.stats.newLeadsChange || 0}%`}
          changeLabel="vs last month"
          icon={UserPlus}
          variant="positive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardChartWidget
          title="Revenue Trend"
          timePeriod={{
            value: "monthly",
            options: [
              { label: "Monthly", value: "monthly" },
              { label: "Weekly", value: "weekly" },
            ],
          }}
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <ChartContainer config={revenueChartConfig} className="h-full">
            <LineChart
              data={dashboard?.revenue || []}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </DashboardChartWidget>

        <DashboardChartWidget
          title="Pipeline Distribution"
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-2">
            <ChartContainer config={pipelineChartConfig} className="w-full h-[200px] max-w-[240px] !aspect-square">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={dashboard?.pipeline || []}
                  dataKey="count"
                  nameKey="stage"
                  innerRadius={45}
                  outerRadius={70}
                  strokeWidth={2}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-muted-foreground text-xs"
                            >
                              Total Pipeline
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              ${(totalPipelineValue / 1000).toFixed(0)}k
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                  {(dashboard?.pipeline || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex gap-3 items-center justify-center flex-wrap px-2 pt-1">
              {(dashboard?.pipeline || []).map((item, index) => (
                <div key={item.stage} className="flex gap-1.5 items-center">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIPELINE_COLORS[index % PIPELINE_COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {item.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardChartWidget>
      </div>

      {/* Table */}
      <DashboardTable
        title="Recent Deals"
        columns={dealColumns}
        data={filteredDeals}
        searchPlaceholder="Search deals..."
        onSearch={setSearchQuery}
        onFilter={() => {}}
        onSort={() => {}}
        className="h-[436px]"
      />
    </div>
  )
}
