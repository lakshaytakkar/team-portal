"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface QuickDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function QuickDetailModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: QuickDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[500px] w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)]",
          "flex flex-col p-0 gap-0",
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground leading-[1.4] tracking-[0.36px]">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

