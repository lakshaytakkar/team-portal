"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Target, TrendingUp, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { initialProjects } from "@/lib/data/projects"
import { initialTasks } from "@/lib/data/tasks"

async function fetchOperationsSummary() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const completedProjects = initialProjects.projects.filter(p => p.status === "completed").length
  const activeProjects = initialProjects.projects.filter(p => p.status === "active").length
  const completedTasks = initialTasks.tasks.filter(t => t.status === "completed").length
  const totalTasks = initialTasks.tasks.length
  return {
    activeProjects,
    completedProjects,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    onTimeDelivery: 87.5,
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

export default function CeoOperationsSummaryPage() {
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ["operations-summary"],
    queryFn: fetchOperationsSummary,
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
        title="Failed to load operations summary"
        message="We couldn't load operations summary data. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Operations Summary</h1>
            <p className="text-xs text-white/90 mt-0.5">Operations and business metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={(summary?.activeProjects || 0).toString()}
          icon={Activity}
        />
        <StatCard
          title="Completed Projects"
          value={(summary?.completedProjects || 0).toString()}
          icon={CheckCircle2}
        />
        <StatCard
          title="Task Completion Rate"
          value={`${summary?.taskCompletionRate || 0}%`}
          icon={Target}
        />
        <StatCard
          title="On-Time Delivery"
          value={`${summary?.onTimeDelivery || 0}%`}
          icon={TrendingUp}
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-base font-medium text-muted-foreground mb-2">Operations Summary</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive operations and business metrics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
