"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone, CalendarPlus, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScheduleCallDialog } from "@/components/calls/ScheduleCallDialog"
import { EditCallDialog } from "@/components/calls/EditCallDialog"
import { LogOutcomeDialog } from "@/components/calls/LogOutcomeDialog"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { FileText } from "lucide-react"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { getCalls, deleteCall } from "@/lib/actions/calls"
import { toast } from "@/components/ui/sonner"
import { useQueryClient } from "@tanstack/react-query"
import type { Call } from "@/lib/types/call"

type CallFilter = "all" | "scheduled" | "today" | "this-week" | "completed"

async function fetchCalls() {
  return await getCalls()
}

function StatCard({
  title,
  value,
  icon: Icon,
  onClick,
  isActive,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl p-[18px] bg-white transition-all",
        isActive
          ? "border-primary shadow-md bg-primary/5 cursor-pointer"
          : "border-border hover:border-primary/50 hover:shadow-sm cursor-pointer"
      )}
      onClick={onClick}
    >
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div
          className={cn(
            "rounded-lg w-9 h-9 flex items-center justify-center transition-colors",
            isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export default function MyCallsPage() {
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<CallFilter>("all")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isLogOutcomeOpen, setIsLogOutcomeOpen] = useState(false)
  const [editingCallId, setEditingCallId] = useState<string | null>(null)
  const [loggingOutcomeCallId, setLoggingOutcomeCallId] = useState<string | null>(null)
  const { data: calls, isLoading, error, refetch } = useQuery({
    queryKey: ["calls"],
    queryFn: fetchCalls,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  const handleEditCall = (callId: string) => {
    setEditingCallId(callId)
    setIsEditDrawerOpen(true)
  }

  const handleLogOutcome = (callId: string) => {
    setLoggingOutcomeCallId(callId)
    setIsLogOutcomeOpen(true)
  }

  const handleDeleteCall = async (call: Call) => {
    try {
      await deleteCall(call.id)
      toast.success("Call deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["calls"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete call")
      throw error
    }
  }

  const handleDeleteCallLegacy = async (callId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Delete call:", callId)
        refetch()
        resolve()
      }, 500)
    })
  }

  // Calculate counts for each filter
  const totalCount = useMemo(() => calls?.length || 0, [calls])
  const todayCount = useMemo(() => {
    if (!calls) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return calls.filter((call: Call) => {
      const callDate = new Date(call.date)
      callDate.setHours(0, 0, 0, 0)
      return callDate.getTime() === today.getTime()
    }).length
  }, [calls])
  const thisWeekCount = useMemo(() => {
    if (!calls) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
    return calls.filter((call: Call) => {
      const callDate = new Date(call.date)
      callDate.setHours(0, 0, 0, 0)
      return callDate >= today && callDate <= endOfWeek
    }).length
  }, [calls])
  const completedCount = useMemo(() => {
    if (!calls) return 0
    return calls.filter((call: Call) => call.status === "completed").length
  }, [calls])
  const scheduledCount = useMemo(() => {
    if (!calls) return 0
    return calls.filter((call: Call) => {
      const callDate = new Date(call.date)
      return callDate > new Date() && call.status !== "completed"
    }).length
  }, [calls])

  // Filter calls based on active filter
  const filteredCalls = useMemo(() => {
    if (!calls) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

    switch (activeFilter) {
      case "today":
        return calls.filter((call: Call) => {
          const callDate = new Date(call.date)
          callDate.setHours(0, 0, 0, 0)
          return callDate.getTime() === today.getTime()
        })
      case "this-week":
        return calls.filter((call: Call) => {
          const callDate = new Date(call.date)
          callDate.setHours(0, 0, 0, 0)
          return callDate >= today && callDate <= endOfWeek
        })
      case "completed":
        return calls.filter((call: Call) => call.status === "completed")
      case "scheduled":
        return calls.filter((call: Call) => {
          const callDate = new Date(call.date)
          return callDate > new Date() && call.status !== "completed"
        })
      case "all":
      default:
        return calls
    }
  }, [calls, activeFilter])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex items-center justify-between mt-0.5">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="border border-border rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-5 gap-4 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load calls"
        message="We couldn't load your calls. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Calls</h1>
            <p className="text-xs text-white/90 mt-0.5">View call history and schedule upcoming calls</p>
          </div>
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            variant="secondary"
            size="sm"
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule Call
          </Button>
        </div>
      </div>

      {/* Stats Cards as Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Calls"
          value={totalCount}
          icon={Phone}
          onClick={() => setActiveFilter("all")}
          isActive={activeFilter === "all"}
        />
        <StatCard
          title="Upcoming"
          value={scheduledCount}
          icon={Clock}
          onClick={() => setActiveFilter(activeFilter === "scheduled" ? "all" : "scheduled")}
          isActive={activeFilter === "scheduled"}
        />
        <StatCard
          title="Today"
          value={todayCount}
          icon={Phone}
          onClick={() => setActiveFilter(activeFilter === "today" ? "all" : "today")}
          isActive={activeFilter === "today"}
        />
        <StatCard
          title="This Week"
          value={thisWeekCount}
          icon={Clock}
          onClick={() => setActiveFilter(activeFilter === "this-week" ? "all" : "this-week")}
          isActive={activeFilter === "this-week"}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          onClick={() => setActiveFilter(activeFilter === "completed" ? "all" : "completed")}
          isActive={activeFilter === "completed"}
        />
      </div>

      {/* Calls Table */}
      <Card className="border border-border rounded-2xl">
        <CardHeader>
          <CardTitle>
            {activeFilter === "all" && "All Calls"}
            {activeFilter === "scheduled" && "Upcoming Calls"}
            {activeFilter === "today" && "Calls Today"}
            {activeFilter === "this-week" && "This Week's Calls"}
            {activeFilter === "completed" && "Call History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                {activeFilter === "completed" ? (
                  <>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Duration</TableHead>
                  </>
                ) : activeFilter === "scheduled" ? (
                  <>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Status</TableHead>
                  </>
                )}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.length > 0 ? (
                filteredCalls.map((call: any) => (
                  <TableRow key={call.id}>
                    <TableCell>{call.date || call.scheduledDate || "-"}</TableCell>
                    <TableCell>{call.contactName || "-"}</TableCell>
                    <TableCell>{call.company || "-"}</TableCell>
                    {activeFilter === "completed" ? (
                      <>
                        <TableCell>{call.outcome || "-"}</TableCell>
                        <TableCell>{call.duration || "-"}</TableCell>
                      </>
                    ) : activeFilter === "scheduled" ? (
                      <>
                        <TableCell>{call.phone || "-"}</TableCell>
                        <TableCell>{call.status || "Scheduled"}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{call.outcome || "-"}</TableCell>
                        <TableCell>{call.status || "-"}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <RowActionsMenu
                        entityType="call"
                        entityId={call.id}
                        entityName={call.contactName || "Call"}
                        canView={true}
                        canEdit={true}
                        canDelete={false}
                        onEdit={() => handleEditCall(call.id)}
                        onDelete={() => handleDeleteCall(call)}
                        customActions={[
                          {
                            label: "Log Outcome",
                            onClick: () => handleLogOutcome(call.id),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24">
                    <EmptyState
                      icon={Phone}
                      title={
                        activeFilter === "all"
                          ? "No calls yet"
                          : activeFilter === "scheduled"
                          ? "No scheduled calls"
                          : activeFilter === "today"
                          ? "No calls scheduled for today"
                          : activeFilter === "this-week"
                          ? "No calls scheduled for this week"
                          : "No completed calls"
                      }
                      description={
                        activeFilter === "all"
                          ? "All your calls (scheduled and completed) will appear here."
                          : activeFilter === "scheduled"
                          ? "Schedule calls to manage your upcoming outreach activities."
                          : activeFilter === "today"
                          ? "Calls happening today will appear here."
                          : activeFilter === "this-week"
                          ? "Calls scheduled this week will appear here."
                          : "View your call history here. Completed calls from external sources will appear automatically."
                      }
                      action={
                        activeFilter !== "completed"
                          ? {
                              label: "Schedule Your First Call",
                              onClick: () => setIsDrawerOpen(true),
                            }
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Schedule Call Drawer */}
      <ScheduleCallDialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      
      {/* Edit Call Dialog */}
      <EditCallDialog
        open={isEditDrawerOpen}
        onOpenChange={(open) => {
          setIsEditDrawerOpen(open)
          if (!open) {
            setEditingCallId(null)
          }
        }}
        call={editingCallId ? { id: editingCallId, contactName: "", phone: "", date: "", time: "" } : null}
      />
      
      {/* Log Outcome Dialog */}
      <LogOutcomeDialog
        open={isLogOutcomeOpen}
        onOpenChange={(open) => {
          setIsLogOutcomeOpen(open)
          if (!open) {
            setLoggingOutcomeCallId(null)
          }
        }}
        callId={loggingOutcomeCallId || undefined}
      />
    </div>
  )
}

