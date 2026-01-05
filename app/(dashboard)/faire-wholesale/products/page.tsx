"use client"

import { Suspense, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
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
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  Plus,
  Tag,
  LayoutGrid,
  List,
  ImageOff,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { DataTablePagination } from "@/components/faire/DataTablePagination"
import { SortableTableHeader } from "@/components/faire/SortableTableHeader"
import {
  getFaireProducts,
  getFaireStores,
  getFaireSuppliers,
  getFaireProductStats,
} from "@/lib/actions/faire"
import {
  FAIRE_PRODUCT_SALE_STATE_CONFIG,
  FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG,
  type FaireProduct,
  type FaireProductSaleState,
  type FaireProductLifecycleState,
} from "@/lib/types/faire"
import { CreateProductDialog } from "@/components/faire/CreateProductDialog"
import { cn } from "@/lib/utils"
import { usePaginatedFilters } from "@/lib/hooks/usePaginatedFilters"

type ViewMode = "table" | "grid"

function ProductsPageContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

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
    updateParams,
  } = usePaginatedFilters({ defaultSortBy: "name", defaultSortOrder: "asc" })

  // Get lifecycle state from URL
  const lifecycleState = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('lifecycleState') || 'all'

  const { data: productsResult, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-products", storeId, state, lifecycleState, searchQuery, page, pageSize, sortBy, sortOrder],
    queryFn: () =>
      getFaireProducts(
        {
          storeId: storeId !== "all" ? storeId : undefined,
          saleState: state !== "all" ? (state as FaireProductSaleState) : undefined,
          lifecycleState: lifecycleState !== "all" ? (lifecycleState as FaireProductLifecycleState) : undefined,
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

  const { data: suppliersResult } = useQuery({
    queryKey: ["faire-suppliers-all"],
    queryFn: () => getFaireSuppliers(undefined, { page: 1, pageSize: 100 }),
    staleTime: 5 * 60 * 1000,
  })
  const suppliers = suppliersResult?.data || []

  const { data: stats } = useQuery({
    queryKey: ["faire-product-stats", storeId],
    queryFn: () =>
      getFaireProductStats(storeId !== "all" ? [storeId] : undefined),
    staleTime: 2 * 60 * 1000,
  })

  const products = productsResult?.data || []
  const total = productsResult?.total || 0
  const totalPages = productsResult?.totalPages || 1

  if (isLoading) {
    return <ProductsPageSkeleton viewMode={viewMode} />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load products"
        message="We couldn't load the products. Please check your connection and try again."
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
              Faire Products
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Manage product catalog across all stores
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-primary" />
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
                <Tag className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">For Sale</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.bySaleState?.FOR_SALE || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Variants</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.totalVariants?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Low Stock</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.lowStockCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-red-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Out of Stock</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.outOfStockCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex flex-col lg:flex-row h-auto lg:h-16 items-start lg:items-center justify-between border-b border-border px-5 py-3 lg:py-2 bg-white rounded-t-[14px] gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                <SelectValue placeholder="Sale State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {Object.entries(FAIRE_PRODUCT_SALE_STATE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={lifecycleState}
              onValueChange={(val) => updateParams({ lifecycleState: val === 'all' ? undefined : val, page: undefined })}
            >
              <SelectTrigger className="w-full sm:w-[150px] h-[38px]">
                <SelectValue placeholder="Lifecycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lifecycle</SelectItem>
                {Object.entries(FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 px-3",
                viewMode === "grid" && "bg-background shadow-sm"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "h-8 px-3",
                viewMode === "table" && "bg-background shadow-sm"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === "grid" ? (
          <div className="p-5">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No products found"
                description={
                  searchQuery || state !== "all" || lifecycleState !== "all"
                    ? "Try adjusting your filters."
                    : "Products will appear here when added or synced from Faire."
                }
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="px-3 w-[60px]"></TableHead>
                  <SortableTableHeader
                    label="Product"
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
                    <span className="text-sm font-medium text-muted-foreground">Supplier</span>
                  </TableHead>
                  <SortableTableHeader
                    label="Status"
                    sortKey="saleState"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={setSort}
                    className="px-3"
                  />
                  <TableHead className="px-3 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Variants</span>
                  </TableHead>
                  <TableHead className="px-3 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Inventory</span>
                  </TableHead>
                  <TableHead className="w-[44px] px-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const saleStateConfig = FAIRE_PRODUCT_SALE_STATE_CONFIG[product.saleState]
                    const lifecycleConfig = FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG[product.lifecycleState]
                    const imageUrl = product.images?.[0]
                    return (
                      <TableRow key={product.id} className="border-b border-border">
                        <TableCell className="px-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                                unoptimized
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3">
                          <Link
                            href={`/faire-wholesale/products/${product.id}`}
                            className="hover:underline"
                          >
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {product.name}
                              </span>
                              {product.sku && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm text-muted-foreground">
                            {product.store?.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-3">
                          {product.supplier ? (
                            <Link
                              href={`/faire-wholesale/suppliers/${product.supplier.id}`}
                              className="text-sm text-muted-foreground hover:underline"
                            >
                              {product.supplier.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={`${saleStateConfig?.bgColor} ${saleStateConfig?.color} border-0 text-xs`}
                            >
                              {saleStateConfig?.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${lifecycleConfig?.bgColor} ${lifecycleConfig?.color} border-0 text-xs`}
                            >
                              {lifecycleConfig?.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 text-right">
                          <span className="text-sm font-medium text-foreground">
                            {product.variantCount || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 text-right">
                          <span
                            className={`text-sm font-medium ${
                              (product.totalInventory || 0) === 0
                                ? "text-red-600"
                                : (product.totalInventory || 0) <= 10
                                ? "text-yellow-600"
                                : "text-foreground"
                            }`}
                          >
                            {product.totalInventory || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-3">
                          <RowActionsMenu
                            entityType="faire-product"
                            entityId={product.id}
                            entityName={product.name}
                            detailUrl={`/faire-wholesale/products/${product.id}`}
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
                    <TableCell colSpan={8} className="h-24">
                      <EmptyState
                        icon={Package}
                        title="No products found"
                        description={
                          searchQuery || state !== "all" || lifecycleState !== "all"
                            ? "Try adjusting your filters."
                            : "Products will appear here when added or synced from Faire."
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
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
      <CreateProductDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        stores={stores || []}
        suppliers={suppliers}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

// Product Card Component for Grid View
function ProductCard({ product }: { product: FaireProduct }) {
  const saleStateConfig = FAIRE_PRODUCT_SALE_STATE_CONFIG[product.saleState]
  const imageUrl = product.images?.[0]
  const isOutOfStock = (product.totalInventory || 0) === 0
  const isLowStock = (product.totalInventory || 0) > 0 && (product.totalInventory || 0) <= 10

  return (
    <Link href={`/faire-wholesale/products/${product.id}`}>
      <Card className="group border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover:border-primary/30">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                saleStateConfig?.bgColor,
                saleStateConfig?.color
              )}
            >
              {saleStateConfig?.label}
            </span>
          </div>

          {/* Stock Warning Badge */}
          {(isOutOfStock || isLowStock) && (
            <div className="absolute top-2 right-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700">
                  Low Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.sku && (
            <p className="text-xs text-muted-foreground font-mono mb-2">
              {product.sku}
            </p>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span>{product.variantCount || 0} variants</span>
            </div>
            <div className={cn(
              "text-xs font-medium",
              isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-muted-foreground"
            )}>
              {product.totalInventory || 0} in stock
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ProductsPageSkeleton({ viewMode }: { viewMode: ViewMode }) {
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
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <Skeleton className="h-64 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function FaireProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton viewMode="grid" />}>
      <ProductsPageContent />
    </Suspense>
  )
}
