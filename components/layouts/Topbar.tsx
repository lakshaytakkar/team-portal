"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, ChevronDown, PenTool } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[]
}

export function Topbar({ breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }] }: TopbarProps) {
  return (
    <div className="fixed top-0 right-0 left-[272px] h-[72px] border-b border-border bg-card flex items-center justify-between px-5 py-4 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium tracking-[0.28px]">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted-foreground">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className={index === breadcrumbs.length - 1 ? "text-foreground" : "text-muted-foreground"}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 items-center">
        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex gap-2 items-center hover:bg-muted rounded-lg px-2 py-1.5 transition-colors focus:outline-none">
              <Avatar className="h-8 w-8 bg-primary/20">
                <AvatarFallback className="text-primary text-xs font-medium">RJ</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start leading-[1.5] text-xs tracking-[0.24px]">
                <p className="font-semibold text-foreground">Robert Johnson</p>
                <p className="font-normal text-muted-foreground">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Robert Johnson</p>
                <p className="text-xs leading-none text-muted-foreground">robert@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-notes" className="cursor-pointer">
                <PenTool className="mr-2 h-4 w-4" />
                <span>My Notes</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild variant="destructive">
              <Link href="/logout" className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

