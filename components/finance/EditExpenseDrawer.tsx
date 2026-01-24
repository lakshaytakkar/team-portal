"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
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
import { X, Loader2 } from "lucide-react"
import { Expense, ExpenseStatus } from "@/lib/types/finance"
import { updateExpense } from "@/lib/actions/finance"
import { getAssignableUsers } from "@/lib/actions/tasks"

interface EditExpenseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
}

export function EditExpenseDrawer({ open, onOpenChange, expense }: EditExpenseDrawerProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    status: "pending" as ExpenseStatus,
    expenseDate: "",
    receiptUrl: "",
    notes: "",
    approvedById: "",
  })

  const { data: profiles } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
    enabled: open,
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount?.toString() || "",
        category: expense.category || "",
        status: expense.status,
        expenseDate: expense.date || "",
        receiptUrl: expense.receipt || "",
        notes: expense.notes || "",
        approvedById: expense.approvedBy?.id || "",
      })
    }
  }, [expense])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => updateExpense(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense", expense?.id] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      toast.success("Expense updated successfully", {
        description: `Expense **${formData.description || "Expense"}** has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update expense", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expense) return
    
    if (!formData.description || !formData.amount || !formData.category || !formData.expenseDate) {
      toast.error("Description, amount, category, and expense date are required")
      return
    }
    
    updateMutation.mutate({
      id: expense.id,
      input: {
        description: formData.description.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        status: formData.status,
        expenseDate: formData.expenseDate,
        receiptUrl: formData.receiptUrl || undefined,
        notes: formData.notes || undefined,
        approvedById: formData.status === 'approved' ? formData.approvedById : undefined,
      },
    })
  }

  if (!expense) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col w-full sm:w-[540px]"
        hideCloseButton={true}
      >
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            Edit Expense
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="border border-[#dfe1e7] rounded-full size-10 flex items-center justify-center hover:bg-[#f6f8fa] transition-colors shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
          >
            <X className="h-6 w-6 text-[#666d80]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Description <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Amount <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Category <span className="text-[#df1c41]">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ExpenseStatus })}
                >
                  <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Expense Date <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
                  required
                />
              </div>
            </div>

            {formData.status === 'approved' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Approved By
                </Label>
                <Select
                  value={formData.approvedById}
                  onValueChange={(value) => setFormData({ ...formData, approvedById: value })}
                >
                  <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Receipt URL
              </Label>
              <Input
                value={formData.receiptUrl}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                placeholder="Enter receipt URL"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Notes
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter notes"
                className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
              />
            </div>
          </div>

          <div className="border-t border-[#dfe1e7] h-[88px] flex items-center justify-end gap-3.5 px-6 shrink-0">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="md"
              className="w-[128px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              className="w-[128px]"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
