"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckSquare, Clock, AlertCircle, CheckCheck, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationsCount } from "@/lib/actions/notifications"
import type { Notification } from "@/lib/types/notification"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/components/ui/sonner"

export function TopbarNotifications() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)

  // Fetch unread count - minimal polling, rely on manual refresh
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationsCount,
    refetchInterval: 120000, // Poll every 2 minutes (reduced from 60s)
    staleTime: 60000, // Consider data fresh for 60 seconds
  })

  // Fetch notifications when popover is open - minimal polling, rely on manual refresh
  const { data: notifications = [], refetch: refetchNotifications, isFetching } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => getNotifications({ limit: 20 }),
    enabled: open, // Only fetch when popover is open
    refetchInterval: false, // Disable automatic polling - use manual refresh instead
    staleTime: 60000, // Consider data fresh for 60 seconds
  })

  // Refetch notifications when popover opens
  React.useEffect(() => {
    if (open) {
      // Immediately refetch when popover opens to get latest notifications
      refetchNotifications()
      refetchUnreadCount()
    }
  }, [open, refetchNotifications, refetchUnreadCount])

  // Manual refresh handler
  const handleRefresh = () => {
    refetchNotifications()
    refetchUnreadCount()
  }

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
      toast.success("All notifications marked as read")
    },
  })

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markReadMutation.mutate(notification.id)
    }

    // Navigate based on notification type and data
    if (notification.data?.task_id) {
      router.push(`/tasks/${notification.data.task_id}`)
      setOpen(false)
    } else if (notification.type === "task_assigned" || notification.type === "task_due_soon" || notification.type === "task_overdue") {
      router.push("/my-tasks")
      setOpen(false)
    } else {
      // Default to tasks page
      router.push("/my-tasks")
      setOpen(false)
    }
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

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

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
          onClick={() => setOpen(true)}
        >
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          {unreadCount > 0 && (
            <div className="absolute -right-1 -top-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-destructive text-white text-[11px] font-bold leading-none shadow-sm border-2 border-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 rounded-[14px] border border-border shadow-lg"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold tracking-[0.28px]">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="h-7 w-7 p-0"
                title="Refresh notifications"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending}
                  className="h-7 px-2 text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium tracking-[0.28px] text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  You'll see notifications here when you have updates
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <>
                    {unreadNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type)
                      return (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "w-full flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left border-l-2 border-l-primary",
                            !notification.read && "bg-primary/5"
                          )}
                        >
                          <div className={cn("mt-0.5 flex-shrink-0", getNotificationColor(notification.type))}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold tracking-[0.28px] text-foreground">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm leading-5 tracking-[0.28px] text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1.5">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                    {readNotifications.length > 0 && <Separator className="my-2" />}
                  </>
                )}

                {/* Read Notifications */}
                {readNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left opacity-75"
                    >
                      <div className={cn("mt-0.5 flex-shrink-0", getNotificationColor(notification.type))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium tracking-[0.28px] text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-sm leading-5 tracking-[0.28px] text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1.5">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push("/notifications")
                setOpen(false)
              }}
              className="w-full text-xs"
            >
              View all notifications
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

