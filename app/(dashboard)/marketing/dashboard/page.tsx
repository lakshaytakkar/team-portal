"use client"

import { useQuery } from "@tanstack/react-query"
import { Target, Mail, TrendingUp, Users } from "lucide-react"
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
  marketingDashboardStats,
  campaignPerformanceData,
  campaignTypeData,
  recentCampaigns,
  type Campaign,
} from "@/lib/data/dashboard/marketing-dashboard"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

async function fetchMarketingDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    stats: marketingDashboardStats,
    performance: campaignPerformanceData,
    types: campaignTypeData,
    campaigns: recentCampaigns,
  }
}

const performanceChartConfig = {
  opens: {
    label: "Opens",
    color: "var(--chart-1)",
  },
  conversions: {
    label: "Conversions",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const typeChartConfig = {
  Email: {
    label: "Email",
    color: "var(--chart-1)",
  },
  WhatsApp: {
    label: "WhatsApp",
    color: "var(--chart-2)",
  },
  "Social Media": {
    label: "Social Media",
    color: "var(--chart-3)",
  },
  Content: {
    label: "Content",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const TYPE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

export default function MarketingDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["marketing-dashboard"],
    queryFn: fetchMarketingDashboard,
  })

  const filteredCampaigns = dashboard?.campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalCampaigns = dashboard?.types.reduce((sum, item) => sum + item.count, 0) || 0

  const campaignColumns = [
    { key: "name", label: "Campaign Name" },
    {
      key: "type",
      label: "Type",
      render: (campaign: Campaign) => (
        <Badge variant="outline">{campaign.type}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (campaign: Campaign) => (
        <Badge variant={campaign.status === "Active" ? "completed" : "neutral"}>
          {campaign.status}
        </Badge>
      ),
    },
    {
      key: "openRate",
      label: "Open Rate",
      render: (campaign: Campaign) => `${campaign.openRate}%`,
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      render: (campaign: Campaign) => `${campaign.conversionRate}%`,
    },
    {
      key: "leadsGenerated",
      label: "Leads Generated",
      render: (campaign: Campaign) => campaign.leadsGenerated,
    },
    { key: "startDate", label: "Start Date" },
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
        title="Failed to load marketing dashboard"
        message="We couldn't load marketing dashboard data. Please check your connection and try again."
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
          title="Active Campaigns"
          value={dashboard?.stats.activeCampaigns || 0}
          change={`+${dashboard?.stats.activeCampaignsChange || 0}%`}
          changeLabel="vs last month"
          icon={Target}
          variant="positive"
        />
        <DashboardStatCard
          title="Email Open Rate"
          value={`${dashboard?.stats.emailOpenRate || 0}%`}
          change={`+${dashboard?.stats.emailOpenRateChange || 0}%`}
          changeLabel="vs last month"
          icon={Mail}
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
          title="Total Leads Generated"
          value={dashboard?.stats.totalLeadsGenerated || 0}
          change={`+${dashboard?.stats.totalLeadsGeneratedChange || 0}%`}
          changeLabel="vs last month"
          icon={Users}
          variant="positive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardChartWidget
          title="Campaign Performance"
          timePeriod={{
            value: "weekly",
            options: [
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ],
          }}
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <ChartContainer config={performanceChartConfig} className="h-full">
            <LineChart
              data={dashboard?.performance || []}
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
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="opens"
                stroke="var(--color-opens)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="var(--color-conversions)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </DashboardChartWidget>

        <DashboardChartWidget
          title="Campaign Type Distribution"
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-2">
            <ChartContainer config={typeChartConfig} className="w-full h-[200px] max-w-[240px] !aspect-square">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={dashboard?.types || []}
                  dataKey="count"
                  nameKey="type"
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
                              Total Campaigns
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {totalCampaigns}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                  {(dashboard?.types || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex gap-3 items-center justify-center flex-wrap px-2 pt-1">
              {(dashboard?.types || []).map((item, index) => (
                <div key={item.type} className="flex gap-1.5 items-center">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[index % TYPE_COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardChartWidget>
      </div>

      {/* Table */}
      <DashboardTable
        title="Recent Campaigns"
        columns={campaignColumns}
        data={filteredCampaigns}
        searchPlaceholder="Search campaigns..."
        onSearch={setSearchQuery}
        onFilter={() => {}}
        onSort={() => {}}
        className="h-[436px]"
      />
    </div>
  )
}
