"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { CheckSquare, Briefcase, Phone, Clock, Users, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import {
  DashboardStatCard,
  DashboardHeader,
  DashboardChartWidget,
  DashboardTable,
  ExecutiveKPIs,
  QuickLinks,
  RecentActivity,
} from "@/components/dashboard"
import { useUserContext } from "@/lib/providers/UserContextProvider"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import {
  mainDashboardStats,
  taskCompletionData,
  projectStatusData,
  recentActivities,
  type Activity,
} from "@/lib/data/dashboard/main-dashboard"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

async function fetchMainDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    stats: mainDashboardStats,
    taskData: taskCompletionData,
    projectData: projectStatusData,
    activities: recentActivities,
  }
}

const taskChartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-4)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const projectChartConfig = {
  Active: {
    label: "Active",
    color: "var(--chart-2)",
  },
  Completed: {
    label: "Completed",
    color: "var(--chart-4)",
  },
  "On Hold": {
    label: "On Hold",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const COLORS = [
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-3)",
]

export default function MainDashboardPage() {
  const router = useRouter()
  const { user } = useUserContext()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Redirect superadmin/CEO to /explore
  useEffect(() => {
    if (user?.isSuperadmin) {
      router.replace('/explore')
    }
  }, [user, router])
  
  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["main-dashboard"],
    queryFn: fetchMainDashboard,
  })

  const filteredActivities = dashboard?.activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Transform activities for RecentActivity component
  const recentActivitiesData = filteredActivities.map((activity) => ({
    id: activity.id || Math.random().toString(),
    type: activity.type as "task" | "project" | "call" | "leave" | "employee" | "deal",
    title: activity.title,
    description: activity.assignee ? `Assigned to ${activity.assignee}` : undefined,
    status: activity.status,
    assignee: activity.assignee,
    timestamp: activity.date ? new Date(activity.date) : new Date(),
    href: activity.href,
  }))

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
        title="Failed to load dashboard"
        message="We couldn't load dashboard data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  // Role-based stats (defaulting to Executive view for now)
  const stats = dashboard?.stats

  // Don't render dashboard for superadmin (redirecting to /explore)
  if (user?.isSuperadmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={user?.isSuperadmin ? "Executive Dashboard" : "Dashboard"}
        onManageDashboard={() => {}}
        onExport={() => {}}
      />

      {/* Executive KPIs - For superadmin */}
      {user?.isSuperadmin ? (
        <ExecutiveKPIs
          data={{
            revenue: {
              value: "$0",
              change: "+0%",
              changeLabel: "vs last month",
            },
            employees: {
              value: stats?.myTasks || 0,
              change: "+0%",
              changeLabel: "total",
            },
            projects: {
              value: stats?.myProjects || 0,
              change: "+0%",
              changeLabel: "active",
            },
            tasks: {
              value: stats?.myTasks || 0,
              change: "+0%",
              changeLabel: "total",
            },
            activeProjects: {
              value: stats?.myProjects || 0,
              change: "+0%",
              changeLabel: "active",
            },
            completionRate: {
              value: "0%",
              change: "+0%",
              changeLabel: "this month",
            },
          }}
          isLoading={isLoading}
        />
      ) : (
        /* Regular Stat Cards - For employees */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardStatCard
            title="My Tasks"
            value={stats?.myTasks || 0}
            change={`+${stats?.myTasksChange || 0}%`}
            changeLabel="vs last month"
            icon={CheckSquare}
            variant="positive"
          />
          <DashboardStatCard
            title="My Projects"
            value={stats?.myProjects || 0}
            change={`+${stats?.myProjectsChange || 0}%`}
            changeLabel="vs last month"
            icon={Briefcase}
            variant="positive"
          />
          <DashboardStatCard
            title="My Calls"
            value={stats?.myCalls || 0}
            change={`+${stats?.myCallsChange || 0}%`}
            changeLabel="vs last month"
            icon={Phone}
            variant="positive"
          />
          <DashboardStatCard
            title="Attendance"
            value={stats?.myAttendance || "Present"}
            change={`${stats?.myAttendanceChange || 0}%`}
            changeLabel="this month"
            icon={Clock}
            variant="positive"
          />
        </div>
      )}

      {/* Quick Links */}
      <QuickLinks maxItems={user?.isSuperadmin ? 15 : 8} />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardChartWidget
          title="Task Completion"
          timePeriod={{
            value: "monthly",
            options: [
              { label: "Monthly", value: "monthly" },
              { label: "Weekly", value: "weekly" },
              { label: "Daily", value: "daily" },
            ],
          }}
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <ChartContainer config={taskChartConfig} className="h-full">
            <LineChart
              data={dashboard?.taskData || []}
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
                dataKey="completed"
                stroke="var(--color-completed)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="var(--color-pending)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </DashboardChartWidget>

        <DashboardChartWidget
          title="Project Status"
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-2">
            <ChartContainer config={projectChartConfig} className="w-full h-[200px] max-w-[240px] !aspect-square">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={dashboard?.projectData || []}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={45}
                  outerRadius={70}
                  strokeWidth={2}
                >
                  {(dashboard?.projectData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex gap-3 items-center justify-center flex-wrap px-2 pt-1">
              {(dashboard?.projectData || []).map((item, index) => (
                <div key={item.status} className="flex gap-1.5 items-center">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardChartWidget>
          </div>
        </div>
        <RecentActivity
          activities={recentActivitiesData}
          isLoading={isLoading}
          maxItems={5}
        />
      </div>
    </div>
  )
}
