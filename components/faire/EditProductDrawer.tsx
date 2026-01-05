"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Package } from "lucide-react"
import { toast } from "sonner"
import { updateFaireProduct } from "@/lib/actions/faire"
import type {
  FaireStore,
  FaireSupplier,
  FaireProduct,
  FaireProductSaleState,
  FaireProductLifecycleState,
} from "@/lib/types/faire"
import {
  FAIRE_PRODUCT_SALE_STATE_CONFIG,
  FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG,
} from "@/lib/types/faire"

const formSchema = z.object({
  supplierId: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  saleState: z.enum(["FOR_SALE", "SALES_PAUSED", "DISCONTINUED"]),
  lifecycleState: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  unitMultiplier: z.number().int().positive(),
  minimumOrderQuantity: z.number().int().positive(),
  madeInCountry: z.string().optional(),
  preorderable: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface EditProductDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: FaireProduct | null
  stores: FaireStore[]
  suppliers: FaireSupplier[]
  onSuccess?: () => void
}

export function EditProductDrawer({
  open,
  onOpenChange,
  product,
  stores,
  suppliers,
  onSuccess,
}: EditProductDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredSuppliers = suppliers.filter(
    (s) => s.storeId === product?.storeId
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (product && open) {
      reset({
        supplierId: product.supplierId || undefined,
        name: product.name,
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        sku: product.sku || "",
        saleState: product.saleState,
        lifecycleState: product.lifecycleState,
        unitMultiplier: product.unitMultiplier,
        minimumOrderQuantity: product.minimumOrderQuantity,
        madeInCountry: product.madeInCountry || "",
        preorderable: product.preorderable,
      })
    }
  }, [product, open, reset])

  const onSubmit = async (data: FormData) => {
    if (!product) return

    setIsSubmitting(true)
    try {
      await updateFaireProduct(product.id, {
        supplierId: data.supplierId || undefined,
        name: data.name,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        sku: data.sku || undefined,
        saleState: data.saleState as FaireProductSaleState,
        lifecycleState: data.lifecycleState as FaireProductLifecycleState,
        unitMultiplier: data.unitMultiplier,
        minimumOrderQuantity: data.minimumOrderQuantity,
        madeInCountry: data.madeInCountry || undefined,
        preorderable: data.preorderable,
      })
      toast.success("Product updated successfully")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to update product:", error)
      toast.error("Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!product) return null

  const store = stores.find((s) => s.id === product.storeId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Product
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {/* Store (Read-only) */}
          <div className="space-y-2">
            <Label>Store</Label>
            <Input value={store?.name || ""} disabled />
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier</Label>
            <Select
              value={watch("supplierId") || "none"}
              onValueChange={(value) =>
                setValue("supplierId", value === "none" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No supplier</SelectItem>
                {filteredSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="Enter product SKU"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              {...register("shortDescription")}
              placeholder="Brief product description"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Detailed product description"
              rows={3}
            />
          </div>

          {/* States Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sale State</Label>
              <Select
                value={watch("saleState")}
                onValueChange={(value) =>
                  setValue("saleState", value as FaireProductSaleState)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FAIRE_PRODUCT_SALE_STATE_CONFIG).map(
                    ([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lifecycle State</Label>
              <Select
                value={watch("lifecycleState")}
                onValueChange={(value) =>
                  setValue("lifecycleState", value as FaireProductLifecycleState)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG).map(
                    ([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantities Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitMultiplier">Unit Multiplier</Label>
              <Input
                id="unitMultiplier"
                type="number"
                min={1}
                {...register("unitMultiplier", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumOrderQuantity">Min Order Qty</Label>
              <Input
                id="minimumOrderQuantity"
                type="number"
                min={1}
                {...register("minimumOrderQuantity", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Made In Country */}
          <div className="space-y-2">
            <Label htmlFor="madeInCountry">Made In Country</Label>
            <Input
              id="madeInCountry"
              {...register("madeInCountry")}
              placeholder="e.g., USA, China, Germany"
            />
          </div>

          {/* Preorderable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="preorderable">Preorderable</Label>
            <Switch
              id="preorderable"
              checked={watch("preorderable")}
              onCheckedChange={(checked) => setValue("preorderable", checked)}
            />
          </div>

          <SheetFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
