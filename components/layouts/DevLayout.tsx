"use client"

import * as React from "react"
import { DevSidebar } from "./DevSidebar"
import { DevTopbar } from "./DevTopbar"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DevLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function DevLayout({ children, breadcrumbs }: DevLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <DevSidebar />
      <div className="ml-[272px] pt-[72px]">
        <DevTopbar breadcrumbs={breadcrumbs} />
        <main className="p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}

