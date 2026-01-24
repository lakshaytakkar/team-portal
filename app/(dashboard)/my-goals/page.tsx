"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { CreateGoalDialog } from "@/components/my/CreateGoalDialog"
import { getGoals, deleteGoal } from "@/lib/actions/goals"
import { toast } from "@/components/ui/sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { Badge } from "@/components/ui/badge"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import type { Goal } from "@/lib/types/goal"

export default function MyGoalsPage() {
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const { data: goals, isLoading, error, refetch } = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
  })

  const handleDelete = async (goal: Goal) => {
    try {
      await deleteGoal(goal.id)
      toast.success("Goal deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete goal")
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-full" />
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-12">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load goals"
        message="We couldn't load your goals. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">My Goals</h1>
            <p className="text-xs text-white/90 mt-0.5">Track and manage your personal and professional goals</p>
          </div>
          <Button onClick={() => setIsCreateGoalOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>
      
      {goals && goals.length === 0 ? (
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-12">
            <EmptyState
              icon={Target}
              title="My Goals"
              description="Your goals and OKRs will be available here."
              action={{
                label: "Create Goal",
                onClick: () => setIsCreateGoalOpen(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-6">
            <div className="space-y-4">
              {goals?.map((goal) => (
                <div key={goal.id} className="border border-border rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base">{goal.title}</h3>
                      <Badge variant={goal.status === 'completed' ? 'default' : goal.status === 'in-progress' ? 'secondary' : 'outline'}>
                        {goal.status}
                      </Badge>
                      <Badge variant="outline">{goal.priority}</Badge>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Progress: {goal.progress}%</span>
                      {goal.targetDate && <span>Target: {goal.targetDate}</span>}
                    </div>
                  </div>
                  <RowActionsMenu
                    entityType="goal"
                    entityId={goal.id}
                    entityName={goal.title}
                    detailUrl={`/my-goals/${goal.id}`}
                    onDelete={() => handleDelete(goal)}
                    canView={true}
                    canEdit={true}
                    canDelete={true}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <CreateGoalDialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen} />
    </div>
  )
}
