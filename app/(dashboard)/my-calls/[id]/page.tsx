"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone, Calendar, Mail, Building, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react"
import { Call, CallOutcome, CallStatus } from "@/lib/types/call"
import { initialCalls } from "@/lib/data/calls"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { ErrorState } from "@/components/ui/error-state"
import { LargeDetailModal } from "@/components/details"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"

const outcomeConfig: Record<CallOutcome, { label: string; variant: "default" | "secondary" | "green-outline" | "yellow-outline" | "red-outline" }> = {
  connected: { label: "Connected", variant: "default" },
  voicemail: { label: "Voicemail", variant: "secondary" },
  "no-answer": { label: "No Answer", variant: "secondary" },
  busy: { label: "Busy", variant: "yellow-outline" },
  "callback-requested": { label: "Callback Requested", variant: "yellow-outline" },
  "not-interested": { label: "Not Interested", variant: "red-outline" },
  interested: { label: "Interested", variant: "green-outline" },
  "meeting-scheduled": { label: "Meeting Scheduled", variant: "green-outline" },
}

const statusConfig: Record<CallStatus, { label: string; variant: "default" | "secondary" | "green-outline" | "red-outline" }> = {
  scheduled: { label: "Scheduled", variant: "default" },
  completed: { label: "Completed", variant: "green-outline" },
  cancelled: { label: "Cancelled", variant: "red-outline" },
  rescheduled: { label: "Rescheduled", variant: "secondary" },
}

async function fetchCall(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const call = initialCalls.calls.find((c) => c.id === id)
  if (!call) throw new Error("Call not found")
  return call
}

async function fetchAllCalls() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return initialCalls.calls
}

export default function CallDetailPage() {
  const params = useParams()
  const router = useRouter()
  const callId = params.id as string
  const [isOpen, setIsOpen] = useState(true)
  const [notes, setNotes] = useState("")

  const { data: call, isLoading, error, refetch } = useQuery({
    queryKey: ["call", callId],
    queryFn: () => fetchCall(callId),
  })

  const { data: allCalls } = useQuery({
    queryKey: ["all-calls"],
    queryFn: fetchAllCalls,
  })

  // Handle 404 for missing calls
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !call) {
      notFound()
    }
  }, [error, isLoading, call])

  const navigation = useDetailNavigation({
    currentId: callId,
    items: allCalls || [],
    getId: (c) => c.id,
    basePath: "/my-calls",
    onNavigate: (id) => {
      router.push(`/my-calls/${id}`)
    },
  })

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      router.push("/my-calls")
    }, 200)
  }

  if (isLoading) {
    return (
      <LargeDetailModal open={isOpen} onOpenChange={handleClose} title="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </LargeDetailModal>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <LargeDetailModal open={isOpen} onOpenChange={handleClose} title="Error">
        <ErrorState
          title="Failed to load call"
          message="We couldn't load this call. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </LargeDetailModal>
    )
  }

  if (!call) {
    return null
  }

  const outcome = call.outcome ? outcomeConfig[call.outcome] : null
  const status = statusConfig[call.status]
  const dateTime = new Date(`${call.date}T${call.time}`)

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
        <Button>Save Changes</Button>
      </div>
    </div>
  )

  return (
    <LargeDetailModal
      open={isOpen}
      onOpenChange={handleClose}
      title={`Call with ${call.contactName}`}
      footer={footer}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
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
                      <Building className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{call.company}</span>
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
                    {dateTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {dateTime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {call.phone && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Phone</span>
                  </div>
                  <div className="pl-6">
                    <a
                      href={`tel:${call.phone}`}
                      className="text-base font-medium text-primary hover:text-primary/80"
                    >
                      {call.phone}
                    </a>
                  </div>
                </div>
              )}

              {call.email && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Email</span>
                  </div>
                  <div className="pl-6">
                    <a
                      href={`mailto:${call.email}`}
                      className="text-base font-medium text-primary hover:text-primary/80"
                    >
                      {call.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Status</span>
                <div className="mt-1">
                  <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                    {status.label}
                  </Badge>
                </div>
              </div>
              {outcome && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Outcome</span>
                  <div className="mt-1">
                    <Badge variant={outcome.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                      {outcome.label}
                    </Badge>
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground font-medium">Assigned To</span>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={getAvatarForUser(call.assignedTo.id || call.assignedTo.name)}
                      alt={call.assignedTo.name}
                    />
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
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              </div>
              {call.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{call.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
              )}
              <div className="mt-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add or update notes..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Action */}
        {call.nextAction && (
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Next Action</h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{call.nextAction}</p>
                  {call.nextActionDate && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(call.nextActionDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LargeDetailModal>
  )
}

