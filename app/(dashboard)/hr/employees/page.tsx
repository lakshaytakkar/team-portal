"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  Users,
  UserCheck,
  Clock,
  LayoutGrid,
  LayoutList,
  Mail,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Employee } from "@/lib/types/hr"
import { getEmployees } from "@/lib/actions/hr"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateEmployeeDialog } from "@/components/hr/CreateEmployeeDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchEmployees() {
  return await getEmployees()
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  "on-leave": { label: "On Leave", variant: "secondary" },
  terminated: { label: "Terminated", variant: "outline" },
  resigned: { label: "Resigned", variant: "outline" },
}

const roleTypeConfig: Record<string, { label: string; className: string }> = {
  client_facing: { label: "Client-facing", className: "bg-blue-100 text-blue-700 border-blue-200" },
  internal: { label: "Internal", className: "bg-gray-100 text-gray-700 border-gray-200" },
  hybrid: { label: "Hybrid", className: "bg-purple-100 text-purple-700 border-purple-200" },
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

function EmployeeCard({ employee }: { employee: Employee }) {
  const status = statusConfig[employee.status] || statusConfig.active
  const roleType = roleTypeConfig[employee.roleType] || roleTypeConfig.internal

  return (
    <Link href={`/hr/employees/${employee.id}`}>
      <Card className="border border-border rounded-2xl hover:border-primary transition-colors bg-white group">
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar Thumbnail */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border group-hover:border-primary transition-colors">
                <AvatarImage 
                  src={employee.avatar || getAvatarForUser(employee.id)} 
                  alt={employee.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-semibold bg-muted">
                  {employee.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className={cn(
                "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center",
                status.variant === "default" && "bg-green-500",
                status.variant === "secondary" && "bg-yellow-500",
                status.variant === "outline" && "bg-gray-400"
              )}>
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Name and Title */}
            <div className="space-y-1 w-full">
              <h3 className="text-base font-semibold text-foreground leading-6 tracking-[0.32px] truncate">
                {employee.fullName}
              </h3>
              <p className="text-sm font-medium text-muted-foreground leading-5 tracking-[0.28px] truncate">
                {employee.position}
              </p>
            </div>

            {/* Employee ID */}
            <div className="w-full">
              <span className="text-xs text-muted-foreground font-medium leading-4 tracking-[0.24px]">
                ID: {employee.employeeId}
              </span>
            </div>

            {/* Department Badge */}
            <Badge variant="primary" className="h-5 px-2.5 py-0.5 rounded-2xl text-xs font-medium">
              {employee.department}
            </Badge>

            {/* Metadata */}
            <div className="w-full space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Hired {new Date(employee.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Role Type */}
            <div className="w-full pt-2 border-t border-border">
              <span className={cn(
                "inline-flex items-center h-5 px-2 py-0.5 rounded-2xl text-xs font-medium border",
                roleType.className
              )}>
                {roleType.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HREmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border rounded-2xl p-[18px] bg-white">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <Card className="border border-border rounded-[14px]">
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
        title="Failed to load employees"
        message="We couldn't load employees. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredEmployees = employees?.filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const activeCount = employees?.filter(e => e.status === "active").length || 0
  const totalCount = employees?.length || 0
  const onLeaveCount = employees?.filter(e => e.status === "on-leave").length || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Employees</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage employee information and records</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Employees" value={totalCount.toString()} icon={Users} />
        <StatCard title="Active" value={activeCount.toString()} icon={UserCheck} />
        <StatCard title="On Leave" value={onLeaveCount.toString()} icon={Clock} />
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="bg-muted p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-9 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors flex items-center gap-2",
                  viewMode === "table"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground font-medium hover:text-foreground"
                )}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "h-9 px-4 py-0 rounded-[10px] text-sm font-semibold leading-5 tracking-[0.28px] transition-colors flex items-center gap-2",
                  viewMode === "cards"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground font-medium hover:text-foreground"
                )}
                title="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
            <Button variant="outline" size="default" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsCreateEmployeeOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Employee
            </Button>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="w-[200px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Employee</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Employee ID</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Department</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Role Type</span>
                  </TableHead>
                  <TableHead className="w-[144px] px-3">
                    <span className="text-sm font-medium text-muted-foreground">Hire Date</span>
                  </TableHead>
                  <TableHead className="px-3">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                  </TableHead>
                  <TableHead className="w-[44px] px-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const status = statusConfig[employee.status] || statusConfig.active
                    return (
                      <TableRow key={employee.id} className="border-b border-border">
                        <TableCell className="px-3">
                          <Link href={`/hr/employees/${employee.id}`} className="flex items-center gap-2.5 hover:underline">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={employee.avatar || getAvatarForUser(employee.id)} alt={employee.fullName} />
                              <AvatarFallback className="text-xs">
                                {employee.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{employee.fullName}</span>
                              <span className="text-xs text-muted-foreground">{employee.email}</span>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{employee.employeeId}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge variant="primary" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {employee.department}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{employee.position}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          {(() => {
                            const roleType = roleTypeConfig[employee.roleType] || roleTypeConfig.internal
                            return (
                              <span className={cn("inline-flex items-center h-5 px-2 py-0.5 rounded-2xl text-xs font-medium border", roleType.className)}>
                                {roleType.label}
                              </span>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">
                            {new Date(employee.hireDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          <RowActionsMenu
                            entityType="employee"
                            entityId={employee.id}
                            entityName={employee.fullName}
                            detailUrl={`/hr/employees/${employee.id}`}
                            canView={true}
                            canEdit={true}
                            canDelete={false}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24">
                      <EmptyState
                        icon={Users}
                        title="No employees yet"
                        description="Get started by adding your first employee."
                        action={{
                          label: "Add Employee",
                          onClick: () => setIsCreateEmployeeOpen(true),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5">
            {filteredEmployees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredEmployees.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            ) : (
              <div className="py-12">
                <EmptyState
                  icon={Users}
                  title="No employees yet"
                  description="Get started by adding your first employee."
                  action={{
                    label: "Add Employee",
                    onClick: () => setIsCreateEmployeeOpen(true),
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <CreateEmployeeDialog open={isCreateEmployeeOpen} onOpenChange={setIsCreateEmployeeOpen} />
    </div>
  )
}
