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
  Code,
  Edit,
  Trash2,
  Zap,
} from "lucide-react"
import { DevProject, DevProjectStatus } from "@/lib/types/dev-project"
import { initialDevProjects } from "@/lib/data/dev-projects"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"

const statusToColumn: Record<DevProjectStatus, "not-started" | "in-progress" | "completed" | "on-hold"> = {
  planning: "not-started",
  active: "in-progress",
  completed: "completed",
  "on-hold": "on-hold",
  cancelled: "on-hold",
}

const statusBadgeConfig: Record<DevProjectStatus, { label: string; variant: "not-started" | "in-progress" | "completed" | "on-hold" }> = {
  planning: { label: "Not Started", variant: "not-started" },
  active: { label: "In Progress", variant: "in-progress" },
  "on-hold": { label: "On Hold", variant: "on-hold" },
  completed: { label: "Completed", variant: "completed" },
  cancelled: { label: "On Hold", variant: "on-hold" },
}

const columns = [
  {
    id: "not-started" as const,
    title: "Not Started",
    dotColor: "bg-slate-500",
    projects: [] as DevProject[],
  },
  {
    id: "in-progress" as const,
    title: "In Progress",
    dotColor: "bg-blue-500",
    projects: [] as DevProject[],
  },
  {
    id: "completed" as const,
    title: "Completed",
    dotColor: "bg-green-500",
    projects: [] as DevProject[],
  },
  {
    id: "on-hold" as const,
    title: "On Hold",
    dotColor: "bg-yellow-500",
    projects: [] as DevProject[],
  },
]

async function fetchDevProjects() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialDevProjects.projects
}

function DevProjectCard({ project }: { project: DevProject }) {
  const status = statusBadgeConfig[project.status]
  const remainingTasks = project.tasksCount ? project.tasksCount - (project.completedTasksCount || 0) : 0

  const getDescription = () => {
    if (project.status === "completed") {
      if (project.tasksCount && project.completedTasksCount === project.tasksCount) {
        return "All tasks finished"
      }
      return "All tasks completed"
    }
    if (project.status === "planning") {
      return `${project.tasksCount || 0} tasks pending`
    }
    if (project.status === "active") {
      if (remainingTasks > 0) {
        return `${remainingTasks} tasks remaining`
      }
      return "In progress"
    }
    if (project.status === "on-hold") {
      return `${remainingTasks} tasks blocked`
    }
    return project.description || ""
  }

  return (
    <Link href={`/dev/projects/${project.id}`}>
      <Card className="border border-border/50 rounded-xl p-4 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/50 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-primary/10 rounded-lg w-8 h-8 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-5 px-2 py-0 rounded-md text-[10px] font-bold uppercase tracking-wider border-border/50 text-muted-foreground">
              {status.label}
            </Badge>
            <button
              className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <h3 className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {getDescription()}
          </p>
          {project.linkedBusinessFeature && (
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 opacity-80">
              {project.linkedBusinessFeature}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 h-1 bg-border/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground w-8">
              {project.progress}%
            </span>
          </div>

          <div className="flex items-center ml-4">
            {project.team.slice(0, 3).map((member, index) => (
              <Avatar
                key={member.id}
                className={cn(
                  "h-5 w-5 border border-background rounded-full",
                  index > 0 && "-ml-1.5"
                )}
              >
                <AvatarImage src={getAvatarForUser(member.id || member.name)} alt={member.name} />
                <AvatarFallback className="text-[8px] bg-secondary font-bold">
                  {member.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function DevProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["dev-projects"],
    queryFn: fetchDevProjects,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground font-medium animate-pulse">Loading roadmap...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive font-bold">Failed to load projects.</div>
      </div>
    )
  }

  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const columnsWithProjects = columns.map((column) => ({
    ...column,
    projects: filteredProjects.filter((project) => statusToColumn[project.status] === column.id),
  }))

  const totalProjects = projects?.length || 0
  const totalTasks = projects?.reduce((sum, p) => sum + (p.tasksCount || 0), 0) || 0
  const activeProjects = projects?.filter((p) => p.status === "active").length || 0
  const completedProjects = projects?.filter((p) => p.status === "completed").length || 0

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="tracking-tighter">Projects Roadmap</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Strategic overview of development initiatives and progress.
          </p>
        </div>
        <Link href="/dev/projects/new">
          <Button className="font-bold tracking-tight px-6 h-11 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4.5 w-4.5 mr-2" />
            New Initiative
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Total Projects", value: totalProjects, icon: Folder, color: "text-primary" },
          { label: "Total Tasks", value: totalTasks, icon: CheckCircle2, color: "text-primary" },
          { label: "Active Now", value: activeProjects, icon: Zap, color: "text-primary" },
          { label: "Completed", value: completedProjects, icon: CheckCircle2, color: "text-emerald-500" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-secondary/20 border-border/40 p-5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-tight">
                {stat.value}
              </p>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
          </Card>
        ))}
      </div>

      {/* Projects Board */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Initiative Board</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search roadmap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-72 bg-secondary/30 border-border/40 rounded-lg text-sm font-medium focus:ring-primary/20"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border/40 bg-secondary/20">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
          {columnsWithProjects.map((column) => (
            <div key={column.id} className="min-w-[300px] flex-1 flex flex-col gap-4">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2.5">
                  <div className={cn("size-2 rounded-full", column.dotColor)} />
                  <span className="font-bold text-sm tracking-tight uppercase opacity-80">
                    {column.title}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border/20">
                    {column.projects.length}
                  </span>
                </div>
                <button className="text-muted-foreground/40 hover:text-foreground transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Project Cards */}
              <div className="flex flex-col gap-4">
                {column.projects.map((project) => (
                  <DevProjectCard key={project.id} project={project} />
                ))}
                {column.projects.length === 0 && (
                  <div className="h-24 border border-dashed border-border/30 rounded-xl flex items-center justify-center">
                    <p className="text-xs text-muted-foreground font-medium italic">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

