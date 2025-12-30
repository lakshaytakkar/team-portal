"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
  Mail,
  Phone,
  Linkedin,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Edit,
  Plus,
  Link2,
} from "lucide-react"
import { Candidate, CandidateStatus } from "@/lib/types/candidate"
import {
  getCandidateById,
  getCandidates,
  getCandidateWithRelations,
  getCandidateTimeline,
  updateCandidateStatus,
} from "@/lib/actions/recruitment"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { CandidateTimeline } from "@/components/recruitment/CandidateTimeline"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const statusConfig: Record<
  CandidateStatus,
  { label: string; variant: "default" | "secondary" | "primary-outline" | "green-outline" | "red-outline" }
> = {
  new: { label: "New", variant: "default" },
  screening: { label: "Screening", variant: "secondary" },
  interview: { label: "Interview", variant: "primary-outline" },
  offer: { label: "Offer", variant: "green-outline" },
  hired: { label: "Hired", variant: "green-outline" },
  rejected: { label: "Rejected", variant: "red-outline" },
}

async function fetchCandidate(id: string) {
  const candidate = await getCandidateWithRelations(id)
  if (!candidate) throw new Error("Candidate not found")
  return candidate
}

async function fetchAllCandidates() {
  return await getCandidates()
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const candidateId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"
  const queryClient = useQueryClient()

  const { data: candidateData, isLoading, error, refetch } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchCandidate(candidateId),
  })

  const { data: timeline } = useQuery({
    queryKey: ["candidate-timeline", candidateId],
    queryFn: () => getCandidateTimeline(candidateId),
    enabled: !!candidateId,
  })

  const { data: allCandidates } = useQuery({
    queryKey: ["all-candidates"],
    queryFn: fetchAllCandidates,
  })

  const statusChangeMutation = useMutation({
    mutationFn: (status: CandidateStatus) => updateCandidateStatus(candidateId, status, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] })
      queryClient.invalidateQueries({ queryKey: ["candidate-timeline", candidateId] })
      toast.success("Status updated successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to update status", {
        description: error.message,
      })
    },
  })

  // Handle 404 for missing candidates
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !candidateData) {
      notFound()
    }
  }, [error, isLoading, candidateData])

  const navigation = useDetailNavigation({
    currentId: candidateId,
    items: allCandidates || [],
    getId: (c) => c.id,
    basePath: "/recruitment/candidates",
    onNavigate: (id) => {
      router.push(`/recruitment/candidates/${id}`)
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
        title="Failed to load candidate"
        message="We couldn't load this candidate. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!candidateData) {
    return null
  }

  const candidate = candidateData
  const status = statusConfig[candidate.status]

  const getDaysInPipeline = () => {
    return Math.floor(
      (new Date().getTime() - new Date(candidate.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/recruitment/candidates")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{candidate.fullName}</h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{candidate.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/recruitment/interviews?candidate=${candidate.id}`)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
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
                    Applications ({candidate.applicationsCount})
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex-1">
                    Documents
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
                      <span className="text-sm font-semibold text-foreground">Contact Information</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a href={`mailto:${candidate.email}`} className="text-sm text-primary hover:text-primary/80">
                          {candidate.email}
                        </a>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <a href={`tel:${candidate.phone}`} className="text-sm text-primary hover:text-primary/80">
                            {candidate.phone}
                          </a>
                        </div>
                      )}
                      {candidate.linkedIn && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />
                          <a
                            href={candidate.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Position Applied</span>
                    </div>
                    <div className="pl-6">
                      <p className="text-sm text-foreground font-medium">{candidate.positionApplied}</p>
                    </div>
                  </div>

                  {candidate.experience && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Experience</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{candidate.experience}</p>
                      </div>
                    </div>
                  )}

                  {candidate.education && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Education</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{candidate.education}</p>
                      </div>
                    </div>
                  )}

                  {candidate.skills && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Skills</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-muted-foreground">{candidate.skills}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Applications</h3>
                    <Button size="sm" onClick={() => router.push(`/recruitment/applications?candidate=${candidate.id}`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Apply to New Position
                    </Button>
                  </div>
                  {candidate.applications.length > 0 ? (
                    <div className="space-y-3">
                      {candidate.applications.map((app) => (
                        <Card
                          key={app.id}
                          className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/recruitment/applications/${app.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-foreground">{app.position}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                                  {app.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Applied {new Date(app.appliedDate).toLocaleDateString()}
                                </span>
                                {candidate.interviews.filter((i) => i.candidateName === candidate.fullName).length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {candidate.interviews.filter((i) => i.candidateName === candidate.fullName).length}{" "}
                                    interviews
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No applications yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push(`/recruitment/applications?candidate=${candidate.id}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Apply to New Position
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="p-6 mt-0">
                {timeline && timeline.length > 0 ? (
                  <CandidateTimeline timeline={timeline} />
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No timeline activity yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="p-6 mt-0 space-y-4">
                {candidate.resume ? (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Resume
                    </Label>
                    <a
                      href={candidate.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No resume uploaded.</p>
                )}

                {candidate.coverLetter && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Cover Letter</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{candidate.coverLetter}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="p-6 mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Add Notes</Label>
                  <Textarea placeholder="Add notes about this candidate..." className="min-h-[150px]" />
                </div>
                {candidate.notes && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Existing Notes</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{candidate.notes}</p>
                  </div>
                )}
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
                <span className="text-sm text-muted-foreground">Applications</span>
                <span className="text-sm font-semibold text-foreground">{candidate.applicationsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interviews</span>
                <span className="text-sm font-semibold text-foreground">{candidate.interviewsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days in Pipeline</span>
                <span className="text-sm font-semibold text-foreground">{getDaysInPipeline()}</span>
              </div>
            </div>
          </Card>

          {/* Related Items */}
          <Card className="border border-border rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Related Items</h3>
            <div className="space-y-3">
              {candidate.applications.slice(0, 3).map((app) => (
                <Link
                  key={app.id}
                  href={`/recruitment/applications/${app.id}`}
                  className="block p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{app.position}</p>
                  <p className="text-xs text-muted-foreground">{app.status}</p>
                </Link>
              ))}
              {candidate.applications.length === 0 && (
                <p className="text-xs text-muted-foreground">No applications yet</p>
              )}
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
