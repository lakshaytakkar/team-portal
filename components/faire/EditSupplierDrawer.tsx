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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Truck } from "lucide-react"
import { toast } from "sonner"
import { updateFaireSupplier } from "@/lib/actions/faire"
import type {
  FaireStore,
  FaireSupplier,
  FaireSupplierStatus,
} from "@/lib/types/faire"
import { FAIRE_SUPPLIER_STATUS_CONFIG } from "@/lib/types/faire"

const formSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  code: z.string().optional(),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  contactName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  paymentTerms: z.string().optional(),
  leadTimeDays: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditSupplierDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: FaireSupplier | null
  stores: FaireStore[]
  onSuccess?: () => void
}

export function EditSupplierDrawer({
  open,
  onOpenChange,
  supplier,
  stores,
  onSuccess,
}: EditSupplierDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (supplier && open) {
      reset({
        name: supplier.name,
        code: supplier.code || "",
        status: supplier.status,
        contactName: supplier.contactName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        website: supplier.website || "",
        addressLine1: supplier.addressLine1 || "",
        addressLine2: supplier.addressLine2 || "",
        city: supplier.city || "",
        state: supplier.state || "",
        postalCode: supplier.postalCode || "",
        country: supplier.country || "",
        paymentTerms: supplier.paymentTerms || "",
        leadTimeDays: supplier.leadTimeDays || null,
        notes: supplier.notes || "",
      })
    }
  }, [supplier, open, reset])

  const onSubmit = async (data: FormData) => {
    if (!supplier) return

    setIsSubmitting(true)
    try {
      await updateFaireSupplier(supplier.id, {
        name: data.name,
        code: data.code || undefined,
        status: data.status as FaireSupplierStatus,
        contactName: data.contactName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        addressLine1: data.addressLine1 || undefined,
        addressLine2: data.addressLine2 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        country: data.country || undefined,
        paymentTerms: data.paymentTerms || undefined,
        leadTimeDays: data.leadTimeDays || undefined,
        notes: data.notes || undefined,
      })
      toast.success("Supplier updated successfully")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to update supplier:", error)
      toast.error("Failed to update supplier")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!supplier) return null

  const store = stores.find((s) => s.id === supplier.storeId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Edit Supplier
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {/* Store (Read-only) */}
          <div className="space-y-2">
            <Label>Store</Label>
            <Input value={store?.name || ""} disabled />
          </div>

          {/* Name & Code Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter supplier name"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Supplier Code</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g., SUP-001"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as FaireSupplierStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FAIRE_SUPPLIER_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              {...register("contactName")}
              placeholder="Primary contact person"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contact@supplier.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder="https://www.supplier.com"
            />
            {errors.website && (
              <p className="text-xs text-red-500">{errors.website.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              {...register("addressLine1")}
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              {...register("addressLine2")}
              placeholder="Suite, unit, building (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="City" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} placeholder="State" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register("postalCode")}
                placeholder="ZIP code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} placeholder="USA" />
            </div>
          </div>

          {/* Business Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                {...register("paymentTerms")}
                placeholder="e.g., Net 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                min={1}
                {...register("leadTimeDays", { valueAsNumber: true })}
                placeholder="e.g., 7"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about this supplier"
              rows={3}
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
