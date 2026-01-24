"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] [font-family:var(--font-inter-tight)]",
        primary: "border border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] [font-family:var(--font-inter-tight)]",
        secondary:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        tertiary: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-[#dc2626] text-white hover:bg-[#dc2626]/90 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[16px] py-[8px] text-base leading-[1.5] tracking-[0.32px] rounded-[10px]",
        xsm: "h-8 px-3 py-1.5 text-xs rounded-lg",
        sm: "h-10 px-4 py-2 text-sm rounded-lg",
        md: "h-12 px-5 py-3 text-base rounded-lg",
        lg: "h-[52px] px-6 py-4 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
        "icon-xsm": "h-8 w-8 rounded-md",
        "icon-sm": "h-10 w-10 rounded-md",
        "icon-md": "h-12 w-12 rounded-lg",
        "icon-lg": "h-[52px] w-[52px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

