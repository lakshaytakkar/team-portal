"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { User, LogOut, ChevronDown, PenTool } from "lucide-react"
import { useUserContext } from "@/lib/providers/UserContextProvider"
import { signOut } from "@/lib/actions/auth"
import { TopbarGlobalSearch } from "@/components/search/TopbarGlobalSearch"
import { TopbarNotifications } from "@/components/notifications/TopbarNotifications"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[]
}

export function Topbar({ breadcrumbs = [{ label: "Home" }, { label: "Dashboard" }] }: TopbarProps) {
  const router = useRouter()
  const { user, isLoading } = useUserContext()
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      setLogoutDialogOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if signOut fails
      router.push("/sign-in")
      setLogoutDialogOpen(false)
    }
  }

  const userDisplayName = user?.name || 'User'
  const userEmail = user?.email || ''
  const userRole = user?.role || 'employee'
  const userAvatar = user?.avatar || getAvatarForUser(userDisplayName)

  return (
    <div className="h-[72px] border-b border-border mb-5 flex items-center justify-between px-5 py-4">
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
        {/* Global Search */}
        <TopbarGlobalSearch />
        
        {/* Notifications */}
        {user && <TopbarNotifications />}
        
        {/* Profile Menu or Sign In Button */}
        {isLoading ? (
          // Show loading state while checking authentication
          <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
        ) : user ? (
          // Show user menu when logged in
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex gap-2 items-center hover:bg-muted rounded-lg px-2 py-1.5 transition-colors focus:outline-none">
                <Avatar className="h-8 w-8 bg-primary/20">
                  <AvatarImage src={userAvatar} alt={userDisplayName} />
                  <AvatarFallback className="text-primary text-xs font-medium">
                    {userDisplayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start leading-[1.5] text-sm tracking-[0.28px]">
                  <p className="font-semibold text-foreground">{userDisplayName}</p>
                  <p className="font-normal text-muted-foreground capitalize">{userRole}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-5 tracking-[0.28px]">{userDisplayName}</p>
                  <p className="text-sm leading-5 tracking-[0.28px] text-muted-foreground">{userEmail}</p>
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
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setLogoutDialogOpen(true)}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        ) : (
          // Show sign in button when not logged in
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
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

