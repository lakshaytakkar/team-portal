"use client"

import { type LuminIconName, luminIconSrc } from "./lumin-icons"
import { cn } from "@/lib/utils"

interface IconProps {
  name: LuminIconName
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className }: IconProps) {
  const src = luminIconSrc[name]
  
  if (!src) {
    console.warn(`Icon "${name}" not found in registry`)
    return null
  }

  const placeholderSrc = "/icons/lumin/placeholder.svg"

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn("inline-block", className)}
      onError={(e) => {
        // Fallback to placeholder if icon file doesn't exist
        const target = e.target as HTMLImageElement
        if (target.src !== placeholderSrc && !target.src.includes("placeholder")) {
          target.src = placeholderSrc
          target.className = cn(target.className, "opacity-50")
        }
      }}
    />
  )
}

