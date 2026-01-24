"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from "date-fns"
import {
  getReminders,
  markReminderComplete,
  acknowledgeReminder,
} from "@/lib/actions/reminders"
import type { Reminder, ReminderPriority } from "@/lib/types/reminder"
import { toast } from "@/components/ui/sonner"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { useRouter } from "next/navigation"

async function fetchMyReminders() {
  return await getReminders()
}

function getPriorityColor(priority: ReminderPriority) {
  switch (priority) {
    case "urgent":
      return "text-red-600"
    case "high":
      return "text-orange-600"
    case "medium":
      return "text-blue-600"
    case "low":
      return "text-gray-600"
  }
}

function getPriorityIcon(priority: ReminderPriority) {
  switch (priority) {
    case "urgent":
      return AlertCircle
    case "high":
      return AlertCircle
    case "medium":
      return Clock
    case "low":
      return Bell
  }
}

function ReminderItem({
  reminder,
  onComplete,
  onAcknowledge,
}: {
  reminder: Reminder
  onComplete: (id: string) => void
  onAcknowledge: (id: string) => void
}) {
  const router = useRouter()
  const reminderDate = new Date(reminder.reminderDate)
  const isOverdue = isPast(reminderDate) && reminder.status === "scheduled"
  const isUpcoming = !isPast(reminderDate) && reminder.status === "scheduled"
  const Icon = getPriorityIcon(reminder.priority)

  const handleActionClick = () => {
    if (reminder.actionUrl) {
      router.push(reminder.actionUrl)
    }
  }

  return (
    <div
      className={cn(
        "w-full flex items-start gap-4 px-6 py-4 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0",
        reminder.status === "scheduled" && "bg-primary/5 border-l-4 border-l-primary",
        isOverdue && "bg-red-50 border-l-4 border-l-red-500"
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", getPriorityColor(reminder.priority))}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1">
            <p className="text-sm font-semibold tracking-[0.28px]">{reminder.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("text-xs", getPriorityColor(reminder.priority))}>
                {reminder.priority}
              </Badge>
              {reminder.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
              {isToday(reminderDate) && (
                <Badge variant="default" className="text-xs">
                  Today
                </Badge>
              )}
              {isTomorrow(reminderDate) && (
                <Badge variant="default" className="text-xs">
                  Tomorrow
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm leading-5 tracking-[0.28px] mb-2 text-muted-foreground">
          {reminder.message}
        </p>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(reminderDate, "MMM d, yyyy 'at' h:mm a")}
          </div>
          {reminder.triggeredAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Triggered {formatDistanceToNow(new Date(reminder.triggeredAt), { addSuffix: true })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {reminder.status === "scheduled" || reminder.status === "triggered" ? (
            <>
              {reminder.actionRequired && !reminder.acknowledgedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge(reminder.id)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Acknowledge
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onComplete(reminder.id)}
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                Mark Complete
              </Button>
              {reminder.actionUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleActionClick}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Action
                </Button>
              )}
            </>
          ) : reminder.status === "completed" ? (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed {reminder.completedAt && formatDistanceToNow(new Date(reminder.completedAt), { addSuffix: true })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function MyRemindersPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "overdue" | "completed">("all")

  const { data: reminders = [], isLoading, error, refetch } = useQuery({
    queryKey: ["reminders", "my"],
    queryFn: fetchMyReminders,
  })

  const completeMutation = useMutation({
    mutationFn: markReminderComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      toast.success("Reminder marked as complete")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark reminder as complete")
    },
  })

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      toast.success("Reminder acknowledged")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to acknowledge reminder")
    },
  })

  const handleComplete = (id: string) => {
    completeMutation.mutate(id)
  }

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id)
  }

  // Filter reminders based on tab
  const filteredReminders = useMemo(() => {
    if (!reminders) return []

    switch (activeTab) {
      case "upcoming": {
        return reminders.filter(
          (r) =>
            (r.status === "scheduled" || r.status === "triggered") &&
            !isPast(new Date(r.reminderDate))
        )
      }
      case "overdue": {
        return reminders.filter(
          (r) => r.status === "scheduled" && isPast(new Date(r.reminderDate))
        )
      }
      case "completed": {
        return reminders.filter((r) => r.status === "completed")
      }
      case "all":
      default: {
        return reminders.filter(
          (r) => r.status === "scheduled" || r.status === "triggered" || r.status === "completed"
        )
      }
    }
  }, [reminders, activeTab])

  // Calculate counts
  const upcomingCount = useMemo(
    () =>
      reminders.filter(
        (r) =>
          (r.status === "scheduled" || r.status === "triggered") &&
          !isPast(new Date(r.reminderDate))
      ).length,
    [reminders]
  )

  const overdueCount = useMemo(
    () =>
      reminders.filter((r) => r.status === "scheduled" && isPast(new Date(r.reminderDate))).length,
    [reminders]
  )

  const completedCount = useMemo(
    () => reminders.filter((r) => r.status === "completed").length,
    [reminders]
  )

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Reminders</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your reminders</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load reminders"
          message={error instanceof Error ? error.message : "An error occurred"}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Reminders</h1>
            <p className="text-xs text-white/90 mt-0.5">Stay on top of your scheduled reminders and tasks</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="all"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            All ({reminders.length})
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Upcoming ({upcomingCount})
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Overdue ({overdueCount})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Completed ({completedCount})
          </TabsTrigger>
        </TabsList>

        {/* Reminders List */}
        <Card className="border border-border rounded-[14px] mt-4">
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="px-6 py-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-4">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Bell}
                  title={`No ${activeTab === "all" ? "" : activeTab} reminders`}
                  description={
                    activeTab === "overdue"
                      ? "Great! You have no overdue reminders."
                      : activeTab === "completed"
                      ? "No completed reminders yet."
                      : activeTab === "upcoming"
                      ? "No upcoming reminders scheduled."
                      : "You don't have any reminders yet."
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredReminders.map((reminder) => (
                  <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onComplete={handleComplete}
                    onAcknowledge={handleAcknowledge}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}

