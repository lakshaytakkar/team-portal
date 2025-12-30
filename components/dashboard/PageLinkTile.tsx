"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageLinkTileProps {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export function PageLinkTile({ title, href, icon: Icon, description }: PageLinkTileProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full bg-background/50 border-border/40 hover:border-primary/50 transition-all group-hover:bg-background group-hover:shadow-sm">
        <CardHeader className="p-4">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="bg-primary/10 p-1 rounded-md group-hover:bg-primary/20 transition-colors">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium tracking-tight group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}

