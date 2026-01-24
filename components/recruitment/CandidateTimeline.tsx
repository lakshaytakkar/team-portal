"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { TimelineItem } from "@/lib/actions/recruitment"
import { Calendar, FileText, UserCheck, MessageSquare, X, CheckCircle2, Clock } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

interface CandidateTimelineProps {
  timeline: TimelineItem[]
  onItemClick?: (item: TimelineItem) => void
  className?: string
}

export function CandidateTimeline({ timeline, onItemClick, className }: CandidateTimelineProps) {
  const router = useRouter()

  const getItemIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'application':
        return FileText
      case 'interview':
        return Calendar
      case 'evaluation':
        return UserCheck
      case 'status_change':
        return CheckCircle2
      case 'note':
        return MessageSquare
      default:
        return Clock
    }
  }

  const getItemColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'application':
        return 'bg-blue-100 text-blue-700'
      case 'interview':
        return 'bg-purple-100 text-purple-700'
      case 'evaluation':
        return 'bg-green-100 text-green-700'
      case 'status_change':
        return 'bg-orange-100 text-orange-700'
      case 'note':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Group timeline items by date
  const groupedTimeline = timeline.reduce((acc, item) => {
    const date = new Date(item.date).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, TimelineItem[]>)

  const handleItemClick = (item: TimelineItem) => {
    if (onItemClick) {
      onItemClick(item)
      return
    }

    // Default navigation
    if (item.relatedId && item.relatedType) {
      switch (item.relatedType) {
        case 'application':
          router.push(`/recruitment/applications/${item.relatedId}`)
          break
        case 'interview':
          router.push(`/recruitment/interviews/${item.relatedId}`)
          break
        case 'evaluation':
          router.push(`/recruitment/evaluations/${item.relatedId}`)
          break
      }
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(groupedTimeline).map(([date, items]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-semibold text-muted-foreground px-2">
              {format(new Date(date), "EEEE, MMMM d, yyyy")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3 pl-6 border-l-2 border-border">
            {items.map((item) => {
              const Icon = getItemIcon(item.type)
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer",
                    onItemClick && "cursor-pointer"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("rounded-full p-2", getItemColor(item.type))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.userName && (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-xs">
                                    {item.userName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{item.userName}</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        {item.relatedType && (
                          <Badge variant="outline" className="mt-2 h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {item.relatedType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {timeline.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No timeline activity yet</p>
        </div>
      )}
    </div>
  )
}

