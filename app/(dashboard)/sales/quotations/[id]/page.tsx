"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Mail,
  Phone,
  Building2,
  DollarSign,
  User,
  Calendar,
  ArrowLeft,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { Quotation, QuotationStatus } from "@/lib/types/sales"
import { getQuotation, getQuotations } from "@/lib/actions/sales"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const statusConfig: Record<
  QuotationStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "green-outline" | "red-outline"; icon: any }
> = {
  draft: { label: "Draft", variant: "outline", icon: FileText },
  sent: { label: "Sent", variant: "secondary", icon: Clock },
  accepted: { label: "Accepted", variant: "green-outline", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "red-outline", icon: XCircle },
  expired: { label: "Expired", variant: "outline", icon: Clock },
}

async function fetchQuotation(id: string) {
  const quotation = await getQuotation(id)
  if (!quotation) throw new Error("Quotation not found")
  return quotation
}

async function fetchAllQuotations() {
  return await getQuotations('all')
}

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const quotationId = params.id as string
  const queryClient = useQueryClient()

  const { data: quotation, isLoading, error, refetch } = useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: () => fetchQuotation(quotationId),
  })

  const { data: allQuotations } = useQuery({
    queryKey: ["all-quotations"],
    queryFn: fetchAllQuotations,
  })

  // Handle 404 for missing quotations
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !quotation) {
      notFound()
    }
  }, [error, isLoading, quotation])

  const navigation = useDetailNavigation({
    currentId: quotationId,
    items: allQuotations || [],
    getId: (q) => q.id,
    basePath: "/sales/quotations",
    onNavigate: (id) => {
      router.push(`/sales/quotations/${id}`)
    },
  })

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
        title="Failed to load quotation"
        message="We couldn't load this quotation. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!quotation) {
    return null
  }

  const status = statusConfig[quotation.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales/quotations")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                {quotation.quotationNumber}
              </h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{quotation.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
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
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Quotation Number</Label>
                  <p className="text-sm text-muted-foreground">{quotation.quotationNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Company</Label>
                  <p className="text-sm text-muted-foreground">{quotation.company}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </Label>
                  <p className="text-sm text-muted-foreground">${quotation.amount.toLocaleString()}</p>
                </div>
                {quotation.validUntil && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Valid Until
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(quotation.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned To
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={quotation.assignedTo.avatar} />
                      <AvatarFallback>{getAvatarForUser(quotation.assignedTo.name)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">{quotation.assignedTo.name}</p>
                  </div>
                </div>
              </div>

              {quotation.items && quotation.items.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Items</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="space-y-2">
                      {quotation.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.description}</span>
                          <span className="text-muted-foreground">
                            {item.quantity} × ${item.unitPrice.toLocaleString()} = ${(item.quantity * item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
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
                    <FileText className="h-4 w-4 mr-2" />
                    Send Quotation
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
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
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(quotation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

