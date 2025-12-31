"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
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
  DepartmentReport,
  DepartmentReportType,
  CreateDepartmentReportInput,
  UpdateDepartmentReportInput,
} from "@/lib/types/department-reports"
import {
  createDepartmentReport,
  updateDepartmentReport,
  getDepartmentReport,
} from "@/lib/actions/department-reports"
import { getDepartments } from "@/lib/actions/hr"
import { getDailyReportCategories } from "@/lib/actions/daily-reports"
import { useUserContext } from "@/lib/providers/UserContextProvider"

interface CreateDepartmentReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId?: string
  departmentId?: string
  reportDate?: string
}

export function CreateDepartmentReportDialog({
  open,
  onOpenChange,
  reportId,
  departmentId: initialDepartmentId,
  reportDate: initialReportDate,
}: CreateDepartmentReportDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUserContext()

  const [formData, setFormData] = useState({
    departmentId: initialDepartmentId || "",
    categoryId: "",
    reportDate: initialReportDate || new Date().toISOString().split('T')[0],
    reportType: "aggregated" as DepartmentReportType,
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch existing report if editing
  const { data: existingReport } = useQuery({
    queryKey: ["department-report", reportId],
    queryFn: () => getDepartmentReport(reportId!),
    enabled: !!reportId && open,
  })

  // Fetch departments and categories
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: open,
  })

  const { data: categories } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: getDailyReportCategories,
    enabled: open,
  })

  // Update form when existing report loads
  useEffect(() => {
    if (existingReport) {
      setFormData({
        departmentId: existingReport.departmentId,
        categoryId: existingReport.categoryId || "",
        reportDate: existingReport.reportDate,
        reportType: existingReport.reportType,
        notes: existingReport.notes || "",
      })
    } else if (open && !reportId) {
      // Reset form for new report
      setFormData({
        departmentId: initialDepartmentId || "",
        categoryId: "",
        reportDate: initialReportDate || new Date().toISOString().split('T')[0],
        reportType: "aggregated",
        notes: "",
      })
    }
  }, [existingReport, open, reportId, initialDepartmentId, initialReportDate])

  // Auto-fill user's department if not superadmin
  useEffect(() => {
    if (open && !reportId && !user?.isSuperadmin && user?.departmentId) {
      setFormData(prev => ({
        ...prev,
        departmentId: user.departmentId || prev.departmentId,
      }))
    }
  }, [open, reportId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!formData.departmentId) {
      setErrors({ departmentId: "Department is required" })
      return
    }

    if (!formData.reportDate) {
      setErrors({ reportDate: "Report date is required" })
      return
    }

    setIsSubmitting(true)

    try {
      if (reportId && existingReport) {
        // Update existing report
        const input: UpdateDepartmentReportInput = {
          categoryId: formData.categoryId || undefined,
          reportDate: formData.reportDate,
          reportType: formData.reportType,
          notes: formData.notes || undefined,
        }

        await updateDepartmentReport(reportId, input)
        toast.success("Department report updated successfully")
      } else {
        // Create new report
        const input: CreateDepartmentReportInput = {
          departmentId: formData.departmentId,
          categoryId: formData.categoryId || undefined,
          reportDate: formData.reportDate,
          reportType: formData.reportType,
          notes: formData.notes || undefined,
          status: "draft",
        }

        const newReport = await createDepartmentReport(input)
        toast.success("Department report created successfully")
        
        // Navigate to the new report
        router.push(`/daily-reporting/department/${newReport.id}`)
      }

      queryClient.invalidateQueries({ queryKey: ["department-reports"] })
      queryClient.invalidateQueries({ queryKey: ["department-report-stats"] })
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save department report", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      departmentId: initialDepartmentId || "",
      categoryId: "",
      reportDate: initialReportDate || new Date().toISOString().split('T')[0],
      reportType: "aggregated",
      notes: "",
    })
    setErrors({})
    onOpenChange(false)
  }

  const canEditDepartment = user?.isSuperadmin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>
            {reportId ? "Edit Department Report" : "Create Department Report"}
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
                disabled={!canEditDepartment}
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
                  <SelectItem value="">No Category</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Report Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Report Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.reportDate}
                onChange={(e) =>
                  setFormData({ ...formData, reportDate: e.target.value })
                }
                className={cn(
                  "h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]",
                  errors.reportDate && "border-destructive"
                )}
                required
              />
              {errors.reportDate && (
                <p className="text-sm text-destructive">{errors.reportDate}</p>
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
                  setFormData({ ...formData, reportType: value as DepartmentReportType })
                }
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggregated">
                    Aggregated (from individual reports)
                  </SelectItem>
                  <SelectItem value="separate">
                    Separate (independent department report)
                  </SelectItem>
                  <SelectItem value="hybrid">
                    Hybrid (both aggregated and separate)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.reportType === "aggregated" &&
                  "Automatically compiled from individual employee reports"}
                {formData.reportType === "separate" &&
                  "Independent report submitted separately"}
                {formData.reportType === "hybrid" &&
                  "Combines aggregated data with additional separate information"}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Notes
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any additional notes or comments..."
                rows={4}
                className="rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              />
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
                : reportId
                ? "Update Report"
                : "Create Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


