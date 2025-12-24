"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Code,
  Folder,
  CheckSquare,
  BookOpen,
  ExternalLink,
  Zap,
  Settings,
  FileText,
  Grid3x3,
  Sparkles,
} from "lucide-react"
import { initialDevProjects } from "@/lib/data/dev-projects"
import { initialDevTasks } from "@/lib/data/dev-tasks"
import { DevTask } from "@/lib/types/dev-task"
import { cn } from "@/lib/utils"

async function fetchDevProjects() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return initialDevProjects.projects
}

async function fetchDevTasks() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return initialDevTasks.tasks
}

export default function DevPortalPage() {
  const { data: devProjects } = useQuery({
    queryKey: ["dev-projects"],
    queryFn: fetchDevProjects,
  })

  const { data: devTasks } = useQuery({
    queryKey: ["dev-tasks"],
    queryFn: fetchDevTasks,
  })

  const totalProjects = devProjects?.length || 0
  const activeProjects = devProjects?.filter((p) => p.status === "active").length || 0
  const totalTasks = devTasks?.reduce((acc, task) => {
    const countTotal = (t: DevTask): number => {
      let total = 1
      if (t.level === 0 && "subtasks" in t && t.subtasks) {
        total += t.subtasks.reduce((sum, st) => sum + countTotal(st), 0)
      } else if (t.level === 1 && "subtasks" in t && t.subtasks) {
        total += t.subtasks.reduce((sum, st) => sum + countTotal(st), 0)
      }
      return total
    }
    return acc + countTotal(task)
  }, 0) || 0
  const completedTasks = devTasks?.reduce((acc, task) => {
    const countCompleted = (t: DevTask): number => {
      let total = t.status === "completed" ? 1 : 0
      if (t.level === 0 && "subtasks" in t && t.subtasks) {
        total += t.subtasks.reduce((sum, st) => sum + countCompleted(st), 0)
      } else if (t.level === 1 && "subtasks" in t && t.subtasks) {
        total += t.subtasks.reduce((sum, st) => sum + countCompleted(st), 0)
      }
      return total
    }
    return acc + countCompleted(task)
  }, 0) || 0

  const quickLinks = [
    { name: "Pages Index", href: "/dev/pages-index", icon: FileText, description: "All routes and pages" },
    { name: "Stack", href: "/dev/stack", icon: Grid3x3, description: "Technology stack" },
    { name: "Prompts", href: "/dev/prompts", icon: Sparkles, description: "AI prompts library" },
    { name: "UI Libraries", href: "/dev/ui-libraries", icon: Code, description: "Component libraries" },
    { name: "External Apps", href: "/dev/external-apps", icon: ExternalLink, description: "Quick links" },
    { name: "Docs", href: "/dev/docs", icon: BookOpen, description: "Project documentation" },
    { name: "Credentials", href: "/dev/credentials", icon: Settings, description: "Env vars & setup" },
  ]

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="tracking-tighter">Developer Portal</h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Your purpose-built development workspace for planning and building.
          Streamline projects, tasks, and system architecture.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Total Projects</p>
                <p className="text-3xl font-bold tracking-tight">{totalProjects}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors">
                <Folder className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Active Projects</p>
                <p className="text-3xl font-bold tracking-tight">{activeProjects}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Total Tasks</p>
                <p className="text-3xl font-bold tracking-tight">{totalTasks}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 group-hover:bg-emerald-500/20 transition-colors">
                <CheckSquare className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border/50 hover:bg-secondary/50 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Completed</p>
                <p className="text-3xl font-bold tracking-tight text-emerald-500">{completedTasks}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 group-hover:bg-emerald-500/20 transition-colors">
                <CheckSquare className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">System Infrastructure</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="bg-secondary/20 border-border/40 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer h-full group">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="bg-secondary p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-lg border border-border/50">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base tracking-tight">{link.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Recent Projects Widget */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Active Projects</h2>
            <Link href="/dev/projects">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold tracking-tight">
                View roadmap →
              </Button>
            </Link>
          </div>
          <Card className="bg-secondary/20 border-border/40 overflow-hidden">
            <CardContent className="p-0">
              {devProjects && devProjects.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {devProjects.slice(0, 4).map((project) => (
                    <Link key={project.id} href={`/dev/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-5 hover:bg-secondary/40 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Folder className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{project.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-1.5 w-24 bg-border/40 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500" 
                              style={{ width: `${project.progress}%` }} 
                            />
                          </div>
                          <div className="text-xs font-bold text-muted-foreground w-10 text-right">{project.progress}%</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-muted-foreground font-medium">No projects in roadmap</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks Widget */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
            <Link href="/dev/tasks">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold tracking-tight">
                All issues →
              </Button>
            </Link>
          </div>
          <Card className="bg-secondary/20 border-border/40 overflow-hidden">
            <CardContent className="p-0">
              {devTasks && devTasks.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {devTasks.slice(0, 6).map((task) => (
                    <Link key={task.id} href={`/dev/tasks/${task.id}`}>
                      <div className="flex items-center justify-between p-4 px-5 hover:bg-secondary/40 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "size-2 rounded-full",
                            task.status === "completed" ? "bg-emerald-500" : 
                            task.status === "in-progress" ? "bg-primary" : "bg-muted-foreground/30"
                          )} />
                          <div>
                            <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{task.name}</p>
                            <div className="flex gap-2 mt-0.5">
                              {task.phase && (
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1.5 py-0.5 bg-secondary rounded">
                                  Phase {task.phase}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1.5 py-0.5 bg-secondary rounded capitalize">
                                {task.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="text-muted-foreground font-medium">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

