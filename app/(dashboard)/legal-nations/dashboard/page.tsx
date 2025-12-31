"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { getLLCClientStats, getLLCClients } from "@/lib/actions/llc-clients"
import type { LLCClientStats, LLCClient } from "@/lib/types/llc-clients"
import { LLC_STATUS_CONFIG, LLC_HEALTH_CONFIG } from "@/lib/types/llc-clients"
import { cn } from "@/lib/utils"

export default function LegalNationsDashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["llc-client-stats"],
    queryFn: () => getLLCClientStats(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: recentClients, isLoading: clientsLoading } = useQuery({
    queryKey: ["llc-clients-recent"],
    queryFn: () => getLLCClients({ }),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.slice(0, 5),
  })

  if (statsLoading) {
    return <DashboardSkeleton />
  }

  if (statsError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load the dashboard data. Please check your connection and try again."
        onRetry={() => refetchStats()}
      />
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Legal Nations Dashboard
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              LLC Formation Services Overview - Wyoming LLC Formation for International Clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/legal-nations/clients">
              <Button variant="secondary" size="sm">
                View All Clients
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Clients</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats?.total || 0}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Delivered</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.byStatus.delivered || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Revenue Collected</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Pending Payments</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCurrency(stats?.pendingPayments || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution & Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <Card className="border border-border rounded-[14px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Clients by Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(LLC_STATUS_CONFIG)
              .sort((a, b) => a[1].order - b[1].order)
              .map(([status, config]) => {
                const count = stats?.byStatus[status as keyof typeof stats.byStatus] || 0
                const percentage = stats?.total ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("h-5 px-2 py-0.5 rounded-md text-xs", config.bgColor, config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", config.bgColor.replace("100", "500"))}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>

        {/* Health Overview */}
        <Card className="border border-border rounded-[14px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Client Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(LLC_HEALTH_CONFIG).map(([health, config]) => {
                const count = stats?.byHealth[health as keyof typeof stats.byHealth] || 0
                return (
                  <div
                    key={health}
                    className={cn(
                      "p-3 rounded-lg border",
                      config.bgColor,
                      "border-transparent"
                    )}
                  >
                    <p className={cn("text-2xl font-bold", config.color)}>{count}</p>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                  </div>
                )
              })}
            </div>
            {(stats?.byHealth.at_risk || 0) + (stats?.byHealth.critical || 0) > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>{(stats?.byHealth.at_risk || 0) + (stats?.byHealth.critical || 0)}</strong> clients need attention
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <Card className="border border-border rounded-[14px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/legal-nations/applications" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Applications Pipeline
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/legal-nations/bank-approvals" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Approvals
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/legal-nations/my-clients" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  My Assigned Clients
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card className="border border-border rounded-[14px] lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Clients</CardTitle>
            <Link href="/legal-nations/clients">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentClients?.map((client) => (
                  <Link
                    key={client.id}
                    href={`/legal-nations/clients/${client.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {client.clientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{client.clientName}</p>
                        <p className="text-xs text-muted-foreground">{client.llcName || client.clientCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "h-5 px-2 py-0.5 rounded-md text-xs",
                          LLC_STATUS_CONFIG[client.status]?.bgColor,
                          LLC_STATUS_CONFIG[client.status]?.color
                        )}
                      >
                        {LLC_STATUS_CONFIG[client.status]?.label}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* This Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-purple-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Onboarded This Month</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.thisMonthOnboarded || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Delivered This Month</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.thisMonthDelivered || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
