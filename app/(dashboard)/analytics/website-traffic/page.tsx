"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
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
  Globe,
  Users,
  MousePointerClick,
  TrendingDown,
} from "lucide-react"
import { WebsiteTraffic } from "@/lib/types/analytics"
import { initialWebsiteTraffic } from "@/lib/data/analytics"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchWebsiteTraffic() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialWebsiteTraffic
}

export default function AnalyticsWebsiteTrafficPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: traffic, isLoading, error, refetch } = useQuery({
    queryKey: ["website-traffic"],
    queryFn: fetchWebsiteTraffic,
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
        title="Failed to load website traffic"
        message="We couldn't load website traffic data. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredTraffic = traffic?.filter(
    (item) =>
      item.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Website Traffic</h1>
            <p className="text-xs text-white/90 mt-0.5">View website traffic analytics (visitors, page views, sessions)</p>
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
          <h2 className="text-base font-semibold text-foreground">Traffic Data</h2>
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
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Visitors</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Page Views</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Sessions</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Bounce Rate</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Avg Session Duration</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTraffic.length > 0 ? (
                filteredTraffic.map((item) => (
                  <TableRow key={item.id} className="border-b border-border">
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.website}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.visitors.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.pageViews.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.sessions.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.bounceRate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">{item.avgSessionDuration}s</span>
                    </TableCell>
                    <TableCell className="px-3">
                      <RowActionsMenu
                        entityType="traffic"
                        entityId={item.id}
                        entityName={item.website}
                        canView={true}
                        canEdit={false}
                        canDelete={false}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
                    <EmptyState
                      icon={Globe}
                      title="No traffic data yet"
                      description="Website traffic data will appear here once tracking is set up."
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
