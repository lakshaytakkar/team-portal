"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { canViewAllLeaveRequests } from "@/lib/utils/permissions"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaveRequestsRedirectPage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/sign-in")
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
  }, [user, isLoading, router])

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

