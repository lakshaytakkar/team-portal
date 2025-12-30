"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { assignAsset } from "@/lib/actions/assets"
import { getEmployees } from "@/lib/actions/hr"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

interface AssignAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  assetName: string
}

export function AssignAssetDialog({ open, onOpenChange, assetId, assetName }: AssignAssetDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    assignedDate: new Date().toISOString().split('T')[0],
    notes: "",
  })

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: open,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employeeId) {
      toast.error("Employee required", {
        description: "Please select an employee",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await assignAsset(assetId, formData.employeeId, formData.assignedDate)

      await queryClient.invalidateQueries({ queryKey: ["assets"] })

      toast.success("Asset assigned successfully", {
        description: `${assetName} has been assigned`,
        duration: 3000,
      })
      onOpenChange(false)
      // Reset form
      setFormData({
        employeeId: "",
        assignedDate: new Date().toISOString().split('T')[0],
        notes: "",
      })
    } catch (error) {
      console.error("Error assigning asset:", error)
      toast.error("Failed to assign asset", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      employeeId: "",
      assignedDate: new Date().toISOString().split('T')[0],
      notes: "",
    })
    onOpenChange(false)
  }

  const selectedEmployee = employees.find((emp) => emp.id === formData.employeeId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Assign Asset</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{assetName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Employee <span className="text-[#df1c41]">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                disabled={employeesLoading}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder={employeesLoading ? "Loading employees..." : "Select employee"} />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((emp) => emp.status === 'active')
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={employee.avatar || getAvatarForUser(employee.id)} alt={employee.fullName} />
                            <AvatarFallback className="text-xs">
                              {employee.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.fullName} ({employee.employeeId})</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedEmployee && (
                <div className="mt-2 p-3 rounded-lg bg-muted flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedEmployee.avatar || getAvatarForUser(selectedEmployee.id)} alt={selectedEmployee.fullName} />
                    <AvatarFallback>
                      {selectedEmployee.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedEmployee.fullName}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmployee.email} • {selectedEmployee.department}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Assignment Date <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                type="date"
                value={formData.assignedDate}
                onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Notes (Optional)
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any notes about this assignment"
                className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={handleCancel} variant="outline" size="md" className="w-[128px]">
              Cancel
            </Button>
            <Button type="submit" size="md" className="w-[128px]" disabled={isSubmitting || !formData.employeeId}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Assigning...</> : "Assign Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

