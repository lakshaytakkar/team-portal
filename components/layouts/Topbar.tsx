"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/ModeToggle"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[]
}

export function Topbar({ breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }] }: TopbarProps) {
  return (
    <div className="fixed top-0 right-0 left-[272px] h-[72px] border-b border-[#dfe1e7] bg-white flex items-center justify-between px-5 py-4 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium tracking-[0.28px]">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-[#818898]">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-[#818898] hover:text-[#0d0d12] transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={index === breadcrumbs.length - 1 ? "text-[#0d0d12]" : "text-[#818898]"}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 items-center">
        {/* Mode Toggle */}
        <ModeToggle />

        {/* Divider */}
        <div className="flex h-5 items-center justify-center w-0">
          <div className="flex-none rotate-90">
            <Separator className="h-px w-5 bg-[#dfe1e7]" />
          </div>
        </div>

        {/* Search */}
        <button className="bg-white border border-[#dfe1e7] rounded-full shrink-0 size-8 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors">
          <Search className="h-4 w-4 text-[#666d80]" />
        </button>

        {/* Notifications */}
        <button className="relative bg-white border border-[#dfe1e7] rounded-full shrink-0 size-8 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors">
          <Bell className="h-4 w-4 text-[#666d80]" />
          <div className="absolute left-4 top-1.5 size-2 bg-[#ef4444] rounded-full border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="flex h-5 items-center justify-center w-0">
          <div className="flex-none rotate-90">
            <Separator className="h-px w-5 bg-[#dfe1e7]" />
          </div>
        </div>

        {/* Profile */}
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8 bg-[#dad7fd]">
            <AvatarFallback className="text-[#897efa] text-xs font-medium">RJ</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start leading-[1.5] text-xs tracking-[0.24px]">
            <p className="font-semibold text-[#0d0d12]">Robert Johnson</p>
            <p className="font-normal text-[#666d80]">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

