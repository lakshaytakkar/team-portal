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
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SalesOrder } from "@/lib/types/finance"
import { initialSalesOrders } from "@/lib/data/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchSalesOrders() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialSalesOrders
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
  confirmed: {
    label: "Confirmed",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  "in-progress": {
    label: "In Progress",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  completed: {
    label: "Completed",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  cancelled: {
    label: "Cancelled",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
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

export default function FinanceSalesOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: salesOrders, isLoading, error, refetch } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: fetchSalesOrders,
  })

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
        title="Failed to load sales orders"
        message="We couldn't load sales orders. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredOrders = salesOrders?.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalAmount = salesOrders?.reduce((sum, order) => sum + order.amount, 0) || 0
  const pendingCount = salesOrders?.filter(o => o.status === "pending").length || 0
  const inProgressCount = salesOrders?.filter(o => o.status === "in-progress").length || 0
  const completedCount = salesOrders?.filter(o => o.status === "completed").length || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Sales Orders</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage sales orders and convert to invoices</p>
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
            New Sales Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Value"
          value={`$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+20%"
          changeLabel="this month"
          icon={DollarSign}
        />
        <StatCard
          title="Pending"
          value={pendingCount.toString()}
          change="+5"
          changeLabel="orders"
          icon={Clock}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount.toString()}
          change="+3"
          changeLabel="orders"
          icon={ShoppingCart}
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          change="+8"
          changeLabel="orders"
          icon={CheckCircle2}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Sales Orders</h2>
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
                <TableHead className="w-[150px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Order #</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Client</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Order Date</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Expected Delivery</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  return (
                    <TableRow key={order.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{order.orderNumber}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{order.clientName}</span>
                          <span className="text-xs text-muted-foreground">{order.clientEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          ${order.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "—"}
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
                          entityType="sales-order"
                          entityId={order.id}
                          entityName={order.orderNumber}
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
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={ShoppingCart}
                      title="No sales orders yet"
                      description="Sales orders will appear here once they are created."
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
