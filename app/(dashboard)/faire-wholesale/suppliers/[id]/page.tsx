"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Truck,
  Edit,
  Trash2,
  Store,
  Mail,
  Phone,
  Globe,
  MapPin,
  Package,
  Clock,
  CreditCard,
  Calendar,
  User,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  getFaireSupplierById,
  deleteFaireSupplier,
  getFaireStores,
  getFaireProducts,
} from "@/lib/actions/faire"
import {
  FAIRE_SUPPLIER_STATUS_CONFIG,
  FAIRE_PRODUCT_SALE_STATE_CONFIG,
} from "@/lib/types/faire"
import { EditSupplierDrawer } from "@/components/faire/EditSupplierDrawer"
import { toast } from "sonner"

export default function FaireSupplierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const supplierId = params.id as string

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const { data: supplier, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-supplier", supplierId],
    queryFn: () => getFaireSupplierById(supplierId),
    staleTime: 2 * 60 * 1000,
  })

  const { data: stores } = useQuery({
    queryKey: ["faire-stores"],
    queryFn: () => getFaireStores(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: supplierProductsResult } = useQuery({
    queryKey: ["faire-supplier-products", supplierId],
    queryFn: () => getFaireProducts({ supplierId }, { page: 1, pageSize: 100 }),
    staleTime: 2 * 60 * 1000,
    enabled: !!supplierId,
  })
  const supplierProducts = supplierProductsResult?.data

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteFaireSupplier(supplierId)
      toast.success("Supplier deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["faire-suppliers"] })
      router.push("/faire-wholesale/suppliers")
    } catch (error) {
      console.error("Failed to delete supplier:", error)
      toast.error("Failed to delete supplier")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return <SupplierDetailSkeleton />
  }

  if (error || !supplier) {
    return (
      <ErrorState
        title="Supplier not found"
        message="The supplier you're looking for doesn't exist or has been deleted."
        onRetry={() => router.push("/faire-wholesale/suppliers")}
      />
    )
  }

  const statusConfig = FAIRE_SUPPLIER_STATUS_CONFIG[supplier.status]
  const fullAddress = [
    supplier.addressLine1,
    supplier.addressLine2,
    supplier.city,
    supplier.state,
    supplier.postalCode,
    supplier.country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/faire-wholesale/suppliers")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                {supplier.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {supplier.code && (
                  <span className="text-xs text-white/80 font-mono">{supplier.code}</span>
                )}
                <Badge
                  variant="outline"
                  className={`${statusConfig?.bgColor} ${statusConfig?.color} border-0 text-xs`}
                >
                  {statusConfig?.label}
                </Badge>
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
              {supplier.store?.name || "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Products</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {supplierProducts?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Lead Time</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : "Not set"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Payment Terms</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {supplier.paymentTerms || "Not set"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products ({supplierProducts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.contactName && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Name</p>
                      <p className="text-sm font-medium">{supplier.contactName}</p>
                    </div>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${supplier.email}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {supplier.email}
                      </a>
                    </div>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${supplier.phone}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {supplier.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                {!supplier.contactName && !supplier.email && !supplier.phone && !supplier.website && (
                  <p className="text-sm text-muted-foreground italic">
                    No contact information provided
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Address</CardTitle>
              </CardHeader>
              <CardContent>
                {fullAddress ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      {supplier.addressLine1 && (
                        <p className="text-sm">{supplier.addressLine1}</p>
                      )}
                      {supplier.addressLine2 && (
                        <p className="text-sm">{supplier.addressLine2}</p>
                      )}
                      <p className="text-sm">
                        {[supplier.city, supplier.state, supplier.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {supplier.country && (
                        <p className="text-sm text-muted-foreground">{supplier.country}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No address provided
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Business Terms */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Business Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={`${statusConfig?.bgColor} ${statusConfig?.color} border-0`}
                  >
                    {statusConfig?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Terms</span>
                  <span className="text-sm font-medium">
                    {supplier.paymentTerms || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lead Time</span>
                  <span className="text-sm font-medium">
                    {supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Record Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">
                    {new Date(supplier.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Portal Credentials */}
            {supplier.credentials && (
              <Card className="border border-border rounded-[14px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Portal Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supplier.credentials.domain && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Domain</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://${supplier.credentials.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {supplier.credentials.domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(supplier.credentials!.domain!, 'domain')}
                        >
                          {copiedField === 'domain' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {supplier.credentials.email && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Email / Username</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {supplier.credentials.email}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(supplier.credentials!.email!, 'email')}
                        >
                          {copiedField === 'email' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {supplier.credentials.password && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Password</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {showPassword ? supplier.credentials.password : '••••••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(supplier.credentials!.password!, 'password')}
                        >
                          {copiedField === 'password' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {supplier.notes && (
              <Card className="border border-border rounded-[14px] lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {supplier.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="border border-border rounded-[14px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                    <TableHead className="px-3">
                      <span className="text-sm font-medium text-muted-foreground">Product</span>
                    </TableHead>
                    <TableHead className="px-3">
                      <span className="text-sm font-medium text-muted-foreground">SKU</span>
                    </TableHead>
                    <TableHead className="px-3">
                      <span className="text-sm font-medium text-muted-foreground">Sale State</span>
                    </TableHead>
                    <TableHead className="px-3">
                      <span className="text-sm font-medium text-muted-foreground">Min Qty</span>
                    </TableHead>
                    <TableHead className="px-3">
                      <span className="text-sm font-medium text-muted-foreground">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierProducts && supplierProducts.length > 0 ? (
                    supplierProducts.map((product) => {
                      const saleConfig = FAIRE_PRODUCT_SALE_STATE_CONFIG[product.saleState]
                      return (
                        <TableRow key={product.id} className="border-b border-border">
                          <TableCell className="px-3">
                            <Link
                              href={`/faire-wholesale/products/${product.id}`}
                              className="text-sm font-medium text-foreground hover:underline"
                            >
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell className="px-3">
                            <span className="text-sm font-mono text-muted-foreground">
                              {product.sku || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="px-3">
                            <Badge
                              variant="outline"
                              className={`${saleConfig?.bgColor} ${saleConfig?.color} border-0 text-xs`}
                            >
                              {saleConfig?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3">
                            <span className="text-sm text-muted-foreground">
                              {product.minimumOrderQuantity}
                            </span>
                          </TableCell>
                          <TableCell className="px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/faire-wholesale/products/${product.id}`}>
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24">
                        <EmptyState
                          icon={Package}
                          title="No products"
                          description="This supplier has no products assigned yet."
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Drawer */}
      <EditSupplierDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        supplier={supplier}
        stores={stores || []}
        onSuccess={() => {
          refetch()
          queryClient.invalidateQueries({ queryKey: ["faire-suppliers"] })
        }}
      />

      {/* Delete Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${supplier.name}"? This action cannot be undone. Any products linked to this supplier will have their supplier reference removed.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        icon={<Trash2 className="h-4 w-4" />}
      />
    </div>
  )
}

function SupplierDetailSkeleton() {
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
