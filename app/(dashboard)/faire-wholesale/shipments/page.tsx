"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "@/components/faire/DataTablePagination"
import { SortableTableHeader } from "@/components/faire/SortableTableHeader"
import {
  getFaireShipments,
  getFaireStores,
} from "@/lib/actions/faire"
import type { FaireShipment } from "@/lib/types/faire"
import { usePaginatedFilters } from "@/lib/hooks/usePaginatedFilters"

function ShipmentsPageContent() {
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

  const { data: shipmentsResult, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-shipments", storeId, searchQuery, page, pageSize, sortBy, sortOrder],
    queryFn: () =>
      getFaireShipments(
        {
          storeId: storeId !== "all" ? storeId : undefined,
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

  const shipments = shipmentsResult?.data || []
  const total = shipmentsResult?.total || 0
  const totalPages = shipmentsResult?.totalPages || 1

  const getShipmentStatus = (shipment: FaireShipment): string => {
    if (shipment.deliveredAt) return "delivered"
    if (shipment.shippedAt) return "in_transit"
    return "pending"
  }

  // Filter by status client-side (since status is computed)
  const filteredShipments = state === "all"
    ? shipments
    : shipments.filter((shipment) => getShipmentStatus(shipment) === state)

  // Calculate stats from current data
  const stats = {
    total: total,
    pending: shipments.filter((s) => !s.shippedAt && !s.deliveredAt).length,
    inTransit: shipments.filter((s) => s.shippedAt && !s.deliveredAt).length,
    delivered: shipments.filter((s) => !!s.deliveredAt).length,
  }

  const formatCarrier = (carrier?: string): string => {
    if (!carrier) return "—"
    const carriers: Record<string, string> = {
      ups: "UPS",
      fedex: "FedEx",
      usps: "USPS",
      dhl: "DHL",
      ontrac: "OnTrac",
      lasership: "LaserShip",
    }
    return carriers[carrier.toLowerCase()] || carrier
  }

  const getStatusBadge = (shipment: FaireShipment) => {
    if (shipment.deliveredAt) {
      return (
        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      )
    }
    if (shipment.shippedAt) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
          <Truck className="h-3 w-3 mr-1" />
          In Transit
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  if (isLoading) {
    return <ShipmentsPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load shipments"
        message="We couldn't load the shipments. Please check your connection and try again."
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
              Faire Shipments
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Track shipments across all orders
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats.total.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Pending</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">In Transit</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats.inTransit}
            </p>
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
              {stats.delivered}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between border-b border-border px-5 py-3 sm:py-2 bg-white rounded-t-[14px] gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracking, carrier, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger className="w-full sm:w-[180px] h-[38px]">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores?.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full sm:w-[150px] h-[38px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Order</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Store</span>
                </TableHead>
                <SortableTableHeader
                  label="Carrier"
                  sortKey="carrier"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Tracking</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <SortableTableHeader
                  label="Shipped"
                  sortKey="shipDate"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Delivered</span>
                </TableHead>
                <TableHead className="w-[60px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id} className="border-b border-border">
                    <TableCell className="px-3">
                      {shipment.order ? (
                        <Link
                          href={`/faire-wholesale/orders/${shipment.orderId}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {shipment.order.displayId || shipment.order.faireOrderId?.slice(0, 12) || "—"}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground">
                        {shipment.order?.store?.name || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-medium text-foreground">
                        {formatCarrier(shipment.carrier)}
                      </span>
                      {shipment.shippingType && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {shipment.shippingType}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm font-mono text-foreground">
                        {shipment.trackingCode || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">{getStatusBadge(shipment)}</TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground">
                        {shipment.shippedAt
                          ? new Date(shipment.shippedAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-sm text-muted-foreground">
                        {shipment.deliveredAt
                          ? new Date(shipment.deliveredAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex items-center gap-1">
                        {shipment.trackingUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a
                              href={shipment.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Track Shipment"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {shipment.orderId && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link
                              href={`/faire-wholesale/orders/${shipment.orderId}`}
                              title="View Order"
                            >
                              <Package className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
                    <EmptyState
                      icon={Truck}
                      title="No shipments found"
                      description={
                        searchQuery || state !== "all"
                          ? "Try adjusting your filters."
                          : "Shipments will appear here when orders are shipped."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredShipments.length > 0 && (
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

function ShipmentsPageSkeleton() {
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
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-5">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function FaireShipmentsPage() {
  return (
    <Suspense fallback={<ShipmentsPageSkeleton />}>
      <ShipmentsPageContent />
    </Suspense>
  )
}
