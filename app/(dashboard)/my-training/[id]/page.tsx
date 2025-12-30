"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, X } from "lucide-react"
import { Training, TrainingVideo } from "@/lib/types/my-workspace"
import { initialTrainings } from "@/lib/data/my-workspace"
import { ErrorState } from "@/components/ui/error-state"
import { TrainingVideoPlayer } from "@/components/training/TrainingVideoPlayer"
import { TrainingVideoSidebar } from "@/components/training/TrainingVideoSidebar"

async function fetchTraining(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const training = initialTrainings.find((t) => t.id === id)
  if (!training) throw new Error("Training not found")

  // Generate videos from the training (for demo - in real app this would come from API)
  // If training already has videos, use them. Otherwise, create a single video from the url field
  if (!training.videos) {
    training.videos = training.url
      ? [
          {
            id: `${training.id}-video-1`,
            title: training.title,
            url: training.url,
            duration: training.duration,
          },
        ]
      : []
  }

  return training
}

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const trainingId = params.id as string
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  const { data: training, isLoading, error, refetch } = useQuery({
    queryKey: ["training", trainingId],
    queryFn: () => fetchTraining(trainingId),
  })

  // Set initial selected video when training loads
  useEffect(() => {
    if (training && training.videos && training.videos.length > 0 && !selectedVideoId) {
      setSelectedVideoId(training.videos[0].id)
    }
  }, [training, selectedVideoId])

  // Handle 404 for missing trainings
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !training) {
      notFound()
    }
  }, [error, isLoading, training])

  const handleClose = useCallback(() => {
    router.push("/my-training")
  }, [router])

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideoId(videoId)
  }, [])

  const handleVideoEnd = useCallback(() => {
    if (!training?.videos) return

    const currentIndex = training.videos.findIndex((v) => v.id === selectedVideoId)
    if (currentIndex < training.videos.length - 1) {
      // Auto-play next video
      setSelectedVideoId(training.videos[currentIndex + 1].id)
    }
  }, [training, selectedVideoId])

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

  // Get selected video
  const selectedVideo = training.videos?.find((v) => v.id === selectedVideoId) || null
  const completedVideoIds: string[] = [] // TODO: Get from user progress data

  if (!training.videos || training.videos.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">{training.title}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No videos available</p>
            <p className="text-sm text-muted-foreground">This training does not have video content.</p>
          </div>
        </div>
      </div>
    )
  }

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
            <p className="text-sm text-muted-foreground">
              Video {training.videos.findIndex((v) => v.id === selectedVideoId) + 1} of {training.videos.length}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClose}>
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      {/* Main Content: Sidebar + Video Player */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Video Navigation */}
        <div className="w-full lg:w-[400px] border-r bg-background overflow-hidden flex-shrink-0">
          <TrainingVideoSidebar
            videos={training.videos}
            selectedVideoId={selectedVideoId}
            onVideoSelect={handleVideoSelect}
            completedVideoIds={completedVideoIds}
          />
        </div>

        {/* Right Main Content - Video Player */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {selectedVideo ? (
            <div className="p-6">
              <TrainingVideoPlayer video={selectedVideo} onVideoEnd={handleVideoEnd} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-muted-foreground">Select a video to view content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
