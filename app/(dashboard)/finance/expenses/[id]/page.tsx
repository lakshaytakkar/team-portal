"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
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
  User,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { Expense, ExpenseStatus } from "@/lib/types/finance"
import { getExpense, getExpenses } from "@/lib/actions/finance"
import { ErrorState } from "@/components/ui/error-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { EditExpenseDrawer } from "@/components/finance/EditExpenseDrawer"
import { useQueryClient } from "@tanstack/react-query"

const statusConfig: Record<
  ExpenseStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "green-outline" | "red-outline"; icon: any }
> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  approved: { label: "Approved", variant: "green-outline", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "red-outline", icon: XCircle },
  paid: { label: "Paid", variant: "green-outline", icon: CheckCircle },
}

async function fetchExpense(id: string) {
  const expense = await getExpense(id)
  if (!expense) throw new Error("Expense not found")
  return expense
}

async function fetchAllExpenses() {
  return await getExpenses()
}

export default function ExpenseDetailPage() {
  const queryClient = useQueryClient()
  const params = useParams()
  const router = useRouter()
  const expenseId = params.id as string
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false)

  const { data: expense, isLoading, error, refetch } = useQuery({
    queryKey: ["expense", expenseId],
    queryFn: () => fetchExpense(expenseId),
  })

  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !expense) {
      notFound()
    }
  }, [error, isLoading, expense])

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error && (!(error instanceof Error) || !error.message.toLowerCase().includes("not found"))) {
    return (
      <ErrorState
        title="Failed to load expense"
        message="We couldn't load this expense. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!expense) {
    return null
  }

  const status = statusConfig[expense.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/finance/expenses")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
                {expense.description}
              </h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ${expense.amount.toLocaleString()} • {expense.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditExpenseOpen(true)}>
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
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Description</Label>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </Label>
                  <p className="text-sm text-muted-foreground">${expense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Category</Label>
                  <p className="text-sm text-muted-foreground capitalize">{expense.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expense Date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Submitted By
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={expense.submittedBy.avatar} />
                      <AvatarFallback>{getAvatarForUser(expense.submittedBy.name)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">{expense.submittedBy.name}</p>
                  </div>
                </div>
                {expense.approvedBy && (
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Approved By
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={expense.approvedBy.avatar} />
                        <AvatarFallback>{getAvatarForUser(expense.approvedBy.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground">{expense.approvedBy.name}</p>
                    </div>
                  </div>
                )}
                {expense.receipt && (
                  <div className="col-span-2">
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Receipt</Label>
                    <a
                      href={expense.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Receipt
                    </a>
                  </div>
                )}
                {expense.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Notes</Label>
                    <div className="border rounded-lg p-4 bg-muted/50 min-h-[100px]">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{expense.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
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
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(expense.updatedAt).toLocaleDateString()}
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

