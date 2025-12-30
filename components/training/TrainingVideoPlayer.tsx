"use client"

import { useState, useRef, useEffect } from "react"
import { TrainingVideo } from "@/lib/types/my-workspace"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface TrainingVideoPlayerProps {
  video: TrainingVideo
  onVideoEnd?: () => void
}

export function TrainingVideoPlayer({ video, onVideoEnd }: TrainingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Update current time and handle errors
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const updateTime = () => setCurrentTime(videoElement.currentTime)
    const updateDuration = () => setDuration(videoElement.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onVideoEnd) {
        onVideoEnd()
      }
    }
    const handleError = (e: Event) => {
      setHasError(true)
      const error = videoElement.error
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            setErrorMessage("Video playback was aborted")
            break
          case error.MEDIA_ERR_NETWORK:
            setErrorMessage("Network error while loading video")
            break
          case error.MEDIA_ERR_DECODE:
            setErrorMessage("Video format not supported or corrupted")
            break
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setErrorMessage("Video source not supported or invalid URL")
            break
          default:
            setErrorMessage("Unable to load video. Please check the video URL.")
        }
      } else {
        setErrorMessage("Unable to load video. Please check the video URL.")
      }
    }

    // Reset error state when video changes
    setHasError(false)
    setErrorMessage(null)

    videoElement.addEventListener("timeupdate", updateTime)
    videoElement.addEventListener("loadedmetadata", updateDuration)
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("ended", handleEnded)
    videoElement.addEventListener("error", handleError)

    return () => {
      videoElement.removeEventListener("timeupdate", updateTime)
      videoElement.removeEventListener("loadedmetadata", updateDuration)
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("ended", handleEnded)
      videoElement.removeEventListener("error", handleError)
    }
  }, [video, onVideoEnd])

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isPlaying) {
      videoElement.pause()
    } else {
      videoElement.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    videoElement.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const skipBackward = () => {
    const videoElement = videoRef.current
    if (!videoElement) return
    videoElement.currentTime = Math.max(0, videoElement.currentTime - 10)
  }

  const skipForward = () => {
    const videoElement = videoRef.current
    if (!videoElement) return
    videoElement.currentTime = Math.min(duration, videoElement.currentTime + 10)
  }

  const toggleMute = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isMuted) {
      videoElement.muted = false
      setIsMuted(false)
    } else {
      videoElement.muted = true
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const newVolume = value[0]
    videoElement.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Check if URL is a YouTube URL and convert to embed format
  const getYouTubeEmbedUrl = (url: string): string | null => {
    // Match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }

    return null
  }

  const isYouTubeUrl = (url: string): boolean => {
    return /youtube\.com|youtu\.be/.test(url)
  }

  const youtubeEmbedUrl = video.url ? getYouTubeEmbedUrl(video.url) : null
  const isYouTube = video.url ? isYouTubeUrl(video.url) : false

  if (!video.url) {
    return (
      <div className="w-full aspect-video bg-black rounded-[14px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-2">No video available</p>
          <p className="text-white/70 text-sm">This video does not have content</p>
        </div>
      </div>
    )
  }

  // Show error state if video failed to load (only for non-YouTube videos)
  if (hasError && !isYouTube) {
    return (
      <div className="w-full aspect-video bg-black rounded-[14px] flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white mb-2 font-medium">Unable to load video</p>
          <p className="text-white/70 text-sm mb-4">{errorMessage || "The video source is invalid or not supported"}</p>
          <p className="text-white/50 text-xs">URL: {video.url}</p>
        </div>
      </div>
    )
  }

  // Render YouTube embed if it's a YouTube URL
  if (isYouTube && youtubeEmbedUrl) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-[14px] overflow-hidden"
      >
        <iframe
          src={`${youtubeEmbedUrl}?autoplay=0&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title || "YouTube video player"}
        />
      </div>
    )
  }

  // Render regular video player for non-YouTube videos
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-[14px] overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => setShowControls(true)}
    >
      <video 
        ref={videoRef} 
        src={video.url} 
        className="w-full h-full object-contain" 
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end">
          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="w-full" />
          </div>

          {/* Controls */}
          <div className="px-4 pb-4 space-y-2">
            {/* Timer */}
            <div className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={skipBackward} className="text-white hover:bg-white/20 h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 h-8 w-8">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={skipForward} className="text-white hover:bg-white/20 h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 h-8 w-8">
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
                </div>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 h-8 w-8">
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


