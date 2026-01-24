"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Truck } from "lucide-react"
import { createFaireShipment } from "@/lib/actions/faire"
import type { CreateFaireShipmentInput } from "@/lib/types/faire"

const CARRIERS = [
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "usps", label: "USPS" },
  { value: "dhl", label: "DHL" },
  { value: "ontrac", label: "OnTrac" },
  { value: "lasership", label: "LaserShip" },
  { value: "other", label: "Other" },
]

const SHIPPING_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
  { value: "overnight", label: "Overnight" },
  { value: "freight", label: "Freight" },
]

const formSchema = z.object({
  carrier: z.string().min(1, "Carrier is required"),
  trackingCode: z.string().min(1, "Tracking number is required"),
  trackingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  shippingType: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateShipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  onSuccess?: () => void
}

export function CreateShipmentDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: CreateShipmentDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carrier: "",
      trackingCode: "",
      trackingUrl: "",
      shippingType: "",
    },
  })

  const carrier = watch("carrier")
  const trackingCode = watch("trackingCode")

  // Auto-generate tracking URL based on carrier
  const generateTrackingUrl = (carrier: string, code: string): string => {
    const urls: Record<string, string> = {
      ups: `https://www.ups.com/track?tracknum=${code}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${code}`,
      usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${code}`,
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${code}`,
    }
    return urls[carrier] || ""
  }

  // Update tracking URL when carrier or code changes
  const handleCarrierChange = (value: string) => {
    setValue("carrier", value)
    if (trackingCode && value) {
      const url = generateTrackingUrl(value, trackingCode)
      if (url) setValue("trackingUrl", url)
    }
  }

  const handleTrackingCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value
    setValue("trackingCode", code)
    if (carrier && code) {
      const url = generateTrackingUrl(carrier, code)
      if (url) setValue("trackingUrl", url)
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const input: CreateFaireShipmentInput = {
        orderId,
        carrier: data.carrier,
        trackingCode: data.trackingCode,
        trackingUrl: data.trackingUrl || undefined,
        shippingType: data.shippingType || undefined,
      }
      return createFaireShipment(input)
    },
    onSuccess: () => {
      toast.success("Shipment created successfully")
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create shipment")
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Add Shipment
          </DialogTitle>
          <DialogDescription>
            Enter the shipping carrier and tracking information for this order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier *</Label>
            <Select value={carrier} onValueChange={handleCarrierChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carrier && (
              <p className="text-sm text-destructive">{errors.carrier.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingCode">Tracking Number *</Label>
            <Input
              id="trackingCode"
              placeholder="Enter tracking number"
              value={trackingCode}
              onChange={handleTrackingCodeChange}
            />
            {errors.trackingCode && (
              <p className="text-sm text-destructive">{errors.trackingCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingUrl">Tracking URL</Label>
            <Input
              id="trackingUrl"
              placeholder="https://..."
              {...register("trackingUrl")}
            />
            {errors.trackingUrl && (
              <p className="text-sm text-destructive">{errors.trackingUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Auto-generated for common carriers. You can edit if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingType">Shipping Type</Label>
            <Select
              value={watch("shippingType")}
              onValueChange={(value) => setValue("shippingType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shipping type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Shipment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
