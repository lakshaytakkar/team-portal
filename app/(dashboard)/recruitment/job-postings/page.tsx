"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Eye,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  Clock,
  Calendar,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { JobListing } from "@/lib/types/recruitment"
import { getJobListings, getJobPortals, getJobRoles } from "@/lib/actions/recruitment"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RecruitmentTopbarActions } from "@/components/recruitment/RecruitmentTopbarActions"
import { getAvatarForUser } from "@/lib/utils/avatars"
import type { Action } from "@/lib/utils/actions"
import { formatDistanceToNow } from "date-fns"
import { format } from "date-fns"

async function fetchJobListings() {
  return await getJobListings()
}

async function fetchJobPortals() {
  return await getJobPortals()
}

async function fetchJobRoles() {
  return await getJobRoles()
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  active: { label: "Active", variant: "default" },
  paused: { label: "Paused", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  closed: { label: "Closed", variant: "secondary" },
}

export default function JobPostingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [portalFilter, setPortalFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewMode = searchParams.get("view") || "team"
  const isMyView = viewMode === "my"

  const { data: jobListings, isLoading, error, refetch } = useQuery({
    queryKey: ["job-listings"],
    queryFn: fetchJobListings,
  })

  const { data: jobPortals } = useQuery({
    queryKey: ["job-portals"],
    queryFn: fetchJobPortals,
  })

  const { data: jobRoles } = useQuery({
    queryKey: ["job-roles"],
    queryFn: fetchJobRoles,
  })

  const metrics = useMemo(() => {
    if (!jobListings) return { active: 0, totalApplications: 0, totalViews: 0 }
    const active = jobListings.filter((l) => l.status === "active").length
    const totalApplications = jobListings.reduce((sum, l) => sum + l.applicationsCount, 0)
    const totalViews = jobListings.reduce((sum, l) => sum + l.views, 0)
    return { active, totalApplications, totalViews }
  }, [jobListings])

  const primaryActions: Action[] = [
    {
      id: "create-job-listing",
      type: "create",
      label: "New Job Listing",
      onClick: () => {
        // TODO: Implement create job listing dialog
      },
    },
  ]

  const secondaryActions: Action[] = [
    {
      id: "export",
      type: "export",
      label: "Export",
      onClick: () => {
        // TODO: Implement export
      },
    },
  ]

  // Group listings by job role
  const groupedListings = useMemo(() => {
    if (!jobListings) return {}

    // First filter listings
    const filtered = jobListings.filter((listing) => {
      const matchesSearch =
        searchQuery === "" ||
        listing.jobRole.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.jobPortal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.customTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesStatus = statusFilter === "all" || listing.status === statusFilter
      const matchesPortal = portalFilter === "all" || listing.jobPortal.id === portalFilter
      const matchesRole = roleFilter === "all" || listing.jobRole.id === roleFilter

      return matchesSearch && matchesStatus && matchesPortal && matchesRole
    })

    // Then group by role
    const grouped: Record<string, JobListing[]> = {}
    filtered.forEach((listing) => {
      const roleId = listing.jobRole.id
      if (!grouped[roleId]) {
        grouped[roleId] = []
      }
      grouped[roleId].push(listing)
    })

    return grouped
  }, [jobListings, searchQuery, statusFilter, portalFilter, roleFilter])

  const sortedRoleIds = useMemo(() => {
    return Object.keys(groupedListings).sort((a, b) => {
      const roleA = jobListings?.find((l) => l.jobRole.id === a)?.jobRole.title ?? ""
      const roleB = jobListings?.find((l) => l.jobRole.id === b)?.jobRole.title ?? ""
      return roleA.localeCompare(roleB)
    })
  }, [groupedListings, jobListings])

  // Early returns for loading and error states - after all hooks
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load job listings"
        message="We couldn't load job listings. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {isMyView ? "My Job Listings" : "Job Listings"}
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              {isMyView
                ? "View job listings across portals and manage recruitment postings"
                : "Manage all job listings across portals, track applications, and monitor performance"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <RecruitmentTopbarActions primary={primaryActions} secondary={secondaryActions} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Active Listings
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.active}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Applications
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.totalApplications}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Views
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.totalViews}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Eye className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-[38px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={portalFilter} onValueChange={setPortalFilter}>
              <SelectTrigger className="w-[160px] h-[38px]">
                <SelectValue placeholder="Portal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Portals</SelectItem>
                {jobPortals?.map((portal) => (
                  <SelectItem key={portal.id} value={portal.id}>
                    {portal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] h-[38px]">
                <SelectValue placeholder="Job Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {jobRoles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {sortedRoleIds.length > 0 ? (
            sortedRoleIds.map((roleId) => {
              const listings = groupedListings[roleId]
              const firstListing = listings[0]
              const role = firstListing.jobRole

              return (
                <div key={roleId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {listings.length} listing{listings.length !== 1 ? "s" : ""} • {role.department}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {listings.map((listing) => {
                      const status = statusConfig[listing.status] || statusConfig.draft
                      const listingTitle = listing.customTitle || role.title

                      return (
                        <Card
                          key={listing.id}
                          className="border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            // TODO: Navigate to listing detail page if exists
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-semibold text-foreground">{listingTitle}</h4>
                                      <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                                        {status.label}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5" />
                                        <span>{listing.jobPortal.name}</span>
                                      </div>
                                      {listing.postedDate && !isNaN(new Date(listing.postedDate).getTime()) && (
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-3.5 w-3.5" />
                                          <span>Posted {format(new Date(listing.postedDate), "MMM d, yyyy")}</span>
                                        </div>
                                      )}
                                      {listing.expiryDate && !isNaN(new Date(listing.expiryDate).getTime()) && (
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5" />
                                          <span>Expires {format(new Date(listing.expiryDate), "MMM d, yyyy")}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground font-medium">{listing.views}</span>
                                    <span className="text-muted-foreground">views</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground font-medium">{listing.applicationsCount}</span>
                                    <span className="text-muted-foreground">applications</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {listing.createdAt && !isNaN(new Date(listing.createdAt).getTime()) && (
                                    <>
                                      <span>Created {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                                      {listing.updatedAt && !isNaN(new Date(listing.updatedAt).getTime()) && <span>•</span>}
                                    </>
                                  )}
                                  {listing.updatedAt && !isNaN(new Date(listing.updatedAt).getTime()) && (
                                    <span>Updated {formatDistanceToNow(new Date(listing.updatedAt), { addSuffix: true })}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                {listing.portalListingUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.open(listing.portalListingUrl, "_blank", "noopener,noreferrer")
                                    }}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View Listing
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No job listings found"
              description={searchQuery || statusFilter !== "all" || portalFilter !== "all" || roleFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Create your first job listing to start posting across portals."}
              action={
                !searchQuery && statusFilter === "all" && portalFilter === "all" && roleFilter === "all"
                  ? {
                      label: "Create Job Listing",
                      onClick: () => {
                        // TODO: Implement create job listing dialog
                      },
                    }
                  : undefined
              }
            />
          )}
        </div>
      </Card>
    </div>
  )
}
