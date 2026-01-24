"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        neutral: "border-transparent bg-muted text-foreground",
        primary: "border-transparent bg-primary/10 text-primary",
        green: "border-transparent bg-green-100 text-green-700",
        yellow: "border-transparent bg-yellow-100 text-yellow-700",
        red: "border-transparent bg-red-100 text-red-700",
        "neutral-outline": "border-border bg-background text-foreground",
        "primary-outline": "border-primary bg-background text-primary",
        "green-outline": "border-green-500 bg-background text-green-700",
        "yellow-outline": "border-yellow-500 bg-background text-yellow-700",
        "red-outline": "border-red-500 bg-background text-red-700",
        "not-started": "border-transparent bg-status-not-started text-status-not-started-foreground",
        "in-progress": "border-transparent bg-status-in-progress text-status-in-progress-foreground",
        "completed": "border-transparent bg-status-completed text-status-completed-foreground",
        "on-hold": "border-transparent bg-status-on-hold text-status-on-hold-foreground",
        "priority-high": "border-transparent bg-priority-high text-priority-high-foreground",
        "priority-medium": "border-transparent bg-priority-medium text-priority-medium-foreground",
        "priority-low": "border-transparent bg-priority-low text-priority-low-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-md",
        md: "px-2.5 py-0.5 text-xs rounded-md",
        lg: "px-3 py-1 text-sm rounded-lg",
      },
      style: {
        fill: "",
        outline: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      style: "fill",
    },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style">,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean
  showClose?: boolean
  onClose?: () => void
}

function Badge({ className, variant, size, style, showDot, showClose, onClose, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, style }), className)} {...props}>
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded-sm hover:bg-current/20 p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export { Badge, badgeVariants }
