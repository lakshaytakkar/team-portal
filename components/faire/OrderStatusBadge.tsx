"use client"

import { cn } from "@/lib/utils"
import { FaireOrderState, FAIRE_ORDER_STATE_CONFIG } from "@/lib/types/faire"

interface OrderStatusBadgeProps {
  state: FaireOrderState
  className?: string
}

export function OrderStatusBadge({ state, className }: OrderStatusBadgeProps) {
  const config = FAIRE_ORDER_STATE_CONFIG[state]

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center h-5 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700",
          className
        )}
      >
        Unknown
      </span>
    )
  }

  return (
    <span
      className={cn("inline-flex items-center h-5 px-2 py-0.5 rounded-md text-xs font-medium", className)}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  )
}
