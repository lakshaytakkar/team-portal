"use client"

import { use, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { DevTaskForm } from "@/components/forms/DevTaskForm"
import { Skeleton } from "@/components/ui/skeleton"
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

async function updateTask(id: string, data: Partial<DevTask>) {
  // Mock API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const findAndUpdateTask = (tasks: DevTask[]): boolean => {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i] = {
          ...tasks[i],
          ...data,
          updatedAt: new Date().toISOString(),
        } as DevTask
        return true
      }
      const task = tasks[i]
      if ("subtasks" in task && task.subtasks) {
        if (findAndUpdateTask(task.subtasks as DevTask[])) {
          return true
        }
      }
    }
    return false
  }
  
  if (!findAndUpdateTask(initialDevTasks.tasks)) {
    throw new Error("Task not found")
  }
  
  return fetchDevTask(id)
}

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: task, isLoading, error } = useQuery({
    queryKey: ["dev-task", id],
    queryFn: () => fetchDevTask(id),
  })

  // Handle 404 for missing tasks
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !task) {
      notFound()
    }
  }, [error, isLoading, task])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Form Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
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

  return (
    <div className="space-y-6">
      <DevTaskForm task={task} onSubmit={async (data) => { await updateTask(id, data) }} />
    </div>
  )
}

