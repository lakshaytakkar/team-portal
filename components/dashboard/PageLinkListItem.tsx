"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageLinkListItemProps {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export function PageLinkListItem({ title, href, icon: Icon, description }: PageLinkListItemProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-2.5 rounded-md hover:bg-accent/50 transition-colors group"
    >
      <div className="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary/20 transition-colors mt-0.5 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium group-hover:text-primary transition-colors">
          {title}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </div>
      </div>
    </Link>
  )
}

