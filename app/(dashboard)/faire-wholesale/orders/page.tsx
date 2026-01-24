"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  ShoppingCart,
  DollarSign,
  Clock,
  Truck,
  Package,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { DataTablePagination } from "@/components/faire/DataTablePagination"
import { SortableTableHeader } from "@/components/faire/SortableTableHeader"
import { getFaireOrders, getFaireStores, getFaireOrderStats } from "@/lib/actions/faire"
import {
  formatCents,
  type FaireOrderState,
  FAIRE_ORDER_STATE_CONFIG,
} from "@/lib/types/faire"
import { OrderStatusBadge } from "@/components/faire/OrderStatusBadge"
import { usePaginatedFilters } from "@/lib/hooks/usePaginatedFilters"

function OrdersPageContent() {
  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    storeId,
    state,
    setPage,
    setPageSize,
    setSort,
    setSearchQuery,
    setStoreId,
    setState,
    paginationParams,
  } = usePaginatedFilters({ defaultSortBy: "created_at", defaultSortOrder: "desc" })

  const { data: ordersResult, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-orders", storeId, state, searchQuery, page, pageSize, sortBy, sortOrder],
    queryFn: () =>
      getFaireOrders(
        {
          storeId: storeId !== "all" ? storeId : undefined,
          state: state !== "all" ? (state as FaireOrderState) : undefined,
          searchQuery: searchQuery || undefined,
        },
        paginationParams
      ),
    staleTime: 2 * 60 * 1000,
  })

  const { data: stores } = useQuery({
    queryKey: ["faire-stores"],
    queryFn: () => getFaireStores(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: stats } = useQuery({
    queryKey: ["faire-order-stats", storeId],
    queryFn: () =>
      getFaireOrderStats(storeId !== "all" ? [storeId] : undefined),
    staleTime: 2 * 60 * 1000,
  })

  const orders = ordersResult?.data || []
  const total = ordersResult?.total || 0
  const totalPages = ordersResult?.totalPages || 1

  if (isLoading) {
    return <OrdersPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load orders"
        message="We couldn't load the orders. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Faire Orders
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Manage wholesale orders across all stores
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.total?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">New</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.byState?.NEW || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Processing</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.byState?.PROCESSING || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-purple-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">In Transit</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.byState?.IN_TRANSIT || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Revenue</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCents(stats?.totalRevenueCents || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store Tabs */}
      {stores && stores.length > 0 && (
        <div className="border border-border rounded-[14px] bg-white p-4">
          <Tabs value={storeId} onValueChange={setStoreId}>
            <TabsList className="bg-muted p-0.5 rounded-xl h-auto flex-wrap justify-start w-auto">
              <TabsTrigger
                value="all"
                className="h-10 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
              >
                All Stores
              </TabsTrigger>
              {stores.map((store) => (
                <TabsTrigger
                  key={store.id}
                  value={store.id}
                  className="h-10 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
                >
                  {store.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Main Table Card */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between border-b border-border px-5 py-3 sm:py-2 bg-white rounded-t-[14px] gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full sm:w-[160px] h-[38px]">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {Object.entries(FAIRE_ORDER_STATE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <SortableTableHeader
                  label="Order ID"
                  sortKey="displayId"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="w-[120px] px-3"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Store</span>
                </TableHead>
                <SortableTableHeader
                  label="Customer"
                  sortKey="customer"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <SortableTableHeader
                  label="Status"
                  sortKey="state"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <SortableTableHeader
                  label="Total"
                  sortKey="total"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3 text-right"
                />
                <SortableTableHeader
                  label="Date"
                  sortKey="date"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-border">
                    <TableCell className="px-3">
                      <Link
                        href={`/faire-wholesale/orders/${order.id}`}
                        className="hover:underline"
                      >
                        <span className="text-sm font-mono font-medium text-foreground">
                          {order.displayId || order.faireOrderId?.slice(0, 12) || "—"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground">
                        {order.store?.name || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <div>
                        <Link
                          href={`/faire-wholesale/retailers?q=${encodeURIComponent(order.retailerName || '')}`}
                          className="hover:underline"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {order.retailerName || order.address?.companyName || order.address?.name || "—"}
                          </span>
                        </Link>
                        {order.address?.city && (
                          <p className="text-xs text-muted-foreground">
                            {order.address.city}, {order.address.state}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3">
                      <OrderStatusBadge state={order.state} />
                    </TableCell>
                    <TableCell className="px-3 text-right">
                      <span className="text-sm font-medium text-foreground">
                        {formatCents(order.totalCents || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-xs text-muted-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <RowActionsMenu
                        entityType="faire-order"
                        entityId={order.id}
                        entityName={order.displayId || "Order"}
                        detailUrl={`/faire-wholesale/orders/${order.id}`}
                        canView={true}
                        canEdit={false}
                        canDelete={false}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={ShoppingCart}
                      title="No orders found"
                      description={
                        searchQuery || state !== "all"
                          ? "Try adjusting your filters."
                          : "Orders will appear here when synced from Faire."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="px-5 border-t border-border">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

function OrdersPageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
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

export default function FaireOrdersPage() {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersPageContent />
    </Suspense>
  )
}
