"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ShoppingCart,
  DollarSign,
  Truck,
  AlertTriangle,
  Package,
  Store,
  ArrowRight,
  TrendingUp,
  Users,
  RefreshCw,
  PackageCheck,
  Clock,
} from "lucide-react"
import Link from "next/link"
import {
  getFaireOverviewStats,
  getFaireOrderStats,
  getFaireProductStats,
  getFaireStores,
  getFaireOrders,
} from "@/lib/actions/faire"
import { FAIRE_ORDER_STATE_CONFIG, FAIRE_PRODUCT_SALE_STATE_CONFIG } from "@/lib/types/faire"
import type { FaireOrderState, FaireProductSaleState, FaireStore } from "@/lib/types/faire"
import { cn } from "@/lib/utils"

export default function FaireWholesaleDashboardPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all")

  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ["faire-stores"],
    queryFn: () => getFaireStores(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: overviewStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["faire-overview-stats"],
    queryFn: () => getFaireOverviewStats(),
    staleTime: 2 * 60 * 1000,
  })

  const { data: orderStats } = useQuery({
    queryKey: ["faire-order-stats", selectedStoreId],
    queryFn: () => getFaireOrderStats(selectedStoreId !== "all" ? [selectedStoreId] : undefined),
    staleTime: 2 * 60 * 1000,
  })

  const { data: productStats } = useQuery({
    queryKey: ["faire-product-stats", selectedStoreId],
    queryFn: () => getFaireProductStats(selectedStoreId !== "all" ? [selectedStoreId] : undefined),
    staleTime: 2 * 60 * 1000,
  })

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["faire-recent-orders", selectedStoreId],
    queryFn: () => getFaireOrders(
      { storeId: selectedStoreId !== "all" ? selectedStoreId : undefined },
      { page: 1, pageSize: 5, sortBy: "created_at", sortOrder: "desc" }
    ),
    staleTime: 2 * 60 * 1000,
    select: (data) => data.data,
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

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const activeStores = stores?.filter(s => s.isActive) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Faire Wholesale Dashboard
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Multi-Store Wholesale Management - {activeStores.length} Active Store{activeStores.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/30 text-white">
                <Store className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {activeStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/faire-wholesale/orders">
              <Button variant="secondary" size="sm">
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Orders</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {orderStats?.total || overviewStats?.totalOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Revenue</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCurrency(orderStats?.totalRevenueCents || overviewStats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Pending Shipments</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {orderStats?.pendingShipments || overviewStats?.pendingShipments || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-red-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Low Stock Alerts</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {productStats?.lowStockCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders by State & Products by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders by State */}
        <Card className="border border-border rounded-[14px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders by State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(FAIRE_ORDER_STATE_CONFIG)
              .sort((a, b) => a[1].order - b[1].order)
              .map(([state, config]) => {
                const count = orderStats?.byState[state as FaireOrderState] || 0
                const total = orderStats?.total || 1
                const percentage = Math.round((count / total) * 100)
                return (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("h-5 px-2 py-0.5 rounded-md text-xs border-0", config.bgColor, config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", config.bgColor.replace("100", "500"))}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>

        {/* Products by Sale State */}
        <Card className="border border-border rounded-[14px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-2xl font-bold text-primary">
                  {productStats?.total || overviewStats?.totalProducts || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">
                  {productStats?.totalVariants || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Variants</p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(FAIRE_PRODUCT_SALE_STATE_CONFIG).map(([state, config]) => {
                const count = productStats?.bySaleState[state as FaireProductSaleState] || 0
                return (
                  <div key={state} className="flex items-center justify-between">
                    <Badge className={cn("h-5 px-2 py-0.5 rounded-md text-xs border-0", config.bgColor, config.color)}>
                      {config.label}
                    </Badge>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
            {(productStats?.lowStockCount || 0) + (productStats?.outOfStockCount || 0) > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>{(productStats?.lowStockCount || 0) + (productStats?.outOfStockCount || 0)}</strong> products need inventory attention
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <Card className="border border-border rounded-[14px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/faire-wholesale/orders" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  View All Orders
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faire-wholesale/products" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Manage Products
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faire-wholesale/shipments" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4" />
                  Track Shipments
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faire-wholesale/stores" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Manage Stores
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border border-border rounded-[14px] lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Link href="/faire-wholesale/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const stateConfig = FAIRE_ORDER_STATE_CONFIG[order.state]
                  return (
                    <Link
                      key={order.id}
                      href={`/faire-wholesale/orders/${order.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.displayId || order.faireOrderId}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.retailerName || 'Unknown Retailer'} • {order.store?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {formatCurrency(order.totalCents || 0)}
                        </span>
                        <Badge
                          className={cn(
                            "h-5 px-2 py-0.5 rounded-md text-xs border-0",
                            stateConfig?.bgColor,
                            stateConfig?.color
                          )}
                        >
                          {stateConfig?.label}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders found</p>
                <p className="text-xs">Orders will appear here when synced from Faire</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Store Performance Cards */}
      {activeStores.length > 0 && selectedStoreId === "all" && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStores.slice(0, 6).map((store) => (
              <StorePerformanceCard key={store.id} store={store} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-purple-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Store className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Active Stores</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {overviewStats?.activeStores || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Pending Orders</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {(orderStats?.byState.NEW || 0) + (orderStats?.byState.PROCESSING || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-cyan-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-cyan-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">In Transit</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {orderStats?.byState.IN_TRANSIT || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Delivered</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {orderStats?.byState.DELIVERED || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StorePerformanceCard({ store }: { store: FaireStore }) {
  const { data: storeStats } = useQuery({
    queryKey: ["faire-store-stats", store.id],
    queryFn: () => getFaireOrderStats([store.id]),
    staleTime: 5 * 60 * 1000,
  })

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  return (
    <Link href={`/faire-wholesale/stores/${store.id}`}>
      <Card className="border border-border rounded-[14px] hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[120px]">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.code}</p>
              </div>
            </div>
            {store.lastSyncAt && (
              <Badge variant="outline" className="text-[10px] h-5">
                <Clock className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Orders</p>
              <p className="font-semibold">{storeStats?.total || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Revenue</p>
              <p className="font-semibold">{formatCurrency(storeStats?.totalRevenueCents || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
