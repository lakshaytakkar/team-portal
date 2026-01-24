"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, CheckSquare, Clock, AlertCircle, CheckCheck, RefreshCw, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { getNotifications, markNotificationRead, markNotificationUnread, markAllNotificationsRead, getUnreadNotificationsCount } from "@/lib/actions/notifications"
import type { Notification } from "@/lib/types/notification"
import { toast } from "@/components/ui/sonner"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"

type NotificationFilter = "all" | "unread" | "read"

function NotificationItem({ notification, onMarkRead, onMarkUnread }: { notification: Notification; onMarkRead: (id: string) => void; onMarkUnread: (id: string) => void }) {
  const router = useRouter()

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "task_assigned":
      case "task_status_changed":
      case "task_priority_changed":
        return CheckSquare
      case "task_due_soon":
      case "task_overdue":
        return Clock
      case "task_blocked":
        return AlertCircle
      case "task_completed":
        return CheckSquare
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "task_overdue":
      case "task_blocked":
        return "text-destructive"
      case "task_due_soon":
        return "text-yellow-600"
      case "task_completed":
        return "text-green-600"
      default:
        return "text-primary"
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the mark as unread button
    if ((e.target as HTMLElement).closest('[data-mark-unread]')) {
      return
    }

    if (!notification.read) {
      onMarkRead(notification.id)
    }

    // Navigate based on notification type and data
    if (notification.data?.task_id) {
      router.push(`/tasks/${notification.data.task_id}`)
    } else if (notification.type === "task_assigned" || notification.type === "task_due_soon" || notification.type === "task_overdue") {
      router.push("/my-tasks")
    } else {
      router.push("/my-tasks")
    }
  }

  const handleMarkUnread = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkUnread(notification.id)
  }

  const Icon = getNotificationIcon(notification.type)

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-4 px-6 py-4 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-b-0 cursor-pointer relative group",
        !notification.read && "bg-primary/5 border-l-4 border-l-primary"
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", getNotificationColor(notification.type))}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={cn("text-sm font-semibold tracking-[0.28px]", notification.read ? "text-foreground/75" : "text-foreground")}>
            {notification.title}
          </p>
          <div className="flex items-center gap-2">
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
            {notification.read && (
              <Button
                data-mark-unread
                variant="ghost"
                size="sm"
                onClick={handleMarkUnread}
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Mark unread
              </Button>
            )}
          </div>
        </div>
        <p className={cn("text-sm leading-5 tracking-[0.28px] mb-2", notification.read ? "text-muted-foreground/75" : "text-muted-foreground")}>
          {notification.message}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground/70">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
          {notification.type && (
            <Badge variant="secondary" className="text-xs">
              {notification.type.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<NotificationFilter>("all")

  // Fetch unread count
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationsCount,
    refetchInterval: 120000, // Poll every 2 minutes
  })

  // Fetch all notifications
  const { data: notifications = [], isLoading, error, refetch: refetchNotifications, isFetching } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => getNotifications({ limit: 100 }),
    refetchInterval: false,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
    },
  })

  const markUnreadMutation = useMutation({
    mutationFn: markNotificationUnread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notification marked as unread")
    },
  })

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id)
  }

  const handleMarkUnread = (id: string) => {
    markUnreadMutation.mutate(id)
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  const handleRefresh = () => {
    refetchNotifications()
    refetchUnreadCount()
  }

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (!notifications) return []

    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.read)
      case "read":
        return notifications.filter((n) => n.read)
      case "all":
      default:
        return notifications
    }
  }, [notifications, activeTab])

  const readCount = useMemo(() => notifications.filter((n) => n.read).length, [notifications])
  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.read), [notifications])

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your notifications</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load notifications"
          message={error instanceof Error ? error.message : "An error occurred"}
          onRetry={() => refetchNotifications()}
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Notifications</h1>
            <p className="text-xs text-white/90 mt-0.5">Stay updated with your latest activities and task assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationFilter)}>
        <TabsList className="bg-muted p-0.5 rounded-xl h-auto border-0">
          <TabsTrigger
            value="all"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger
            value="read"
            className="h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium transition-colors"
          >
            Read ({readCount})
          </TabsTrigger>
        </TabsList>

        {/* Notifications List */}
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
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Bell}
                  title={`No ${activeTab === "all" ? "" : activeTab} notifications`}
                  description={
                    activeTab === "unread"
                      ? "You're all caught up! No unread notifications."
                      : activeTab === "read"
                      ? "No read notifications yet."
                      : "You don't have any notifications yet."
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onMarkUnread={handleMarkUnread}
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

