"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, TrendingDown, Percent, FileText } from "lucide-react"
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
  financeDashboardStats,
  financialData,
  expenseCategoryData,
  recentTransactions,
  type Transaction,
} from "@/lib/data/dashboard/finance-dashboard"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

async function fetchFinanceDashboard() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    stats: financeDashboardStats,
    financial: financialData,
    expenses: expenseCategoryData,
    transactions: recentTransactions,
  }
}

const financialChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-4)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const expenseChartConfig = {
  Salaries: {
    label: "Salaries",
    color: "var(--chart-1)",
  },
  "Office Rent": {
    label: "Office Rent",
    color: "var(--chart-2)",
  },
  Marketing: {
    label: "Marketing",
    color: "var(--chart-3)",
  },
  Operations: {
    label: "Operations",
    color: "var(--chart-4)",
  },
  Other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const EXPENSE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export default function FinanceDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ["finance-dashboard"],
    queryFn: fetchFinanceDashboard,
  })

  const filteredTransactions = dashboard?.transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalExpenses = dashboard?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0

  const transactionColumns = [
    {
      key: "type",
      label: "Type",
      render: (transaction: Transaction) => (
        <Badge
          variant={transaction.type === "Revenue" ? "completed" : "destructive"}
        >
          {transaction.type}
        </Badge>
      ),
    },
    { key: "description", label: "Description" },
    {
      key: "amount",
      label: "Amount",
      render: (transaction: Transaction) => (
        <span
          className={`text-sm font-medium ${
            transaction.type === "Revenue" ? "text-[#10b981]" : "text-[#ef4444]"
          }`}
        >
          {transaction.type === "Revenue" ? "+" : "-"}
          ${transaction.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (transaction: Transaction) => (
        <Badge variant="outline">{transaction.status}</Badge>
      ),
    },
    { key: "category", label: "Category" },
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
        title="Failed to load finance dashboard"
        message="We couldn't load finance dashboard data. Please check your connection and try again."
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
          title="Total Expenses"
          value={`$${(dashboard?.stats.totalExpenses || 0).toLocaleString()}`}
          change={`+${dashboard?.stats.totalExpensesChange || 0}%`}
          changeLabel="vs last month"
          icon={TrendingDown}
          variant="negative"
        />
        <DashboardStatCard
          title="Profit Margin"
          value={`${dashboard?.stats.profitMargin || 0}%`}
          change={`+${dashboard?.stats.profitMarginChange || 0}%`}
          changeLabel="vs last month"
          icon={Percent}
          variant="positive"
        />
        <DashboardStatCard
          title="Pending Invoices"
          value={dashboard?.stats.pendingInvoices || 0}
          change={`${dashboard?.stats.pendingInvoicesChange || 0}%`}
          changeLabel="vs last month"
          icon={FileText}
          variant={dashboard?.stats.pendingInvoicesChange && dashboard.stats.pendingInvoicesChange < 0 ? "positive" : "default"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardChartWidget
          title="Revenue vs Expenses"
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
          <ChartContainer config={financialChartConfig} className="h-full">
            <LineChart
              data={dashboard?.financial || []}
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </DashboardChartWidget>

        <DashboardChartWidget
          title="Expense Category Distribution"
          onRefresh={() => refetch()}
          className="h-[400px]"
        >
          <div className="flex flex-col items-center justify-center h-full gap-2 pb-2">
            <ChartContainer config={expenseChartConfig} className="w-full h-[200px] max-w-[240px] !aspect-square">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={dashboard?.expenses || []}
                  dataKey="amount"
                  nameKey="category"
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
                              Total Expenses
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 16}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              ${(totalExpenses / 1000).toFixed(0)}k
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                  {(dashboard?.expenses || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex gap-3 items-center justify-center flex-wrap px-2 pt-1">
              {(dashboard?.expenses || []).map((item, index) => (
                <div key={item.category} className="flex gap-1.5 items-center">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                  />
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DashboardChartWidget>
      </div>

      {/* Table */}
      <DashboardTable
        title="Recent Transactions"
        columns={transactionColumns}
        data={filteredTransactions}
        searchPlaceholder="Search transactions..."
        onSearch={setSearchQuery}
        onFilter={() => {}}
        onSort={() => {}}
        className="h-[436px]"
      />
    </div>
  )
}
