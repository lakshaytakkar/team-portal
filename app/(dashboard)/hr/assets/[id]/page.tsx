"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Package,
  Calendar,
  DollarSign,
  FileText,
  User,
  CheckCircle2,
  Wrench,
  XCircle,
  Clock,
  Link as LinkIcon,
} from "lucide-react"
import { Asset, AssetAssignment } from "@/lib/types/hr"
import { getAssetById, getAssets, getAssetAssignments } from "@/lib/actions/assets"
import { ErrorState } from "@/components/ui/error-state"
import { DetailPageHeader, DetailQuickTile, DetailTabs } from "@/components/details"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { AssetImage } from "@/components/hr/AssetImage"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  available: { label: "Available", variant: "default" },
  assigned: { label: "Assigned", variant: "secondary" },
  maintenance: { label: "Maintenance", variant: "outline" },
  retired: { label: "Retired", variant: "destructive" },
}

async function fetchAsset(id: string) {
  const asset = await getAssetById(id)
  if (!asset) throw new Error("Asset not found")
  return asset
}

async function fetchAllAssets() {
  return await getAssets()
}

async function fetchAssetAssignments(assetId: string) {
  return await getAssetAssignments(assetId)
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string

  const { data: asset, isLoading: isLoadingAsset, error: assetError } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: () => fetchAsset(assetId),
  })

  const { data: allAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAllAssets,
  })

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["asset-assignments", assetId],
    queryFn: () => fetchAssetAssignments(assetId),
    enabled: !!assetId,
  })

  const navigation = useDetailNavigation({
    currentId: assetId,
    items: allAssets || [],
    getId: (asset: Asset) => asset.id,
    basePath: "/hr/assets",
  })

  if (isLoadingAsset) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (assetError || !asset) {
    return (
      <ErrorState
        title="Asset not found"
        message="The asset you're looking for doesn't exist or has been removed."
        onRetry={() => router.push("/hr/assets")}
      />
    )
  }

  const status = statusConfig[asset.status] || statusConfig.available
  const currentAssignment = assignments?.find((a) => !a.returnDate)
  const historicalAssignments = assignments?.filter((a) => a.returnDate) || []

  const breadcrumbs = [
    { label: "HR", href: "/hr" },
    { label: "Assets", href: "/hr/assets" },
    { label: asset.name },
  ]

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* Asset Details Card */}
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Asset Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                    Asset Type
                  </span>
                  <div>
                    <Badge variant="primary" className="h-5 px-2.5 py-0.5 rounded-2xl text-xs font-medium">
                      {asset.assetType.name.charAt(0).toUpperCase() + asset.assetType.name.slice(1)}
                    </Badge>
                  </div>
                </div>

                {asset.serialNumber && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                      Serial Number
                    </span>
                    <p className="text-sm text-foreground font-medium leading-5 tracking-[0.28px]">
                      {asset.serialNumber}
                    </p>
                  </div>
                )}

                {asset.purchaseDate && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                      Purchase Date
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-foreground font-medium leading-5 tracking-[0.28px]">
                        {new Date(asset.purchaseDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {asset.purchasePrice && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                      Purchase Price
                    </span>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-foreground font-medium leading-5 tracking-[0.28px]">
                        ${asset.purchasePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                    Created At
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-foreground font-medium leading-5 tracking-[0.28px]">
                      {new Date(asset.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                    Last Updated
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-foreground font-medium leading-5 tracking-[0.28px]">
                      {new Date(asset.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {asset.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px] block mb-2">
                        Notes
                      </span>
                      <p className="text-sm text-foreground leading-5 tracking-[0.28px] whitespace-pre-wrap">
                        {asset.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Assignment Card */}
          {currentAssignment ? (
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Current Assignment</h3>
                  <Badge variant="secondary" className="h-5 px-2.5 py-0.5 rounded-2xl text-xs font-medium">
                    Active
                  </Badge>
                </div>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage
                      src={currentAssignment.employee.avatar || getAvatarForUser(currentAssignment.employee.id)}
                      alt={currentAssignment.employee.fullName}
                    />
                    <AvatarFallback>
                      {currentAssignment.employee.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/hr/employees/${currentAssignment.employee.id}`}
                      className="hover:underline flex items-center gap-2 group"
                    >
                      <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {currentAssignment.employee.fullName}
                      </h4>
                      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">{currentAssignment.employee.email}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Assigned {new Date(currentAssignment.assignedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {currentAssignment.assignedBy && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          <span>by {currentAssignment.assignedBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Current Assignment</h3>
                  <Badge variant="outline" className="h-5 px-2.5 py-0.5 rounded-2xl text-xs font-medium">
                    Not Assigned
                  </Badge>
                </div>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">This asset is currently not assigned to any employee.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      id: "history",
      label: "Assignment History",
      content: (
        <div className="space-y-6">
          {isLoadingAssignments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-border rounded-2xl">
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : historicalAssignments.length === 0 && !currentAssignment ? (
            <Card className="border border-border rounded-2xl">
              <CardContent className="p-6">
                <EmptyState
                  icon={Package}
                  title="No assignment history"
                  description="This asset has never been assigned to any employee."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Show current assignment first if exists */}
              {currentAssignment && (
                <Card className="border border-border rounded-2xl bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage
                          src={currentAssignment.employee.avatar || getAvatarForUser(currentAssignment.employee.id)}
                          alt={currentAssignment.employee.fullName}
                        />
                        <AvatarFallback>
                          {currentAssignment.employee.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              href={`/hr/employees/${currentAssignment.employee.id}`}
                              className="hover:underline flex items-center gap-2 group"
                            >
                              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {currentAssignment.employee.fullName}
                              </h4>
                              <LinkIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">{currentAssignment.employee.email}</p>
                          </div>
                          <Badge variant="secondary" className="h-5 px-2 py-0.5 rounded-2xl text-xs font-medium shrink-0">
                            Current
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Assigned {new Date(currentAssignment.assignedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {currentAssignment.assignedBy && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3" />
                              <span>by {currentAssignment.assignedBy.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historical assignments */}
              {historicalAssignments.map((assignment) => (
                <Card key={assignment.id} className="border border-border rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage
                          src={assignment.employee.avatar || getAvatarForUser(assignment.employee.id)}
                          alt={assignment.employee.fullName}
                        />
                        <AvatarFallback>
                          {assignment.employee.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              href={`/hr/employees/${assignment.employee.id}`}
                              className="hover:underline flex items-center gap-2 group"
                            >
                              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {assignment.employee.fullName}
                              </h4>
                              <LinkIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">{assignment.employee.email}</p>
                          </div>
                          <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs font-medium shrink-0">
                            Returned
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Assigned {new Date(assignment.assignedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          {assignment.returnDate && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="h-3 w-3" />
                              <span>
                                Returned {new Date(assignment.returnDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        {assignment.assignedBy && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                            <User className="h-3 w-3" />
                            <span>Assigned by {assignment.assignedBy.name}</span>
                          </div>
                        )}
                        {assignment.returnNotes && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              <strong>Return notes:</strong> {assignment.returnNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <DetailPageHeader
        breadcrumbs={breadcrumbs}
        onBack={() => router.push("/hr/assets")}
        onNext={navigation.navigateNext}
        onPrev={navigation.navigatePrev}
        hasNext={navigation.hasNext}
        hasPrev={navigation.hasPrev}
      />

      {/* Quick Tile */}
      <DetailQuickTile
        thumbnail={
          <AssetImage
            imageUrl={asset.imageUrl}
            assetTypeIcon={asset.assetType.icon}
            alt={asset.name}
            size="lg"
            className="w-full h-full"
          />
        }
        title={asset.name}
        subtitle={asset.assetType.name.charAt(0).toUpperCase() + asset.assetType.name.slice(1)}
        status={status}
        metadata={[
          {
            label: "Status",
            value: (
              <Badge variant={status.variant} className="h-5 px-2.5 py-0.5 rounded-2xl text-xs font-medium">
                {status.label}
              </Badge>
            ),
          },
          ...(asset.serialNumber
            ? [
                {
                  label: "Serial Number",
                  value: asset.serialNumber,
                },
              ]
            : []),
          ...(asset.assignedTo
            ? [
                {
                  label: "Assigned To",
                  value: (
                    <Link
                      href={`/hr/employees/${asset.assignedTo.id}`}
                      className="hover:underline flex items-center gap-2 group"
                    >
                      <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                        {asset.assignedTo.name}
                      </span>
                      <LinkIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ),
                },
              ]
            : []),
          ...(asset.assignmentDate
            ? [
                {
                  label: "Assignment Date",
                  value: new Date(asset.assignmentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                },
              ]
            : []),
        ]}
      />

      {/* Tabs */}
      <DetailTabs tabs={tabs} />
    </div>
  )
}

