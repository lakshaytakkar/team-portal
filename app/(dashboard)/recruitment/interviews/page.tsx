"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Video,
  Phone,
  MapPin,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Interview } from "@/lib/types/recruitment"
import { getInterviews } from "@/lib/actions/recruitment"
import { exportInterviewsToCSV } from "@/lib/utils/export"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { RecruitmentTopbarActions, type ViewMode } from "@/components/recruitment/RecruitmentTopbarActions"
import { ScheduleInterviewDialog } from "@/components/recruitment/ScheduleInterviewDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"
import type { Action } from "@/lib/utils/actions"
import { format, isToday, isTomorrow, isPast, differenceInDays, startOfDay } from "date-fns"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

async function fetchInterviews() {
  return await getInterviews()
}

const statusConfig: Record<string, { label: string; borderColor: string; textColor: string; dotColor: string }> = {
  scheduled: {
    label: "Scheduled",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  completed: {
    label: "Completed",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  cancelled: {
    label: "Cancelled",
    borderColor: "border-[#df1c41]",
    textColor: "text-[#df1c41]",
    dotColor: "bg-[#df1c41]",
  },
  rescheduled: {
    label: "Rescheduled",
    borderColor: "border-[#f59e0b]",
    textColor: "text-[#f59e0b]",
    dotColor: "bg-[#f59e0b]",
  },
}

const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  phone: { label: "Phone", icon: Phone },
  video: { label: "Video", icon: Video },
  "in-person": { label: "In Person", icon: MapPin },
}

export default function RecruitmentInterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const router = useRouter()
  const { data: interviews, isLoading, error, refetch } = useQuery({
    queryKey: ["interviews"],
    queryFn: fetchInterviews,
  })

  const metrics = useMemo(() => {
    if (!interviews) return { today: 0, thisWeek: 0, upcoming: 0, completed: 0 }
    const now = new Date()
    const today = interviews.filter((i) => {
      const interviewDate = new Date(i.interviewDate)
      return isToday(interviewDate)
    }).length
    const thisWeek = interviews.filter((i) => {
      const interviewDate = new Date(i.interviewDate)
      const daysDiff = differenceInDays(interviewDate, now)
      return daysDiff >= 0 && daysDiff <= 7
    }).length
    const upcoming = interviews.filter((i) => {
      const interviewDate = new Date(i.interviewDate)
      return !isPast(interviewDate) && i.status === "scheduled"
    }).length
    const completed = interviews.filter((i) => i.status === "completed").length
    return { today, thisWeek, upcoming, completed }
  }, [interviews])

  const filteredInterviews = useMemo(() => {
    return interviews?.filter(
      (interview) =>
        interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  }, [interviews, searchQuery])

  const primaryActions: Action[] = [
    {
      id: "schedule-interview",
      type: "create",
      label: "Schedule Interview",
      onClick: () => setIsScheduleInterviewOpen(true),
    },
  ]

  const secondaryActions: Action[] = [
    {
      id: "export",
      type: "export",
      label: "Export",
      onClick: () => {
        if (!interviews || interviews.length === 0) {
          toast.error("No interviews to export")
          return
        }
        try {
          exportInterviewsToCSV(interviews, {
            filename: `interviews-${new Date().toISOString().split('T')[0]}`,
          })
          toast.success("Export started", {
            description: "Exporting all interviews",
          })
        } catch (error) {
          toast.error("Export failed", {
            description: error instanceof Error ? error.message : "An error occurred",
          })
        }
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load interviews"
        message="We couldn't load interviews. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }


  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Interviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule and manage candidate interviews</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Today
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.today}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            This Week
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.thisWeek}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Upcoming
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.upcoming}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Completed
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">{metrics.completed}</p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <RecruitmentTopbarActions
            primary={primaryActions}
            secondary={secondaryActions}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            availableViewModes={["table", "calendar"]}
          />
        </div>

        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="w-[200px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Candidate</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Interview Date</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Time</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Interviewer</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Days Until</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                  </TableHead>
                  <TableHead className="w-[44px] px-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.length > 0 ? (
                  filteredInterviews.map((interview) => {
                    const status = statusConfig[interview.status] || statusConfig.scheduled
                    const type = typeConfig[interview.interviewType] || typeConfig.video
                    const TypeIcon = type.icon
                    const daysUntil = getDaysUntil(interview.interviewDate)
                    return (
                      <TableRow
                        key={interview.id}
                        className="border-b border-border cursor-pointer hover:bg-muted/30"
                        onClick={() => router.push(`/recruitment/interviews/${interview.id}`)}
                      >
                        <TableCell className="px-3">
                          <Link
                            href={`/recruitment/candidates?search=${encodeURIComponent(interview.candidateName)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{interview.candidateName}</span>
                              <span className="text-xs text-muted-foreground">{interview.candidateEmail}</span>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{interview.position}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(interview.interviewDate), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{interview.interviewTime}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{type.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={getAvatarForUser(interview.interviewer.id || interview.interviewer.name)}
                                alt={interview.interviewer.name}
                              />
                              <AvatarFallback className="text-xs">
                                {interview.interviewer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">{interview.interviewer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3">
                          {daysUntil ? (
                            <span className="text-sm font-medium text-foreground">{daysUntil}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 px-1.5 py-0.5 rounded-2xl text-xs gap-1 bg-background",
                              status.borderColor,
                              status.textColor
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu
                            entityType="interview"
                            entityId={interview.id}
                            entityName={interview.candidateName}
                            detailUrl={`/recruitment/interviews/${interview.id}`}
                            canView={true}
                            canEdit={true}
                            canDelete={false}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24">
                      <EmptyState
                        icon={CalendarIcon}
                        title="No interviews found"
                        description={searchQuery ? "Try adjusting your search criteria." : "Schedule interviews to manage the interview process."}
                        action={
                          !searchQuery
                            ? {
                                label: "Schedule Interview",
                                onClick: () => setIsScheduleInterviewOpen(true),
                              }
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {viewMode === "calendar" && (
          <div className="p-5">
            <InterviewCalendarView interviews={filteredInterviews} />
          </div>
        )}
      </Card>

      <ScheduleInterviewDialog open={isScheduleInterviewOpen} onOpenChange={setIsScheduleInterviewOpen} />
    </div>
  )
}

// Enhanced Calendar View Component with Collapsible Groups
function InterviewCalendarView({ interviews }: { interviews: Interview[] }) {
  const router = useRouter()
  
  // Group interviews by date
  const interviewsByDate = useMemo(() => {
    const grouped: Record<string, Interview[]> = {}
    interviews.forEach((interview) => {
      const dateKey = format(new Date(interview.interviewDate), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(interview)
    })
    // Sort interviews within each date by time
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => {
        const timeA = a.interviewTime || ""
        const timeB = b.interviewTime || ""
        return timeA.localeCompare(timeB)
      })
    })
    return grouped
  }, [interviews])

  const sortedDates = Object.keys(interviewsByDate).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateA.getTime() - dateB.getTime()
  })

  const getDateLabel = (dateKey: string) => {
    const date = new Date(dateKey)
    if (isToday(date)) {
      return `Today, ${format(date, "MMMM d, yyyy")}`
    }
    if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "MMMM d, yyyy")}`
    }
    return format(date, "EEEE, MMMM d, yyyy")
  }

  const getRelativeDateLabel = (dateKey: string) => {
    const date = new Date(dateKey)
    const daysDiff = differenceInDays(date, startOfDay(new Date()))
    if (daysDiff < 0) return "Past"
    if (daysDiff === 0) return "Today"
    if (daysDiff === 1) return "Tomorrow"
    if (daysDiff <= 7) return `In ${daysDiff} days`
    return format(date, "MMM d")
  }

  return (
    <div className="space-y-3">
      {sortedDates.length > 0 ? (
        <Accordion type="multiple" defaultValue={sortedDates.slice(0, 7)} className="w-full">
          {sortedDates.map((dateKey) => {
            const dateInterviews = interviewsByDate[dateKey]
            const date = new Date(dateKey)
            const isPastDate = isPast(date) && !isToday(date)
            
            return (
              <AccordionItem key={dateKey} value={dateKey} className="border border-border rounded-xl mb-3 last:mb-0">
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg",
                        isToday(date) ? "bg-primary/10" : isPastDate ? "bg-muted/50" : "bg-muted/30"
                      )}>
                        <CalendarIcon className={cn(
                          "h-5 w-5",
                          isToday(date) ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="flex flex-col items-start">
                        <h3 className="text-base font-semibold text-foreground leading-6">
                          {getDateLabel(dateKey)}
                        </h3>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {getRelativeDateLabel(dateKey)} • {dateInterviews.length} {dateInterviews.length === 1 ? "interview" : "interviews"}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-auto h-6 px-2.5 rounded-lg text-xs font-semibold",
                        isToday(date) && "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      {dateInterviews.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 pt-0">
                  <div className="space-y-3 mt-2">
                    {dateInterviews.map((interview) => {
                      const status = statusConfig[interview.status] || statusConfig.scheduled
                      const type = typeConfig[interview.interviewType] || typeConfig.video
                      const TypeIcon = type.icon
                      const daysUntil = getDaysUntil(interview.interviewDate)
                      
                      return (
                        <Card
                          key={interview.id}
                          className={cn(
                            "border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group",
                            "bg-white hover:bg-muted/20"
                          )}
                          onClick={() => router.push(`/recruitment/interviews/${interview.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Left side - Type icon and time */}
                            <div className="flex flex-col items-center gap-2 pt-1">
                              <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-lg",
                                status.dotColor === "bg-[#3b82f6]" ? "bg-blue-50" :
                                status.dotColor === "bg-[#339d88]" ? "bg-green-50" :
                                status.dotColor === "bg-[#df1c41]" ? "bg-red-50" :
                                "bg-amber-50"
                              )}>
                                <TypeIcon className={cn(
                                  "h-5 w-5",
                                  status.dotColor === "bg-[#3b82f6]" ? "text-blue-600" :
                                  status.dotColor === "bg-[#339d88]" ? "text-green-600" :
                                  status.dotColor === "bg-[#df1c41]" ? "text-red-600" :
                                  "text-amber-600"
                                )} />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-foreground leading-5">
                                  {interview.interviewTime}
                                </span>
                                {daysUntil && (
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    {daysUntil}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Middle - Main content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <h4 className="text-base font-semibold text-foreground leading-6 truncate">
                                      {interview.candidateName}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "h-5 px-2 py-0.5 rounded-full text-xs gap-1.5 shrink-0",
                                        status.borderColor,
                                        status.textColor,
                                        "bg-background"
                                      )}
                                    >
                                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                                      {status.label}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Briefcase className="h-3.5 w-3.5" />
                                      <span className="font-medium text-foreground">{interview.position}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Mail className="h-3.5 w-3.5" />
                                      <span className="truncate max-w-[200px]">{interview.candidateEmail}</span>
                                    </div>
                                    {interview.location && (
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{interview.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Interviewer info */}
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={getAvatarForUser(interview.interviewer.id || interview.interviewer.name)}
                                    alt={interview.interviewer.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {interview.interviewer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-sm text-muted-foreground truncate">
                                    Interviewer: <span className="font-medium text-foreground">{interview.interviewer.name}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right side - Actions */}
                            <div 
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <RowActionsMenu
                                entityType="interview"
                                entityId={interview.id}
                                entityName={interview.candidateName}
                                detailUrl={`/recruitment/interviews/${interview.id}`}
                                canView={true}
                                canEdit={true}
                                canDelete={false}
                              />
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="No interviews scheduled"
          description="Schedule interviews to see them in calendar view."
        />
      )}
    </div>
  )
}

function getDaysUntil(interviewDate: string) {
  const date = new Date(interviewDate)
  const days = differenceInDays(date, new Date())
  if (days < 0) return null
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `${days}d`
}
