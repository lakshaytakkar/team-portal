"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Store,
  Edit,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import {
  getFaireStoreById,
  updateFaireStore,
  getFaireStoreStats,
} from "@/lib/actions/faire"
import { formatCents, type FaireStore, type FaireStoreStats } from "@/lib/types/faire"
import { EditFaireStoreDrawer } from "@/components/faire/EditFaireStoreDrawer"

export default function FaireStoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const storeId = params.id as string
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: store, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-store", storeId],
    queryFn: () => getFaireStoreById(storeId),
    enabled: !!storeId,
  })

  const { data: stats } = useQuery({
    queryKey: ["faire-store-stats", storeId],
    queryFn: () => getFaireStoreStats(storeId),
    enabled: !!storeId,
  })

  const handleToggleActive = async () => {
    if (!store) return
    try {
      await updateFaireStore(store.id, {
        isActive: !store.isActive,
      })
      toast.success(`Store ${!store.isActive ? "activated" : "deactivated"}`)
      await refetch()
      await queryClient.invalidateQueries({ queryKey: ["faire-stores"] })
    } catch (error) {
      toast.error(
        `Failed to update store: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  const handleToggleAutoSync = async () => {
    if (!store) return
    try {
      await updateFaireStore(store.id, {
        autoSyncEnabled: !store.autoSyncEnabled,
      })
      toast.success(
        `Auto sync ${!store.autoSyncEnabled ? "enabled" : "disabled"}`
      )
      await refetch()
    } catch (error) {
      toast.error(
        `Failed to update auto sync: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

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

  if (error || !store) {
    return (
      <div className="space-y-5">
        <ErrorState
          title="Store not found"
          message="The store you're looking for doesn't exist or has been deleted."
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
            onClick={() => router.push("/faire-wholesale/stores")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                {store.name}
              </h1>
              <Badge
                className={cn(
                  "h-5 px-2 py-0.5 rounded-md text-xs",
                  store.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {store.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {store.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {store.isActive ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsEditDrawerOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-orange-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">
                Orders (Month)
              </p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.ordersThisMonth || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">
                Revenue (Month)
              </p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCents(stats?.revenueThisMonth || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-purple-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">
                Low Stock Items
              </p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.lowStockProducts || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-yellow-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">
                Pending Shipments
              </p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {stats?.pendingShipments || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="sync">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Store Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {store.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Code</p>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {store.code || "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Faire Brand ID
                    </p>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {store.faireBrandId || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      API Token
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {store.apiToken ? "••••••••" : "Not configured"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-foreground">
                    {store.description || "No description provided"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      className={cn(
                        "h-5 px-2 py-0.5 rounded-md text-xs",
                        store.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {store.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="text-sm text-foreground">
                      {new Date(store.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-5 mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Sync Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Auto Sync
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Automatically sync orders and products from Faire
                    </p>
                  </div>
                  <Button
                    variant={store.autoSyncEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleAutoSync}
                  >
                    {store.autoSyncEnabled ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Disabled
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Last Sync
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {store.lastSyncAt
                        ? new Date(store.lastSyncAt).toLocaleString()
                        : "Never synced"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-5 mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Sync History
              </h2>
              <EmptyState
                icon={Clock}
                title="No sync history"
                description="Sync logs will appear here once you start syncing with Faire."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Drawer */}
      <EditFaireStoreDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        store={store}
        onSuccess={() => {
          refetch()
          queryClient.invalidateQueries({ queryKey: ["faire-stores"] })
        }}
      />
    </div>
  )
}
