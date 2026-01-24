"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Truck,
  ExternalLink,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FaireShipment } from "@/lib/types/faire"

interface ShipmentCardProps {
  shipment: FaireShipment
  className?: string
}

export function ShipmentCard({ shipment, className }: ShipmentCardProps) {
  const isDelivered = !!shipment.deliveredAt
  const isShipped = !!shipment.shippedAt

  const getStatusBadge = () => {
    if (isDelivered) {
      return (
        <Badge className="bg-green-100 text-green-700 h-5 px-2 py-0.5 rounded-md text-xs">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Delivered
        </Badge>
      )
    }
    if (isShipped) {
      return (
        <Badge className="bg-blue-100 text-blue-700 h-5 px-2 py-0.5 rounded-md text-xs">
          <Truck className="h-3 w-3 mr-1" />
          In Transit
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 h-5 px-2 py-0.5 rounded-md text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const formatCarrier = (carrier?: string): string => {
    if (!carrier) return "Unknown Carrier"
    const carriers: Record<string, string> = {
      ups: "UPS",
      fedex: "FedEx",
      usps: "USPS",
      dhl: "DHL",
      ontrac: "OnTrac",
      lasership: "LaserShip",
    }
    return carriers[carrier.toLowerCase()] || carrier
  }

  return (
    <Card className={cn("border border-border rounded-[14px]", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatCarrier(shipment.carrier)}
              </p>
              {shipment.shippingType && (
                <p className="text-xs text-muted-foreground capitalize">
                  {shipment.shippingType}
                </p>
              )}
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-3">
          {/* Tracking Number */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tracking Number</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {shipment.trackingCode || "—"}
              </p>
            </div>
            {shipment.trackingUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                asChild
              >
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>

          {/* Timeline */}
          <div className="border-t pt-3 space-y-2">
            {shipment.shippedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Shipped:</span>
                <span className="text-foreground">
                  {new Date(shipment.shippedAt).toLocaleDateString()} at{" "}
                  {new Date(shipment.shippedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {shipment.deliveredAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="text-muted-foreground">Delivered:</span>
                <span className="text-foreground">
                  {new Date(shipment.deliveredAt).toLocaleDateString()} at{" "}
                  {new Date(shipment.deliveredAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {!shipment.shippedAt && !shipment.deliveredAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Awaiting shipment pickup
                </span>
              </div>
            )}
          </div>

          {/* Items count if available */}
          {shipment.itemIds && shipment.itemIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
              <Package className="h-3 w-3" />
              <span>{shipment.itemIds.length} item(s) in this shipment</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
