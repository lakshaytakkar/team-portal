"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, UserPlus, UserMinus, Briefcase, MoreVertical } from "lucide-react"
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
  hrDashboardStats,
  workHoursData,
  employeeTypeData,
  hrEmployees,
  type HREmployee,
} from "@/lib/data/dashboard/hr-dashboard"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

async function fetchHRDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    stats: hrDashboardStats,
    workHours: workHoursData,
    employeeTypes: employeeTypeData,
    employees: hrEmployees,
  }
}

const workHoursChartConfig = {
  hours: {
    label: "Hours",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const employeeTypeChartConfig = {
  Fulltime: {
    label: "Fulltime",
    color: "var(--chart-1)",
  },
  Freelance: {
    label: "Freelance",
    color: "var(--chart-3)",
  },
  Internship: {
    label: "Internship",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const TYPE_COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-4)",
]

export default function HRDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState("monthly")
  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["hr-dashboard"],
    queryFn: fetchHRDashboard,
  })

  const filteredEmployees = dashboard?.employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalEmployees = dashboard?.employeeTypes.reduce((sum, item) => sum + item.count, 0) || 0

  const employeeColumns = [
    {
      key: "no",
      label: "No",
      render: (employee: HREmployee, index: number) => (
        <div className="flex items-center gap-2.5">
          <Checkbox className="w-4 h-4" />
          <span className="text-sm font-medium">{index + 1}</span>
        </div>
      ),
      className: "w-[72px]",
    },
    {
      key: "name",
      label: "Employee Name",
      render: (employee: HREmployee) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {employee.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{employee.name}</span>
            <span className="text-xs text-muted-foreground">{employee.employeeId}</span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (employee: HREmployee) => (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {employee.department}
        </Badge>
      ),
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "joiningDate",
      label: "Joining Date",
    },
    {
      key: "level",
      label: "Level",
      render: (employee: HREmployee) => (
        <Badge variant="outline" className="gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {employee.level}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: () => (
        <button className="w-4 h-4 flex items-center justify-center">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      ),
      className: "w-[44px]",
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
        title="Failed to load HR dashboard"
        message="We couldn't load HR dashboard data. Please check your connection and try again."
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
          title="Total Employee"
          value={dashboard?.stats.totalEmployees.toLocaleString() || "0"}
          change={`+${dashboard?.stats.totalEmployeesChange || 0}%`}
          changeLabel="to last month"
          icon={Users}
          variant="positive"
        />
        <DashboardStatCard
          title="New Employee"
          value={dashboard?.stats.newEmployees.toLocaleString() || "0"}
          change={`${dashboard?.stats.newEmployeesChange || 0}%`}
          changeLabel="to last month"
          icon={UserPlus}
          variant={dashboard?.stats.newEmployeesChange && dashboard.stats.newEmployeesChange < 0 ? "negative" : "positive"}
        />
        <DashboardStatCard
          title="Resigned Employee"
          value={dashboard?.stats.resignedEmployees.toLocaleString() || "0"}
          change={`+${dashboard?.stats.resignedEmployeesChange || 0}%`}
          changeLabel="to last month"
          icon={UserMinus}
          variant="negative"
        />
        <DashboardStatCard
          title="Job Applications"
          value={dashboard?.stats.jobApplications.toLocaleString() || "0"}
          change={`+${dashboard?.stats.jobApplicationsChange || 0}%`}
          changeLabel="to last month"
          icon={Briefcase}
          variant="positive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardChartWidget
          title="Avg. Work Hours"
          timePeriod={{
            value: timePeriod,
            options: [
              { label: "Monthly", value: "monthly" },
              { label: "Weekly", value: "weekly" },
              { label: "Daily", value: "daily" },
            ],
            onChange: setTimePeriod,
          }}
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <ChartContainer config={workHoursChartConfig} className="h-full">
            <LineChart
              data={dashboard?.workHours || []}
              margin={{ left: 48, right: 12, top: 12, bottom: 48 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}h`}
                domain={[0, 10]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`${value}h`, "Hours"]}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="var(--color-hours)"
                strokeWidth={2}
                dot={{ fill: "var(--color-hours)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </DashboardChartWidget>

        <DashboardChartWidget
          title="Employee Type"
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-2">
            <ChartContainer config={employeeTypeChartConfig} className="w-full h-[200px] max-w-[240px] !aspect-square">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={dashboard?.employeeTypes || []}
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
                              Total Employee
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {totalEmployees.toLocaleString()}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                  {(dashboard?.employeeTypes || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex gap-3 items-center justify-center flex-wrap px-2 pt-1">
              {(dashboard?.employeeTypes || []).map((item, index) => (
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
        title="List of Employees"
        columns={employeeColumns}
        data={filteredEmployees}
        searchPlaceholder="Search"
        onSearch={setSearchQuery}
        onFilter={() => {}}
        onSort={() => {}}
        className="h-[436px]"
      />
    </div>
  )
}
