"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JobRole } from "@/lib/types/recruitment"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { MapPin, Calendar, Users } from "lucide-react"

interface JobRoleDetailHeaderProps {
  role: JobRole
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  filled: { label: "Filled", variant: "outline" },
}

export function JobRoleDetailHeader({ role }: JobRoleDetailHeaderProps) {
  const status = statusConfig[role.status] || statusConfig.active
  const departmentInitials = role.department
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="bg-[#301da4] rounded-[16px] p-8 flex gap-6 items-center">
      {/* Department Logo */}
      <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shrink-0">
        <span className="text-2xl font-semibold text-[#666d80]">
          {departmentInitials}
        </span>
      </div>

      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-[20px] font-semibold text-white leading-[1.35] mb-2">
          {role.title}
        </h2>
        <div className="flex items-center gap-4 text-white/90 text-base mb-2">
          {role.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{role.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span>{role.department}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/80 text-base">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(role.createdAt), "MMM d, yyyy")}</span>
          </div>
          {role.applicationsCount !== undefined && role.applicationsCount > 0 && (
            <>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{role.applicationsCount} applicants</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <Badge
          variant={status.variant === "default" ? "neutral" : status.variant}
          className="h-6 px-3 py-1 rounded-2xl text-sm font-medium bg-white/10 text-white border-white/20"
        >
          {status.label}
        </Badge>
      </div>
    </div>
  )
}

