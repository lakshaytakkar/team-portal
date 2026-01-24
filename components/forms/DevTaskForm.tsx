"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DevTask, DevTaskStatus, DevTaskPriority } from "@/lib/types/dev-task"
import { ArrowLeft, Save, X, Plus } from "lucide-react"
import Link from "next/link"
import { initialDevProjects } from "@/lib/data/dev-projects"

interface DevTaskFormProps {
  task?: DevTask
  onSubmit: (data: Partial<DevTask>) => Promise<void>
  onCancel?: () => void
}

export function DevTaskForm({ task, onSubmit, onCancel }: DevTaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [docLinks, setDocLinks] = useState<string[]>(task?.docLinks || [])
  const [relatedFiles, setRelatedFiles] = useState<string[]>(task?.relatedFiles || [])
  const [newDocLink, setNewDocLink] = useState("")
  const [newRelatedFile, setNewRelatedFile] = useState("")

  const [formData, setFormData] = useState<Partial<DevTask>>({
    name: task?.name || "",
    description: task?.description || "",
    status: task?.status || "not-started",
    priority: task?.priority || "medium",
    phase: task?.phase,
    projectId: task?.projectId || "",
    dueDate: task?.dueDate || "",
    figmaLink: task?.figmaLink || "",
    promptUsed: task?.promptUsed || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        docLinks: docLinks.length > 0 ? docLinks : undefined,
        relatedFiles: relatedFiles.length > 0 ? relatedFiles : undefined,
      })
      const isEdit = !!task
      toast.success(
        isEdit ? "Task updated successfully" : "Task created successfully",
        {
          description: `Your task **${formData.name || "Task"}** has been ${isEdit ? "updated" : "created"}`,
          duration: 3000,
        }
      )
      router.push("/dev/tasks")
    } catch (error) {
      console.error("Error submitting task:", error)
      const isEdit = !!task
      toast.error(
        isEdit ? "Failed to update task" : "Failed to create task",
        {
          description: error instanceof Error ? error.message : "An error occurred. Please try again.",
          duration: 5000,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dev/tasks")
    }
  }

  const addDocLink = () => {
    if (newDocLink.trim()) {
      setDocLinks([...docLinks, newDocLink.trim()])
      setNewDocLink("")
    }
  }

  const removeDocLink = (index: number) => {
    setDocLinks(docLinks.filter((_, i) => i !== index))
  }

  const addRelatedFile = () => {
    if (newRelatedFile.trim()) {
      setRelatedFiles([...relatedFiles, newRelatedFile.trim()])
      setNewRelatedFile("")
    }
  }

  const removeRelatedFile = (index: number) => {
    setRelatedFiles(relatedFiles.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{task ? "Edit Task" : "Create New Task"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter task name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: DevTaskStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: DevTaskPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectId">Project</Label>
                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? undefined : value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {initialDevProjects.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phase">Phase</Label>
                <Select
                  value={formData.phase?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, phase: value === "none" ? undefined : parseInt(value) as 1 | 2 | 3 | 4 })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1">Phase 1: UI/Layout</SelectItem>
                    <SelectItem value="2">Phase 2: Fix Gaps/Interactions</SelectItem>
                    <SelectItem value="3">Phase 3: Details/Actions</SelectItem>
                    <SelectItem value="4">Phase 4: Microinteractions/Bug Fixes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Resources</h3>

            <div>
              <Label htmlFor="figmaLink">Figma Link</Label>
              <Input
                id="figmaLink"
                type="url"
                value={formData.figmaLink || ""}
                onChange={(e) => setFormData({ ...formData, figmaLink: e.target.value })}
                placeholder="https://figma.com/design/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="promptUsed">Prompt Used</Label>
              <Input
                id="promptUsed"
                value={formData.promptUsed || ""}
                onChange={(e) => setFormData({ ...formData, promptUsed: e.target.value })}
                placeholder="e.g., Phase 1: Create UI Layout"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Documentation Links</Label>
              <div className="mt-1 space-y-2">
                {docLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={link} readOnly />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeDocLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newDocLink}
                    onChange={(e) => setNewDocLink(e.target.value)}
                    placeholder="docs/page-specs/example.md"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addDocLink()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addDocLink}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Related Files</Label>
              <div className="mt-1 space-y-2">
                {relatedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={file} readOnly className="font-mono text-sm" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRelatedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newRelatedFile}
                    onChange={(e) => setNewRelatedFile(e.target.value)}
                    placeholder="app/dev/projects/page.tsx"
                    className="font-mono text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addRelatedFile()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addRelatedFile}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dev/tasks">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}

