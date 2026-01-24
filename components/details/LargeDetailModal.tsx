"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LargeDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function LargeDetailModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
  showCloseButton = true,
}: LargeDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[1200px] max-h-[600px] w-[calc(100%-2rem)] h-[calc(100vh-2rem)]",
          "flex flex-col p-0 gap-0",
          "sm:max-w-[1200px] sm:max-h-[600px]",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground leading-[1.4] tracking-[0.36px]">
              {title}
            </DialogTitle>
            {showCloseButton && (
              <button
                onClick={() => onOpenChange(false)}
                className="border border-border rounded-full size-10 flex items-center justify-center hover:bg-muted transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            )}
          </div>
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

