"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Laptop,
  Monitor,
  Smartphone,
  Keyboard,
  Mouse,
  Headphones,
  Tablet,
  Plug,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetImageProps {
  imageUrl?: string
  assetTypeIcon?: string
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  laptop: Laptop,
  monitor: Monitor,
  smartphone: Smartphone,
  phone: Smartphone,
  keyboard: Keyboard,
  mouse: Mouse,
  headphones: Headphones,
  tablet: Tablet,
  plug: Plug,
  "docking-station": Plug,
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32",
}

export function AssetImage({
  imageUrl,
  assetTypeIcon,
  alt = "Asset",
  className,
  size = "md",
}: AssetImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // If image URL exists and no error, show image
  if (imageUrl && !imageError) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-muted", sizeClasses[size], className)}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity",
            imageLoading ? "opacity-0" : "opacity-100"
          )}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
          onLoad={() => setImageLoading(false)}
        />
      </div>
    )
  }

  // Fallback to icon
  const IconComponent = assetTypeIcon && iconMap[assetTypeIcon.toLowerCase()]
    ? iconMap[assetTypeIcon.toLowerCase()]
    : Package

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-muted text-muted-foreground",
        sizeClasses[size],
        className
      )}
    >
      <IconComponent className={cn(
        size === "sm" ? "h-6 w-6" : size === "md" ? "h-12 w-12" : "h-16 w-16"
      )} />
    </div>
  )
}

