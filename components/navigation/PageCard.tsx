"use client"

import * as React from "react"
import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "@/components/layouts/Sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PageCardProps {
  item: MenuItem
  className?: string
}

export function PageCard({ item, className }: PageCardProps) {
  const Icon = item.icon

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "group relative flex flex-col gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              className
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </h3>
                </div>
              </div>
              {item.description && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </Link>
        </TooltipTrigger>
        {item.description && (
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">{item.label}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground font-mono">{item.href}</p>
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

