"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Package, Loader2, Edit, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"
import {
  createFaireProductVariant,
  adjustFaireInventory,
} from "@/lib/actions/faire"
import {
  formatCents,
  FAIRE_PRODUCT_SALE_STATE_CONFIG,
  type FaireProductVariant,
  type FaireProductSaleState,
} from "@/lib/types/faire"

interface ProductVariantTableProps {
  productId: string
  storeId: string
  variants: FaireProductVariant[]
  onRefresh: () => void
}

export function ProductVariantTable({
  productId,
  storeId,
  variants,
  onRefresh,
}: ProductVariantTableProps) {
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<FaireProductVariant | null>(null)

  const handleOpenAdjustDialog = (variant: FaireProductVariant) => {
    setSelectedVariant(variant)
    setIsAdjustDialogOpen(true)
  }

  return (
    <>
      <Card className="border border-border rounded-[14px]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium">Product Variants</CardTitle>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="px-4">
                    <span className="text-sm font-medium text-muted-foreground">Variant</span>
                  </TableHead>
                  <TableHead className="px-4">
                    <span className="text-sm font-medium text-muted-foreground">SKU</span>
                  </TableHead>
                  <TableHead className="px-4">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                  </TableHead>
                  <TableHead className="px-4 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Wholesale</span>
                  </TableHead>
                  <TableHead className="px-4 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Retail</span>
                  </TableHead>
                  <TableHead className="px-4 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Available</span>
                  </TableHead>
                  <TableHead className="px-4 text-right">
                    <span className="text-sm font-medium text-muted-foreground">Reserved</span>
                  </TableHead>
                  <TableHead className="px-4 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.length > 0 ? (
                  variants.map((variant) => {
                    const saleStateConfig = FAIRE_PRODUCT_SALE_STATE_CONFIG[variant.saleState]
                    const isLowStock = variant.availableQuantity > 0 && variant.availableQuantity <= 10
                    const isOutOfStock = variant.availableQuantity <= 0

                    // Get primary price
                    const primaryPrice = variant.prices?.[0]
                    const wholesalePrice = primaryPrice?.wholesalePrice?.amountMinor
                    const retailPrice = primaryPrice?.retailPrice?.amountMinor

                    return (
                      <TableRow key={variant.id} className="border-b border-border">
                        <TableCell className="px-4">
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {variant.name}
                            </span>
                            {variant.options && variant.options.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {variant.options.map((opt, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {opt.name}: {opt.value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="text-sm font-mono text-muted-foreground">
                            {variant.sku || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant="outline"
                            className={`${saleStateConfig?.bgColor} ${saleStateConfig?.color} border-0 text-xs`}
                          >
                            {saleStateConfig?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <span className="text-sm font-medium">
                            {wholesalePrice !== undefined
                              ? formatCents(wholesalePrice)
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <span className="text-sm text-muted-foreground">
                            {retailPrice !== undefined
                              ? formatCents(retailPrice)
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {(isLowStock || isOutOfStock) && (
                              <AlertTriangle
                                className={`h-3 w-3 ${
                                  isOutOfStock ? "text-red-500" : "text-yellow-500"
                                }`}
                              />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                isOutOfStock
                                  ? "text-red-600"
                                  : isLowStock
                                  ? "text-yellow-600"
                                  : "text-foreground"
                              }`}
                            >
                              {variant.availableQuantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <span className="text-sm text-muted-foreground">
                            {variant.reservedQuantity || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAdjustDialog(variant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24">
                      <EmptyState
                        icon={Package}
                        title="No variants"
                        description="Add variants to define SKUs and pricing for this product."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Variant Dialog */}
      <CreateVariantDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        productId={productId}
        onSuccess={onRefresh}
      />

      {/* Adjust Inventory Dialog */}
      <AdjustInventoryDialog
        open={isAdjustDialogOpen}
        onOpenChange={setIsAdjustDialogOpen}
        variant={selectedVariant}
        onSuccess={onRefresh}
      />
    </>
  )
}

// Create Variant Dialog
interface CreateVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  onSuccess: () => void
}

function CreateVariantDialog({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: CreateVariantDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    gtin: "",
    wholesalePriceCents: 0,
    retailPriceCents: 0,
    availableQuantity: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Variant name is required")
      return
    }

    setIsSubmitting(true)
    try {
      await createFaireProductVariant({
        productId,
        name: formData.name,
        sku: formData.sku || undefined,
        gtin: formData.gtin || undefined,
        wholesalePriceCents: formData.wholesalePriceCents,
        retailPriceCents: formData.retailPriceCents || undefined,
        availableQuantity: formData.availableQuantity,
      })
      toast.success("Variant created successfully")
      setFormData({
        name: "",
        sku: "",
        gtin: "",
        wholesalePriceCents: 0,
        retailPriceCents: 0,
        availableQuantity: 0,
      })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to create variant:", error)
      toast.error("Failed to create variant")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Variant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="variantName">Variant Name *</Label>
            <Input
              id="variantName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Small, Red, Pack of 6"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variantSku">SKU</Label>
              <Input
                id="variantSku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Product SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variantGtin">GTIN/UPC</Label>
              <Input
                id="variantGtin"
                value={formData.gtin}
                onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
                placeholder="Barcode"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wholesalePrice">Wholesale Price ($)</Label>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                min="0"
                value={(formData.wholesalePriceCents / 100).toFixed(2)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wholesalePriceCents: Math.round(parseFloat(e.target.value || "0") * 100),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price ($)</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={(formData.retailPriceCents / 100).toFixed(2)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retailPriceCents: Math.round(parseFloat(e.target.value || "0") * 100),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableQuantity">Available Quantity</Label>
            <Input
              id="availableQuantity"
              type="number"
              min="0"
              value={formData.availableQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  availableQuantity: parseInt(e.target.value || "0"),
                })
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Variant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Adjust Inventory Dialog
interface AdjustInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: FaireProductVariant | null
  onSuccess: () => void
}

function AdjustInventoryDialog({
  open,
  onOpenChange,
  variant,
  onSuccess,
}: AdjustInventoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!variant || quantity === 0) {
      toast.error("Please enter a quantity adjustment")
      return
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the adjustment")
      return
    }

    setIsSubmitting(true)
    try {
      await adjustFaireInventory({
        variantId: variant.id,
        quantity,
        reason,
      })
      toast.success("Inventory adjusted successfully")
      setQuantity(0)
      setReason("")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to adjust inventory:", error)
      toast.error("Failed to adjust inventory")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!variant) return null

  const newQuantity = variant.availableQuantity + quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{variant.name}</p>
            {variant.sku && (
              <p className="text-xs text-muted-foreground font-mono">SKU: {variant.sku}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 border rounded-md">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-lg font-semibold">{variant.availableQuantity}</p>
            </div>
            <div className="p-2 border rounded-md">
              <p className="text-xs text-muted-foreground">Adjustment</p>
              <p
                className={`text-lg font-semibold ${
                  quantity > 0
                    ? "text-green-600"
                    : quantity < 0
                    ? "text-red-600"
                    : "text-foreground"
                }`}
              >
                {quantity > 0 ? `+${quantity}` : quantity}
              </p>
            </div>
            <div className="p-2 border rounded-md">
              <p className="text-xs text-muted-foreground">New Total</p>
              <p
                className={`text-lg font-semibold ${
                  newQuantity < 0 ? "text-red-600" : "text-foreground"
                }`}
              >
                {newQuantity}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustQuantity">Quantity Adjustment</Label>
            <Input
              id="adjustQuantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value || "0"))}
              placeholder="Enter positive or negative number"
            />
            <p className="text-xs text-muted-foreground">
              Use positive numbers to add stock, negative to remove.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustReason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inventory Count">Inventory Count</SelectItem>
                <SelectItem value="Stock Received">Stock Received</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
                <SelectItem value="Lost/Missing">Lost/Missing</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Adjustment">Manual Adjustment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || newQuantity < 0}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Apply Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
