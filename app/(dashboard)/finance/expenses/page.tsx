"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  DollarSign,
  Receipt,
  Clock,
  TrendingUp,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Expense } from "@/lib/types/finance"
import { initialExpenses } from "@/lib/data/finance"
import { deleteExpense } from "@/lib/actions/finance"
import { useQueryClient } from "@tanstack/react-query"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateExpenseDialog } from "@/components/finance/CreateExpenseDialog"

async function fetchExpenses() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialExpenses
}

const statusConfig: Record<
  string,
  { label: string; borderColor: string; textColor: string; dotColor: string }
> = {
  pending: {
    label: "Pending",
    borderColor: "border-[#f59e0b]",
    textColor: "text-[#f59e0b]",
    dotColor: "bg-[#f59e0b]",
  },
  approved: {
    label: "Approved",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  rejected: {
    label: "Rejected",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
  paid: {
    label: "Paid",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
}

const categoryConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  travel: { label: "Travel", variant: "default" },
  meals: { label: "Meals", variant: "secondary" },
  supplies: { label: "Supplies", variant: "outline" },
  software: { label: "Software", variant: "default" },
  hardware: { label: "Hardware", variant: "secondary" },
  other: { label: "Other", variant: "outline" },
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

export default function FinanceExpensesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false)
  const { data: expenses, isLoading, error, refetch } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  })

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId)
    await queryClient.invalidateQueries({ queryKey: ["expenses"] })
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
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
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load expenses"
        message="We couldn't load expenses. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredExpenses = expenses?.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalAmount = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const pendingAmount = expenses?.filter(e => e.status === "pending").reduce((sum, exp) => sum + exp.amount, 0) || 0
  const approvedAmount = expenses?.filter(e => e.status === "approved").reduce((sum, exp) => sum + exp.amount, 0) || 0
  const paidAmount = expenses?.filter(e => e.status === "paid").reduce((sum, exp) => sum + exp.amount, 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Expenses</h1>
            <p className="text-xs text-white/90 mt-0.5">Track and manage company expenses</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Expenses"
          value={`$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+12.5%"
          changeLabel="this month"
          icon={DollarSign}
        />
        <StatCard
          title="Pending"
          value={`$${pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+5%"
          changeLabel="this month"
          icon={Clock}
        />
        <StatCard
          title="Approved"
          value={`$${approvedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+18%"
          changeLabel="this month"
          icon={Receipt}
        />
        <StatCard
          title="Paid"
          value={`$${paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+8%"
          changeLabel="this month"
          icon={TrendingUp}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsCreateExpenseOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Expense
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[200px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Description</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Category</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Submitted By</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const status = statusConfig[expense.status] || statusConfig.pending
                  const category = categoryConfig[expense.category] || categoryConfig.other
                  return (
                    <TableRow key={expense.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{expense.description}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={category.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {category.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          ${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{expense.submittedBy.name}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 px-1.5 py-0.5 rounded-2xl text-xs gap-1 bg-background",
                            status.borderColor,
                            status.textColor
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="expense"
                          entityId={expense.id}
                          entityName={expense.description}
                          detailUrl={`/finance/expenses/${expense.id}`}
                          canView={true}
                          canEdit={true}
                          canDelete={true}
                          onDelete={() => handleDeleteExpense(expense.id)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={Receipt}
                      title="No expenses yet"
                      description="Get started by submitting your first expense."
                      action={{
                        label: "Submit Expense",
                        onClick: () => setIsCreateExpenseOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateExpenseDialog open={isCreateExpenseOpen} onOpenChange={setIsCreateExpenseOpen} />
    </div>
  )
}
