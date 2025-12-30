"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  FileBarChart,
  Download,
  Calendar,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FinancialReport } from "@/lib/types/finance"
import { initialFinancialReports } from "@/lib/data/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

async function fetchReports() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialFinancialReports
}

const typeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  "profit-loss": { label: "Profit & Loss", variant: "default" },
  "balance-sheet": { label: "Balance Sheet", variant: "secondary" },
  "cash-flow": { label: "Cash Flow", variant: "outline" },
  "custom": { label: "Custom", variant: "outline" },
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
}

export default function FinanceReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ["financial-reports"],
    queryFn: fetchReports,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load reports"
        message="We couldn't load financial reports. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredReports = reports?.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Financial Reports</h1>
            <p className="text-xs text-white/90 mt-0.5">Generate and view financial reports and analytics</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="default" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export All
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Reports</h2>
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

        <div className="p-5">
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((report) => {
                const type = typeConfig[report.type] || typeConfig.custom
                const status = statusConfig[report.status] || statusConfig.draft
                return (
                  <Card key={report.id} className="border border-border rounded-2xl hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px] mb-1">
                            {report.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={type.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                              {type.label}
                            </Badge>
                            <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{report.period}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarForUser(report.generatedBy.id || report.generatedBy.name)} alt={report.generatedBy.name} />
                            <AvatarFallback className="text-xs">
                              {report.generatedBy.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{report.generatedBy.name}</span>
                        </div>
                        {report.fileUrl && (
                          <Button variant="outline" size="sm" className="gap-2 h-8">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileBarChart}
              title="No reports yet"
              description="Generate your first financial report to get started."
              action={{
                label: "Generate Report",
                onClick: () => {},
              }}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
