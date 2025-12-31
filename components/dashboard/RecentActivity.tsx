"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Clock, ArrowRight } from "lucide-react"

interface Activity {
  id: string
  type: "task" | "project" | "call" | "leave" | "employee" | "deal"
  title: string
  description?: string
  status?: string
  assignee?: string
  timestamp: Date | string
  href?: string
}

interface RecentActivityProps {
  activities?: Activity[]
  isLoading?: boolean
  maxItems?: number
  className?: string
}

export function RecentActivity({ 
  activities = [], 
  isLoading, 
  maxItems = 5,
  className 
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems)

  if (isLoading) {
    return (
      <Card className={cn("border border-border rounded-[14px]", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTypeColor = (type: Activity["type"]) => {
    const colors: Record<Activity["type"], string> = {
      task: "bg-blue-100 text-blue-700",
      project: "bg-purple-100 text-purple-700",
      call: "bg-green-100 text-green-700",
      leave: "bg-orange-100 text-orange-700",
      employee: "bg-pink-100 text-pink-700",
      deal: "bg-yellow-100 text-yellow-700",
    }
    return colors[type] || "bg-gray-100 text-gray-700"
  }

  const formatTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  return (
    <Card className={cn("border border-border rounded-[14px]", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-3">
            {displayActivities.map((activity) => {
              const content = (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize shrink-0", getTypeColor(activity.type))}
                  >
                    {activity.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                      {activity.status && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {activity.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.href && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              )

              return activity.href ? (
                <Link key={activity.id} href={activity.href}>
                  {content}
                </Link>
              ) : (
                <div key={activity.id}>{content}</div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity
          </div>
        )}
      </CardContent>
    </Card>
  )
}


