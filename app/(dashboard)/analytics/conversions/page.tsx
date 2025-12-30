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
  FileDown,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { Conversion } from "@/lib/types/analytics"
import { initialConversions } from "@/lib/data/analytics"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchConversions() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialConversions
}

export default function AnalyticsConversionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: conversions, isLoading, error, refetch } = useQuery({
    queryKey: ["conversions"],
    queryFn: fetchConversions,
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
        title="Failed to load conversions"
        message="We couldn't load conversion data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredConversions = conversions?.filter(
    (conversion) =>
      conversion.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversion.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversion.source?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Conversion Tracking</h1>
            <p className="text-xs text-white/90 mt-0.5">Track conversions, leads, and sales from websites</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button variant="outline" size="default" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Conversions</h2>
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
                  <span className="text-sm font-medium text-muted-foreground">Website</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Event</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Value</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Source</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Occurred At</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversions.length > 0 ? (
                filteredConversions.map((conversion) => (
                  <TableRow key={conversion.id} className="border-b border-border">
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{conversion.website}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <Badge variant="default" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {conversion.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {conversion.value ? `$${conversion.value.toLocaleString("en-US")}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{conversion.source || "—"}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(conversion.occurredAt).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <RowActionsMenu
                        entityType="conversion"
                        entityId={conversion.id}
                        entityName={conversion.event}
                        canView={true}
                        canEdit={false}
                        canDelete={false}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24">
                    <EmptyState
                      icon={TrendingUp}
                      title="No conversions yet"
                      description="Conversion events will appear here once they are tracked."
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
