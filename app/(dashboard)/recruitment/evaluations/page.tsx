"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileDown,
  Search,
  Filter,
  ClipboardCheck,
  UserCheck,
  X,
  ChevronRight,
  Award,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Evaluation, EvaluationRound } from "@/lib/types/recruitment"
import { getEvaluations, getEvaluationProgress } from "@/lib/actions/recruitment"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchEvaluations() {
  return await getEvaluations()
}

async function fetchEvaluationProgress() {
  return await getEvaluationProgress()
}

const recommendationConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType; color: string }> = {
  hire: { label: "Hire", variant: "default", icon: UserCheck, color: "text-green-600 bg-green-50 border-green-200" },
  maybe: { label: "Maybe", variant: "secondary", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  "no-hire": { label: "No Hire", variant: "outline", icon: X, color: "text-red-600 bg-red-50 border-red-200" },
}

const roundConfig: Record<EvaluationRound, { label: string; shortLabel: string; description: string; icon: React.ElementType; color: string }> = {
  level_1: {
    label: "Level 1 - Department Senior",
    shortLabel: "L1",
    description: "Technical & functional evaluation by department senior",
    icon: Users,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  level_2: {
    label: "Level 2 - Final Decision",
    shortLabel: "L2",
    description: "Final hiring decision by HR/Management",
    icon: Award,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending_level_1: { label: "Awaiting L1", icon: Clock, color: "text-gray-600 bg-gray-100" },
  pending_level_2: { label: "Awaiting L2", icon: ChevronRight, color: "text-blue-600 bg-blue-100" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-100" },
}

type ViewMode = "all" | "level_1" | "level_2" | "progress"

function StatCard({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
}: {
  title: string
  value: string | number
  icon: React.ElementType
  onClick?: () => void
  isActive?: boolean
  iconBgColor?: string
  iconColor?: string
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl p-4 bg-white transition-all",
        isActive
          ? "border-primary shadow-md bg-primary/5 cursor-pointer"
          : "border-border hover:border-primary/50 hover:shadow-sm cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
        </div>
        <div
          className={cn(
            "rounded-lg w-10 h-10 flex items-center justify-center transition-colors",
            isActive ? "bg-primary text-white" : `${iconBgColor} ${iconColor}`
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export default function RecruitmentEvaluationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("all")

  const { data: evaluations, isLoading, error, refetch } = useQuery({
    queryKey: ["evaluations"],
    queryFn: fetchEvaluations,
  })

  const { data: progress } = useQuery({
    queryKey: ["evaluation-progress"],
    queryFn: fetchEvaluationProgress,
  })

  // Filter and group evaluations - must be before early returns
  const filteredEvaluations = useMemo(() => {
    let filtered = evaluations || []

    // Filter by search
    filtered = filtered.filter(
      (eval_) =>
        eval_.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eval_.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eval_.position.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter by round
    if (viewMode === "level_1") {
      filtered = filtered.filter((e) => e.evaluationRound === "level_1")
    } else if (viewMode === "level_2") {
      filtered = filtered.filter((e) => e.evaluationRound === "level_2")
    }

    return filtered
  }, [evaluations, searchQuery, viewMode])

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!evaluations) return { total: 0, level1: 0, level2: 0, pendingLevel2: 0 }
    const level1 = evaluations.filter((e) => e.evaluationRound === "level_1").length
    const level2 = evaluations.filter((e) => e.evaluationRound === "level_2").length
    const pendingLevel2 = progress?.filter((p) => p.status === "pending_level_2").length || 0
    return { total: evaluations.length, level1, level2, pendingLevel2 }
  }, [evaluations, progress])

  // Early returns for loading and error states - after all hooks
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
        title="Failed to load evaluations"
        message="We couldn't load evaluations. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Evaluations</h1>
            <p className="text-xs text-white/90 mt-0.5">Two-round evaluation process: Department Senior (L1) → Final Decision (L2)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="default" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Metrics Cards as Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Evaluations"
          value={metrics.total}
          icon={ClipboardCheck}
          onClick={() => setViewMode("all")}
          isActive={viewMode === "all"}
        />
        <StatCard
          title="Level 1 (Dept Senior)"
          value={metrics.level1}
          icon={Users}
          onClick={() => setViewMode(viewMode === "level_1" ? "all" : "level_1")}
          isActive={viewMode === "level_1"}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Level 2 (Final)"
          value={metrics.level2}
          icon={Award}
          onClick={() => setViewMode(viewMode === "level_2" ? "all" : "level_2")}
          isActive={viewMode === "level_2"}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Pending L2"
          value={metrics.pendingLevel2}
          icon={Clock}
          onClick={() => setViewMode(viewMode === "progress" ? "all" : "progress")}
          isActive={viewMode === "progress"}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-4">
            {/* View mode indicator */}
            <div className="text-sm font-medium text-muted-foreground">
              {viewMode === "all" && "All Evaluations"}
              {viewMode === "level_1" && "Level 1 Evaluations"}
              {viewMode === "level_2" && "Level 2 Evaluations"}
              {viewMode === "progress" && "Evaluation Progress"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {viewMode === "progress" ? (
          // Progress View - Show candidates with their evaluation status
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="w-[200px] px-3">Candidate</TableHead>
                  <TableHead className="px-3">Position</TableHead>
                  <TableHead className="px-3">Level 1 Status</TableHead>
                  <TableHead className="px-3">Level 1 Score</TableHead>
                  <TableHead className="px-3">Level 2 Status</TableHead>
                  <TableHead className="px-3">Level 2 Score</TableHead>
                  <TableHead className="px-3">Overall Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progress && progress.length > 0 ? (
                  progress.map((item) => {
                    const status = statusConfig[item.status]
                    const StatusIcon = status.icon
                    return (
                      <TableRow key={item.interviewId} className="border-b border-border">
                        <TableCell className="px-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{item.candidateName}</span>
                            <span className="text-xs text-muted-foreground">{item.candidateEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{item.position}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          {item.level1 ? (
                            <Badge className={cn("gap-1", recommendationConfig[item.level1.recommendation].color)}>
                              {recommendationConfig[item.level1.recommendation].label}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          {item.level1 ? (
                            <span className="text-sm font-semibold text-foreground">{item.level1.overallScore}/10</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          {item.level2 ? (
                            <Badge className={cn("gap-1", recommendationConfig[item.level2.recommendation].color)}>
                              {recommendationConfig[item.level2.recommendation].label}
                            </Badge>
                          ) : item.level1?.recommendation === "no-hire" ? (
                            <Badge variant="outline" className="gap-1 text-red-500 bg-red-50">
                              <X className="h-3 w-3" />
                              N/A
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          {item.level2 ? (
                            <span className="text-sm font-semibold text-foreground">{item.level2.overallScore}/10</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge className={cn("gap-1", status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24">
                      <EmptyState
                        icon={ClipboardCheck}
                        title="No evaluations yet"
                        description="Complete interviews to start the evaluation process."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Regular Evaluations View
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="w-[200px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Candidate</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Round</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Evaluated By</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Technical</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Communication</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Cultural Fit</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Overall</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Recommendation</span>
                  </TableHead>
                  <TableHead className="w-[44px] px-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.length > 0 ? (
                  filteredEvaluations.map((evaluation) => {
                    const recommendation = recommendationConfig[evaluation.recommendation] || recommendationConfig.maybe
                    const RecommendationIcon = recommendation.icon
                    const round = roundConfig[evaluation.evaluationRound] || roundConfig.level_1
                    const RoundIcon = round.icon
                    return (
                      <TableRow key={evaluation.id} className="border-b border-border">
                        <TableCell className="px-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{evaluation.candidateName}</span>
                            <span className="text-xs text-muted-foreground">{evaluation.candidateEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{evaluation.position}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge className={cn("gap-1 border", round.color)}>
                            <RoundIcon className="h-3 w-3" />
                            {round.shortLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={getAvatarForUser(evaluation.evaluatedBy.id || evaluation.evaluatedBy.name)} alt={evaluation.evaluatedBy.name} />
                              <AvatarFallback className="text-xs">
                                {evaluation.evaluatedBy.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{evaluation.evaluatedBy.name}</span>
                              {evaluation.evaluatorTitle && (
                                <span className="text-xs text-muted-foreground">{evaluation.evaluatorTitle}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{evaluation.technicalScore}/10</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{evaluation.communicationScore}/10</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{evaluation.culturalFitScore}/10</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-semibold text-foreground">{evaluation.overallScore}/10</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge className={cn("gap-1 border", recommendation.color)}>
                            <RecommendationIcon className="h-3 w-3" />
                            {recommendation.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          <RowActionsMenu
                            entityType="evaluation"
                            entityId={evaluation.id}
                            entityName={evaluation.candidateName}
                            canView={true}
                            canEdit={true}
                            canDelete={false}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24">
                      <EmptyState
                        icon={ClipboardCheck}
                        title="No evaluations yet"
                        description="Candidate evaluations will appear here once they are submitted."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
