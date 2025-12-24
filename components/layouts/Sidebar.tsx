"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  Calendar,
  Users,
  Clock,
  UserPlus,
  DollarSign,
  FileText,
  Settings,
  Headphones,
  LogOut,
  ChevronLeft,
  CheckSquare,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ModeToggle"

interface MenuItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
}

const menuItems: MenuItem[] = [
  // Main Menu
  { label: "Dashboard", href: "/", icon: Home, section: "main" },
  { label: "Calendar", href: "/calendar", icon: Calendar, section: "main" },
  // My Workspace
  { label: "My Projects", href: "/projects", icon: Briefcase, section: "workspace" },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare, section: "workspace" },
  // Management
  { label: "Employee", href: "/employee", icon: Users, section: "management" },
  { label: "Attendance", href: "/attendance", icon: Clock, section: "management" },
  { label: "Recruitment", href: "/recruitment", icon: UserPlus, section: "management" },
  { label: "Payroll", href: "/payroll", icon: DollarSign, section: "management" },
  { label: "Invoices", href: "/invoices", icon: FileText, section: "management" },
]

const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Center", href: "/help", icon: Headphones },
  { label: "Logout", href: "/logout", icon: LogOut },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[272px] bg-white flex flex-col py-5 z-40">
      {/* Header */}
      <div className="flex flex-col h-16 items-start justify-center px-2 shrink-0 w-full">
        <div className="flex h-14 items-center px-3 w-full">
          <div className="flex flex-1 gap-2.5 items-center">
            <div className="relative shrink-0 size-8">
              <div className="absolute inset-0 bg-[#897efa] rounded" />
            </div>
            <p className="font-semibold leading-[1.35] text-[#0d0d12] text-xl">LuminHR</p>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-white border border-[#dfe1e7] rounded-md shrink-0 size-6 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors"
          >
            <ChevronLeft className={cn("h-4 w-4 text-[#0d0d12] transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col gap-4 items-start px-4 py-0 w-full overflow-y-auto">
        {/* Main Menu */}
        <div className="flex flex-col gap-1 items-start w-full">
          <div className="flex items-center justify-center px-3 py-1 w-full">
            <p className="flex-1 font-medium text-[#a4acb9] text-sm tracking-[0.28px]">Main Menu</p>
          </div>
          <div className="flex flex-col items-start w-full">
            {menuItems
              .filter((item) => item.section === "main")
              .map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex gap-2 h-10 items-center px-3 py-2 rounded-lg w-[240px] transition-colors",
                      active
                        ? "bg-[#f6f8fa] text-[#0d0d12]"
                        : "bg-white text-[#666d80] hover:bg-[#f6f8fa]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "shrink-0 size-4",
                        active && item.href === "/attendance" ? "text-[#897efa]" : active ? "text-[#0d0d12]" : "text-[#666d80]"
                      )}
                    />
                    <p className="flex-1 font-medium text-base tracking-[0.32px]">{item.label}</p>
                    {active && item.href === "/attendance" && (
                      <div className="absolute bg-[#897efa] h-6 left-[-16px] rounded-br-lg rounded-tr-lg top-1/2 -translate-y-1/2 w-1" />
                    )}
                  </Link>
                )
              })}
          </div>
        </div>

        {/* My Workspace Menu */}
        <div className="flex flex-col gap-1 items-start w-full">
          <div className="flex items-center justify-center px-3 py-1 w-full">
            <p className="flex-1 font-medium text-[#a4acb9] text-sm tracking-[0.28px]">MY WORKSPACE</p>
          </div>
          <div className="flex flex-col items-start w-full">
            {menuItems
              .filter((item) => item.section === "workspace")
              .map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex gap-2 h-10 items-center px-3 py-2 rounded-lg w-[240px] transition-colors",
                      active
                        ? "bg-[#f6f8fa] text-[#0d0d12]"
                        : "bg-white text-[#666d80] hover:bg-[#f6f8fa]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "shrink-0 size-4",
                        active && item.href === "/attendance" ? "text-[#897efa]" : active ? "text-[#0d0d12]" : "text-[#666d80]"
                      )}
                    />
                    <p className="flex-1 font-medium text-base tracking-[0.32px]">{item.label}</p>
                    {active && item.href === "/attendance" && (
                      <div className="absolute bg-[#897efa] h-6 left-[-16px] rounded-br-lg rounded-tr-lg top-1/2 -translate-y-1/2 w-1" />
                    )}
                  </Link>
                )
              })}
          </div>
        </div>

        {/* Management Menu */}
        <div className="flex flex-col gap-1 items-start w-full">
          <div className="flex items-center justify-center px-3 py-1 w-full">
            <p className="flex-1 font-medium text-[#a4acb9] text-sm tracking-[0.28px]">Management</p>
          </div>
          <div className="flex flex-col items-start w-full">
            {menuItems
              .filter((item) => item.section === "management")
              .map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex gap-2 h-10 items-center px-3 py-2 rounded-lg w-[240px] transition-colors",
                      active
                        ? "bg-[#f6f8fa] text-[#0d0d12]"
                        : "bg-white text-[#666d80] hover:bg-[#f6f8fa]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "shrink-0 size-4",
                        active && item.href === "/attendance" ? "text-[#897efa]" : active ? "text-[#0d0d12]" : "text-[#666d80]"
                      )}
                    />
                    <p className="flex-1 font-medium text-base tracking-[0.32px]">{item.label}</p>
                    {active && item.href === "/attendance" && (
                      <div className="absolute bg-[#897efa] h-6 left-[-16px] rounded-br-lg rounded-tr-lg top-1/2 -translate-y-1/2 w-1" />
                    )}
                  </Link>
                )
              })}
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="flex flex-1 flex-col items-start justify-end w-full mt-auto">
          {bottomMenuItems.map((item) => {
            const isLogout = item.label === "Logout"
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex gap-2 h-10 items-center px-3 py-2 rounded-lg w-full transition-colors",
                  isLogout
                    ? "text-[#ef4444] hover:bg-[#f6f8fa]"
                    : "text-[#666d80] hover:bg-[#f6f8fa]"
                )}
              >
                <item.icon className={cn("shrink-0 size-4", isLogout ? "text-[#ef4444]" : "text-[#666d80]")} />
                <p className={cn("flex-1 font-medium text-base tracking-[0.32px]", isLogout && "text-[#ef4444]")}>
                  {item.label}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

