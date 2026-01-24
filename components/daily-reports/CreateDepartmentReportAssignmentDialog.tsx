"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import type {
  DepartmentReportAssignment,
  CreateDepartmentReportAssignmentInput,
  UpdateDepartmentReportAssignmentInput,
} from "@/lib/types/department-reports"
import {
  createDepartmentReportAssignment,
  updateDepartmentReportAssignment,
} from "@/lib/actions/department-reports"
import { getDepartments } from "@/lib/actions/hr"
import { getDailyReportCategories } from "@/lib/actions/daily-reports"
import { getAssignableUsers } from "@/lib/actions/daily-reports"

interface CreateDepartmentReportAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment?: DepartmentReportAssignment | null
}

export function CreateDepartmentReportAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}: CreateDepartmentReportAssignmentDialogProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    departmentId: "",
    categoryId: "",
    assignedUserId: "",
    reportType: "both" as "aggregated" | "separate" | "both",
    submissionDeadlineTime: "18:00:00",
    timezone: "UTC",
    isActive: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch departments, categories, and users
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    enabled: open,
  })

  const { data: categories } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: () => getDailyReportCategories(),
    enabled: open,
  })

  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: () => getAssignableUsers(),
    enabled: open,
  })

  // Update form when assignment loads
  useEffect(() => {
    if (assignment) {
      setFormData({
        departmentId: assignment.departmentId,
        categoryId: assignment.categoryId || "",
        assignedUserId: assignment.assignedUserId,
        reportType: assignment.reportType,
        submissionDeadlineTime: assignment.submissionDeadlineTime,
        timezone: assignment.timezone,
        isActive: assignment.isActive,
      })
    } else if (open && !assignment) {
      // Reset form for new assignment
      setFormData({
        departmentId: "",
        categoryId: "",
        assignedUserId: "",
        reportType: "both",
        submissionDeadlineTime: "18:00:00",
        timezone: "UTC",
        isActive: true,
      })
    }
  }, [assignment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!formData.departmentId) {
      setErrors({ departmentId: "Department is required" })
      return
    }

    if (!formData.assignedUserId) {
      setErrors({ assignedUserId: "Assigned user is required" })
      return
    }

    setIsSubmitting(true)

    try {
      if (assignment) {
        // Update existing assignment
        const input: UpdateDepartmentReportAssignmentInput = {
          assignedUserId: formData.assignedUserId,
          reportType: formData.reportType,
          submissionDeadlineTime: formData.submissionDeadlineTime,
          timezone: formData.timezone,
          isActive: formData.isActive,
        }

        await updateDepartmentReportAssignment(assignment.id, input)
        toast.success("Assignment updated successfully")
      } else {
        // Create new assignment
        const input: CreateDepartmentReportAssignmentInput = {
          departmentId: formData.departmentId,
          categoryId: formData.categoryId || undefined,
          assignedUserId: formData.assignedUserId,
          reportType: formData.reportType,
          submissionDeadlineTime: formData.submissionDeadlineTime,
          timezone: formData.timezone,
          isActive: formData.isActive,
        }

        await createDepartmentReportAssignment(input)
        toast.success("Assignment created successfully")
      }

      queryClient.invalidateQueries({ queryKey: ["department-report-assignments"] })
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save assignment", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      departmentId: "",
      categoryId: "",
      assignedUserId: "",
      reportType: "both",
      submissionDeadlineTime: "18:00:00",
      timezone: "UTC",
      isActive: true,
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>
            {assignment ? "Edit Assignment" : "Create Assignment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {/* Department */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Department <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, departmentId: value })
                }
                disabled={!!assignment}
              >
                <SelectTrigger
                  className={cn(
                    "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                    errors.departmentId && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-sm text-destructive">{errors.departmentId}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Category
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned User */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Assigned User <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.assignedUserId}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedUserId: value })
                }
              >
                <SelectTrigger
                  className={cn(
                    "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                    errors.assignedUserId && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedUserId && (
                <p className="text-sm text-destructive">{errors.assignedUserId}</p>
              )}
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Report Type <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) =>
                  setFormData({ ...formData, reportType: value as "aggregated" | "separate" | "both" })
                }
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggregated">Aggregated Only</SelectItem>
                  <SelectItem value="separate">Separate Only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deadline Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Submission Deadline Time <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="time"
                value={formData.submissionDeadlineTime}
                onChange={(e) =>
                  setFormData({ ...formData, submissionDeadlineTime: e.target.value + ":00" })
                }
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Time of day when the report is due (e.g., 18:00 for 6 PM)
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Timezone <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Mumbai (IST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Status
              </Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "active" })
                }
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 flex-shrink-0 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : assignment
                ? "Update Assignment"
                : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}









