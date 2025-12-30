"use client"

import * as React from "react"
import Link from "next/link"
import {
  Briefcase,
  Users,
  TrendingUp,
  DollarSign,
  Megaphone,
  BarChart3,
  Rocket,
  Code,
  Settings,
  Grid3x3,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickLink {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  description?: string
}

const quickLinks: QuickLink[] = [
  // Operations
  {
    label: "Projects",
    href: "/projects",
    icon: Briefcase,
    category: "Operations",
    description: "Manage all projects",
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: Activity,
    category: "Operations",
    description: "View and manage tasks",
  },
  // People
  {
    label: "Employees",
    href: "/hr/employees",
    icon: Users,
    category: "People",
    description: "Manage employees",
  },
  {
    label: "Recruitment",
    href: "/recruitment/dashboard",
    icon: Users,
    category: "People",
    description: "Hiring and candidates",
  },
  // Sales
  {
    label: "Sales Overview",
    href: "/sales/dashboard",
    icon: TrendingUp,
    category: "Sales",
    description: "Sales performance",
  },
  {
    label: "Pipeline",
    href: "/sales/pipeline",
    icon: TrendingUp,
    category: "Sales",
    description: "Sales pipeline",
  },
  // Finance
  {
    label: "Finance Overview",
    href: "/finance/dashboard",
    icon: DollarSign,
    category: "Finance",
    description: "Financial overview",
  },
  {
    label: "Invoices",
    href: "/finance/invoices",
    icon: DollarSign,
    category: "Finance",
    description: "Manage invoices",
  },
  // Marketing
  {
    label: "Marketing Overview",
    href: "/marketing/dashboard",
    icon: Megaphone,
    category: "Marketing",
    description: "Marketing campaigns",
  },
  // Analytics
  {
    label: "Analytics",
    href: "/analytics/dashboard",
    icon: BarChart3,
    category: "Analytics",
    description: "Analytics and insights",
  },
  // R&D
  {
    label: "Research & Development",
    href: "/rnd/research-docs",
    icon: Rocket,
    category: "R&D",
    description: "R&D projects",
  },
  // Development
  {
    label: "Development",
    href: "/development/projects",
    icon: Code,
    category: "Development",
    description: "Dev portal",
  },
  // Admin
  {
    label: "User Management",
    href: "/admin/users",
    icon: Settings,
    category: "Admin",
    description: "Manage users",
  },
  // Navigation
  {
    label: "Explore Pages",
    href: "/explore",
    icon: Grid3x3,
    category: "Navigation",
    description: "Browse all pages",
  },
]

interface QuickLinksProps {
  className?: string
  maxItems?: number
}

export function QuickLinks({ className, maxItems }: QuickLinksProps) {
  const displayLinks = maxItems ? quickLinks.slice(0, maxItems) : quickLinks

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Quick Links</h2>
        <p className="text-sm text-muted-foreground">Fast access to frequently used pages</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {displayLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card",
                "hover:border-primary/50 hover:shadow-md transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </p>
                {link.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

