"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, Briefcase, CheckSquare, Activity } from "lucide-react"
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
  managerDashboardStats,
  performanceData,
  taskStatusData,
  teamMembers,
  type TeamMember,
} from "@/lib/data/dashboard/manager-dashboard"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

async function fetchManagerDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    stats: managerDashboardStats,
    performance: performanceData,
    taskStatus: taskStatusData,
    members: teamMembers,
  }
}

const performanceChartConfig = {
  productivity: {
    label: "Productivity",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const taskStatusChartConfig = {
  Completed: {
    label: "Completed",
    color: "var(--chart-4)",
  },
  "In Progress": {
    label: "In Progress",
    color: "var(--chart-2)",
  },
  Pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  Blocked: {
    label: "Blocked",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const TASK_COLORS = [
  "var(--chart-4)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
]

export default function ManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: fetchManagerDashboard,
  })

  const filteredMembers = dashboard?.members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalTasks = dashboard?.taskStatus.reduce((sum, item) => sum + item.count, 0) || 0

  const memberColumns = [
    {
      key: "name",
      label: "Team Member",
      render: (member: TeamMember) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {member.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{member.name}</span>
            <span className="text-xs text-muted-foreground">{member.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: "projects",
      label: "Projects",
      render: (member: TeamMember) => <span className="text-sm">{member.projects}</span>,
    },
    {
      key: "tasksCompleted",
      label: "Tasks Completed",
      render: (member: TeamMember) => <span className="text-sm">{member.tasksCompleted}</span>,
    },
    {
      key: "productivity",
      label: "Productivity",
      render: (member: TeamMember) => (
        <span className="text-sm font-medium">{member.productivity}%</span>
      ),
    },
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
        title="Failed to load manager dashboard"
        message="We couldn't load manager dashboard data. Please check your connection and try again."
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
          title="Team Size"
          value={dashboard?.stats.teamSize || 0}
          change={`+${dashboard?.stats.teamSizeChange || 0}%`}
          changeLabel="vs last month"
          icon={Users}
          variant="positive"
        />
        <DashboardStatCard
          title="Active Projects"
          value={dashboard?.stats.activeProjects || 0}
          change={`+${dashboard?.stats.activeProjectsChange || 0}%`}
          changeLabel="vs last month"
          icon={Briefcase}
          variant="positive"
        />
        <DashboardStatCard
          title="Tasks Completed"
          value={dashboard?.stats.tasksCompleted || 0}
          change={`+${dashboard?.stats.tasksCompletedChange || 0}%`}
          changeLabel="vs last month"
          icon={CheckSquare}
          variant="positive"
        />
        <DashboardStatCard
          title="Team Productivity"
          value={`${dashboard?.stats.teamProductivity || 0}%`}
          change={`+${dashboard?.stats.teamProductivityChange || 0}%`}
          changeLabel="vs last month"
          icon={Activity}
          variant="positive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardChartWidget
          title="Team Performance"
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`${value}%`, "Productivity"]}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="var(--color-productivity)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </DashboardChartWidget>

        <DashboardChartWidget
          title="Task Status Distribution"
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-2">
            <ChartContainer config={taskStatusChartConfig} className="w-full h-[200px] max-w-[240px] !aspect-square">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={dashboard?.taskStatus || []}
                  dataKey="count"
                  nameKey="status"
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
                              Total Tasks
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {totalTasks}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                  {(dashboard?.taskStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex gap-3 items-center justify-center flex-wrap px-2 pt-1">
              {(dashboard?.taskStatus || []).map((item, index) => (
                <div key={item.status} className="flex gap-1.5 items-center">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: TASK_COLORS[index % TASK_COLORS.length] }}
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

      {/* Table */}
      <DashboardTable
        title="Team Members"
        columns={memberColumns}
        data={filteredMembers}
        searchPlaceholder="Search team members..."
        onSearch={setSearchQuery}
        onFilter={() => {}}
        onSort={() => {}}
        className="h-[436px]"
      />
    </div>
  )
}
