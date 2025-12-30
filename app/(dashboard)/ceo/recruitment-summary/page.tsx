"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Briefcase, TrendingUp, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { initialCandidates } from "@/lib/data/candidates"
import { initialJobPostings } from "@/lib/data/recruitment"

async function fetchRecruitmentSummary() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    totalCandidates: initialCandidates.candidates.length,
    activeJobs: initialJobPostings.filter(j => j.status === "published").length,
    avgTimeToHire: 24,
    pipelineValue: initialCandidates.candidates.filter(c => c.status === "interview").length,
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function CeoRecruitmentSummaryPage() {
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ["recruitment-summary"],
    queryFn: fetchRecruitmentSummary,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load recruitment summary"
        message="We couldn't load recruitment summary data. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Recruitment Summary</h1>
            <p className="text-xs text-white/90 mt-0.5">Recruitment pipeline summary</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={(summary?.totalCandidates || 0).toString()}
          icon={UserPlus}
        />
        <StatCard
          title="Active Job Postings"
          value={(summary?.activeJobs || 0).toString()}
          icon={Briefcase}
        />
        <StatCard
          title="Avg Time to Hire (days)"
          value={(summary?.avgTimeToHire || 0).toString()}
          icon={Clock}
        />
        <StatCard
          title="In Interview Stage"
          value={(summary?.pipelineValue || 0).toString()}
          icon={TrendingUp}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-base font-medium text-muted-foreground mb-2">Recruitment Pipeline Summary</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive recruitment metrics and executive insights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
