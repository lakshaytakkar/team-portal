"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "./ProgressBar"
import { Play, Pause, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  description?: string
  currentProgress?: number
  onProgressUpdate?: (progress: number) => void
  isCompleted?: boolean
}

export function VideoPlayer({
  videoUrl,
  title,
  description,
  currentProgress = 0,
  onProgressUpdate,
  isCompleted = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(currentProgress)
  const [duration, setDuration] = useState(0)
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      // Resume from last progress if available
      if (currentProgress > 0 && currentProgress < 100) {
        video.currentTime = (currentProgress / 100) * video.duration
      }
    }

    const handleTimeUpdate = () => {
      if (video.duration) {
        const newProgress = (video.currentTime / video.duration) * 100
        setProgress(newProgress)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100)
      if (onProgressUpdate) {
        onProgressUpdate(100)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [currentProgress, onProgressUpdate])

  // Auto-save progress periodically
  useEffect(() => {
    if (onProgressUpdate && isPlaying) {
      progressUpdateInterval.current = setInterval(() => {
        if (videoRef.current && videoRef.current.duration) {
          const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
          onProgressUpdate(currentProgress)
        }
      }, 5000) // Save every 5 seconds
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current)
      }
    }
  }, [isPlaying, onProgressUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    video.currentTime = newTime
    const newProgress = percentage * 100
    setProgress(newProgress)
    if (onProgressUpdate) {
      onProgressUpdate(newProgress)
    }
  }

  return (
    <Card className="border border-border rounded-[14px] overflow-hidden">
      <CardContent className="p-0">
        {/* Video Container */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
          />
          
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Button
              variant="secondary"
              size="icon"
              className="h-16 w-16 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Completed Badge */}
          {isCompleted && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t border-border">
          <div
            className="relative w-full h-2 bg-border rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className={cn(
                "absolute left-0 top-0 h-full rounded-full transition-all",
                isCompleted ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            {duration > 0 && (
              <span>
                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
              </span>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="p-6 border-t border-border">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

