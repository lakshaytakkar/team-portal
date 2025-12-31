"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Trash2, Edit, Users, Clock } from "lucide-react"
import type { DepartmentReportAssignment } from "@/lib/types/department-reports"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import {
  getDepartmentReportAssignments,
  deleteDepartmentReportAssignment,
} from "@/lib/actions/department-reports"
import { getDepartments } from "@/lib/actions/hr"
import { getDailyReportCategories } from "@/lib/actions/daily-reports"
import { useUser } from "@/lib/hooks/useUser"
import { CreateDepartmentReportAssignmentDialog } from "@/components/daily-reports/CreateDepartmentReportAssignmentDialog"

export default function DepartmentReportAssignmentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<DepartmentReportAssignment | null>(null)

  const { data: assignments, isLoading, error, refetch } = useQuery({
    queryKey: ["department-report-assignments", departmentFilter],
    queryFn: () => getDepartmentReportAssignments(departmentFilter !== "all" ? departmentFilter : undefined),
    enabled: !userLoading && !!user,
  })

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: !userLoading && !!user,
  })

  const { data: categories } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: getDailyReportCategories,
    enabled: !userLoading && !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDepartmentReportAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-report-assignments"] })
      toast.success("Assignment deleted successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete assignment", {
        description: error.message,
      })
    },
  })

  const handleEdit = (assignment: DepartmentReportAssignment) => {
    setEditingAssignment(assignment)
    setIsCreateOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const filteredAssignments = useMemo(() => {
    if (!assignments) return []
    if (!searchQuery.trim()) return assignments

    const query = searchQuery.toLowerCase()
    return assignments.filter(
      (assignment) =>
        assignment.department?.name?.toLowerCase().includes(query) ||
        assignment.assignedUser?.name?.toLowerCase().includes(query) ||
        assignment.assignedUser?.email?.toLowerCase().includes(query) ||
        assignment.category?.name?.toLowerCase().includes(query)
    )
  }, [assignments, searchQuery])

  if (userLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load assignments"
        message="We couldn't load department report assignments. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Department Report Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage who is responsible for submitting department reports
          </p>
        </div>
        <Button onClick={() => {
          setEditingAssignment(null)
          setIsCreateOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments && filteredAssignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned User</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.department?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {assignment.category ? (
                        <Badge variant="outline">{assignment.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">All Categories</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {assignment.assignedUser?.name || 'Unknown'}
                          </p>
                          {assignment.assignedUser?.email && (
                            <p className="text-xs text-muted-foreground">
                              {assignment.assignedUser.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.reportType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{assignment.submissionDeadlineTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {assignment.timezone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        entityType="department-report-assignment"
                        entityId={assignment.id}
                        entityName={`Assignment for ${assignment.department?.name || 'Unknown'}`}
                        onEdit={() => handleEdit(assignment)}
                        onDelete={() => handleDelete(assignment.id)}
                        canView={false}
                        canEdit={true}
                        canDelete={true}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Users}
              title="No assignments found"
              description="Create your first assignment to get started."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <CreateDepartmentReportAssignmentDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) {
            setEditingAssignment(null)
          }
        }}
        assignment={editingAssignment}
      />
    </div>
  )
}


