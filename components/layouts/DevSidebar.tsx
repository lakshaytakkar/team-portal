"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  FileText,
  Grid3x3,
  Sparkles,
  Code,
  ExternalLink,
  BookOpen,
  Settings,
  ChevronLeft,
  LogOut,
  HelpCircle,
  Palette,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ModeToggle"
import { ThemeToggle } from "@/components/ThemeToggle"

interface MenuItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
}

const menuItems: MenuItem[] = [
  // Dashboard
  { label: "Dashboard", href: "/dev", icon: LayoutDashboard, section: "dashboard" },
  // Project Management
  { label: "Projects", href: "/dev/projects", icon: Folder, section: "management" },
  { label: "Tasks", href: "/dev/tasks", icon: CheckSquare, section: "management" },
  { label: "Pages Index", href: "/dev/pages-index", icon: FileText, section: "management" },
  // Design Systems
  { label: "Foundations", href: "/dev/design-system/foundations", icon: Palette, section: "design" },
  { label: "Components Library", href: "/dev/design-system/components", icon: Code, section: "design" },
  // Resources
  { label: "Stack", href: "/dev/stack", icon: Grid3x3, section: "resources" },
  { label: "Prompts", href: "/dev/prompts", icon: Sparkles, section: "resources" },
  { label: "UI Libraries", href: "/dev/ui-libraries", icon: Code, section: "resources" },
  { label: "External Apps", href: "/dev/external-apps", icon: ExternalLink, section: "resources" },
  // Documentation
  { label: "Docs", href: "/dev/docs", icon: BookOpen, section: "docs" },
  { label: "Credentials", href: "/dev/credentials", icon: Settings, section: "docs" },
]

const bottomMenuItems: MenuItem[] = [
  { label: "Help & Center", href: "/help", icon: HelpCircle },
  { label: "Logout", href: "/logout", icon: LogOut },
]

const sectionLabels: Record<string, string> = {
  dashboard: "DASHBOARD",
  management: "PROJECT MANAGEMENT",
  design: "DESIGN SYSTEMS",
  resources: "RESOURCES",
  docs: "DOCUMENTATION",
}

interface DevSidebarProps {
  isFilterHeaderCollapsed?: boolean
}

export function DevSidebar({ isFilterHeaderCollapsed = true }: DevSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false)

  const handleLogout = () => {
    // TODO: Implement actual logout logic (clear session, tokens, etc.)
    router.push("/sign-in")
    setLogoutDialogOpen(false)
  }

  const isActive = (href: string) => {
    if (href === "/dev") {
      return pathname === "/dev"
    }
    return pathname.startsWith(href)
  }

  const sections = ["dashboard", "management", "design", "resources", "docs"] as const

  return (
    <div className={`fixed left-0 ${isFilterHeaderCollapsed ? 'top-0' : 'top-[48px]'} bottom-0 w-[272px] bg-background flex flex-col py-6 z-40 border-r border-border transition-all duration-300`}>
      {/* Header */}
      <div className="flex flex-col h-16 items-start justify-center px-4 shrink-0 w-full mb-4">
        <div className="flex h-14 items-center px-2 w-full">
          <div className="flex flex-1 gap-3 items-center">
            <div className="flex items-center justify-center size-8 bg-primary rounded-lg shadow-lg shadow-primary/20">
              <Code className="h-5 w-5 text-white" />
            </div>
            <p className="font-bold leading-none text-foreground text-xl tracking-tight">Dev Portal</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col gap-6 items-start px-4 py-0 w-full overflow-y-auto">
        {/* Sections */}
        {sections.map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section)
          if (sectionItems.length === 0) return null

          return (
            <div key={section} className="flex flex-col gap-1.5 items-start w-full">
              <div className="flex items-center px-3 py-1 w-full">
                <p className="flex-1 font-semibold text-muted-foreground text-[11px] tracking-widest uppercase">
                  {sectionLabels[section]}
                </p>
              </div>
              <div className="flex flex-col items-start w-full gap-0.5">
                {sectionItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex gap-3 h-9 items-center px-3 py-2 rounded-md w-full transition-all duration-200",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "shrink-0 size-4 transition-colors",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <p className="flex-1 font-medium text-sm">{item.label}</p>
                      {active && (
                        <div className="absolute right-3 size-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Bottom Menu */}
        <div className="flex flex-col items-start w-full mt-auto pt-4 gap-1 border-t border-border">
          <div className="px-3 py-2 w-full flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Theme</p>
            <ThemeToggle />
          </div>
          {bottomMenuItems.map((item) => {
            const isLogout = item.label === "Logout"
            if (isLogout) {
              return (
                <button
                  key={item.href}
                  onClick={() => setLogoutDialogOpen(true)}
                  className={cn(
                    "group flex gap-3 h-9 items-center px-3 py-2 rounded-md w-full transition-all text-left",
                    "text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                  )}
                >
                  <item.icon className="shrink-0 size-4" />
                  <p className="flex-1 font-medium text-sm">{item.label}</p>
                </button>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex gap-3 h-9 items-center px-3 py-2 rounded-md w-full transition-all",
                  "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="shrink-0 size-4 text-muted-foreground group-hover:text-foreground" />
                <p className="flex-1 font-medium text-sm">{item.label}</p>
              </Link>
            )
          })}
        </div>
      </div>

      <ConfirmationDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
        title="Logout"
        description="Are you sure want to Logout to Lumin?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        variant="destructive"
        icon={<LogOut className="w-full h-full" />}
      />
    </div>
  )
}
