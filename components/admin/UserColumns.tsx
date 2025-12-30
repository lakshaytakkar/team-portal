"use client"

import { AdminUser } from "@/lib/types/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Eye, Edit, Trash2, Mail, Lock, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"

interface UserColumnsProps {
  onViewDetails: (user: AdminUser) => void
  onEdit: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
  onSuspend: (user: AdminUser) => void
  onActivate: (user: AdminUser) => void
  onSendEmail: (user: AdminUser) => void
}

export function createUserColumns({
  onViewDetails,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
  onSendEmail,
}: UserColumnsProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "default" as const
      case "manager":
        return "secondary" as const
      case "executive":
        return "outline" as const
      default:
        return "outline" as const
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "green-outline" as const
      case "inactive":
        return "neutral-outline" as const
      case "suspended":
        return "red-outline" as const
      default:
        return "outline" as const
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return [
    {
      key: "name",
      label: "Name",
      render: (user: AdminUser) => (
        <div
          className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-all"
          onClick={() => onViewDetails(user)}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={getAvatarForUser(user.id)} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium truncate min-w-0 max-w-[150px]" title={user.name}>
            {user.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (user: AdminUser) => (
        <span className="text-sm truncate block max-w-[200px]" title={user.email}>
          {user.email}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user: AdminUser) => {
        const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)
        return (
          <Badge variant={getRoleBadgeVariant(user.role)} className="whitespace-nowrap">
            {roleLabel}
          </Badge>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      render: (user: AdminUser) => {
        const statusLabel = user.status.charAt(0).toUpperCase() + user.status.slice(1)
        return (
          <Badge variant={getStatusBadgeVariant(user.status)} className="whitespace-nowrap">
            {statusLabel}
          </Badge>
        )
      },
    },
    {
      key: "department",
      label: "Department",
      render: (user: AdminUser) => (
        <span className="text-sm text-muted-foreground">{user.department || "-"}</span>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (user: AdminUser) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {user.updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (user: AdminUser) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(user)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendEmail(user)}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status === "active" ? (
                <DropdownMenuItem onClick={() => onSuspend(user)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Suspend
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onActivate(user)}>
                  <Check className="h-4 w-4 mr-2" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}

