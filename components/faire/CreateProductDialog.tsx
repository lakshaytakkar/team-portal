"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Package } from "lucide-react"
import { toast } from "sonner"
import { createFaireProduct } from "@/lib/actions/faire"
import type {
  FaireStore,
  FaireSupplier,
  FaireProductSaleState,
  FaireProductLifecycleState,
} from "@/lib/types/faire"
import {
  FAIRE_PRODUCT_SALE_STATE_CONFIG,
  FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG,
} from "@/lib/types/faire"

const formSchema = z.object({
  storeId: z.string().min(1, "Store is required"),
  supplierId: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  saleState: z.enum(["FOR_SALE", "SALES_PAUSED", "DISCONTINUED"]).default("FOR_SALE"),
  lifecycleState: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  unitMultiplier: z.number().int().positive().default(1),
  minimumOrderQuantity: z.number().int().positive().default(1),
  madeInCountry: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stores: FaireStore[]
  suppliers: FaireSupplier[]
  onSuccess?: () => void
}

export function CreateProductDialog({
  open,
  onOpenChange,
  stores,
  suppliers,
  onSuccess,
}: CreateProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string>("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      saleState: "FOR_SALE",
      lifecycleState: "DRAFT",
      unitMultiplier: 1,
      minimumOrderQuantity: 1,
    },
  })

  const watchedStoreId = watch("storeId")
  const filteredSuppliers = suppliers.filter(
    (s) => !watchedStoreId || s.storeId === watchedStoreId
  )

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await createFaireProduct({
        storeId: data.storeId,
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
      })
      toast.success("Product created successfully")
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create product:", error)
      toast.error("Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Store */}
          <div className="space-y-2">
            <Label htmlFor="storeId">Store *</Label>
            <Select
              value={watchedStoreId}
              onValueChange={(value) => {
                setValue("storeId", value)
                setValue("supplierId", undefined)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.storeId && (
              <p className="text-xs text-red-500">{errors.storeId.message}</p>
            )}
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier</Label>
            <Select
              value={watch("supplierId") || ""}
              onValueChange={(value) => setValue("supplierId", value || undefined)}
              disabled={!watchedStoreId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier (optional)" />
              </SelectTrigger>
              <SelectContent>
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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
