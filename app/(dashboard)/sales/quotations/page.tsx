"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Quotation } from "@/lib/types/sales"
import { initialQuotations } from "@/lib/data/sales"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateQuotationDialog } from "@/components/sales/CreateQuotationDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchQuotations() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialQuotations
}

const statusConfig: Record<string, { label: string; borderColor: string; textColor: string; dotColor: string }> = {
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
  accepted: {
    label: "Accepted",
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
  expired: {
    label: "Expired",
    borderColor: "border-muted-foreground",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
}

export default function SalesQuotationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false)
  const searchParams = useSearchParams()
  const viewMode = searchParams.get("view") || "team"
  const isMyView = viewMode === "my"
  const { data: quotations, isLoading, error, refetch } = useQuery({
    queryKey: ["quotations"],
    queryFn: fetchQuotations,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
        title="Failed to load quotations"
        message="We couldn't load quotations. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredQuotations = quotations?.filter(
    (quote) =>
      quote.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const totalAmount = quotations?.reduce((sum, q) => sum + q.amount, 0) || 0
  const sentCount = quotations?.filter(q => q.status === "sent").length || 0
  const acceptedCount = quotations?.filter(q => q.status === "accepted").length || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {isMyView ? "My Quotations" : "Quotations"}
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              {isMyView
                ? "Create and track your quotations"
                : "View and manage team quotations"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-border rounded-[14px] flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Value</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              ${totalAmount.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-[14px] flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Sent</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{sentCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-[14px] flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Accepted</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{acceptedCount}</p>
          </CardContent>
        </Card>
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
          <Button onClick={() => setIsCreateQuotationOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[150px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Quotation #</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Company</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Valid Until</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((quotation) => {
                  const status = statusConfig[quotation.status] || statusConfig.draft
                  return (
                    <TableRow key={quotation.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{quotation.quotationNumber}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{quotation.company}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{quotation.contactName}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          ${quotation.amount.toLocaleString("en-US")}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(quotation.validUntil).toLocaleDateString()}
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
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={quotation.assignedTo.avatar || getAvatarForUser(quotation.assignedTo.id || quotation.assignedTo.name)} alt={quotation.assignedTo.name} />
                            <AvatarFallback className="text-xs">
                              {quotation.assignedTo.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{quotation.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="quotation"
                          entityId={quotation.id}
                          entityName={quotation.quotationNumber}
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
                      icon={FileText}
                      title="No quotations yet"
                      description="Create quotations to send to potential customers."
                      action={{
                        label: "Create Quotation",
                        onClick: () => setIsCreateQuotationOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateQuotationDialog open={isCreateQuotationOpen} onOpenChange={setIsCreateQuotationOpen} />
    </div>
  )
}
