"use client"

import { useState } from "react"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/sonner"
import { createLLCClient, getAssignableEmployees } from "@/lib/actions/llc-clients"
import type { CreateLLCClientInput, LLCServicePlan } from "@/lib/types/llc-clients"

interface CreateLLCClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLLCClientDialog({ open, onOpenChange }: CreateLLCClientDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: employees = [] } = useQuery({
    queryKey: ["assignable-employees"],
    queryFn: getAssignableEmployees,
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLLCClientInput>({
    defaultValues: {
      plan: "elite",
      websiteIncluded: true,
      currency: "INR",
      amountReceived: 0,
      remainingPayment: 0,
    },
  })

  const plan = watch("plan")
  const websiteIncluded = watch("websiteIncluded")

  const onSubmit = async (data: CreateLLCClientInput) => {
    setIsSubmitting(true)
    try {
      await createLLCClient(data)
      toast.success("Client created successfully")
      queryClient.invalidateQueries({ queryKey: ["llc-clients"] })
      queryClient.invalidateQueries({ queryKey: ["llc-client-stats"] })
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create client")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New LLC Client</DialogTitle>
          <DialogDescription>
            Create a new LLC formation client for Legal Nations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="Full name"
                {...register("clientName", { required: "Client name is required" })}
              />
              {errors.clientName && (
                <p className="text-xs text-destructive">{errors.clientName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCode">Client Code</Label>
              <Input
                id="clientCode"
                placeholder="Auto-generated if empty"
                {...register("clientCode")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@email.com"
                {...register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91 XXXXX XXXXX"
                {...register("phone")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="India"
                {...register("country")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="llcName">LLC Name</Label>
              <Input
                id="llcName"
                placeholder="Company LLC"
                {...register("llcName")}
              />
            </div>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Plan *</Label>
              <Select
                value={plan}
                onValueChange={(value) => {
                  setValue("plan", value as LLCServicePlan)
                  if (value === "llc") {
                    setValue("websiteIncluded", false)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elite">Elite (LLC + Website)</SelectItem>
                  <SelectItem value="llc">LLC Basic (LLC Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Website Included</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={websiteIncluded}
                  onCheckedChange={(checked) => setValue("websiteIncluded", checked)}
                  disabled={plan === "llc"}
                />
                <span className="text-sm text-muted-foreground">
                  {websiteIncluded ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Amount Received</Label>
              <Input
                id="amountReceived"
                type="number"
                placeholder="0"
                {...register("amountReceived", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remainingPayment">Remaining</Label>
              <Input
                id="remainingPayment"
                type="number"
                placeholder="0"
                {...register("remainingPayment", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select
              onValueChange={(value) => setValue("assignedToId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={3}
              {...register("notes")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
