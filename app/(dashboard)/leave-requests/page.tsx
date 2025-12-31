"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { canViewAllLeaveRequests } from "@/lib/utils/permissions"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaveRequestsRedirectPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return
    
    // If still loading, wait
    if (isLoading) return

    // Timeout fallback - redirect after 3 seconds if still loading
    const timeoutId = setTimeout(() => {
      if (isLoading && !hasRedirected) {
        // Default to my-leave-requests if still loading after timeout
        router.replace("/my-leave-requests")
        setHasRedirected(true)
      }
    }, 3000)
    
    if (isLoading) {
      return () => clearTimeout(timeoutId)
    }

    if (!user) {
      router.replace("/sign-in")
      setHasRedirected(true)
      clearTimeout(timeoutId)
      return
    }

    // Determine redirect based on role and permissions
    const canViewAll = canViewAllLeaveRequests(user.role, user.department)
    
    if (user.role === 'superadmin' || user.department?.toLowerCase() === 'hr') {
      // HR/SuperAdmin → HR management page
      router.replace("/hr/leave-requests")
    } else if (user.role === 'manager') {
      // Manager → Manager team page
      router.replace("/manager/leave-requests")
    } else {
      // Executive → Personal page
      router.replace("/my-leave-requests")
    }
    setHasRedirected(true)
    clearTimeout(timeoutId)
  }, [user, isLoading, router, hasRedirected])

  // Show loading state while determining redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}

