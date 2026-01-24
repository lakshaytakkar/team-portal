"use client"

import { Suspense, useState } from "react"
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
  Plus,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { DataTablePagination } from "@/components/faire/DataTablePagination"
import { SortableTableHeader } from "@/components/faire/SortableTableHeader"
import {
  getFaireSuppliers,
  getFaireStores,
  getFaireSupplierStats,
} from "@/lib/actions/faire"
import {
  FAIRE_SUPPLIER_STATUS_CONFIG,
  type FaireSupplierStatus,
} from "@/lib/types/faire"
import { CreateSupplierDialog } from "@/components/faire/CreateSupplierDialog"
import { usePaginatedFilters } from "@/lib/hooks/usePaginatedFilters"

function SuppliersPageContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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
  } = usePaginatedFilters({ defaultSortBy: "name", defaultSortOrder: "asc" })

  const { data: suppliersResult, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-suppliers", storeId, state, searchQuery, page, pageSize, sortBy, sortOrder],
    queryFn: () =>
      getFaireSuppliers(
        {
          storeId: storeId !== "all" ? storeId : undefined,
          status: state !== "all" ? (state as FaireSupplierStatus) : undefined,
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
    queryKey: ["faire-supplier-stats"],
    queryFn: () => getFaireSupplierStats(),
    staleTime: 2 * 60 * 1000,
  })

  const suppliers = suppliersResult?.data || []
  const total = suppliersResult?.total || 0
  const totalPages = suppliersResult?.totalPages || 1

  if (isLoading) {
    return <SuppliersPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load suppliers"
        message="We couldn't load the suppliers. Please check your connection and try again."
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
              Faire Suppliers
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Manage suppliers across all stores
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-primary" />
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
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Active</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.activeSuppliers || 0}
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
              {stats?.byStatus?.pending || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Products</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.totalProducts?.toLocaleString() || 0}
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
                placeholder="Search suppliers..."
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
                {Object.entries(FAIRE_SUPPLIER_STATUS_CONFIG).map(([key, config]) => (
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
                  label="Supplier"
                  sortKey="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Store</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact</span>
                </TableHead>
                <SortableTableHeader
                  label="Status"
                  sortKey="status"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={setSort}
                  className="px-3"
                />
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Location</span>
                </TableHead>
                <TableHead className="px-3 text-right">
                  <span className="text-sm font-medium text-muted-foreground">Lead Time</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => {
                  const statusConfig = FAIRE_SUPPLIER_STATUS_CONFIG[supplier.status]
                  return (
                    <TableRow key={supplier.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <Link
                          href={`/faire-wholesale/suppliers/${supplier.id}`}
                          className="hover:underline"
                        >
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {supplier.name}
                            </span>
                            {supplier.code && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {supplier.code}
                              </p>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm text-muted-foreground">
                          {supplier.store?.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div>
                          {supplier.contactName && (
                            <span className="text-sm font-medium text-foreground">
                              {supplier.contactName}
                            </span>
                          )}
                          {supplier.email && (
                            <p className="text-xs text-muted-foreground">
                              {supplier.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge
                          variant="outline"
                          className={`${statusConfig?.bgColor} ${statusConfig?.color} border-0 text-xs`}
                        >
                          {statusConfig?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm text-muted-foreground">
                          {[supplier.city, supplier.state, supplier.country]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 text-right">
                        <span className="text-sm text-muted-foreground">
                          {supplier.leadTimeDays
                            ? `${supplier.leadTimeDays} days`
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="faire-supplier"
                          entityId={supplier.id}
                          entityName={supplier.name}
                          detailUrl={`/faire-wholesale/suppliers/${supplier.id}`}
                          canView={true}
                          canEdit={true}
                          canDelete={true}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={Truck}
                      title="No suppliers found"
                      description={
                        searchQuery || state !== "all"
                          ? "Try adjusting your filters."
                          : "Suppliers will appear here when added."
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {suppliers.length > 0 && (
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

      {/* Create Dialog */}
      <CreateSupplierDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        stores={stores || []}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

function SuppliersPageSkeleton() {
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

export default function FaireSuppliersPage() {
  return (
    <Suspense fallback={<SuppliersPageSkeleton />}>
      <SuppliersPageContent />
    </Suspense>
  )
}
