"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  Calendar,
  Clock,
  CheckSquare,
  Folder,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Phone,
  Key,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MenuItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
  description?: string
}

const menuItems: MenuItem[] = [
  // Dashboard
  { label: "Dashboard", href: "/", icon: Home, section: "dashboard", description: "View your overview and quick stats" },
  // My Workspace - Work
  { label: "My Projects", href: "/projects", icon: Briefcase, section: "my-workspace", description: "Manage and track your projects" },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare, section: "my-workspace", description: "View and update your assigned tasks" },
  { label: "My Calls", href: "/my-calls", icon: Phone, section: "my-workspace", description: "Track and manage your sales and outreach calls" },
  { label: "My Training", href: "/my-training", icon: GraduationCap, section: "my-workspace", description: "Access daily training materials and courses" },
  // My Workspace - Time & Attendance
  { label: "My Attendance", href: "/my-attendance", icon: Clock, section: "my-workspace", description: "Check in, check out, and view attendance history" },
  { label: "My Leave Requests", href: "/my-leave-requests", icon: CalendarDays, section: "my-workspace", description: "Request time off and view leave status" },
  { label: "My Calendar", href: "/my-calendar", icon: Calendar, section: "my-workspace", description: "View your schedule and upcoming events" },
  // My Workspace - Files & Notes
  { label: "My Documents", href: "/my-documents", icon: Folder, section: "my-workspace", description: "Access and manage your files" },
  // Team & Organization
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen, section: "team", description: "Browse company documentation and guides" },
  { label: "My Resources", href: "/my-resources", icon: Key, section: "team", description: "Access external apps, credentials, and integrations" },
]

const sectionLabels: Record<string, string> = {
  dashboard: "",
  "my-workspace": "MY WORKSPACE",
  team: "TEAM & ORGANIZATION",
}

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const sections = ["dashboard", "my-workspace", "team"] as const

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 bottom-0 w-[272px] bg-card flex flex-col py-5 z-40 border-r border-border">
      {/* Header */}
      <div className="flex flex-col h-16 items-start justify-center px-2 shrink-0 w-full">
        <div className="flex h-14 items-center px-3 w-full">
          <div className="flex flex-1 gap-2.5 items-center">
            <div className="relative shrink-0 size-8">
              <div className="absolute inset-0 bg-primary rounded" />
            </div>
            <p className="font-semibold leading-[1.35] text-foreground text-xl">Team Portal</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col gap-4 items-start px-4 py-0 w-full overflow-y-auto">
        {sections.map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section)
          if (sectionItems.length === 0) return null

          return (
            <div key={section} className="flex flex-col gap-1 items-start w-full">
              {sectionLabels[section] && (
                <div className="flex items-center justify-center px-3 py-1 w-full">
                  <p className="flex-1 font-medium text-muted-foreground text-sm tracking-[0.28px]">
                    {sectionLabels[section]}
                  </p>
                </div>
              )}
              <div className="flex flex-col items-start w-full">
                {sectionItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex gap-2 h-10 items-center px-3 py-2 rounded-lg w-[240px] transition-colors",
                            active
                              ? "bg-muted text-foreground"
                              : "bg-card text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "shrink-0 size-4",
                              active ? "text-foreground" : "text-muted-foreground"
                            )}
                          />
                          <p className="flex-1 font-medium text-base tracking-[0.32px]">{item.label}</p>
                          {active && (
                            <div className="absolute bg-primary h-6 left-[-16px] rounded-br-lg rounded-tr-lg top-1/2 -translate-y-1/2 w-1" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      {item.description && (
                        <TooltipContent side="right">
                          <p className="text-sm">{item.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </TooltipProvider>
  )
}

