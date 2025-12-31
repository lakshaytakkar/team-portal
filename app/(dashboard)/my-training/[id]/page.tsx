"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, X } from "lucide-react"
import type { Training } from "@/lib/types/trainings"
import { getTrainingById, updateTrainingProgress } from "@/lib/actions/trainings"
import { ErrorState } from "@/components/ui/error-state"
import { VideoPlayer } from "@/components/training/VideoPlayer"
import { useUser } from "@/lib/hooks/useUser"
import { toast } from "@/components/ui/sonner"

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const trainingId = params.id as string

  const { data: training, isLoading, error, refetch } = useQuery({
    queryKey: ["training", trainingId, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated")
      return await getTrainingById(trainingId, user.id)
    },
    enabled: !userLoading && !!user?.id,
  })

  const progressMutation = useMutation({
    mutationFn: async ({ progress, status }: { progress?: number; status?: 'not-started' | 'in-progress' | 'completed' }) => {
      if (!user?.id) throw new Error("User not authenticated")
      return await updateTrainingProgress(user.id, {
        trainingId,
        progressPercentage: progress,
        status,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", trainingId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
    },
  })

  const handleClose = useCallback(() => {
    router.push("/my-training")
  }, [router])

  const handleProgressUpdate = useCallback((progress: number) => {
    if (!user?.id) return
    
    const currentStatus = training?.progress?.status || 'not-started'
    let newStatus: 'not-started' | 'in-progress' | 'completed' = currentStatus
    
    if (progress > 0 && progress < 100) {
      newStatus = 'in-progress'
    } else if (progress >= 100) {
      newStatus = 'completed'
    }
    
    progressMutation.mutate({ progress, status: newStatus })
  }, [user?.id, training?.progress?.status, progressMutation])

  const handleMarkComplete = useCallback(() => {
    if (!user?.id) return
    progressMutation.mutate({ progress: 100, status: 'completed' }, {
      onSuccess: () => {
        toast.success("Training marked as completed")
      }
    })
  }, [user?.id, progressMutation])

  // Handle 404 for missing trainings
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !training) {
      notFound()
    }
  }, [error, isLoading, training])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            <Skeleton className="w-[400px] border-r" />
            <Skeleton className="flex-1" />
          </div>
        </div>
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <h1 className="text-lg font-semibold">Error</h1>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <ErrorState
            title="Failed to load training"
            message="We couldn't load this training. Please check your connection and try again."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (!training) {
    return null
  }

  const currentProgress = training.progress?.progressPercentage || 0
  const isCompleted = training.progress?.status === 'completed'

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold line-clamp-1">{training.title}</h1>
            {training.progress && (
              <p className="text-sm text-muted-foreground">
                Progress: {training.progress.progressPercentage}% • {training.progress.status === 'completed' ? 'Completed' : training.progress.status === 'in-progress' ? 'In Progress' : 'Not Started'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCompleted && (
            <Button variant="default" size="sm" onClick={handleMarkComplete}>
              Mark as Complete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Main Content - Video Player */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-6xl mx-auto p-6">
          <VideoPlayer
            videoUrl={training.videoUrl}
            title={training.title}
            description={training.description}
            currentProgress={currentProgress}
            onProgressUpdate={handleProgressUpdate}
            isCompleted={isCompleted}
          />
        </div>
      </div>
    </div>
  )
}
