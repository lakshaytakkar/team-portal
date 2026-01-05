"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { Quotation, QuotationStatus } from "@/lib/types/sales"
import { updateQuotation } from "@/lib/actions/sales"

interface EditQuotationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotation: Quotation | null
}

export function EditQuotationDrawer({ open, onOpenChange, quotation }: EditQuotationDrawerProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    quotationNumber: "",
    amount: "",
    status: "draft" as QuotationStatus,
    validUntil: "",
  })

  useEffect(() => {
    if (quotation) {
      setFormData({
        quotationNumber: quotation.quotationNumber || "",
        amount: quotation.amount?.toString() || "",
        status: quotation.status,
        validUntil: quotation.validUntil || "",
      })
    }
  }, [quotation])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => updateQuotation(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotation", quotation?.id] })
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
      queryClient.invalidateQueries({ queryKey: ["all-quotations"] })
      toast.success("Quotation updated successfully", {
        description: `Quotation **${formData.quotationNumber || "Quotation"}** has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update quotation", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quotation) return
    
    if (!formData.quotationNumber || !formData.amount) {
      toast.error("Quotation number and amount are required")
      return
    }
    
    updateMutation.mutate({
      id: quotation.id,
      input: {
        quotationNumber: formData.quotationNumber.trim(),
        amount: Number(formData.amount),
        status: formData.status,
        validUntil: formData.validUntil || undefined,
      },
    })
  }

  if (!quotation) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col w-full sm:w-[540px]"
        hideCloseButton={true}
      >
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            Edit Quotation
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
                Quotation Number <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.quotationNumber}
                onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                placeholder="Enter quotation number"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

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
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as QuotationStatus })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Valid Until
              </Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
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




