"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Target, CheckCircle2, Clock } from "lucide-react"
import { Goal, GoalStatus, GoalPriority } from "@/lib/types/goal"
import { initialGoals } from "@/lib/data/goals"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { ErrorState } from "@/components/ui/error-state"
import { QuickDetailModal } from "@/components/details"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"

const statusConfig: Record<GoalStatus, { label: string; variant: "neutral-outline" | "primary-outline" | "green-outline" | "red-outline" }> = {
  "not-started": { label: "Not Started", variant: "neutral-outline" },
  "in-progress": { label: "In Progress", variant: "primary-outline" },
  completed: { label: "Completed", variant: "green-outline" },
  cancelled: { label: "Cancelled", variant: "red-outline" },
}

const priorityConfig: Record<GoalPriority, { label: string; variant: "neutral" | "secondary" | "yellow" | "red" }> = {
  low: { label: "Low", variant: "neutral" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "yellow" },
}

async function fetchGoal(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const goal = initialGoals.goals.find((g) => g.id === id)
  if (!goal) throw new Error("Goal not found")
  return goal
}

async function fetchAllGoals() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return initialGoals.goals
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string
  const [isOpen, setIsOpen] = useState(true)
  const [notes, setNotes] = useState("")

  const { data: goal, isLoading, error, refetch } = useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => fetchGoal(goalId),
  })

  const { data: allGoals } = useQuery({
    queryKey: ["all-goals"],
    queryFn: fetchAllGoals,
  })

  // Handle 404 for missing goals
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !goal) {
      notFound()
    }
  }, [error, isLoading, goal])

  const navigation = useDetailNavigation({
    currentId: goalId,
    items: allGoals || [],
    getId: (g) => g.id,
    basePath: "/my-goals",
    onNavigate: (id) => {
      router.push(`/my-goals/${id}`)
    },
  })

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      router.push("/my-goals")
    }, 200)
  }

  if (isLoading) {
    return (
      <QuickDetailModal open={isOpen} onOpenChange={handleClose} title="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </QuickDetailModal>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <QuickDetailModal open={isOpen} onOpenChange={handleClose} title="Error">
        <ErrorState
          title="Failed to load goal"
          message="We couldn't load this goal. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </QuickDetailModal>
    )
  }

  if (!goal) {
    return null
  }

  const status = statusConfig[goal.status]
  const priority = priorityConfig[goal.priority]

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={navigation.navigatePrev}
          disabled={!navigation.hasPrev}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={navigation.navigateNext}
          disabled={!navigation.hasNext}
        >
          Next
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        <Button>Save</Button>
      </div>
    </div>
  )

  return (
    <QuickDetailModal
      open={isOpen}
      onOpenChange={handleClose}
      title={goal.title}
      footer={footer}
    >
      <div className="space-y-4">
        {/* Status and Priority */}
        <div className="flex items-center gap-3">
          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
            {status.label}
          </Badge>
          <Badge variant={priority.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
            {priority.label}
          </Badge>
        </div>

        {/* Description */}
        {goal.description && (
          <div>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Progress</span>
            <span className="text-sm text-foreground font-medium">{goal.progress}%</span>
          </div>
          <div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-l-full transition-all",
                goal.progress === 100 ? "bg-status-completed-foreground" : "bg-primary"
              )}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Target Date */}
        {goal.targetDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-xs text-muted-foreground font-medium">Target Date</span>
              <p className="text-sm text-foreground font-medium">
                {new Date(goal.targetDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Assigned To */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={getAvatarForUser(goal.assignedTo.id || goal.assignedTo.name)}
              alt={goal.assignedTo.name}
            />
            <AvatarFallback className="text-xs">
              {goal.assignedTo.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Assigned To</span>
            <p className="text-sm text-foreground font-medium">{goal.assignedTo.name}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <span className="text-sm font-semibold text-foreground">Notes</span>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this goal..."
            className="min-h-[80px]"
          />
        </div>
      </div>
    </QuickDetailModal>
  )
}

