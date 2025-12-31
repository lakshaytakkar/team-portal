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
} from "lucide-react"
import { Lead, LeadStatus } from "@/lib/types/sales"
import { getLead, getLeads, updateLead } from "@/lib/actions/sales"
import { ErrorState } from "@/components/ui/error-state"
import { useDetailNavigation } from "@/lib/hooks/useDetailNavigation"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditLeadDrawer } from "@/components/sales/EditLeadDrawer"

const statusConfig: Record<
  LeadStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "green-outline" | "red-outline" }
> = {
  new: { label: "New", variant: "default" },
  contacted: { label: "Contacted", variant: "secondary" },
  qualified: { label: "Qualified", variant: "outline" },
  converted: { label: "Converted", variant: "green-outline" },
  lost: { label: "Lost", variant: "red-outline" },
}

async function fetchLead(id: string) {
  const lead = await getLead(id)
  if (!lead) throw new Error("Lead not found")
  return lead
}

async function fetchAllLeads() {
  return await getLeads('all')
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = params.id as string
  const activeTab = searchParams.get("tab") || "overview"
  const queryClient = useQueryClient()
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false)

  const { data: lead, isLoading, error, refetch } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => fetchLead(leadId),
  })

  const { data: allLeads } = useQuery({
    queryKey: ["all-leads"],
    queryFn: fetchAllLeads,
  })

  // Handle 404 for missing leads
  useEffect(() => {
    if (error && error instanceof Error && error.message.toLowerCase().includes("not found")) {
      notFound()
    }
    if (!isLoading && !error && !lead) {
      notFound()
    }
  }, [error, isLoading, lead])

  const navigation = useDetailNavigation({
    currentId: leadId,
    items: allLeads || [],
    getId: (l) => l.id,
    basePath: "/sales/leads",
    onNavigate: (id) => {
      router.push(`/sales/leads/${id}`)
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
        title="Failed to load lead"
        message="We couldn't load this lead. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!lead) {
    return null
  }

  const status = statusConfig[lead.status]

  const getDaysInPipeline = () => {
    return Math.floor(
      (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales/leads")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{lead.company}</h1>
              <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{lead.contactName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditLeadOpen(true)}>
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
                  <TabsTrigger value="notes" className="flex-1">
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="flex-1">
                    Activities
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Company</Label>
                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Contact Name</Label>
                    <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                  </div>
                  {lead.email && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  )}
                  {lead.phone && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                  )}
                  {lead.value && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Value
                      </Label>
                      <p className="text-sm text-muted-foreground">${lead.value.toLocaleString()}</p>
                    </div>
                  )}
                  {lead.source && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Source</Label>
                      <p className="text-sm text-muted-foreground">{lead.source}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assigned To
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.assignedTo.avatar} />
                        <AvatarFallback>{getAvatarForUser(lead.assignedTo.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground">{lead.assignedTo.name}</p>
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

              <TabsContent value="notes" className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Notes</Label>
                    {lead.notes ? (
                      <div className="border rounded-lg p-4 bg-muted/50 min-h-[200px]">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{lead.notes}</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 bg-muted/50 min-h-[200px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No notes available</p>
                      </div>
                    )}
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
                    Convert to Deal
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
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-foreground font-medium">
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditLeadDrawer 
        open={isEditLeadOpen} 
        onOpenChange={(open) => {
          setIsEditLeadOpen(open)
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["lead", leadId] })
          }
        }} 
        lead={lead} 
      />
    </div>
  )
}

