"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DollarSign,
  Calendar,
  ArrowLeft,
  Edit,
  FileText,
  Printer,
  Mail,
} from "lucide-react"
import { Invoice, InvoiceStatus } from "@/lib/types/finance"
import { getInvoice, getInvoices } from "@/lib/actions/finance"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { EditInvoiceDrawer } from "@/components/finance/EditInvoiceDrawer"
import { useQueryClient } from "@tanstack/react-query"

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "green-outline" | "red-outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "secondary" },
  paid: { label: "Paid", variant: "green-outline" },
  overdue: { label: "Overdue", variant: "red-outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
}

async function fetchInvoice(id: string) {
  const invoice = await getInvoice(id)
  if (!invoice) throw new Error("Invoice not found")
  return invoice
}

async function fetchAllInvoices() {
  return await getInvoices()
}

export default function InvoiceDetailPage() {
  const queryClient = useQueryClient()
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false)

  const { data: invoice, isLoading, error, refetch } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => fetchInvoice(invoiceId),
  })

  const { data: allInvoices } = useQuery({
    queryKey: ["all-invoices"],
    queryFn: fetchAllInvoices,
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !invoice) {
      notFound()
    }
  }, [error, isLoading, invoice])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <ErrorState
        title="Failed to load invoice"
        message="We couldn't load this invoice. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!invoice) {
    return null
  }

  const status = statusConfig[invoice.status]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/finance/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                {invoice.invoiceNumber}
              </h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{invoice.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => setIsEditInvoiceOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Invoice Number</Label>
                  <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Client Name</Label>
                  <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Client Email
                  </Label>
                  <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </Label>
                  <p className="text-sm text-muted-foreground">${invoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Tax
                  </Label>
                  <p className="text-sm text-muted-foreground">${invoice.tax.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total
                  </Label>
                  <p className="text-sm text-muted-foreground font-semibold">${invoice.total.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Issue Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                {invoice.paidDate && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Paid Date
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.paidDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {invoice.items && invoice.items.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Items</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="space-y-2">
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <p className="text-foreground font-medium">{item.description}</p>
                            <p className="text-muted-foreground text-xs">
                              {item.quantity} × ${item.unitPrice.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-foreground font-semibold">
                            ${(item.quantity * item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Notes</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 min-h-[100px]">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Quick Actions
                </Label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Information
                </Label>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="text-foreground font-medium">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(invoice.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditInvoiceDrawer 
        open={isEditInvoiceOpen} 
        onOpenChange={(open) => {
          setIsEditInvoiceOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] })
          }
        }} 
        invoice={invoice} 
      />
    </div>
  )
}

