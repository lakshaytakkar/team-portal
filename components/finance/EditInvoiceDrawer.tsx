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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Loader2, Plus, Trash2 } from "lucide-react"
import { Invoice, InvoiceStatus } from "@/lib/types/finance"
import { updateInvoice } from "@/lib/actions/finance"

interface EditInvoiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export function EditInvoiceDrawer({ open, onOpenChange, invoice }: EditInvoiceDrawerProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    amount: "",
    tax: "",
    total: "",
    status: "draft" as InvoiceStatus,
    issueDate: "",
    dueDate: "",
    paidDate: "",
    items: [] as InvoiceItem[],
    notes: "",
  })

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || "",
        clientName: invoice.clientName || "",
        clientEmail: invoice.clientEmail || "",
        clientAddress: "",
        amount: invoice.amount?.toString() || "",
        tax: invoice.tax?.toString() || "0",
        total: invoice.total?.toString() || "",
        status: invoice.status,
        issueDate: invoice.issueDate || "",
        dueDate: invoice.dueDate || "",
        paidDate: invoice.paidDate || "",
        items: invoice.items || [],
        notes: invoice.notes || "",
      })
    }
  }, [invoice])

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: any }) => updateInvoice(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice?.id] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["all-invoices"] })
      toast.success("Invoice updated successfully", {
        description: `Invoice **${formData.invoiceNumber || "Invoice"}** has been updated`,
        duration: 3000,
      })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update invoice", {
        description: error.message,
        duration: 5000,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoice) return
    
    if (!formData.invoiceNumber || !formData.clientName || !formData.clientEmail || !formData.amount || !formData.total) {
      toast.error("Invoice number, client name, client email, amount, and total are required")
      return
    }
    
    updateMutation.mutate({
      id: invoice.id,
      input: {
        invoiceNumber: formData.invoiceNumber.trim(),
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientAddress: formData.clientAddress || undefined,
        amount: Number(formData.amount),
        tax: formData.tax ? Number(formData.tax) : 0,
        total: Number(formData.total),
        status: formData.status,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        paidDate: formData.paidDate || undefined,
        items: formData.items,
        notes: formData.notes || undefined,
      },
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
    
    // Recalculate total
    const total = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = formData.tax ? Number(formData.tax) : 0
    setFormData(prev => ({ ...prev, items: newItems, amount: total.toString(), total: (total + tax).toString() }))
  }

  if (!invoice) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="p-0 flex flex-col w-full sm:w-[640px]"
        hideCloseButton={true}
      >
        <div className="border-b border-[#dfe1e7] h-[88px] flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold text-[#0d0d12] leading-[1.4] tracking-[0.36px]">
            Edit Invoice
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
                Invoice Number <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Enter invoice number"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Client Name <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Enter client name"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Client Email <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="Enter client email"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Client Address
              </Label>
              <Textarea
                value={formData.clientAddress}
                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                placeholder="Enter client address"
                className="min-h-[80px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Amount <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => {
                    const amount = e.target.value
                    const tax = formData.tax ? Number(formData.tax) : 0
                    setFormData({ ...formData, amount, total: (Number(amount) + tax).toString() })
                  }}
                  placeholder="0.00"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Tax
                </Label>
                <Input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => {
                    const tax = e.target.value
                    const amount = formData.amount ? Number(formData.amount) : 0
                    setFormData({ ...formData, tax, total: (amount + Number(tax)).toString() })
                  }}
                  placeholder="0.00"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Total <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="0.00"
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as InvoiceStatus })}
                >
                  <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Issue Date <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Due Date <span className="text-[#df1c41]">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
                  required
                />
              </div>
              {formData.status === 'paid' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                    Paid Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.paidDate}
                    onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                    className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                  Items
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="h-10"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="h-10"
                        />
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          placeholder="Unit Price"
                          className="h-10"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="h-10 w-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No items. Click "Add Item" to add line items.
                  </div>
                )}
              </div>
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




