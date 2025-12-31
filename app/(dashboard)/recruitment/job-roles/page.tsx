"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  FileDown,
  Filter,
  UserCog,
  MapPin,
  Bookmark,
  ArrowUpDown,
  Search,
} from "lucide-react"
import { JobRole } from "@/lib/types/recruitment"
import { getJobRoles } from "@/lib/actions/recruitment"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchJobRoles() {
  return await getJobRoles()
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  filled: { label: "Filled", variant: "outline" },
}

function JobRoleCard({ role }: { role: JobRole }) {
  const router = useRouter()
  const status = statusConfig[role.status] || statusConfig.active
  const departmentInitials = role.department
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="bg-white border border-[#dfe1e7] rounded-[12px] p-4 flex flex-col gap-4 shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]">
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
          <h3 className="text-base font-semibold text-[#0d0d12] leading-[1.5] tracking-[0.32px] truncate">
            {role.title}
          </h3>
          <p className="text-base text-[#666d80] leading-[1.5] tracking-[0.32px] truncate">
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
        <p className="text-sm text-[#666d80] leading-[1.5] tracking-[0.28px] line-clamp-3">
          {role.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1 text-sm text-[#666d80]">
          <MapPin className="h-4 w-4" />
          <span className="text-sm text-[#666d80] leading-[1.5] tracking-[0.28px]">
            {role.department}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center pt-2 border-t border-[#dfe1e7]">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 h-10 px-4 py-2 rounded-lg"
          onClick={() => router.push(`/recruitment/job-roles/${role.id}`)}
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-lg border border-[#dfe1e7] bg-white hover:bg-accent"
        >
          <Bookmark className="h-4 w-4 text-primary" />
        </Button>
        <RowActionsMenu
          entityType="job-role"
          entityId={role.id}
          entityName={role.title}
          canView={true}
          canEdit={true}
          canDelete={false}
          detailUrl={`/recruitment/job-roles/${role.id}`}
        />
      </div>
    </div>
  )
}

export default function RecruitmentJobRolesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: jobRoles, isLoading, error, refetch } = useQuery({
    queryKey: ["job-roles"],
    queryFn: fetchJobRoles,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[12px]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load job roles"
        message="We couldn't load job roles. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredJobRoles = jobRoles?.filter(
    (role) =>
      role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Job Roles</h1>
            <p className="text-xs text-white/90 mt-0.5">Define and manage job roles and positions in your organization.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" className="gap-2 h-10">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
        <Button variant="primary" size="sm" className="gap-2 h-10">
          <Plus className="h-4 w-4" />
          New Job Role
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#818898]" />
          <Input
            placeholder="Search job roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border border-[#dfe1e7] rounded-lg bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-10 border border-[#dfe1e7] bg-white hover:bg-accent"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-10 border border-[#dfe1e7] bg-white hover:bg-accent"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort by
          </Button>
        </div>
      </div>

      {/* Job Roles Grid */}
      {filteredJobRoles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobRoles.map((role) => (
            <JobRoleCard key={role.id} role={role} />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            icon={UserCog}
            title="No job roles found"
            description={
              searchQuery
                ? `No job roles match "${searchQuery}". Try adjusting your search.`
                : "Define job roles to organize positions in your organization."
            }
          />
        </div>
      )}
    </div>
  )
}
