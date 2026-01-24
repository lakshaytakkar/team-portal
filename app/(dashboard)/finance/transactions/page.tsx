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
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Transaction } from "@/lib/types/finance"
import { initialTransactions } from "@/lib/data/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchTransactions() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialTransactions
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  processing: { label: "Processing", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  failed: { label: "Failed", variant: "outline" },
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  income: { label: "Income", icon: TrendingUp, color: "text-[#10b981]" },
  expense: { label: "Expense", icon: TrendingDown, color: "text-[#df1c41]" },
  transfer: { label: "Transfer", icon: ArrowUpDown, color: "text-[#3b82f6]" },
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

export default function FinanceTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
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
        title="Failed to load transactions"
        message="We couldn't load transactions. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredTransactions = transactions?.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.account?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const incomeTotal = transactions?.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0
  const expenseTotal = transactions?.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0
  const netTotal = incomeTotal - expenseTotal

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Transactions</h1>
            <p className="text-xs text-white/90 mt-0.5">View all financial transactions</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="default" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={`$${incomeTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={`$${expenseTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingDown}
        />
        <StatCard
          title="Net Total"
          value={`$${netTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">All Transactions</h2>
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
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Description</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Category</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Account</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const status = statusConfig[transaction.status] || statusConfig.pending
                  const type = typeConfig[transaction.type] || typeConfig.expense
                  const TypeIcon = type.icon
                  return (
                    <TableRow key={transaction.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{transaction.description}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className={cn("h-4 w-4", type.color)} />
                          <span className="text-sm font-medium text-foreground">{type.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{transaction.category || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{transaction.account || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className={cn(
                          "text-sm font-medium",
                          transaction.type === "income" ? "text-[#10b981]" : transaction.type === "expense" ? "text-[#df1c41]" : "text-foreground"
                        )}>
                          {transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}
                          ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="transaction"
                          entityId={transaction.id}
                          entityName={transaction.description}
                          canView={true}
                          canEdit={true}
                          canDelete={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
                    <EmptyState
                      icon={ArrowUpDown}
                      title="No transactions yet"
                      description="Transactions will appear here once they are recorded."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
