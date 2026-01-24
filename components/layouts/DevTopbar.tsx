"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Bell } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/ModeToggle"
import { ThemeToggle } from "@/components/ThemeToggle"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DevTopbarProps {
  breadcrumbs?: BreadcrumbItem[]
  isFilterHeaderCollapsed?: boolean
}

export function DevTopbar({ breadcrumbs, isFilterHeaderCollapsed = true }: DevTopbarProps) {
  const pathname = usePathname()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs) return breadcrumbs
    
    const segments = pathname.split("/").filter(Boolean)
    const crumbs: BreadcrumbItem[] = [{ label: "Dev Portal", href: "/dev" }]

    const pageNames: Record<string, string> = {
      projects: "Projects",
      tasks: "Tasks",
      "pages-index": "Pages Index",
      stack: "Stack",
      prompts: "Prompts",
      "ui-libraries": "UI Libraries",
      "external-apps": "External Apps",
      docs: "Docs",
      credentials: "Credentials",
    }

    segments.forEach((segment, index) => {
      if (segment === "dev") return
      const label = pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const href = "/" + segments.slice(0, index + 1).join("/")
      crumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : href,
      })
    })

    return crumbs
  }

  const computedBreadcrumbs = getBreadcrumbs()

  return (
    <div className={`fixed ${isFilterHeaderCollapsed ? 'top-0' : 'top-[48px]'} right-0 left-[272px] h-[72px] border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 py-4 z-30 transition-all duration-300`}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2.5 text-sm font-medium">
        {computedBreadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground/40 font-normal">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={index === computedBreadcrumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 items-center">
        {/* Mode Toggle */}
        <div className="scale-90 origin-right opacity-80 hover:opacity-100 transition-opacity">
          <ModeToggle />
        </div>

        <Separator orientation="vertical" className="h-6 bg-border mx-1" />

        {/* Search */}
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg">
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Notifications */}
        <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg">
          <Bell className="h-4.5 w-4.5" />
          <div className="absolute right-2.5 top-2.5 size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
        </button>

        <Separator orientation="vertical" className="h-6 bg-border mx-1" />

        {/* Profile */}
        <div className="flex gap-3 items-center pl-1 group cursor-pointer">
          <div className="flex flex-col items-end leading-tight text-xs">
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Developer</p>
            <p className="font-medium text-muted-foreground">Admin Access</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-border group-hover:border-primary transition-colors">
            <AvatarImage src={getAvatarForUser("Developer")} alt="Developer" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">DV</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

