"use client"

import { useEffect } from "react"
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
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle2,
  Link2,
  Edit,
} from "lucide-react"
import {
  getInterviewWithRelations,
  getInterviews,
} from "@/lib/actions/recruitment"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

const statusConfig: Record<
  string,
  { label: string; borderColor: string; textColor: string; dotColor: string }
> = {
  scheduled: {
    label: "Scheduled",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  completed: {
    label: "Completed",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  cancelled: {
    label: "Cancelled",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
  rescheduled: {
    label: "Rescheduled",
    borderColor: "border-[#f59e0b]",
    textColor: "text-[#f59e0b]",
    dotColor: "bg-[#f59e0b]",
  },
}

const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  phone: { label: "Phone", icon: Phone },
  video: { label: "Video", icon: Video },
  "in-person": { label: "In Person", icon: MapPin },
}

async function fetchInterview(id: string) {
  const interview = await getInterviewWithRelations(id)
  if (!interview) throw new Error("Interview not found")
  return interview
}

async function fetchAllInterviews() {
  return await getInterviews()
}

export default function InterviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const interviewId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"

  const { data: interviewData, isLoading, error, refetch } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: () => fetchInterview(interviewId),
  })

  const { data: allInterviews } = useQuery({
    queryKey: ["all-interviews"],
    queryFn: fetchAllInterviews,
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !interviewData) {
      notFound()
    }
  }, [error, isLoading, interviewData])

  const navigation = useDetailNavigation({
    currentId: interviewId,
    items: allInterviews || [],
    getId: (i) => i.id,
    basePath: "/recruitment/interviews",
    onNavigate: (id) => {
      router.push(`/recruitment/interviews/${id}`)
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
        title="Failed to load interview"
        message="We couldn't load this interview. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!interviewData) {
    return null
  }

  const interview = interviewData
  const status = statusConfig[interview.status] || statusConfig.scheduled
  const type = typeConfig[interview.interviewType] || typeConfig.video
  const TypeIcon = type.icon

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/recruitment/interviews")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                {interview.candidateName}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-1.5 py-0.5 rounded-2xl text-xs gap-1",
                  status.borderColor,
                  status.textColor
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {interview.position} • {format(new Date(interview.interviewDate), "MMM d, yyyy")} at {interview.interviewTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {interview.status === "completed" && !interview.evaluation && (
            <Button
              variant="outline"
              onClick={() => router.push(`/recruitment/evaluations?interview=${interviewId}`)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Evaluation
            </Button>
          )}
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
                  <TabsTrigger value="evaluation" className="flex-1">
                    Evaluation {interview.evaluation ? "✓" : ""}
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
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Interview Details</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span className="text-sm font-medium text-foreground">
                          {format(new Date(interview.interviewDate), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time</span>
                        <span className="text-sm font-medium text-foreground">{interview.interviewTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{type.label}</span>
                        </div>
                      </div>
                      {interview.location && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Location</span>
                          <span className="text-sm font-medium text-foreground">{interview.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Candidate</span>
                    </div>
                    <div className="pl-6">
                      <Link
                        href={`/recruitment/candidates?search=${encodeURIComponent(interview.candidateName)}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getAvatarForUser(interview.candidateName)}
                            alt={interview.candidateName}
                          />
                          <AvatarFallback className="text-xs">
                            {interview.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{interview.candidateName}</p>
                          <p className="text-xs text-muted-foreground">{interview.candidateEmail}</p>
                        </div>
                        <Link2 className="h-3 w-3 text-muted-foreground ml-auto" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Application</span>
                    </div>
                    <div className="pl-6">
                      <Link
                        href={`/recruitment/applications/${interview.application.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <span className="text-sm font-medium text-foreground">{interview.application.position}</span>
                        <Link2 className="h-3 w-3 text-muted-foreground" />
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Status: {interview.application.status}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Interviewer</span>
                    </div>
                    <div className="pl-6">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getAvatarForUser(interview.interviewer.name)}
                            alt={interview.interviewer.name}
                          />
                          <AvatarFallback className="text-xs">
                            {interview.interviewer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{interview.interviewer.name}</p>
                          {interview.interviewer.email && (
                            <p className="text-xs text-muted-foreground">{interview.interviewer.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evaluation" className="p-6 mt-0">
                {interview.evaluation ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Technical</p>
                        <p className="text-lg font-semibold text-foreground">
                          {interview.evaluation.technicalScore}/10
                        </p>
                      </Card>
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Communication</p>
                        <p className="text-lg font-semibold text-foreground">
                          {interview.evaluation.communicationScore}/10
                        </p>
                      </Card>
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Cultural Fit</p>
                        <p className="text-lg font-semibold text-foreground">
                          {interview.evaluation.culturalFitScore}/10
                        </p>
                      </Card>
                      <Card className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Overall</p>
                        <p className="text-lg font-semibold text-foreground">
                          {interview.evaluation.overallScore}/10
                        </p>
                      </Card>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Feedback</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {interview.evaluation.feedback}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Recommendation</Label>
                      <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                        {interview.evaluation.recommendation}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Evaluated By</Label>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getAvatarForUser(interview.evaluation.evaluatedBy.name)}
                            alt={interview.evaluation.evaluatedBy.name}
                          />
                          <AvatarFallback className="text-xs">
                            {interview.evaluation.evaluatedBy.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-foreground">
                          {interview.evaluation.evaluatedBy.name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(interview.evaluation.evaluatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {interview.status === "completed"
                        ? "No evaluation created yet. Create an evaluation for this interview."
                        : "Complete the interview to create an evaluation."}
                    </p>
                    {interview.status === "completed" && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/recruitment/evaluations?interview=${interviewId}`)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Create Evaluation
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="p-6 mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Add Notes</Label>
                  <Textarea placeholder="Add notes about this interview..." className="min-h-[150px]" />
                </div>
                {interview.notes && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Existing Notes</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{interview.notes}</p>
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
                  href={`/recruitment/candidates?search=${encodeURIComponent(interview.candidateName)}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {interview.candidateName}
                </Link>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Application</p>
                <Link
                  href={`/recruitment/applications/${interview.application.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {interview.application.position}
                </Link>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Interviewer</p>
                <p className="text-sm font-semibold text-foreground">{interview.interviewer.name}</p>
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

