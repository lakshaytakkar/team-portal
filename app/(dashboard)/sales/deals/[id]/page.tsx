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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Mail,
  Phone,
  Building2,
  DollarSign,
  User,
  Calendar,
  ArrowLeft,
  Edit,
  Plus,
  FileText,
  TrendingUp,
} from "lucide-react"
import { Deal, DealStage } from "@/lib/types/sales"
import { getDeal, getDeals, updateDeal } from "@/lib/actions/sales"
import { EditDealDrawer } from "@/components/sales/EditDealDrawer"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const stageConfig: Record<
  DealStage,
  { label: string; variant: "default" | "secondary" | "outline" | "green-outline" | "red-outline" }
> = {
  prospecting: { label: "Prospecting", variant: "default" },
  qualification: { label: "Qualification", variant: "secondary" },
  proposal: { label: "Proposal", variant: "outline" },
  negotiation: { label: "Negotiation", variant: "outline" },
  "closed-won": { label: "Closed Won", variant: "green-outline" },
  "closed-lost": { label: "Closed Lost", variant: "red-outline" },
}

async function fetchDeal(id: string) {
  const deal = await getDeal(id)
  if (!deal) throw new Error("Deal not found")
  return deal
}

async function fetchAllDeals() {
  return await getDeals('all')
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dealId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"
  const queryClient = useQueryClient()
  const [isEditDealOpen, setIsEditDealOpen] = useState(false)

  const { data: deal, isLoading, error, refetch } = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => fetchDeal(dealId),
  })

  const { data: allDeals } = useQuery({
    queryKey: ["all-deals"],
    queryFn: fetchAllDeals,
  })

  // Handle 404 for missing deals
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !deal) {
      notFound()
    }
  }, [error, isLoading, deal])

  const navigation = useDetailNavigation({
    currentId: dealId,
    items: allDeals || [],
    getId: (d) => d.id,
    basePath: "/sales/deals",
    onNavigate: (id) => {
      router.push(`/sales/deals/${id}`)
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
        title="Failed to load deal"
        message="We couldn't load this deal. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!deal) {
    return null
  }

  const stage = stageConfig[deal.stage]

  const getDaysInPipeline = () => {
    return Math.floor(
      (new Date().getTime() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales/deals")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{deal.name}</h1>
              <Badge variant={stage.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {stage.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{deal.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDealOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
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
            <Tabs value={activeTab} onValueChange={(value) => router.push(`?tab=${value}`)}>
              <div className="border-b border-border px-6 pt-4">
                <TabsList className="bg-muted p-0.5 rounded-xl w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="quotations" className="flex-1">
                    Quotations
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="flex-1">
                    Activities
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Deal Name</Label>
                    <p className="text-sm text-muted-foreground">{deal.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Company</Label>
                    <p className="text-sm text-muted-foreground">{deal.company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Contact Name</Label>
                    <p className="text-sm text-muted-foreground">{deal.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Value
                    </Label>
                    <p className="text-sm text-muted-foreground">${deal.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Probability
                    </Label>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{deal.probability}%</p>
                      <Progress value={deal.probability} className="h-2" />
                    </div>
                  </div>
                  {deal.expectedCloseDate && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Expected Close Date
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
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
                        <AvatarImage src={deal.assignedTo.avatar} />
                        <AvatarFallback>{getAvatarForUser(deal.assignedTo.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground">{deal.assignedTo.name}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Days in Pipeline
                    </Label>
                    <p className="text-sm text-muted-foreground">{getDaysInPipeline()} days</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quotations" className="px-6 py-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50 min-h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No quotations available</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="px-6 py-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/50 min-h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No activities recorded</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quotation
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
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
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(deal.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditDealDrawer 
        open={isEditDealOpen} 
        onOpenChange={(open) => {
          setIsEditDealOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["deal", dealId] })
          }
        }} 
        deal={deal} 
      />
    </div>
  )
}

