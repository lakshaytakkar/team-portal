"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { updateJobRole } from "@/lib/actions/recruitment"
import { getDepartments } from "@/lib/actions/hr"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { JobRole } from "@/lib/types/recruitment"

interface EditJobRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobRole: JobRole | null
}

export function EditJobRoleDialog({ open, onOpenChange, jobRole }: EditJobRoleDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    departmentId: "",
    description: "",
    requirements: "",
    status: "active" as "active" | "inactive" | "filled",
    experienceMinYears: "",
    experienceMaxYears: "",
    location: "",
    employmentType: "full-time" as "full-time" | "part-time" | "contract" | "internship",
    salaryMin: "",
    salaryMax: "",
    openings: "1",
    responsibilities: "",
    masterJd: "",
  })

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: open,
  })

  // Populate form when jobRole changes
  useEffect(() => {
    if (jobRole && departments.length > 0) {
      // Find department ID by name
      const department = departments.find((d) => d.name === jobRole.department)
      setFormData({
        title: jobRole.title || "",
        departmentId: department?.id || "",
        description: jobRole.description || "",
        requirements: jobRole.requirements || "",
        status: jobRole.status || "active",
        experienceMinYears: jobRole.experienceMinYears?.toString() || "",
        experienceMaxYears: jobRole.experienceMaxYears?.toString() || "",
        location: jobRole.location || "",
        employmentType: jobRole.employmentType || "full-time",
        salaryMin: jobRole.salaryMin?.toString() || "",
        salaryMax: jobRole.salaryMax?.toString() || "",
        openings: jobRole.openings?.toString() || "1",
        responsibilities: jobRole.responsibilities || "",
        masterJd: jobRole.masterJd || "",
      })
    }
  }, [jobRole, departments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobRole) return

    setIsSubmitting(true)
    try {
      await updateJobRole({
        id: jobRole.id,
        title: formData.title || undefined,
        departmentId: formData.departmentId || undefined,
        description: formData.description || undefined,
        requirements: formData.requirements || undefined,
        status: formData.status,
      })

      await queryClient.invalidateQueries({ queryKey: ["job-role", jobRole.id] })
      await queryClient.invalidateQueries({ queryKey: ["job-roles"] })
      toast.success("Job role updated", {
        description: `Job role ${formData.title} has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating job role:", error)
      toast.error("Failed to update job role", {
        description: error instanceof Error ? error.message : "An error occurred",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!jobRole) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "filled") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value: "full-time" | "part-time" | "contract" | "internship") =>
                  setFormData({ ...formData, employmentType: value })
                }
              >
                <SelectTrigger id="employmentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Job description..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Job requirements (one per line)..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Remote, New York, USA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Min Salary</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="e.g., 50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Max Salary</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="e.g., 80000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceMinYears">Min Experience (Years)</Label>
              <Input
                id="experienceMinYears"
                type="number"
                value={formData.experienceMinYears}
                onChange={(e) => setFormData({ ...formData, experienceMinYears: e.target.value })}
                placeholder="e.g., 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceMaxYears">Max Experience (Years)</Label>
              <Input
                id="experienceMaxYears"
                type="number"
                value={formData.experienceMaxYears}
                onChange={(e) => setFormData({ ...formData, experienceMaxYears: e.target.value })}
                placeholder="e.g., 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openings">Open Positions</Label>
            <Input
              id="openings"
              type="number"
              value={formData.openings}
              onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
              placeholder="1"
              min="1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

