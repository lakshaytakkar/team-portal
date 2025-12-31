"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getEmployeeById, updateEmployee, getDepartments, getManagers, getVerticals, getRoles } from "@/lib/actions/hr"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { EditEmployeeDialog } from "@/components/hr/EditEmployeeDialog"
import { useState } from "react"

async function fetchEmployee(id: string) {
  const employee = await getEmployeeById(id)
  if (!employee) throw new Error("Employee not found")
  return employee
}

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const employeeId = params.id as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(true)

  const { data: employee, isLoading, error, refetch } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => fetchEmployee(employeeId),
  })

  const handleDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) {
      // Navigate back to detail page when dialog closes
      router.push(`/hr/employees/${employeeId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-full" />
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load employee"
        message="We couldn't load this employee. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!employee) {
    return (
      <ErrorState
        title="Employee Not Found"
        message={`The employee with ID "${employeeId}" could not be found.`}
        onRetry={() => router.push("/hr/employees")}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/hr/employees/${employeeId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Edit Employee</h1>
          <p className="text-sm text-muted-foreground">{employee.fullName}</p>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditEmployeeDialog
        open={isEditDialogOpen}
        onOpenChange={handleDialogClose}
        employeeId={employeeId}
      />
    </div>
  )
}

