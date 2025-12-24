"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, FileText, Sparkles, Code, Edit, Trash2 } from "lucide-react"
import { initialDevTasks } from "@/lib/data/dev-tasks"
import { DevTask } from "@/lib/types/dev-task"

async function fetchDevTask(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  const findTask = (tasks: DevTask[]): DevTask | null => {
    for (const task of tasks) {
      if (task.id === id) return task
      if ("subtasks" in task && task.subtasks) {
        const found = findTask(task.subtasks as DevTask[])
        if (found) return found
      }
    }
    return null
  }
  
  const task = findTask(initialDevTasks.tasks)
  if (!task) throw new Error("Task not found")
  return task
}

export default function DevTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: task, isLoading, error } = useQuery({
    queryKey: ["dev-task", id],
    queryFn: () => fetchDevTask(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading task...</div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Task not found</div>
      </div>
    )
  }

  const statusConfig = {
    "not-started": { label: "Not Started", variant: "neutral-outline" as const },
    "in-progress": { label: "In Progress", variant: "primary-outline" as const },
    "in-review": { label: "In Review", variant: "yellow-outline" as const },
    "completed": { label: "Completed", variant: "green-outline" as const },
    "blocked": { label: "Blocked", variant: "red-outline" as const },
  }

  const priorityConfig = {
    low: { label: "Low", variant: "neutral" as const },
    medium: { label: "Medium", variant: "secondary" as const },
    high: { label: "High", variant: "yellow" as const },
    urgent: { label: "Urgent", variant: "red" as const },
  }

  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/dev/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{task.name}</h1>
            {task.description && <p className="text-muted-foreground mt-1">{task.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dev/tasks/${task.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:border-red-300">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Priority</p>
            <Badge variant={priority.variant}>{priority.label}</Badge>
          </CardContent>
        </Card>

        {task.phase && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Phase</p>
              <Badge variant="secondary">Phase {task.phase}</Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Link */}
      {task.projectId && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Linked Project</p>
                <Link href={`/dev/projects/${task.projectId}`} className="text-blue-600 hover:underline font-medium">
                  View Project →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Links */}
      {(task.figmaLink || task.docLinks?.length || task.relatedFiles?.length || task.promptUsed) ? (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="space-y-4">
              {task.figmaLink && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900">Figma Design</p>
                    <a
                      href={task.figmaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {task.figmaLink}
                    </a>
                  </div>
                </div>
              )}

              {task.docLinks && task.docLinks.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentation Links ({task.docLinks.length})
                  </p>
                  <div className="space-y-2">
                    {task.docLinks.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <Link href="/dev/docs" className="text-blue-600 hover:underline text-sm">
                          {doc}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.relatedFiles && task.relatedFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Related Files ({task.relatedFiles.length})
                  </p>
                  <div className="space-y-2">
                    {task.relatedFiles.map((file, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <code className="text-sm font-mono text-slate-700">{file}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.promptUsed && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-1">Prompt Used</p>
                    <p className="text-sm text-purple-700">{task.promptUsed}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No resources linked to this task</p>
              <p className="text-sm text-muted-foreground">Add Figma links, documentation, or related files when editing</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

