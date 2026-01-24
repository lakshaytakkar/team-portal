"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Store,
  Truck,
  Tag,
  Layers,
  Plus,
  Globe,
  ImageOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  getFaireProductById,
  getFaireProductVariants,
  deleteFaireProduct,
  getFaireStores,
  getFaireSuppliers,
} from "@/lib/actions/faire"
import {
  formatCents,
  FAIRE_PRODUCT_SALE_STATE_CONFIG,
  FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG,
} from "@/lib/types/faire"
import { EditProductDrawer } from "@/components/faire/EditProductDrawer"
import { ProductVariantTable } from "@/components/faire/ProductVariantTable"
import { toast } from "sonner"

export default function FaireProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const productId = params.id as string

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-product", productId],
    queryFn: () => getFaireProductById(productId),
    staleTime: 2 * 60 * 1000,
  })

  const { data: variants, refetch: refetchVariants } = useQuery({
    queryKey: ["faire-product-variants", productId],
    queryFn: () => getFaireProductVariants(productId),
    staleTime: 2 * 60 * 1000,
    enabled: !!productId,
  })

  const { data: stores } = useQuery({
    queryKey: ["faire-stores"],
    queryFn: () => getFaireStores(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: suppliers } = useQuery({
    queryKey: ["faire-suppliers"],
    queryFn: () => getFaireSuppliers(),
    staleTime: 5 * 60 * 1000,
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteFaireProduct(productId)
      toast.success("Product deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["faire-products"] })
      router.push("/faire-wholesale/products")
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast.error("Failed to delete product")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <ErrorState
        title="Product not found"
        message="The product you're looking for doesn't exist or has been deleted."
        onRetry={() => router.push("/faire-wholesale/products")}
      />
    )
  }

  const saleStateConfig = FAIRE_PRODUCT_SALE_STATE_CONFIG[product.saleState]
  const lifecycleConfig = FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG[product.lifecycleState]
  const totalInventory = variants?.reduce((sum, v) => sum + (v.availableQuantity || 0), 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/faire-wholesale/products")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {product.sku && (
                  <span className="text-xs text-white/80 font-mono">SKU: {product.sku}</span>
                )}
                {product.faireProductId && (
                  <span className="text-xs text-white/80 font-mono">
                    Faire: {product.faireProductId}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDrawerOpen(true)}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-red-500/20 text-white border-red-300/30 hover:bg-red-500/30"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Store</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {product.store?.name || "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Supplier</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {product.supplier?.name || "No supplier assigned"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Variants</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {variants?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Total Inventory</p>
            </div>
            <p
              className={`text-sm font-semibold ${
                totalInventory === 0
                  ? "text-red-600"
                  : totalInventory <= 10
                  ? "text-yellow-600"
                  : "text-foreground"
              }`}
            >
              {totalInventory}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Variants ({variants?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Product Details */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sale State</span>
                  <Badge
                    variant="outline"
                    className={`${saleStateConfig?.bgColor} ${saleStateConfig?.color} border-0`}
                  >
                    {saleStateConfig?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lifecycle</span>
                  <Badge
                    variant="outline"
                    className={`${lifecycleConfig?.bgColor} ${lifecycleConfig?.color} border-0`}
                  >
                    {lifecycleConfig?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit Multiplier</span>
                  <span className="text-sm font-medium">{product.unitMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Min Order Qty</span>
                  <span className="text-sm font-medium">{product.minimumOrderQuantity}</span>
                </div>
                {product.madeInCountry && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Made In</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {product.madeInCountry}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preorderable</span>
                  <span className="text-sm font-medium">
                    {product.preorderable ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Description</CardTitle>
              </CardHeader>
              <CardContent>
                {product.shortDescription && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Short Description</p>
                    <p className="text-sm">{product.shortDescription}</p>
                  </div>
                )}
                {product.description ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Full Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided</p>
                )}
              </CardContent>
            </Card>

            {/* Sync Info */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Sync Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Faire Product ID</span>
                  <span className="text-sm font-mono">
                    {product.faireProductId || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Faire Brand ID</span>
                  <span className="text-sm font-mono">
                    {product.faireBrandId || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Synced</span>
                  <span className="text-sm">
                    {product.lastSyncedAt
                      ? new Date(product.lastSyncedAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            {product.images && product.images.length > 0 && (
              <Card className="border border-border rounded-[14px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Images ({product.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === 0 ? product.images!.length - 1 : prev - 1
                            )
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev === product.images!.length - 1 ? 0 : prev + 1
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={cn(
                            "relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                            selectedImageIndex === idx
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="variants">
          <ProductVariantTable
            productId={productId}
            storeId={product.storeId}
            variants={variants || []}
            onRefresh={() => refetchVariants()}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Drawer */}
      <EditProductDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        product={product}
        stores={stores || []}
        suppliers={suppliers || []}
        onSuccess={() => {
          refetch()
          queryClient.invalidateQueries({ queryKey: ["faire-products"] })
        }}
      />

      {/* Delete Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        icon={<Trash2 className="h-4 w-4" />}
      />
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
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
