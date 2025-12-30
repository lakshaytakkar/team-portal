"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
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
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Deal } from "@/lib/types/sales"
import { initialDeals } from "@/lib/data/sales"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateDealDialog } from "@/components/sales/CreateDealDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchDeals() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialDeals
}

const stageConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  prospecting: { label: "Prospecting", variant: "outline" },
  qualification: { label: "Qualification", variant: "secondary" },
  proposal: { label: "Proposal", variant: "default" },
  negotiation: { label: "Negotiation", variant: "default" },
  "closed-won": { label: "Closed Won", variant: "default" },
  "closed-lost": { label: "Closed Lost", variant: "outline" },
}

export default function SalesPipelinePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDealOpen, setIsCreateDealOpen] = useState(false)
  const searchParams = useSearchParams()
  const viewMode = searchParams.get("view") || "team"
  const isMyView = viewMode === "my"
  const { data: deals, isLoading, error, refetch } = useQuery({
    queryKey: ["pipeline-deals"],
    queryFn: fetchDeals,
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
        title="Failed to load pipeline"
        message="We couldn't load pipeline data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  // Filter out closed deals for pipeline view
  const pipelineDeals = deals?.filter(d => !d.stage.startsWith("closed")) || []
  const filteredDeals = pipelineDeals.filter(
    (deal) =>
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {isMyView ? "My Pipeline" : "Pipeline"}
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              {isMyView
                ? "Track your sales pipeline and monitor deal progression"
                : "Track team sales pipeline, monitor deal stages, and analyze performance"}
            </p>
          </div>
        </div>
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
          <Button onClick={() => setIsCreateDealOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[200px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Deal Name</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Company</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Value</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Stage</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Probability</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Expected Close</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => {
                  const stage = stageConfig[deal.stage] || stageConfig.prospecting
                  return (
                    <TableRow key={deal.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <Link href={`/sales/deals/${deal.id}`} className="hover:underline">
                          <span className="text-sm font-medium text-foreground">{deal.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{deal.company}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          ${deal.value.toLocaleString("en-US")}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={stage.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {stage.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{deal.probability}%</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={deal.assignedTo.avatar || getAvatarForUser(deal.assignedTo.id || deal.assignedTo.name)} alt={deal.assignedTo.name} />
                            <AvatarFallback className="text-xs">
                              {deal.assignedTo.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{deal.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="deal"
                          entityId={deal.id}
                          entityName={deal.name}
                          detailUrl={`/sales/deals/${deal.id}`}
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
                      icon={TrendingUp}
                      title="No deals in pipeline"
                      description="Create deals to start building your sales pipeline."
                      action={{
                        label: "Create Deal",
                        onClick: () => setIsCreateDealOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateDealDialog open={isCreateDealOpen} onOpenChange={setIsCreateDealOpen} />
    </div>
  )
}
