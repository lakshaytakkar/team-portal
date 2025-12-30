"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Asset } from "@/lib/types/hr"
import { AssetImage } from "./AssetImage"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { cn } from "@/lib/utils"
import { Calendar, User } from "lucide-react"

interface AssetCardProps {
  asset: Asset
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  available: { label: "Available", variant: "default" },
  assigned: { label: "Assigned", variant: "secondary" },
  maintenance: { label: "Maintenance", variant: "outline" },
  retired: { label: "Retired", variant: "destructive" },
}

export function AssetCard({ asset }: AssetCardProps) {
  const status = statusConfig[asset.status] || statusConfig.available

  return (
    <Link href={`/hr/assets/${asset.id}`}>
      <Card className="border border-border rounded-2xl hover:border-primary transition-colors bg-white group">
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Asset Image */}
            <div className="relative">
              <AssetImage
                imageUrl={asset.imageUrl}
                assetTypeIcon={asset.assetType.icon}
                alt={asset.name}
                size="md"
                className="group-hover:scale-105 transition-transform"
              />
              {/* Status indicator */}
              <div className={cn(
                "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center",
                status.variant === "default" && "bg-green-500",
                status.variant === "secondary" && "bg-blue-500",
                status.variant === "outline" && "bg-yellow-500",
                status.variant === "destructive" && "bg-gray-400"
              )}>
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Name and Type */}
            <div className="space-y-1 w-full">
              <h3 className="text-base font-semibold text-foreground leading-6 tracking-[0.32px] truncate">
                {asset.name}
              </h3>
              <p className="text-sm font-medium text-muted-foreground leading-5 tracking-[0.28px] truncate">
                {asset.assetType.name.charAt(0).toUpperCase() + asset.assetType.name.slice(1)}
              </p>
            </div>

            {/* Serial Number */}
            {asset.serialNumber && (
              <div className="w-full">
                <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                  SN: {asset.serialNumber}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <Badge variant={status.variant} className="h-5 px-2.5 py-0.5 rounded-2xl text-xs font-medium">
              {status.label}
            </Badge>

            {/* Assigned Employee Info */}
            {asset.assignedTo && (
              <div className="w-full space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">{asset.assignedTo.name}</span>
                </div>
                {asset.assignmentDate && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Assigned {new Date(asset.assignmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            )}

            {/* Purchase Date */}
            {asset.purchaseDate && !asset.assignedTo && (
              <div className="w-full pt-2 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Purchased {new Date(asset.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

