"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Phone, Briefcase, Building2, Calendar, User, Users, Edit } from "lucide-react"
import { Employee, EmployeeStatus } from "@/lib/types/hr"
import { getEmployeeById, getEmployees, getPositions } from "@/lib/actions/hr"
import { ErrorState } from "@/components/ui/error-state"
import { DetailPageHeader, DetailQuickTile, DetailTabs } from "@/components/details"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { EmployeePositions } from "@/components/hr/EmployeePositions"
import { EmployeeDocuments } from "@/components/hr/EmployeeDocuments"
import { EmployeeAssets } from "@/components/hr/EmployeeAssets"

const statusConfig: Record<EmployeeStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  "on-leave": { label: "On Leave", variant: "secondary" },
  terminated: { label: "Terminated", variant: "outline" },
  resigned: { label: "Resigned", variant: "outline" },
}

async function fetchEmployee(id: string) {
  const employee = await getEmployeeById(id)
  if (!employee) throw new Error("Employee not found")
  return employee
}

async function fetchAllEmployees() {
  return await getEmployees()
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { data: employee, isLoading, error, refetch } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => fetchEmployee(employeeId),
  })

  const { data: allEmployees } = useQuery({
    queryKey: ["all-employees"],
    queryFn: fetchAllEmployees,
  })

  // Handle 404 for missing employees - less aggressive
  useEffect(() => {
    // Only log warning, don't call notFound immediately
    if (!isLoading && !error && !employee) {
      console.warn('Employee not found:', employeeId)
    }
  }, [error, isLoading, employee, employeeId])

  const navigation = useDetailNavigation({
    currentId: employeeId,
    items: allEmployees || [],
    getId: (e) => e.id,
    basePath: "/hr/employees",
    onNavigate: (id) => {
      router.push(`/hr/employees/${id}`)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-32 w-full" />
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

  if (!isLoading && !employee) {
    return (
      <ErrorState
        title="Employee Not Found"
        message={`The employee with ID "${employeeId}" could not be found. They may have been deleted or moved.`}
        onRetry={() => router.push("/hr/employees")}
      />
    )
  }

  if (!employee) {
    return null
  }

  const statusBadge = statusConfig[employee.status]

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "HR", href: "/hr/employees" },
    { label: "Employees", href: "/hr/employees" },
    { label: employee.fullName },
  ]

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card className="border border-border rounded-2xl">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Contact Information</span>
                </div>
                <div className="pl-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`mailto:${employee.email}`} className="text-sm text-primary hover:text-primary/80">
                      {employee.email}
                    </a>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <a href={`tel:${employee.phone}`} className="text-sm text-primary hover:text-primary/80">
                        {employee.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Position</h3>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-foreground font-medium">
                      {employee.primaryPosition?.role?.name || employee.role?.name || employee.position}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Department</h3>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="primary" className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
                      {employee.primaryPosition?.team?.department?.name || employee.team?.department?.name || employee.department}
                    </Badge>
                  </div>
                </div>
                {employee.primaryPosition?.team?.vertical && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Vertical</h3>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
                        {employee.primaryPosition.team.vertical.name}
                      </Badge>
                    </div>
                  </div>
                )}
                {employee.primaryPosition?.team && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Team</h3>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
                        {employee.primaryPosition.team.name}
                      </Badge>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Status</h3>
                  <Badge variant={statusBadge.variant} className="h-6 px-2.5 py-0.5 rounded-2xl text-sm font-medium">
                    {statusBadge.label}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Hire Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {new Date(employee.hireDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {employee.manager && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Manager</span>
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={employee.manager.avatar || getAvatarForUser(employee.manager.id)}
                          alt={employee.manager.name}
                        />
                        <AvatarFallback className="text-xs">
                          {employee.manager.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground font-medium">{employee.manager.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "positions",
      label: "Positions",
      content: (
        <div className="space-y-6">
          <EmployeePositions employeeId={employeeId} />
        </div>
      ),
    },
    {
      id: "documents",
      label: "Documents",
      content: (
        <div className="space-y-6">
          <EmployeeDocuments employeeId={employeeId} />
        </div>
      ),
    },
    {
      id: "assets",
      label: "Assigned Assets",
      content: (
        <div className="space-y-6">
          <EmployeeAssets employeeId={employeeId} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <DetailPageHeader
        breadcrumbs={breadcrumbs}
        onBack={() => router.push("/hr/employees")}
        onNext={navigation.navigateNext}
        onPrev={navigation.navigatePrev}
        hasNext={navigation.hasNext}
        hasPrev={navigation.hasPrev}
      />

      {/* Quick Tile */}
      <DetailQuickTile
        thumbnail={
          <Avatar className="w-full h-full">
            <AvatarImage src={employee.avatar || getAvatarForUser(employee.id)} alt={employee.fullName} />
            <AvatarFallback>
              {employee.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        }
        title={employee.fullName}
        subtitle={employee.position}
        status={statusBadge}
        metadata={[
          {
            label: "Employee ID",
            value: employee.employeeId,
          },
          {
            label: "Department",
            value: (
              <Badge variant="primary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {employee.department}
              </Badge>
            ),
          },
          {
            label: "Hire Date",
            value: new Date(employee.hireDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
        ]}
        actions={
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Button>
        }
      />

      {/* Tabs */}
      <DetailTabs tabs={tabs} />
    </div>
  )
}
