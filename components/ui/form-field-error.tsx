import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormFieldErrorProps {
  message: string
  className?: string
}

export function FormFieldError({ message, className }: FormFieldErrorProps) {
  if (!message) return null

  return (
    <p
      className={cn(
        "mt-1.5 text-xs font-medium text-destructive leading-4 tracking-[0.24px]",
        className
      )}
    >
      {message}
    </p>
  )
}

