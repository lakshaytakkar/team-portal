"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DevelopmentProjectsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to projects page with development filter
    router.push("/projects?department=development")
  }, [router])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
          Development Projects
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Development projects and roadmap
        </p>
      </div>
      
      <div className="flex items-center justify-center h-64 border border-border rounded-2xl bg-muted/20">
        <div className="text-center">
          <p className="text-base font-medium text-muted-foreground mb-2">
            Redirecting...
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to Projects page with development filter
          </p>
        </div>
      </div>
    </div>
  )
}

