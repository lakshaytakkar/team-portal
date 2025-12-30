"use client"

import { TrainingVideo } from "@/lib/types/my-workspace"
import { Play, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrainingVideoSidebarProps {
  videos: TrainingVideo[]
  selectedVideoId: string | null
  onVideoSelect: (videoId: string) => void
  completedVideoIds?: string[]
}

export function TrainingVideoSidebar({
  videos,
  selectedVideoId,
  onVideoSelect,
  completedVideoIds = [],
}: TrainingVideoSidebarProps) {
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return ""
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} min`
    if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {videos.map((video, index) => {
            const isSelected = video.id === selectedVideoId
            const isCompleted = completedVideoIds.includes(video.id)

            return (
              <button
                key={video.id}
                onClick={() => onVideoSelect(video.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  "hover:bg-muted/50",
                  isSelected && "bg-primary/10 text-primary"
                )}
              >
                <div className={cn("flex-shrink-0", isSelected && "text-primary")}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Play className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium truncate",
                      isSelected && "text-primary",
                      isCompleted && !isSelected && "text-muted-foreground"
                    )}
                  >
                    {index + 1}. {video.title}
                  </div>
                  {video.duration && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}


