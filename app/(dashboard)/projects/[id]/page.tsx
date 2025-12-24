"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MessageSquare,
  Plus,
  ChevronDown,
} from "lucide-react"
import { Project } from "@/lib/types/project"
import { Task, TaskStatus, TaskPriority, TaskResource } from "@/lib/types/task"
import { initialProjects } from "@/lib/data/projects"
import { initialTasks } from "@/lib/data/tasks"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"

// Map task status to Kanban column
const statusToColumn: Record<TaskStatus, "to-do" | "in-progress" | "review" | "completed"> = {
  "not-started": "to-do",
  "in-progress": "in-progress",
  "in-review": "review",
  completed: "completed",
  blocked: "to-do",
}

// Priority badge config
const priorityBadgeConfig: Record<TaskPriority, { label: string; variant: "priority-high" | "priority-medium" | "priority-low" }> = {
  urgent: { label: "High", variant: "priority-high" },
  high: { label: "High", variant: "priority-high" },
  medium: { label: "Medium", variant: "priority-medium" },
  low: { label: "Low", variant: "priority-low" },
}

// Project status badge config
const projectStatusBadgeConfig: Record<Project["status"], { label: string; variant: "completed" | "in-progress" | "not-started" | "on-hold" }> = {
  planning: { label: "Not Started", variant: "not-started" },
  active: { label: "In Progress", variant: "in-progress" },
  "on-hold": { label: "On Hold", variant: "on-hold" },
  completed: { label: "Completed", variant: "completed" },
  cancelled: { label: "On Hold", variant: "on-hold" },
}

// Column configuration
const columns = [
  {
    id: "to-do" as const,
    title: "To Do",
    dotColor: "bg-[#666D80]",
    tasks: [] as Task[],
  },
  {
    id: "in-progress" as const,
    title: "In Progress",
    dotColor: "bg-[#33CFFF]",
    tasks: [] as Task[],
  },
  {
    id: "review" as const,
    title: "Review",
    dotColor: "bg-[#FFBD4C]",
    tasks: [] as Task[],
  },
  {
    id: "completed" as const,
    title: "Completed",
    dotColor: "bg-[#40C4AA]",
    tasks: [] as Task[],
  },
]

async function fetchProject(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const project = initialProjects.projects.find((p) => p.id === id)
  if (!project) throw new Error("Project not found")
  return project
}

async function fetchProjectTasks() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  // Flatten all tasks from the task data structure
  const allTasks: Task[] = []
  
  const flattenTasks = (tasks: any[]): void => {
    tasks.forEach((task) => {
      allTasks.push(task)
      if (task.subtasks) {
        flattenTasks(task.subtasks)
      }
    })
  }
  
  flattenTasks(initialTasks.tasks)
  return allTasks
}

// Calculate task progress from subtasks
function calculateTaskProgress(task: Task): number {
  if (task.progress !== undefined) return task.progress
  
  if ("subtasks" in task && task.subtasks && task.subtasks.length > 0) {
    const completed = task.subtasks.filter((st) => st.status === "completed").length
    return Math.round((completed / task.subtasks.length) * 100)
  }
  
  // Default progress based on status
  if (task.status === "completed") return 100
  if (task.status === "in-progress") return 50
  if (task.status === "in-review") return 90
  return 0
}

// Calendar View Component
function CalendarView({ 
  tasks, 
  currentMonth,
  onMonthChange 
}: { 
  tasks: Task[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
}) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  // Get first day of month and number of days
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  
  // Get previous month's trailing days
  const prevMonth = new Date(year, month - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  // Create calendar grid
  const calendarDays: Array<{
    date: number
    isCurrentMonth: boolean
    isToday: boolean
    fullDate: Date
  }> = []
  
  // Previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i
    const fullDate = new Date(year, month - 1, date)
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      fullDate,
    })
  }
  
  // Current month days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = new Date(year, month, i)
    fullDate.setHours(0, 0, 0, 0)
    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      isToday: fullDate.getTime() === today.getTime(),
      fullDate,
    })
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const fullDate = new Date(year, month + 1, i)
    calendarDays.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      fullDate,
    })
  }
  
  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>()
  tasks.forEach((task) => {
    const dueDate = task.dueDate || task.updatedAt
    const dateKey = new Date(dueDate).toDateString()
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, [])
    }
    tasksByDate.get(dateKey)!.push(task)
  })
  
  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = date.toDateString()
    return tasksByDate.get(dateKey) || []
  }
  
  // Get task color based on priority
  const getTaskColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
      case "urgent":
        return {
          bg: "bg-[#F3F2FF]",
          border: "bg-[#897EFA]",
          text: "text-[#36394A]",
        }
      case "medium":
        return {
          bg: "bg-[#FFF9E8]",
          border: "bg-[#FAC515]",
          text: "text-[#36394A]",
        }
      case "low":
        return {
          bg: "bg-[#ECF9F7]",
          border: "bg-[#40C4AA]",
          text: "text-[#36394A]",
        }
      default:
        return {
          bg: "bg-[#F3F2FF]",
          border: "bg-[#897EFA]",
          text: "text-[#36394A]",
        }
    }
  }
  
  return (
    <div className="border border-[#DFE1E6] rounded-[14px] overflow-hidden">
      {/* Calendar Grid */}
      <div className="flex">
        {weekDays.map((day, dayIndex) => {
          const isWeekend = dayIndex === 0 || dayIndex === 6
          const dayTasks = calendarDays.filter((_, index) => index % 7 === dayIndex)
          
          return (
            <div key={day} className="flex-1 flex flex-col">
              {/* Day Header */}
              <div className={cn(
                "h-10 flex items-center justify-center px-3 border-b border-[#DFE1E6]",
                isWeekend ? "bg-[#F6F8FA]" : "bg-white"
              )}>
                <span className="text-sm font-medium text-[#666D80] leading-[1.5] tracking-[0.28px]">
                  {day}
                </span>
              </div>
              
              {/* Day Cells */}
              {dayTasks.map((dayData, weekIndex) => {
                const dateTasks = getTasksForDate(dayData.fullDate)
                const displayTasks = dateTasks.slice(0, 2)
                const remainingCount = dateTasks.length - 2
                const isWeekendCell = isWeekend
                const isOtherMonth = !dayData.isCurrentMonth
                const isToday = dayData.isToday
                
                return (
                  <div
                    key={`${dayIndex}-${weekIndex}`}
                    className={cn(
                      "h-32 flex flex-col p-3 border-b border-r border-[#DFE1E6]",
                      isWeekendCell ? "bg-[#F6F8FA]" : "bg-white"
                    )}
                  >
                    {/* Date Number */}
                    <div className="flex justify-end mb-2">
                      {isToday ? (
                        <div className="bg-[#897EFA] rounded-[4px] size-[21px] flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-white leading-[1.5] tracking-[0.2px]">
                            {dayData.date}
                          </span>
                        </div>
                      ) : (
                        <span className={cn(
                          "text-sm leading-[1.5] tracking-[0.28px]",
                          isOtherMonth ? "text-[#A4ACB9]" : "text-[#0D0D12]"
                        )}>
                          {dayData.date}
                        </span>
                      )}
                    </div>
                    
                    {/* Tasks */}
                    {displayTasks.length > 0 && (
                      <div className="flex flex-col gap-1 flex-1">
                        {displayTasks.map((task) => {
                          const colors = getTaskColor(task.priority)
                          return (
                            <div
                              key={task.id}
                              className={cn(
                                "relative h-6 rounded-[4px] px-2 flex items-center",
                                colors.bg
                              )}
                            >
                              <div className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-0.5 rounded-full",
                                colors.border
                              )} />
                              <span className={cn(
                                "text-[10px] leading-[1.5] tracking-[0.2px] flex-1 truncate",
                                colors.text
                              )}>
                                {task.name}
                              </span>
                            </div>
                          )
                        })}
                        {remainingCount > 0 && (
                          <span className={cn(
                            "text-[10px] font-medium leading-[1.5] tracking-[0.2px]",
                            isOtherMonth ? "text-[#818898]" : "text-[#0D0D12]"
                          )}>
                            +{remainingCount} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Task Card Component
function TaskCard({ task }: { task: Task }) {
  const priority = priorityBadgeConfig[task.priority]
  const progress = calculateTaskProgress(task)
  const dueDate = task.dueDate || task.updatedAt
  const commentsCount = task.commentsCount ?? 14
  
  // Get assignees - use task resource and any subtask resources
  const assignees: TaskResource[] = []
  if (task.resource) {
    assignees.push(task.resource)
  }
  if ("subtasks" in task && task.subtasks) {
    task.subtasks.forEach((st) => {
      if (st.resource && !assignees.find((a) => a.id === st.resource!.id)) {
        assignees.push(st.resource)
      }
    })
  }
  
  // Limit to 2 assignees for display
  const displayAssignees = assignees.slice(0, 2)

  return (
    <Card className="border border-[#DFE1E7] rounded-2xl p-4 bg-white">
      <div className="flex items-center justify-between mb-2.5">
        <Badge variant={priority.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
          {priority.label}
        </Badge>
        <button className="w-4 h-4 flex items-center justify-center">
          <MoreVertical className="h-4 w-4 text-[#666D80]" />
        </button>
      </div>
      
      <div className="border-b border-[#DFE1E7] pb-2.5 mb-2.5">
        <h3 className="font-medium text-xs text-[#0D0D12] leading-4 tracking-[0.24px] mb-1.5">
          {task.name}
        </h3>
        {task.description && (
          <p className="text-xs text-[#666D80] font-normal leading-4 tracking-[0.24px] line-clamp-3">
            {task.description}
          </p>
        )}
        <div className="flex gap-6 items-center mt-2.5">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-[#818998]" />
            <span className="text-xs text-[#666D80] font-medium leading-4 tracking-[0.24px]">
              {new Date(dueDate).toLocaleDateString("en-US", { 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-[#818998]" />
            <span className="text-xs text-[#666D80] font-medium leading-4 tracking-[0.24px]">
              {commentsCount}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Progress circle */}
          <div className="relative w-5 h-5">
            <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="#DFE1E7"
                strokeWidth="2"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke={progress === 100 ? "#40C4AA" : progress >= 60 ? "#897EFA" : "#DFE1E7"}
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 8}`}
                strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs text-[#666D80] font-medium leading-4 tracking-[0.24px]">
            {progress}%
          </span>
        </div>
        
        <div className="flex items-center pl-0 pr-1.5">
          {displayAssignees.map((assignee, index) => (
            <Avatar
              key={assignee.id}
              className={cn(
                "h-6 w-6 border-2 border-white rounded-full",
                index > 0 && "-ml-1.5"
              )}
            >
              <AvatarImage src={getAvatarForUser(assignee.id || assignee.name)} alt={assignee.name} />
              <AvatarFallback className="text-xs bg-muted">
                {assignee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {assignees.length === 0 && (
            <div className="h-6 w-6 border-2 border-white rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">?</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("kanban")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(columns.map((col) => col.id))
  )
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
  })

  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: fetchProjectTasks,
  })

  // Filter and organize tasks
  const filteredTasks = useMemo(() => {
    if (!allTasks) return []
    return allTasks.filter((task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allTasks, searchQuery])

  // Organize tasks into columns
  const columnsWithTasks = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: filteredTasks.filter((task) => {
        const columnId = statusToColumn[task.status]
        return columnId === column.id
      }),
    }))
  }, [filteredTasks])

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Project not found</div>
      </div>
    )
  }

  const status = projectStatusBadgeConfig[project.status]
  const displayDate = project.dueDate || project.endDate
  const dateRange = displayDate
    ? `${new Date(project.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${new Date(displayDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    : ""

  return (
    <div className="space-y-5">
      {/* Project Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-[#0D0D12] leading-[1.3]">
          {project.name}
        </h1>
        
        <div className="flex flex-col gap-2.5">
          {/* Project Status */}
          <div className="flex items-center">
            <span className="text-base text-[#666D80] font-normal leading-6 tracking-[0.32px] w-[150px]">
              Project Status
            </span>
            <Badge variant={status.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium leading-5">
              {status.label}
            </Badge>
          </div>
          
          {/* Progress */}
          <div className="flex items-center">
            <span className="text-base text-[#666D80] font-normal leading-6 tracking-[0.32px] w-[150px]">
              Progress
            </span>
            <div className="flex items-center gap-4">
              <span className="text-base text-[#272835] font-medium leading-6 tracking-[0.32px]">
                {project.progress}%
              </span>
              <div className="relative w-[130px] h-2 bg-[#DFE1E7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#897EFA] rounded-l-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Dates */}
          {dateRange && (
            <div className="flex items-center">
              <span className="text-base text-[#666D80] font-normal leading-6 tracking-[0.32px] w-[150px]">
                Dates
              </span>
              <span className="text-base text-[#272835] font-medium leading-6 tracking-[0.32px]">
                {dateRange}
              </span>
            </div>
          )}
          
          {/* Project Manager */}
          <div className="flex items-center">
            <span className="text-base text-[#666D80] font-normal leading-6 tracking-[0.32px] w-[150px]">
              Project Manager
            </span>
            <div className="flex items-center gap-1.5 pl-1 pr-3 py-1 border border-[#DFE1E7] rounded-[32px]">
              <Avatar className="h-6 w-6 border-2 border-white rounded-full">
                <AvatarImage src={getAvatarForUser(project.owner.id || project.owner.name)} alt={project.owner.name} />
                <AvatarFallback className="text-xs bg-muted">
                  {project.owner.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-base text-[#272835] font-medium leading-6 tracking-[0.32px]">
                {project.owner.name}
              </span>
            </div>
          </div>
          
          {/* Team Members */}
          <div className="flex items-center">
            <span className="text-base text-[#666D80] font-normal leading-6 tracking-[0.32px] w-[150px]">
              Team Members
            </span>
            <div className="flex items-center gap-3">
              {project.team.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-1.5 pl-1 pr-3 py-1 border border-[#DFE1E7] rounded-[32px]"
                >
                  <Avatar className="h-6 w-6 border-2 border-white rounded-full">
                    <AvatarImage src={getAvatarForUser(member.id || member.name)} alt={member.name} />
                    <AvatarFallback className="text-xs bg-muted">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base text-[#272835] font-medium leading-6 tracking-[0.32px]">
                    {member.name}
                  </span>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-4 py-2 border border-[#DFE1E7] rounded-md shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
              >
                <Plus className="h-3 w-3 mr-2" />
                <span className="text-xs font-semibold text-[#0D0D12] leading-4 tracking-[0.24px]">
                  Invite
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <Card className="border border-[#DFE1E7] rounded-2xl">
        <div className="border-b border-[#DFE1E7] h-16 flex items-center justify-between px-5">
          {/* View Selector Tabs */}
          <div className="bg-[#F6F8FA] p-0.5 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "h-10 px-6 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors",
                viewMode === "kanban"
                  ? "bg-white text-[#0D0D12]"
                  : "text-[#666D80] font-medium"
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "h-10 px-6 py-0 text-sm leading-5 tracking-[0.28px] transition-colors",
                viewMode === "table"
                  ? "bg-white text-[#0D0D12] font-semibold rounded-[10px]"
                  : "text-[#666D80] font-medium"
              )}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "h-10 px-6 py-0 text-sm leading-5 tracking-[0.28px] transition-colors",
                viewMode === "calendar"
                  ? "bg-white text-[#0D0D12] font-semibold rounded-[10px]"
                  : "text-[#666D80] font-medium"
              )}
            >
              Calendar
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666D80]" />
              <Input
                type="search"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-[38px] border border-[#DFE1E7] rounded-[10px] text-sm font-medium text-[#666D80]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-[38px] w-[38px] border border-[#DFE1E7] rounded-[10px]"
            >
              <Filter className="h-4 w-4 text-[#666D80]" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          {viewMode === "kanban" && (
            <div className="flex gap-5">
              {columnsWithTasks.map((column) => (
                <div key={column.id} className="flex-1 flex flex-col gap-3">
                  {/* Column Header */}
                  <div className="bg-[#F6F8FA] h-10 rounded-lg px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
                      <span className="text-base font-semibold text-[#0D0D12] leading-6 tracking-[0.32px]">
                        {column.title}
                      </span>
                      <div className="bg-white border border-[#DFE1E7] rounded-md w-5 h-5 flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#0D0D12] leading-4 tracking-[0.24px]">
                          {column.tasks.length}
                        </span>
                      </div>
                    </div>
                    <button className="w-5 h-5 flex items-center justify-center">
                      <MoreVertical className="h-4 w-4 text-[#666D80]" />
                    </button>
                  </div>

                  {/* Task Cards */}
                  <div className="flex flex-col gap-3">
                    {column.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {viewMode === "table" && (
            <div className="flex flex-col gap-4">
              {columnsWithTasks.map((column) => {
                if (column.tasks.length === 0) return null
                
                const isExpanded = expandedSections.has(column.id)
                const toggleSection = () => {
                  setExpandedSections((prev) => {
                    const next = new Set(prev)
                    if (next.has(column.id)) {
                      next.delete(column.id)
                    } else {
                      next.add(column.id)
                    }
                    return next
                  })
                }
                
                return (
                  <div key={column.id} className="flex flex-col gap-4">
                    {/* Status Header - Clickable Accordion */}
                    <button
                      onClick={toggleSection}
                      className="bg-[#F6F8FA] h-10 rounded-lg px-4 flex items-center justify-between hover:bg-[#E8EBEF] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-[#666D80] transition-transform",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )}
                        />
                        <div className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
                        <span className="text-base font-semibold text-[#0D0D12] leading-6 tracking-[0.32px]">
                          {column.title}
                        </span>
                        <div className="bg-white border border-[#DFE1E7] rounded-md w-5 h-5 flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#0D0D12] leading-4 tracking-[0.24px]">
                            {column.tasks.length}
                          </span>
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="w-5 h-5 flex items-center justify-center cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            e.stopPropagation()
                          }
                        }}
                      >
                        <MoreVertical className="h-4 w-4 text-[#666D80]" />
                      </div>
                    </button>

                    {/* Table - Conditionally Rendered */}
                    {isExpanded && (
                      <div className="border border-[#DFE1E7] rounded-[10px] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-0 hover:bg-transparent">
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 text-[#666D80] font-medium text-sm tracking-[0.28px]">
                              <div className="flex items-center gap-2.5">
                                <Checkbox className="bg-white border border-[#DFE1E7] rounded-[4px] size-4 data-[state=checked]:bg-[#897EFA] data-[state=checked]:border-[#897EFA]" />
                                <span>Task Name</span>
                              </div>
                            </TableHead>
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 text-[#666D80] font-medium text-sm tracking-[0.28px] w-[161px]">
                              Project
                            </TableHead>
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 text-[#666D80] font-medium text-sm tracking-[0.28px] w-[152px]">
                              Due Date
                            </TableHead>
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 text-[#666D80] font-medium text-sm tracking-[0.28px] w-[104px]">
                              Priority
                            </TableHead>
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 text-[#666D80] font-medium text-sm tracking-[0.28px] w-[144px]">
                              Progress
                            </TableHead>
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 text-[#666D80] font-medium text-sm tracking-[0.28px] w-[136px]">
                              Assignee
                            </TableHead>
                            <TableHead className="bg-[#F6F8FA] h-10 px-3 w-11"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {column.tasks.map((task) => {
                            const priority = priorityBadgeConfig[task.priority]
                            const progress = calculateTaskProgress(task)
                            const dueDate = task.dueDate || task.updatedAt
                            
                            // Get assignees
                            const assignees: TaskResource[] = []
                            if (task.resource) {
                              assignees.push(task.resource)
                            }
                            if ("subtasks" in task && task.subtasks) {
                              task.subtasks.forEach((st) => {
                                if (st.resource && !assignees.find((a) => a.id === st.resource!.id)) {
                                  assignees.push(st.resource)
                                }
                              })
                            }
                            const displayAssignees = assignees.slice(0, 3)
                            
                            return (
                              <TableRow key={task.id} className="border-b border-[#DFE1E7] hover:bg-transparent">
                                <TableCell className="h-16 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <Checkbox className="bg-white border border-[#DFE1E7] rounded-[4px] size-4 data-[state=checked]:bg-[#897EFA] data-[state=checked]:border-[#897EFA]" />
                                    <span className="text-sm font-medium text-[#0D0D12] leading-[1.5] tracking-[0.28px]">
                                      {task.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="h-16 px-3">
                                  <span className="text-sm font-medium text-[#0D0D12] leading-[1.5] tracking-[0.28px]">
                                    {project.name}
                                  </span>
                                </TableCell>
                                <TableCell className="h-16 px-3">
                                  <span className="text-sm font-medium text-[#0D0D12] leading-[1.5] tracking-[0.28px]">
                                    {new Date(dueDate).toLocaleDateString("en-US", { 
                                      month: "long", 
                                      day: "numeric", 
                                      year: "numeric" 
                                    })}
                                  </span>
                                </TableCell>
                                <TableCell className="h-16 px-3">
                                  <Badge variant={priority.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs font-medium leading-[18px] tracking-[0.12px]">
                                    {priority.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="h-16 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="relative w-[75px] h-1.5 bg-[#DFE1E7] rounded-[10px] overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full rounded-l-[10px]",
                                          progress === 100 ? "bg-[#40C4AA]" : progress >= 50 ? "bg-[#897EFA]" : "bg-[#DFE1E7]"
                                        )}
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-[#0D0D12] leading-[1.5] tracking-[0.24px]">
                                      {progress}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="h-16 pl-3 pr-5">
                                  <div className="flex items-center -space-x-2">
                                    {displayAssignees.map((assignee, index) => (
                                      <Avatar
                                        key={assignee.id}
                                        className={cn(
                                          "h-8 w-8 border-2 border-white rounded-full",
                                          index > 0 && "-ml-2"
                                        )}
                                      >
                                        <AvatarImage src={getAvatarForUser(assignee.id || assignee.name)} alt={assignee.name} />
                                        <AvatarFallback className="text-xs bg-muted">
                                          {assignee.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {assignees.length === 0 && (
                                      <div className="h-8 w-8 border-2 border-white rounded-full bg-[#D2C9F9] flex items-center justify-center">
                                        <span className="text-xs text-[#897EFA]">?</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="h-16 px-3">
                                  <button className="w-4 h-4 flex items-center justify-center">
                                    <MoreVertical className="h-4 w-4 text-[#666D80]" />
                                  </button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          {viewMode === "calendar" && (
            <CalendarView 
              tasks={filteredTasks} 
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

