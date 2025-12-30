"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  Clock,
  Link2,
  Plus,
} from "lucide-react"
import {
  getApplicationWithRelations,
  getInterviews,
} from "@/lib/actions/recruitment"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { getApplications } from "@/lib/actions/recruitment"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  applied: { label: "Applied", variant: "default" },
  screening: { label: "Screening", variant: "secondary" },
  interview: { label: "Interview", variant: "default" },
  offer: { label: "Offer", variant: "secondary" },
  hired: { label: "Hired", variant: "default" },
  rejected: { label: "Rejected", variant: "outline" },
}

async function fetchApplication(id: string) {
  const application = await getApplicationWithRelations(id)
  if (!application) throw new Error("Application not found")
  return application
}

async function fetchAllApplications() {
  return await getApplications()
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"

  const { data: applicationData, isLoading, error, refetch } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => fetchApplication(applicationId),
  })

  const { data: allApplications } = useQuery({
    queryKey: ["all-applications"],
    queryFn: fetchAllApplications,
  })

  // Get interviews for this application
  const { data: allInterviews } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => getInterviews(),
  })

  const applicationInterviews = useMemo(() => {
    if (!allInterviews || !applicationData) return []
    // Filter interviews that belong to this application
    // Note: This is a simplified approach - in real implementation, interviews should have application_id
    return allInterviews.filter((int) => int.candidateEmail === applicationData.candidateEmail)
  }, [allInterviews, applicationData])

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !applicationData) {
      notFound()
    }
  }, [error, isLoading, applicationData])

  const navigation = useDetailNavigation({
    currentId: applicationId,
    items: allApplications || [],
    getId: (a) => a.id,
    basePath: "/recruitment/applications",
    onNavigate: (id) => {
      router.push(`/recruitment/applications/${id}`)
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
        title="Failed to load application"
        message="We couldn't load this application. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!applicationData) {
    return null
  }

  const status = statusConfig[applicationData.status] || statusConfig.applied

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/recruitment/applications")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                {applicationData.candidateName}
              </h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{applicationData.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/recruitment/interviews?application=${applicationId}`)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
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
                  <TabsTrigger value="interviews" className="flex-1">
                    Interviews ({applicationInterviews.length})
                  </TabsTrigger>
                  <TabsTrigger value="evaluation" className="flex-1">
                    Evaluation
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">
                    Notes
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="p-6 space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Candidate Information</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <Link
                        href={`/recruitment/candidates?search=${encodeURIComponent(applicationData.candidateName)}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getAvatarForUser(applicationData.candidateName)}
                            alt={applicationData.candidateName}
                          />
                          <AvatarFallback className="text-xs">
                            {applicationData.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{applicationData.candidateName}</p>
                          <p className="text-xs text-muted-foreground">{applicationData.candidateEmail}</p>
                        </div>
                        <Link2 className="h-3 w-3 text-muted-foreground ml-auto" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Job Posting</span>
                    </div>
                    <div className="pl-6">
                      <Link
                        href={`/recruitment/job-postings?search=${encodeURIComponent(applicationData.position)}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <span className="text-sm font-medium text-foreground">{applicationData.position}</span>
                        <Link2 className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Application Details</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Applied Date</span>
                        <span className="text-sm font-medium text-foreground">
                          {format(new Date(applicationData.appliedDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Source</span>
                        <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {applicationData.source}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="interviews" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Interviews</h3>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/recruitment/interviews?application=${applicationId}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                  {applicationInterviews.length > 0 ? (
                    <div className="space-y-3">
                      {applicationInterviews.map((interview) => (
                        <Card
                          key={interview.id}
                          className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/recruitment/interviews/${interview.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-foreground">
                                  {format(new Date(interview.interviewDate), "MMM d, yyyy")} at {interview.interviewTime}
                                </span>
                                <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                                  {interview.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {interview.interviewType} • {interview.interviewer.name}
                              </p>
                            </div>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No interviews scheduled yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push(`/recruitment/interviews?application=${applicationId}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="evaluation" className="p-6 mt-0">
                {applicationData.evaluation ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Technical</p>
                        <p className="text-lg font-semibold text-foreground">
                          {applicationData.evaluation.technicalScore}/10
                        </p>
                      </Card>
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Communication</p>
                        <p className="text-lg font-semibold text-foreground">
                          {applicationData.evaluation.communicationScore}/10
                        </p>
                      </Card>
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Cultural Fit</p>
                        <p className="text-lg font-semibold text-foreground">
                          {applicationData.evaluation.culturalFitScore}/10
                        </p>
                      </Card>
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Overall</p>
                        <p className="text-lg font-semibold text-foreground">
                          {applicationData.evaluation.overallScore}/10
                        </p>
                      </Card>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Feedback</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {applicationData.evaluation.feedback}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Recommendation</Label>
                      <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {applicationData.evaluation.recommendation}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No evaluation yet. Complete an interview to create an evaluation.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/recruitment/interviews?application=${applicationId}`)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="p-6 mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Add Notes</Label>
                  <Textarea placeholder="Add notes about this application..." className="min-h-[150px]" />
                </div>
                {applicationData.notes && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Existing Notes</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{applicationData.notes}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Info */}
          <Card className="border border-border rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Candidate</p>
                <Link
                  href={`/recruitment/candidates?search=${encodeURIComponent(applicationData.candidateName)}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {applicationData.candidateName}
                </Link>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Job Posting</p>
                <Link
                  href={`/recruitment/job-postings?search=${encodeURIComponent(applicationData.position)}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {applicationData.position}
                </Link>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Interviews</p>
                <p className="text-sm font-semibold text-foreground">{applicationInterviews.length}</p>
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

