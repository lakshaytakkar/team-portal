"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Download,
  FileText,
  CheckCircle2,
  Briefcase,
  MapPin,
  Calendar,
  User,
} from "lucide-react"
import {
  getJobRoleById,
  getRelatedJobRoles,
  getJobPostingsByRole,
  getApplicationsByRole,
  getJobRoleAnalytics,
  getJobRoles,
} from "@/lib/actions/recruitment"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { format } from "date-fns"
import { JobRoleDetailHeader } from "@/components/recruitment/JobRoleDetailHeader"
import { JobRoleAttributes } from "@/components/recruitment/JobRoleAttributes"
import { RelatedJobRoles } from "@/components/recruitment/RelatedJobRoles"
import { JobRolePostingsTable } from "@/components/recruitment/JobRolePostingsTable"
import { JobRoleApplicationsTable } from "@/components/recruitment/JobRoleApplicationsTable"
import { JobRoleAnalytics } from "@/components/recruitment/JobRoleAnalytics"
import { JobRoleManagementCard } from "@/components/recruitment/JobRoleManagementCard"
import { EditJobRoleDialog } from "@/components/recruitment/EditJobRoleDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  filled: { label: "Filled", variant: "outline" },
}

async function fetchJobRole(id: string) {
  const role = await getJobRoleById(id)
  if (!role) throw new Error("Job role not found")
  return role
}

async function fetchAllJobRoles() {
  return await getJobRoles()
}

export default function JobRoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: roleData, isLoading, error, refetch } = useQuery({
    queryKey: ["job-role", roleId],
    queryFn: () => fetchJobRole(roleId),
  })

  const { data: allRoles } = useQuery({
    queryKey: ["all-job-roles"],
    queryFn: fetchAllJobRoles,
  })

  const { data: relatedRoles } = useQuery({
    queryKey: ["related-job-roles", roleId],
    queryFn: () => getRelatedJobRoles(roleId, roleId, 6),
    enabled: !!roleId,
  })

  const { data: jobPostings } = useQuery({
    queryKey: ["job-postings-by-role", roleId],
    queryFn: () => getJobPostingsByRole(roleId),
    enabled: !!roleId && activeTab === "postings",
  })

  const { data: applications } = useQuery({
    queryKey: ["applications-by-role", roleId],
    queryFn: () => getApplicationsByRole(roleId),
    enabled: !!roleId && activeTab === "applications",
  })

  const { data: analytics } = useQuery({
    queryKey: ["job-role-analytics", roleId],
    queryFn: () => getJobRoleAnalytics(roleId),
    enabled: !!roleId && activeTab === "analytics",
  })

  useEffect(() => {
    // Only call notFound if we're sure the role doesn't exist (after loading completes)
    if (!isLoading && !error && !roleData) {
      // Don't call notFound immediately - let the error state handle it
      console.warn('Job role not found:', roleId)
    }
  }, [error, isLoading, roleData, roleId])

  const navigation = useDetailNavigation({
    currentId: roleId,
    items: allRoles || [],
    getId: (r) => r.id,
    basePath: "/recruitment/job-roles",
    onNavigate: (id) => {
      router.push(`/recruitment/job-roles/${id}`)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load job role"
        message="We couldn't load this job role. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!isLoading && !roleData) {
    return (
      <ErrorState
        title="Job Role Not Found"
        message={`The job role with ID "${roleId}" could not be found. It may have been deleted or moved.`}
        onRetry={() => router.push("/recruitment/job-roles")}
      />
    )
  }

  if (!roleData) {
    return null
  }

  const status = statusConfig[roleData.status] || statusConfig.active

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/recruitment/job-roles")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{roleData.title}</h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {roleData.department} {roleData.location && `• ${roleData.location}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {/* TODO: Implement duplicate */}}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* TODO: Implement export */}}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {/* TODO: Implement archive */}}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* TODO: Implement delete */}} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hero Header */}
      <JobRoleDetailHeader role={roleData} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="border border-border rounded-[14px]">
            <Tabs value={activeTab} onValueChange={(value) => router.push(`?tab=${value}`)}>
              <div className="border-b border-border px-6 pt-4">
                <TabsList className="bg-muted p-0.5 rounded-xl w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="postings" className="flex-1">
                    Job Postings ({roleData.jobPostingsCount || 0})
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex-1">
                    Applications ({roleData.applicationsCount || 0})
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex-1">
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1">
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                <div className="space-y-4">
                  {roleData.requirements && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Qualifications</span>
                      </div>
                      <div className="pl-6">
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {roleData.requirements.split('\n').map((req, idx) => (
                            <li key={idx}>{req.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {roleData.description && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Job Description</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {roleData.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {roleData.responsibilities && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Responsibilities</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {roleData.responsibilities}
                        </p>
                      </div>
                    </div>
                  )}

                  {roleData.skills && roleData.skills.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Skills</span>
                      </div>
                      <div className="pl-6 flex flex-wrap gap-2">
                        {roleData.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {roleData.preferredIndustries && roleData.preferredIndustries.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Preferred Industries</span>
                      </div>
                      <div className="pl-6 flex flex-wrap gap-2">
                        {roleData.preferredIndustries.map((industry, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {roleData.masterJd && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Master Job Description</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                          {roleData.masterJd}
                        </p>
                        {roleData.jdAttachmentUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={roleData.jdAttachmentUrl} download target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download JD Attachment
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="postings" className="p-6 mt-0">
                <JobRolePostingsTable postings={jobPostings || []} roleId={roleId} />
              </TabsContent>

              <TabsContent value="applications" className="p-6 mt-0">
                <JobRoleApplicationsTable applications={applications || []} />
              </TabsContent>

              <TabsContent value="analytics" className="p-6 mt-0">
                <JobRoleAnalytics analytics={analytics} />
              </TabsContent>

              <TabsContent value="settings" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Settings and role configuration will be available here.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <JobRoleAttributes role={roleData} />
          <JobRoleManagementCard role={roleData} />
          
          {/* Navigation */}
          <Card className="border border-border rounded-[14px] p-5">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={navigation.navigatePrev}
                disabled={!navigation.hasPrev}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={navigation.navigateNext}
                disabled={!navigation.hasNext}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Related Roles Section */}
      {relatedRoles && relatedRoles.length > 0 && (
        <RelatedJobRoles roles={relatedRoles} currentRoleId={roleId} />
      )}

      {/* Edit Dialog */}
      <EditJobRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        jobRole={roleData}
      />
    </div>
  )
}

