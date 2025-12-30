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
  Receipt,
  DollarSign,
  Clock,
  AlertCircle,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Invoice } from "@/lib/types/finance"
import { initialInvoices } from "@/lib/data/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateInvoiceDialog } from "@/components/finance/CreateInvoiceDialog"

async function fetchInvoices() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialInvoices
}

const statusConfig: Record<
  string,
  { label: string; borderColor: string; textColor: string; dotColor: string }
> = {
  draft: {
    label: "Draft",
    borderColor: "border-muted-foreground",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  sent: {
    label: "Sent",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  paid: {
    label: "Paid",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  overdue: {
    label: "Overdue",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
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

export default function FinanceInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
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
        title="Failed to load invoices"
        message="We couldn't load invoices. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredInvoices = invoices?.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalAmount = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0
  const paidAmount = invoices?.filter(i => i.status === "paid").reduce((sum, inv) => sum + inv.total, 0) || 0
  const pendingAmount = invoices?.filter(i => i.status === "sent").reduce((sum, inv) => sum + inv.total, 0) || 0
  const overdueAmount = invoices?.filter(i => i.status === "overdue").reduce((sum, inv) => sum + inv.total, 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Invoices</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage invoices, payments, and billing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invoices"
          value={`$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+15%"
          changeLabel="this month"
          icon={Receipt}
        />
        <StatCard
          title="Paid"
          value={`$${paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+10%"
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
          title="Overdue"
          value={`$${overdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="−2%"
          changeLabel="this month"
          icon={AlertCircle}
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
            <Button onClick={() => setIsCreateInvoiceOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[150px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Invoice #</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Client</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Issue Date</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status] || statusConfig.draft
                  return (
                    <TableRow key={invoice.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{invoice.clientName}</span>
                          <span className="text-xs text-muted-foreground">{invoice.clientEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString()}
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
                          entityType="invoice"
                          entityId={invoice.id}
                          entityName={invoice.invoiceNumber}
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
                      icon={Receipt}
                      title="No invoices yet"
                      description="Get started by creating your first invoice."
                      action={{
                        label: "Create Invoice",
                        onClick: () => setIsCreateInvoiceOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateInvoiceDialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen} />
    </div>
  )
}

