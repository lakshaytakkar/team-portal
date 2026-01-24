"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DevelopmentTasksPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to tasks page with development filter
    router.push("/tasks?department=development")
  }, [router])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
          Development Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Development tasks and issues
        </p>
      </div>
      
      <div className="flex items-center justify-center h-64 border border-border rounded-2xl bg-muted/20">
        <div className="text-center">
          <p className="text-base font-medium text-muted-foreground mb-2">
            Redirecting...
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to Tasks page with development filter
          </p>
        </div>
      </div>
    </div>
  )
}

