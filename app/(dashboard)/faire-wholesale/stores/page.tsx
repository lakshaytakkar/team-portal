"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  Store,
  ShoppingCart,
  Package,
  DollarSign,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getFaireStores, deleteFaireStore, getFaireOverviewStats } from "@/lib/actions/faire"
import { formatCents, type FaireStore } from "@/lib/types/faire"
import { CreateFaireStoreDialog } from "@/components/faire/CreateFaireStoreDialog"

export default function FaireStoresPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: stores, isLoading, error, refetch } = useQuery({
    queryKey: ["faire-stores"],
    queryFn: () => getFaireStores(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: stats } = useQuery({
    queryKey: ["faire-overview-stats"],
    queryFn: () => getFaireOverviewStats(),
    staleTime: 5 * 60 * 1000,
  })

  const handleDeleteStore = async (storeId: string) => {
    await deleteFaireStore(storeId)
    await queryClient.invalidateQueries({ queryKey: ["faire-stores"] })
    await queryClient.invalidateQueries({ queryKey: ["faire-overview-stats"] })
  }

  const filteredStores = stores?.filter((store) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      store.name.toLowerCase().includes(query) ||
      store.code.toLowerCase().includes(query) ||
      store.faireBrandId?.toLowerCase().includes(query)
    )
  }) || []

  if (isLoading) {
    return <StoresPageSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load stores"
        message="We couldn't load the stores. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Faire Stores
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              Manage your Faire Wholesale seller accounts
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Stores</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats?.totalStores || 0}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Active Stores</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats?.activeStores || 0}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-orange-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Orders</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{stats?.totalOrders || 0}</p>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Revenue</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              {formatCents(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white rounded-t-[14px]">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Store
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[100px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Code</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Store Name</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Faire Brand ID</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Auto Sync</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Last Sync</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <TableRow key={store.id} className="border-b border-border">
                    <TableCell className="px-3">
                      <Link href={`/faire-wholesale/stores/${store.id}`} className="hover:underline">
                        <span className="text-xs font-mono text-muted-foreground">{store.code}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      <Link href={`/faire-wholesale/stores/${store.id}`} className="hover:underline">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Store className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">{store.name}</span>
                            {store.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {store.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        {store.faireBrandId || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
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
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex items-center gap-1.5">
                        {store.autoSyncEnabled ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-xs text-green-600">Enabled</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Disabled</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3">
                      <span className="text-xs text-muted-foreground">
                        {store.lastSyncAt
                          ? new Date(store.lastSyncAt).toLocaleDateString()
                          : "Never"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <RowActionsMenu
                        entityType="faire-store"
                        entityId={store.id}
                        entityName={store.name}
                        detailUrl={`/faire-wholesale/stores/${store.id}`}
                        canView={true}
                        canEdit={true}
                        canDelete={true}
                        onDelete={() => handleDeleteStore(store.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={Store}
                      title="No stores found"
                      description={searchQuery
                        ? "Try adjusting your search."
                        : "Get started by adding your first Faire store."
                      }
                      action={!searchQuery ? {
                        label: "Add Store",
                        onClick: () => setIsCreateDialogOpen(true),
                      } : undefined}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateFaireStoreDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}

function StoresPageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
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
