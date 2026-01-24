"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default"
  icon?: React.ReactNode
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  icon,
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[380px] p-5 rounded-xl"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-3 items-center text-center">
          {/* Icon Section */}
          {icon && (
            <div className="flex items-center justify-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Gradient background ring */}
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,240,243,0.48)] via-[rgba(255,240,243,0)] to-[rgba(255,240,243,0)] rounded-full" />
                {/* Outer ring */}
                <div className="absolute inset-0 border border-[#fff0f3] rounded-full" />
                {/* Icon container */}
                <div className="relative bg-white border border-[#fadbe1] rounded-full p-2 shadow-[0px_2px_4px_0px_rgba(223,28,65,0.04)] z-10">
                  <div className="w-4 h-4 text-[#DF1C41] flex items-center justify-center">
                    {icon}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {/* Title */}
            <DialogTitle 
              className="text-lg font-semibold leading-[1.3] text-[#0d0d12]"
              style={{ fontFamily: 'var(--font-inter-tight)' }}
            >
              {title}
            </DialogTitle>

            {/* Description */}
            <DialogDescription 
              className="text-sm text-[#666d80] leading-[1.4] tracking-[0.28px]"
              style={{ fontFamily: 'var(--font-inter-tight)' }}
            >
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Actions */}
        <DialogFooter className="gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 h-9 rounded-[10px] border border-[#dfe1e7] bg-white text-[#0d0d12] hover:bg-gray-50 font-semibold text-sm leading-[1.5] tracking-[0.32px]"
            style={{ fontFamily: 'var(--font-inter-tight)' }}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 h-9 rounded-[10px] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] font-semibold text-sm leading-[1.5] tracking-[0.32px]",
              variant === "destructive" 
                ? "bg-[#dc2626] hover:bg-[#dc2626]/90 text-white"
                : ""
            )}
            style={{ fontFamily: 'var(--font-inter-tight)' }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" className="text-current" />
                <span>{confirmText}</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
