"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecruitmentMetrics } from "@/lib/actions/recruitment"
import { Users, Briefcase, Calendar, CheckCircle2, Clock, TrendingUp } from "lucide-react"

interface RecruitmentMetricsProps {
  metrics: RecruitmentMetrics | undefined
  isLoading: boolean
}

export function RecruitmentMetricsCards({ metrics, isLoading }: RecruitmentMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-2xl">
            <CardContent className="p-[18px]">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Active Candidates
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xl font-semibold text-foreground leading-[1.35]">
            {metrics.activeCandidates}
          </p>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Open Positions
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xl font-semibold text-foreground leading-[1.35]">
            {metrics.openPositions}
          </p>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Interviews This Week
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xl font-semibold text-foreground leading-[1.35]">
            {metrics.interviewsThisWeek}
          </p>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
      <Card className="border border-border rounded-2xl p-[18px] bg-white">
        <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
          Offers Pending
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xl font-semibold text-foreground leading-[1.35]">
            {metrics.offersPending}
          </p>
          <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  )
}

