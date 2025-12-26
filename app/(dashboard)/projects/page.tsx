"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Folder,
  CheckCircle2,
} from "lucide-react"
import { Project, ProjectStatus } from "@/lib/types/project"
import { initialProjects } from "@/lib/data/projects"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"

// Map project status to Kanban column
const statusToColumn: Record<ProjectStatus, "not-started" | "in-progress" | "completed" | "on-hold"> = {
  planning: "not-started",
  active: "in-progress",
  completed: "completed",
  "on-hold": "on-hold",
  cancelled: "on-hold",
}

// Status badge config for Kanban cards
const statusBadgeConfig: Record<ProjectStatus, { label: string; variant: "not-started" | "in-progress" | "completed" | "on-hold" }> = {
  planning: { label: "Not Started", variant: "not-started" },
  active: { label: "In Progress", variant: "in-progress" },
  "on-hold": { label: "On Hold", variant: "on-hold" },
  completed: { label: "Completed", variant: "completed" },
  cancelled: { label: "On Hold", variant: "on-hold" },
}

// Column configuration
const columns = [
  {
    id: "not-started" as const,
    title: "Not Started",
    dotColor: "bg-muted-foreground",
    projects: [] as Project[],
  },
  {
    id: "in-progress" as const,
    title: "In Progress",
    dotColor: "bg-status-in-progress-foreground",
    projects: [] as Project[],
  },
  {
    id: "completed" as const,
    title: "Completed",
    dotColor: "bg-status-completed-foreground",
    projects: [] as Project[],
  },
  {
    id: "on-hold" as const,
    title: "On Hold",
    dotColor: "bg-status-on-hold-foreground",
    projects: [] as Project[],
  },
]

async function fetchProjects() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialProjects.projects
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const status = statusBadgeConfig[project.status]
  const remainingTasks = project.tasksCount ? project.tasksCount - (project.completedTasksCount || 0) : 0
  
  // Generate description text based on status
  const getDescription = () => {
    if (project.status === "completed") {
      if (project.tasksCount && project.completedTasksCount === project.tasksCount) {
        return "All tasks finished"
      }
      return "All tasks completed"
    }
    if (project.status === "planning") {
      return `${project.tasksCount || 15} tasks to be assigned`
    }
    if (project.status === "active") {
      // For active projects, show various descriptions
      if (project.name.toLowerCase().includes("feedback")) {
        return "7 tasks due this week"
      }
      if (project.name.toLowerCase().includes("brand")) {
        return "4 logo concepts pending"
      }
      if (project.name.toLowerCase().includes("onboarding")) {
        return "2 designs need review"
      }
      if (remainingTasks > 0) {
        return `${remainingTasks} tasks due this week`
      }
      return "In progress"
    }
    if (project.status === "on-hold") {
      if (project.name.toLowerCase().includes("marketing")) {
        return "Awaiting budget approval"
      }
      if (project.name.toLowerCase().includes("database")) {
        return "1 blocker from engineering"
      }
      return `${remainingTasks} tasks blocked`
    }
    return ""
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="border border-border rounded-2xl p-4 bg-white hover:border-primary transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium leading-5">
              {status.label}
            </Badge>
            <button 
              className="w-4 h-4 flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 mb-2">
          <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
            {project.name}
          </h3>
          <p className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
            {getDescription()}
          </p>
        </div>
      
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="relative w-[100px] h-2 bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                project.progress === 100
                  ? "bg-status-completed-foreground rounded-[10px]"
                  : "bg-status-completed-foreground rounded-l-full"
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
            {project.progress}%
          </span>
        </div>
        
        <div className="flex items-center pl-0 pr-2">
          {project.team.slice(0, 3).map((member, index) => (
            <Avatar
              key={member.id}
              className={cn(
                "h-6 w-6 border-2 border-white rounded-full",
                index > 0 && "-ml-2"
              )}
            >
              <AvatarImage src={getAvatarForUser(member.id || member.name)} alt={member.name} />
              <AvatarFallback className="text-xs bg-muted">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
      </Card>
    </Link>
  )
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading projects. Please try again.</div>
      </div>
    )
  }

  // Filter projects by search query
  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Organize projects into columns
  const columnsWithProjects = columns.map((column) => ({
    ...column,
    projects: filteredProjects.filter((project) => statusToColumn[project.status] === column.id),
  }))

  // Calculate statistics
  const totalProjects = projects?.length || 0
  const totalTasks = projects?.reduce((sum, p) => sum + (p.tasksCount || 0), 0) || 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totalDueToday = projects?.filter((p) => {
    if (!p.dueDate) return false
    const dueDate = new Date(p.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  }).length || 0
  const taskCompleted = projects?.reduce((sum, p) => sum + (p.completedTasksCount || 0), 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
          Projects Overview
        </h1>
        <Button className="h-10 px-4 py-2 bg-primary border border-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Project
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {totalProjects}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Task
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {totalTasks}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Total Due Today
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {totalDueToday}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Task Completed
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {taskCompleted}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border border-border rounded-2xl">
        <div className="border-b border-border h-16 flex items-center justify-between px-5">
          <h2 className="text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
            Projects List
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-[38px] border border-border rounded-[10px] text-sm font-medium text-muted-foreground"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-[38px] w-[38px] border border-border rounded-[10px]"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Kanban Board */}
          <div className="flex gap-5">
            {columnsWithProjects.map((column) => (
              <div key={column.id} className="flex-1 flex flex-col gap-3">
                {/* Column Header */}
                <div className="bg-muted h-10 rounded-lg px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
                    <span className="text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
                      {column.title}
                    </span>
                    <div className="bg-white border border-border rounded-md w-5 h-5 flex items-center justify-center">
                      <span className="text-xs font-semibold text-foreground leading-4 tracking-[0.24px]">
                        {column.projects.length}
                      </span>
                    </div>
                  </div>
                  <button className="w-5 h-5 flex items-center justify-center">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Project Cards */}
                <div className="flex flex-col gap-3">
                  {column.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
