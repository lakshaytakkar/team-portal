"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createUser } from "@/lib/actions/admin"
import { getDepartments, getManagers } from "@/lib/actions/hr"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NONE_VALUE = "__none__"

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", role: "", departmentId: "",
    phone: "", managerId: "", startDate: "", status: "active",
  })

  // Fetch departments and managers
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: open,
  })

  const { data: managers = [] } = useQuery({
    queryKey: ["managers"],
    queryFn: getManagers,
    enabled: open,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      await createUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role as "executive" | "manager" | "superadmin",
        departmentId: formData.departmentId && formData.departmentId !== NONE_VALUE ? formData.departmentId : null,
        phone: formData.phone || null,
        managerId: formData.managerId && formData.managerId !== NONE_VALUE ? formData.managerId : null,
      })

      toast.success("User created successfully", { description: `User **${formData.fullName}** has been added`, duration: 3000 })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      onOpenChange(false)
      setFormData({ fullName: "", email: "", password: "", role: "", departmentId: "", phone: "", managerId: "", startDate: "", status: "active" })
    } catch (error) {
      toast.error("Failed to create user", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Full Name <span className="text-[#df1c41]">*</span></Label><Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter full name" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Email <span className="text-[#df1c41]">*</span></Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Password <span className="text-[#df1c41]">*</span></Label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" required /></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Role <span className="text-[#df1c41]">*</span></Label><Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="executive">Executive</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="superadmin">SuperAdmin</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Department</Label><Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent><SelectItem value={NONE_VALUE}>None</SelectItem>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent></Select></div>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="additional"><AccordionTrigger className="text-sm font-medium text-[#666d80]">Additional Information</AccordionTrigger><AccordionContent className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Phone</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone" className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Manager</Label><Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select manager" /></SelectTrigger><SelectContent><SelectItem value={NONE_VALUE}>None</SelectItem>{managers.map((manager) => (<SelectItem key={manager.id} value={manager.id}>{manager.full_name || manager.email}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Status</Label><Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}><SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            </AccordionContent></AccordionItem></Accordion>
          </div>
          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={() => onOpenChange(false)} variant="outline" size="md" className="w-[128px]" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" size="md" className="w-[128px]" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Add User"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



