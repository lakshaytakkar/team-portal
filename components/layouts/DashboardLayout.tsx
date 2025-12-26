"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }]

  const pageNames: Record<string, string> = {
    projects: "My Projects",
    tasks: "My Tasks",
    "my-training": "My Training",
    "my-calls": "My Calls",
    "my-meeting-notes": "My Meeting Notes",
    "my-daily-reporting": "My Daily Reporting",
    "my-attendance": "My Attendance",
    "my-documents": "My Documents",
    "my-notes": "My Notes",
    "my-calendar": "My Calendar",
    "my-goals": "My Goals",
    "my-performance-reviews": "My Performance Reviews",
    "my-leave-requests": "My Leave Requests",
    "knowledge-base": "Knowledge Base",
    "my-resources": "My Resources",
  }

  if (segments.length === 0) {
    breadcrumbs.push({ label: "Dashboard" })
  } else {
    breadcrumbs.push({ label: "Dashboard", href: "/" })
    segments.forEach((segment, index) => {
      const label = pageNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const href = "/" + segments.slice(0, index + 1).join("/")
      breadcrumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : href,
      })
    })
  }

  return breadcrumbs
}

export function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
  const pathname = usePathname()
  const computedBreadcrumbs = breadcrumbs || getBreadcrumbs(pathname)

  return (
    <div className="min-h-screen bg-card">
      <Sidebar />
      <div className="ml-[272px] pt-[72px]">
        <Topbar breadcrumbs={computedBreadcrumbs} />
        <main className="p-5">{children}</main>
      </div>
    </div>
  )
}

