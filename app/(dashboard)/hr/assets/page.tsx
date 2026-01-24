"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  FileDown,
  Search,
  Filter,
  Package,
  CheckCircle2,
  Wrench,
  LayoutGrid,
  LayoutList,
  Calendar,
  User,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Asset } from "@/lib/types/hr"
import { getAssets } from "@/lib/actions/assets"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateAssetDialog } from "@/components/hr/CreateAssetDialog"
import { AssignAssetDialog } from "@/components/hr/AssignAssetDialog"
import { AssetCard } from "@/components/hr/AssetCard"
import { AssetImage } from "@/components/hr/AssetImage"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchAssets() {
  return await getAssets()
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  available: { label: "Available", variant: "default" },
  assigned: { label: "Assigned", variant: "secondary" },
  maintenance: { label: "Maintenance", variant: "outline" },
  retired: { label: "Retired", variant: "destructive" },
}

function StatCard({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
}: {
  title: string
  value: string
  icon: React.ElementType
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl p-[18px] bg-white transition-all cursor-pointer",
        isActive
          ? "border-primary shadow-md bg-primary/5"
          : "border-border hover:border-primary/50 hover:shadow-sm"
      )}
      onClick={onClick}
    >
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div
          className={cn(
            "rounded-lg w-9 h-9 flex items-center justify-center transition-colors",
            isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export default function HRAssetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false)
  const [assignAssetId, setAssignAssetId] = useState<string | null>(null)
  const [assignAssetName, setAssignAssetName] = useState<string>("")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const { data: assets, isLoading, error, refetch } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  })

  // Filter assets by search query and status for counting
  const assetsForCounting = useMemo(() => {
    if (!assets) return []
    
    let filtered = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assignedTo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetType.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter by selected status
    if (selectedStatus) {
      filtered = filtered.filter((asset) => asset.status === selectedStatus)
    }

    return filtered
  }, [assets, searchQuery, selectedStatus])

  // Group assets by type and get unique types (based on filtered assets)
  const assetTypes = useMemo(() => {
    if (!assetsForCounting.length) return []
    const typesMap = new Map<string, { id: string; name: string; count: number }>()
    assetsForCounting.forEach((asset) => {
      const typeId = asset.assetType.id
      const typeName = asset.assetType.name
      if (!typesMap.has(typeId)) {
        typesMap.set(typeId, { id: typeId, name: typeName, count: 0 })
      }
      typesMap.get(typeId)!.count++
    })
    return Array.from(typesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [assetsForCounting])

  // Filter assets - must be called before any early returns to maintain hook order
  const filteredAssets = useMemo(() => {
    if (!assets) return []
    
    let filtered = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assignedTo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetType.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter by selected type
    if (selectedType !== "all") {
      filtered = filtered.filter((asset) => asset.assetType.id === selectedType)
    }

    // Filter by selected status
    if (selectedStatus) {
      filtered = filtered.filter((asset) => asset.status === selectedStatus)
    }

    return filtered
  }, [assets, searchQuery, selectedType, selectedStatus])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
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

  if (error) {
    return (
      <ErrorState
        title="Failed to load assets"
        message="We couldn't load assets. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const totalCount = assets?.length || 0
  const assignedCount = assets?.filter(a => a.status === "assigned").length || 0
  const availableCount = assets?.filter(a => a.status === "available").length || 0
  const maintenanceCount = assets?.filter(a => a.status === "maintenance").length || 0
  const retiredCount = assets?.filter(a => a.status === "retired").length || 0

  const handleAssignClick = (assetId: string, assetName: string) => {
    setAssignAssetId(assetId)
    setAssignAssetName(assetName)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Assets</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage organizational assets and assignments</p>
          </div>
          <Button onClick={() => setIsCreateAssetOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Assets"
          value={totalCount.toString()}
          icon={Package}
          onClick={() => setSelectedStatus(null)}
          isActive={selectedStatus === null}
        />
        <StatCard
          title="Assigned"
          value={assignedCount.toString()}
          icon={CheckCircle2}
          onClick={() => setSelectedStatus(selectedStatus === "assigned" ? null : "assigned")}
          isActive={selectedStatus === "assigned"}
        />
        <StatCard
          title="Available"
          value={availableCount.toString()}
          icon={Package}
          onClick={() => setSelectedStatus(selectedStatus === "available" ? null : "available")}
          isActive={selectedStatus === "available"}
        />
        <StatCard
          title="Maintenance"
          value={maintenanceCount.toString()}
          icon={Wrench}
          onClick={() => setSelectedStatus(selectedStatus === "maintenance" ? null : "maintenance")}
          isActive={selectedStatus === "maintenance"}
        />
        <StatCard
          title="Retired"
          value={retiredCount.toString()}
          icon={XCircle}
          onClick={() => setSelectedStatus(selectedStatus === "retired" ? null : "retired")}
          isActive={selectedStatus === "retired"}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        {/* Asset Type Tabs */}
        {assetTypes.length > 0 && (
          <div className="border-b border-border px-5 pt-4 pb-0 bg-white">
            <Tabs value={selectedType} onValueChange={setSelectedType}>
              <TabsList className="bg-muted p-0.5 rounded-xl mb-4 h-auto">
                <TabsTrigger
                  value="all"
                  className="h-9 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
                >
                  All ({assetsForCounting.length || 0})
                </TabsTrigger>
                {assetTypes.map((type) => (
                  <TabsTrigger
                    key={type.id}
                    value={type.id}
                    className="h-9 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
                  >
                    {type.name.charAt(0).toUpperCase() + type.name.slice(1)} ({type.count})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="bg-muted p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-9 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors flex items-center gap-2",
                  viewMode === "table"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground font-medium hover:text-foreground"
                )}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "h-9 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors flex items-center gap-2",
                  viewMode === "cards"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground font-medium hover:text-foreground"
                )}
                title="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
            <Button variant="outline" size="default" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="w-[120px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Image</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Asset Name</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Serial Number</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                  </TableHead>
                  <TableHead className="w-[144px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Assignment Date</span>
                  </TableHead>
                  <TableHead className="w-[144px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Purchase Date</span>
                  </TableHead>
                  <TableHead className="w-[44px] px-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => {
                    const status = statusConfig[asset.status] || statusConfig.available
                    return (
                      <TableRow key={asset.id} className="border-b border-border">
                        <TableCell className="px-3">
                          <Link href={`/hr/assets/${asset.id}`}>
                            <AssetImage
                              imageUrl={asset.imageUrl}
                              assetTypeIcon={asset.assetType.icon}
                              alt={asset.name}
                              size="sm"
                              className="cursor-pointer"
                            />
                          </Link>
                        </TableCell>
                        <TableCell className="px-3">
                          <Link href={`/hr/assets/${asset.id}`} className="hover:underline">
                            <span className="text-sm font-medium text-foreground">{asset.name}</span>
                          </Link>
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge variant="primary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {asset.assetType.name.charAt(0).toUpperCase() + asset.assetType.name.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">
                            {asset.serialNumber || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          {asset.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={asset.assignedTo.avatar || getAvatarForUser(asset.assignedTo.id)} alt={asset.assignedTo.name} />
                                <AvatarFallback className="text-xs">
                                  {asset.assignedTo.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-foreground">{asset.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          {asset.assignmentDate ? (
                            <span className="text-sm font-medium text-foreground">
                              {new Date(asset.assignmentDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          {asset.purchaseDate ? (
                            <span className="text-sm font-medium text-foreground">
                              {new Date(asset.purchaseDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          <RowActionsMenu
                            entityType="asset"
                            entityId={asset.id}
                            entityName={asset.name}
                            detailUrl={`/hr/assets/${asset.id}`}
                            canView={true}
                            canEdit={true}
                            canDelete={false}
                            customActions={
                              asset.status === "available"
                                ? [
                                    {
                                      label: "Assign",
                                      onClick: () => handleAssignClick(asset.id, asset.name),
                                    },
                                  ]
                                : asset.status === "assigned"
                                ? [
                                    {
                                      label: "Unassign",
                                      onClick: () => {
                                        // TODO: Implement unassign
                                        console.log("Unassign asset", asset.id)
                                      },
                                    },
                                  ]
                                : []
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24">
                      <EmptyState
                        icon={Package}
                        title="No assets yet"
                        description="Get started by adding your first asset."
                        action={{
                          label: "Add Asset",
                          onClick: () => setIsCreateAssetOpen(true),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            {filteredAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="py-12">
                <EmptyState
                  icon={Package}
                  title="No assets yet"
                  description="Get started by adding your first asset."
                  action={{
                    label: "Add Asset",
                    onClick: () => setIsCreateAssetOpen(true),
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <CreateAssetDialog open={isCreateAssetOpen} onOpenChange={setIsCreateAssetOpen} />
      {assignAssetId && (
        <AssignAssetDialog
          open={!!assignAssetId}
          onOpenChange={(open) => {
            if (!open) {
              setAssignAssetId(null)
              setAssignAssetName("")
            }
          }}
          assetId={assignAssetId}
          assetName={assignAssetName}
        />
      )}
    </div>
  )
}

