"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { getFaireOrderById, getFaireShipments } from "@/lib/actions/faire"
import { formatCents } from "@/lib/types/faire"
import { OrderStatusBadge } from "@/components/faire/OrderStatusBadge"
import { OrderItemsTable } from "@/components/faire/OrderItemsTable"
import { OrderStateWorkflow } from "@/components/faire/OrderStateWorkflow"
import { CreateShipmentDialog } from "@/components/faire/CreateShipmentDialog"
import { ShipmentCard } from "@/components/faire/ShipmentCard"

export default function FaireOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const orderId = params.id as string
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false)

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-order", orderId],
    queryFn: () => getFaireOrderById(orderId),
    enabled: !!orderId,
  })

  const { data: shipments } = useQuery({
    queryKey: ["faire-shipments", orderId],
    queryFn: () => getFaireShipments({ orderId }),
    enabled: !!orderId && activeTab === "shipments",
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-5">
        <ErrorState
          title="Order not found"
          message="The order you're looking for doesn't exist or has been deleted."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/faire-wholesale/orders")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                Order {order.displayId || order.faireOrderId?.slice(0, 12)}
              </h1>
              <OrderStatusBadge state={order.state} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {order.store?.name} &bull; Created{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateShipmentOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shipment
          </Button>
        </div>
      </div>

      {/* Order State Workflow */}
      <OrderStateWorkflow currentState={order.state} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Order Total</p>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {formatCents(order.totalCents || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Items</p>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {order.items?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Ship By</p>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {order.shipAfter
                ? new Date(order.shipAfter).toLocaleDateString()
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Shipments</p>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {shipments?.data?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Info */}
            <Card className="border border-border rounded-[14px]">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {order.address?.name || "—"}
                    </p>
                  </div>
                  {order.address?.companyName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="text-sm font-medium text-foreground">
                        {order.address.companyName}
                      </p>
                    </div>
                  )}
                  {order.address?.phoneNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">
                        {order.address.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border border-border rounded-[14px]">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h2>
                {order.address ? (
                  <div className="space-y-1 text-sm text-foreground">
                    {order.address.address1 && <p>{order.address.address1}</p>}
                    {order.address.address2 && <p>{order.address.address2}</p>}
                    <p>
                      {[
                        order.address.city,
                        order.address.state,
                        order.address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {order.address.country && <p>{order.address.country}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No address provided
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCents(order.subtotalCents || 0)}
                  </span>
                </div>
                {order.shippingCents && order.shippingCents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shipping</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCents(order.shippingCents)}
                    </span>
                  </div>
                )}
                {order.payoutCosts?.commissionCents && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Faire Commission
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      -{formatCents(order.payoutCosts.commissionCents)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Order Total
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {formatCents(order.totalCents || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-5 mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <OrderItemsTable items={order.items || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-5 mt-5">
          {shipments?.data && shipments.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shipments.data.map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
            </div>
          ) : (
            <Card className="border border-border rounded-[14px]">
              <CardContent className="p-5">
                <EmptyState
                  icon={Truck}
                  title="No shipments yet"
                  description="Create a shipment to track delivery of this order."
                  action={{
                    label: "Add Shipment",
                    onClick: () => setIsCreateShipmentOpen(true),
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Shipment Dialog */}
      <CreateShipmentDialog
        open={isCreateShipmentOpen}
        onOpenChange={setIsCreateShipmentOpen}
        orderId={order.id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["faire-shipments", orderId] })
        }}
      />
    </div>
  )
}
