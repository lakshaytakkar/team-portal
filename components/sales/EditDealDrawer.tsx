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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { Deal, DealStage } from "@/lib/types/sales"
import { updateDeal } from "@/lib/actions/sales"
import { getAssignableUsers } from "@/lib/actions/sales"

interface EditDealDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal | null
}

export function EditDealDrawer({ open, onOpenChange, deal }: EditDealDrawerProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    stage: "prospecting" as DealStage,
    probability: "0",
    closeDate: "",
    assignedTo: "",
  })

  const { data: profiles } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
    enabled: open,
  })

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name || "",
        value: deal.value?.toString() || "",
        stage: deal.stage,
        probability: deal.probability?.toString() || "0",
        closeDate: deal.expectedCloseDate || "",
        assignedTo: deal.assignedTo?.id || "",
      })
    }
  }, [deal])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => updateDeal(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal", deal?.id] })
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["all-deals"] })
      toast.success("Deal updated successfully", {
        description: `Deal **${formData.name || "Deal"}** has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update deal", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!deal) return
    
    if (!formData.name) {
      toast.error("Deal name is required")
      return
    }
    
    updateMutation.mutate({
      id: deal.id,
      input: {
        name: formData.name.trim(),
        value: formData.value ? Number(formData.value) : undefined,
        stage: formData.stage,
        probability: formData.probability ? Number(formData.probability) : undefined,
        closeDate: formData.closeDate || undefined,
        assignedTo: formData.assignedTo || undefined,
      },
    })
  }

  if (!deal) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col w-full sm:w-[540px]"
        hideCloseButton={true}
      >
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            Edit Deal
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
                Deal Name <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter deal name"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Value
              </Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter value"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Stage
              </Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as DealStage })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Probability (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                placeholder="Enter probability"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Expected Close Date
              </Label>
              <Input
                type="date"
                value={formData.closeDate}
                onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Assign To
              </Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
