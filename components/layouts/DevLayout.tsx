"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { DevSidebar } from "./DevSidebar"
import { DevTopbar } from "./DevTopbar"
import { FilterHeader } from "./FilterHeader"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DevLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function DevLayout({ children, breadcrumbs }: DevLayoutProps) {
  const [isFilterHeaderCollapsed, setIsFilterHeaderCollapsed] = React.useState(true) // Collapsed by default

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Toggle Button - Always visible when collapsed */}
      {isFilterHeaderCollapsed && (
        <button
          onClick={() => setIsFilterHeaderCollapsed(false)}
          className="fixed top-2 left-2 z-50 flex items-center justify-center w-8 h-8 bg-[#0d0d12] hover:bg-[#1a1a1a] rounded-md transition-colors shadow-lg"
          aria-label="Show filter header"
        >
          <ChevronDown className="h-4 w-4 text-[#a0a0a0]" />
        </button>
      )}
      {/* FilterHeader for role and department switching */}
      <FilterHeader 
        selectedRoles={[]}
        selectedDepartments={[]}
        isSuperAdminView={false}
        isCeoView={false}
        onRoleChange={() => {}}
        onDepartmentChange={() => {}}
        onSuperAdminToggle={() => {}}
        onCeoViewToggle={() => {}}
        isCollapsed={isFilterHeaderCollapsed}
        onToggle={() => setIsFilterHeaderCollapsed(!isFilterHeaderCollapsed)}
      />
      <DevSidebar isFilterHeaderCollapsed={isFilterHeaderCollapsed} />
      <div className={`ml-[272px] ${isFilterHeaderCollapsed ? 'pt-[72px]' : 'pt-[120px]'} transition-all duration-300`}>
        <DevTopbar breadcrumbs={breadcrumbs} isFilterHeaderCollapsed={isFilterHeaderCollapsed} />
        <main className="p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
