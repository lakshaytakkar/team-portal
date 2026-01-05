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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  Users,
  ShoppingCart,
  DollarSign,
  MapPin,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { DataTablePagination } from "@/components/faire/DataTablePagination"
import { SortableTableHeader } from "@/components/faire/SortableTableHeader"
import { getFaireRetailers, getFaireStores } from "@/lib/actions/faire"
import { formatCents } from "@/lib/types/faire"
import { usePaginatedFilters } from "@/lib/hooks/usePaginatedFilters"

function RetailersPageContent() {
  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    storeId,
    setPage,
    setPageSize,
    setSort,
    setSearchQuery,
    setStoreId,
    paginationParams,
  } = usePaginatedFilters({ defaultSortBy: "lastOrderDate", defaultSortOrder: "desc" })

  const { data: retailersResult, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-retailers", storeId, searchQuery, page, pageSize, sortBy, sortOrder],
    queryFn: () =>
      getFaireRetailers(
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

  const retailers = retailersResult?.data || []
  const total = retailersResult?.total || 0
  const totalPages = retailersResult?.totalPages || 1

  // Calculate stats from current page data (this is an approximation - full stats would need a separate query)
  const totalOrders = retailers.reduce((sum, r) => sum + r.orderCount, 0)
  const totalRevenue = retailers.reduce((sum, r) => sum + r.totalRevenueCents, 0)

  if (isLoading) {
    return <RetailersPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load retailers"
        message="We couldn't load the retailers. Please check your connection and try again."
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
              Retailers
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Manage retailers and customers from Faire orders
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Retailers</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {total.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Orders (this page)</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {totalOrders.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Revenue (this page)</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCents(totalRevenue)}
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
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search retailers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Retailer ID</span>
                </TableHead>
                <SortableTableHeader
                  label="Name"
                  sortKey="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Location</span>
                </TableHead>
                <SortableTableHeader
                  label="Orders"
                  sortKey="orderCount"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3 text-right"
                />
                <SortableTableHeader
                  label="Revenue"
                  sortKey="revenue"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3 text-right"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">First Order</span>
                </TableHead>
                <SortableTableHeader
                  label="Last Order"
                  sortKey="lastOrderDate"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailers.length > 0 ? (
                retailers.map((retailer) => (
                  <TableRow key={retailer.retailerId} className="border-b border-border">
                    <TableCell className="px-3">
                      <span className="text-sm font-mono font-medium text-foreground">
                        {retailer.retailerId?.slice(0, 12) || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <Link
                        href={`/faire-wholesale/orders?q=${encodeURIComponent(retailer.retailerName || '')}`}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {retailer.retailerName || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      {retailer.address ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            {retailer.address.companyName || retailer.address.name ? (
                              <span className="text-sm text-foreground">
                                {retailer.address.companyName || retailer.address.name}
                              </span>
                            ) : null}
                            {retailer.address.city && retailer.address.state && (
                              <p className="text-xs text-muted-foreground">
                                {retailer.address.city}, {retailer.address.state}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 text-right">
                      <Link
                        href={`/faire-wholesale/orders?q=${encodeURIComponent(retailer.retailerName || '')}`}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        {retailer.orderCount}
                      </Link>
                    </TableCell>
                    <TableCell className="px-3 text-right">
                      <span className="text-sm font-medium text-foreground">
                        {formatCents(retailer.totalRevenueCents)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-xs text-muted-foreground">
                        {retailer.firstOrderDate
                          ? new Date(retailer.firstOrderDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-xs text-muted-foreground">
                        {retailer.lastOrderDate
                          ? new Date(retailer.lastOrderDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <RowActionsMenu
                        entityType="faire-retailer"
                        entityId={retailer.retailerId}
                        entityName={retailer.retailerName || "Retailer"}
                        detailUrl={`/faire-wholesale/orders?q=${encodeURIComponent(retailer.retailerName || '')}`}
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
                      icon={Users}
                      title="No retailers found"
                      description={
                        searchQuery || storeId !== "all"
                          ? "Try adjusting your filters."
                          : "Retailers will appear here when orders are synced from Faire."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {retailers.length > 0 && (
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

function RetailersPageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
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

export default function FaireRetailersPage() {
  return (
    <Suspense fallback={<RetailersPageSkeleton />}>
      <RetailersPageContent />
    </Suspense>
  )
}
