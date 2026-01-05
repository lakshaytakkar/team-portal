"use client"

import { useState } from "react"
import * as React from "react"
import { DetailDialog, DetailTab } from "@/components/details/DetailDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Phone,
  Calendar,
  Clock,
  User,
  Building2,
  Mail,
  FileText,
  Sparkles,
  Play,
  Pause,
  Download,
} from "lucide-react"
import type { Call } from "@/lib/types/call"
import { format } from "date-fns"
import { CALL_STATUS_CONFIG, CALL_OUTCOME_CONFIG } from "./callConfig"

interface CallDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  call: Call | null
  isLoading?: boolean
}

export function CallDetailModal({
  open,
  onOpenChange,
  call,
  isLoading = false,
}: CallDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const handlePlayPause = () => {
    if (!call?.recordingUrl) return

    if (!audioElement) {
      const audio = new Audio(call.recordingUrl)
      audio.addEventListener("ended", () => setIsPlaying(false))
      audio.addEventListener("pause", () => setIsPlaying(false))
      audio.addEventListener("play", () => setIsPlaying(true))
      setAudioElement(audio)
      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
        })
      }
    }
  }

  // Cleanup audio on unmount or when call changes
  React.useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [audioElement])

  React.useEffect(() => {
    if (audioElement && call?.recordingUrl !== audioElement.src) {
      audioElement.pause()
      setAudioElement(null)
      setIsPlaying(false)
    }
  }, [call?.recordingUrl, audioElement])

  const handleDownload = () => {
    if (!call?.recordingUrl) return
    const link = document.createElement("a")
    link.href = call.recordingUrl
    link.download = `call-${call.id}.mp3`
    link.click()
  }

  if (isLoading || !call) {
    return (
      <DetailDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Loading call details..."
      >
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DetailDialog>
    )
  }

  const statusConfig = CALL_STATUS_CONFIG[call.status]
  const outcomeConfig = call.outcome ? CALL_OUTCOME_CONFIG[call.outcome] : null

  const tabs: DetailTab[] = [
    {
      id: "details",
      label: "Details",
      content: (
        <div className="space-y-6">
          {/* Call Info Card */}
          <Card className="border border-border rounded-xl">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Contact</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-base font-medium text-foreground">{call.contactName}</p>
                    {call.company && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{call.company}</span>
                      </div>
                    )}
                    {call.phone && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{call.phone}</span>
                      </div>
                    )}
                    {call.email && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{call.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Date & Time</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-base font-medium text-foreground">
                      {format(new Date(call.date), "MMMM dd, yyyy")}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{call.time}</span>
                    </div>
                    {call.duration && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <span className="text-sm font-semibold text-foreground">Status</span>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={`${statusConfig.color} ${statusConfig.bgColor} border-0`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
                {outcomeConfig && (
                  <div>
                    <span className="text-sm font-semibold text-foreground">Outcome</span>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={`${outcomeConfig.color} ${outcomeConfig.bgColor} border-0`}
                      >
                        {outcomeConfig.label}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {call.assignedTo && (
                <div className="pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Assigned To</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={call.assignedTo.avatar} />
                      <AvatarFallback className="text-xs">
                        {call.assignedTo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{call.assignedTo.name}</span>
                  </div>
                </div>
              )}

              {call.notes && (
                <div className="pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Notes</span>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {call.notes}
                  </p>
                </div>
              )}

              {call.nextAction && (
                <div className="pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Next Action</span>
                  <p className="text-sm text-foreground mt-2">{call.nextAction}</p>
                  {call.nextActionDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {format(new Date(call.nextActionDate), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "recording",
      label: "Recording",
      disabled: !call.recordingUrl,
      content: call.recordingUrl ? (
        <div className="space-y-6">
          <Card className="border border-border rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Call Recording</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {call.duration
                      ? `Duration: ${Math.floor(call.duration / 60)}m ${call.duration % 60}s`
                      : "Audio recording"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="rounded-full h-16 w-16 gap-0"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Phone className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">No Recording Available</p>
          <p className="text-xs text-muted-foreground">
            This call does not have a recording.
          </p>
        </div>
      ),
    },
    {
      id: "transcription",
      label: "Transcription",
      disabled: !call.transcription,
      content: call.transcription ? (
        <div className="space-y-6">
          <Card className="border border-border rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">Call Transcription</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-muted/30 p-4 rounded-lg border border-border">
                  {call.transcription}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">No Transcription Available</p>
          <p className="text-xs text-muted-foreground">
            This call does not have a transcription.
          </p>
        </div>
      ),
    },
    {
      id: "ai-summary",
      label: "AI Summary",
      disabled: !call.aiSummary,
      content: call.aiSummary ? (
        <div className="space-y-6">
          <Card className="border border-border rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">AI-Generated Summary</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border">
                  {call.aiSummary}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">No AI Summary Available</p>
          <p className="text-xs text-muted-foreground">
            This call does not have an AI-generated summary.
          </p>
        </div>
      ),
    },
  ]

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Call with ${call.contactName}`}
      tabs={tabs}
      className="sm:max-w-[800px]"
    />
  )
}

