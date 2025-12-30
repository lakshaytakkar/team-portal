"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { JobRole } from "@/lib/types/recruitment"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"

interface RelatedJobRolesProps {
  roles: JobRole[]
  currentRoleId: string
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  filled: { label: "Filled", variant: "outline" },
}

function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return "Not specified"
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  if (min) return `$${min.toLocaleString()}+`
  if (max) return `Up to $${max.toLocaleString()}`
  return "Not specified"
}

export function RelatedJobRoles({ roles, currentRoleId }: RelatedJobRolesProps) {
  const router = useRouter()

  if (!roles || roles.length === 0) return null

  return (
    <Card className="border border-[#dfe1e7] rounded-[12px] shadow-[0px_2px_4px_-1px_rgba(13,13,18,0.06)]">
      <div className="border-b border-[#dfe1e7] px-5 py-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#0d0d12]">Related Job Roles</h3>
      </div>
      <div className="p-5">
        <div className="flex gap-5 overflow-x-auto pb-2">
          {roles.map((role) => {
            const status = statusConfig[role.status] || statusConfig.active
            const departmentInitials = role.department
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <Card
                key={role.id}
                className="border border-[#dfe1e7] rounded-[12px] p-4 min-w-[320px] flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/recruitment/job-roles/${role.id}`)}
              >
                {/* Header */}
                <div className="flex gap-4 items-center">
                  {/* Department Logo */}
                  <div className="bg-[#f6f8fa] rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                    <span className="text-base font-semibold text-[#666d80]">
                      {departmentInitials}
                    </span>
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-[#0d0d12] leading-[1.5] truncate">
                      {role.title}
                    </h4>
                    <p className="text-base text-[#666d80] leading-[1.5] truncate">
                      {role.department}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant={status.variant === "default" ? "neutral" : status.variant}
                    className="h-5 px-2 py-0.5 rounded-2xl text-xs font-medium bg-[#eceff3] text-[#666d80] border-0 shrink-0"
                  >
                    {status.label}
                  </Badge>
                </div>

                {/* Description */}
                {role.description && (
                  <p className="text-sm text-[#666d80] leading-[1.5] line-clamp-2">
                    {role.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#dfe1e7]">
                  {role.location && (
                    <div className="flex items-center gap-1 text-sm text-[#666d80]">
                      <MapPin className="h-4 w-4" />
                      <span>{role.location}</span>
                    </div>
                  )}
                  {(role.salaryMin || role.salaryMax) && (
                    <p className="text-sm text-[#666d80]">
                      <span className="font-semibold text-[#0d0d12]">
                        {formatSalaryRange(role.salaryMin, role.salaryMax)}
                      </span>
                    </p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

