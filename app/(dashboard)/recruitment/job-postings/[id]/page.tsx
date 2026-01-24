"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  MapPin,
  Eye,
  UserPlus,
  Link2,
  Edit,
  CheckCircle2,
  FileText,
} from "lucide-react"
import {
  getJobPostingWithApplications,
  getJobPostings,
} from "@/lib/actions/recruitment"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  published: { label: "Published", variant: "default" },
  closed: { label: "Closed", variant: "secondary" },
}

async function fetchJobPosting(id: string) {
  const posting = await getJobPostingWithApplications(id)
  if (!posting) throw new Error("Job posting not found")
  return posting
}

async function fetchAllJobPostings() {
  return await getJobPostings()
}

export default function JobPostingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const postingId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"

  const { data: postingData, isLoading, error, refetch } = useQuery({
    queryKey: ["job-posting", postingId],
    queryFn: () => fetchJobPosting(postingId),
  })

  const { data: allPostings } = useQuery({
    queryKey: ["all-job-postings"],
    queryFn: fetchAllJobPostings,
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !postingData) {
      notFound()
    }
  }, [error, isLoading, postingData])

  const navigation = useDetailNavigation({
    currentId: postingId,
    items: allPostings || [],
    getId: (p) => p.id,
    basePath: "/recruitment/job-postings",
    onNavigate: (id) => {
      router.push(`/recruitment/job-postings/${id}`)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <ErrorState
        title="Failed to load job posting"
        message="We couldn't load this job posting. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!postingData) {
    return null
  }

  const status = statusConfig[postingData.status] || statusConfig.draft

  const getDaysOpen = () => {
    if (!postingData.postedDate) return 0
    return Math.floor(
      (new Date().getTime() - new Date(postingData.postedDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/recruitment/job-postings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{postingData.title}</h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {postingData.department} • {postingData.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

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
                  <TabsTrigger value="applications" className="flex-1">
                    Applications ({postingData.applicationsCount})
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex-1">
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Job Details</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <Badge variant="primary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {postingData.department}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{postingData.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Employment Type</span>
                        <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs capitalize">
                          {postingData.employmentType}
                        </Badge>
                      </div>
                      {postingData.postedDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Posted Date</span>
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(postingData.postedDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                      {postingData.closingDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Closing Date</span>
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(postingData.closingDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {postingData.description && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Description</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {postingData.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {postingData.requirements && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Requirements</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {postingData.requirements}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Applications</h3>
                  </div>
                  {postingData.applications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                            <TableHead className="px-3">
                              <span className="text-sm font-medium text-muted-foreground">Candidate</span>
                            </TableHead>
                            <TableHead className="px-3">
                              <span className="text-sm font-medium text-muted-foreground">Status</span>
                            </TableHead>
                            <TableHead className="px-3">
                              <span className="text-sm font-medium text-muted-foreground">Applied Date</span>
                            </TableHead>
                            <TableHead className="px-3"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {postingData.applications.map((app) => (
                            <TableRow
                              key={app.id}
                              className="border-b border-border cursor-pointer hover:bg-muted/30"
                              onClick={() => router.push(`/recruitment/applications/${app.id}`)}
                            >
                              <TableCell className="px-3">
                                <Link
                                  href={`/recruitment/candidates?search=${encodeURIComponent(app.candidateName)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 hover:underline"
                                >
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={getAvatarForUser(app.candidateName)}
                                      alt={app.candidateName}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {app.candidateName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{app.candidateName}</p>
                                    <p className="text-xs text-muted-foreground">{app.candidateEmail}</p>
                                  </div>
                                </Link>
                              </TableCell>
                              <TableCell className="px-3">
                                <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                                  {app.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3">
                                <span className="text-sm font-medium text-foreground">
                                  {format(new Date(app.appliedDate), "MMM d, yyyy")}
                                </span>
                              </TableCell>
                              <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No applications yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Views</p>
                      <p className="text-lg font-semibold text-foreground">{postingData.views || 0}</p>
                    </Card>
                    <Card className="border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Applications</p>
                      <p className="text-lg font-semibold text-foreground">
                        {postingData.applicationsCount}
                      </p>
                    </Card>
                    <Card className="border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Days Open</p>
                      <p className="text-lg font-semibold text-foreground">{getDaysOpen()}</p>
                    </Card>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Analytics charts coming soon</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Stats */}
          <Card className="border border-border rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="text-sm font-semibold text-foreground">{postingData.views || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Applications</span>
                <span className="text-sm font-semibold text-foreground">{postingData.applicationsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Open Positions</span>
                <span className="text-sm font-semibold text-foreground">{postingData.openings || 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Open</span>
                <span className="text-sm font-semibold text-foreground">{getDaysOpen()}</span>
              </div>
            </div>
          </Card>

          {/* Posted By */}
          <Card className="border border-border rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Posted By</h3>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={getAvatarForUser(postingData.postedBy.name)}
                  alt={postingData.postedBy.name}
                />
                <AvatarFallback className="text-xs">
                  {postingData.postedBy.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{postingData.postedBy.name}</p>
                {postingData.postedBy.email && (
                  <p className="text-xs text-muted-foreground">{postingData.postedBy.email}</p>
                )}
              </div>
            </div>
          </Card>

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
    </div>
  )
}

