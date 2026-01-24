"use client"

import { use, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Clock,
  User,
  Edit,
  Trash2,
  Upload,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getLLCClientById,
  getLLCClientDocuments,
  getLLCClientTimeline,
  deleteLLCClient,
  updateLLCClientStatus,
  updateLLCClientHealth,
} from "@/lib/actions/llc-clients"
import {
  LLC_STATUS_CONFIG,
  LLC_HEALTH_CONFIG,
  LLC_PLAN_CONFIG,
  LLC_BANK_STATUS_CONFIG,
  LLC_DOCUMENT_CATEGORY_CONFIG,
  LLC_DOCUMENT_STATUS_CONFIG,
  type LLCClientStatus,
  type LLCClientHealth,
} from "@/lib/types/llc-clients"
import { getAvatarForUser } from "@/lib/utils/avatars"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { EmptyState } from "@/components/ui/empty-state"

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default function LLCClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: client, isLoading, error, refetch } = useQuery({
    queryKey: ["llc-client", id],
    queryFn: () => getLLCClientById(id),
    staleTime: 5 * 60 * 1000,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ["llc-client-documents", id],
    queryFn: () => getLLCClientDocuments({ clientId: id }),
    enabled: activeTab === "documents",
    staleTime: 5 * 60 * 1000,
  })

  const { data: timeline = [] } = useQuery({
    queryKey: ["llc-client-timeline", id],
    queryFn: () => getLLCClientTimeline(id),
    enabled: activeTab === "timeline",
    staleTime: 5 * 60 * 1000,
  })

  const handleStatusChange = async (newStatus: LLCClientStatus) => {
    try {
      await updateLLCClientStatus(id, newStatus)
      toast.success("Status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["llc-client", id] })
      queryClient.invalidateQueries({ queryKey: ["llc-client-timeline", id] })
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleHealthChange = async (newHealth: LLCClientHealth) => {
    try {
      await updateLLCClientHealth(id, newHealth)
      toast.success("Health status updated")
      queryClient.invalidateQueries({ queryKey: ["llc-client", id] })
    } catch (error) {
      toast.error("Failed to update health")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return
    try {
      await deleteLLCClient(id)
      toast.success("Client deleted")
      router.push("/legal-nations/clients")
    } catch (error) {
      toast.error("Failed to delete client")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (isLoading) {
    return <ClientDetailSkeleton />
  }

  if (error || !client) {
    return (
      <ErrorState
        title="Client not found"
        message="The requested client could not be found."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link href="/legal-nations/clients">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  {client.clientName}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {client.clientCode}
                </Badge>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                {client.llcName || "LLC name pending"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Current Status</Label>
            <Select value={client.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LLC_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn(config.color)}>{config.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Client Health</Label>
            <Select value={client.health || "neutral"} onValueChange={handleHealthChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LLC_HEALTH_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={cn(config.color)}>{config.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Service Plan</Label>
            <div className="flex items-center gap-2 h-9">
              <Badge variant="outline">{LLC_PLAN_CONFIG[client.plan]?.label}</Badge>
              {client.websiteIncluded && (
                <Badge variant="secondary" className="text-xs">+ Website</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Amount Received</Label>
            <div className="flex items-center gap-2 h-9">
              <span className="text-lg font-semibold">{formatCurrency(client.amountReceived)}</span>
              {client.remainingPayment > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  +{formatCurrency(client.remainingPayment)} pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-5 mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Contact Information */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-sm hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.country && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.country}</span>
                  </div>
                )}
                {client.assignedTo && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Assigned to:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={client.assignedTo.avatar || getAvatarForUser(client.assignedTo.fullName)}
                          alt={client.assignedTo.fullName}
                        />
                        <AvatarFallback className="text-xs">
                          {client.assignedTo.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{client.assignedTo.fullName}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Dates */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Date</span>
                  <span className="text-sm font-medium">{formatDate(client.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Onboarding Date</span>
                  <span className="text-sm font-medium">{formatDate(client.onboardingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Onboarding Call</span>
                  <span className="text-sm font-medium">{formatDate(client.onboardingCallDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Document Submission</span>
                  <span className="text-sm font-medium">{formatDate(client.documentSubmissionDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Delivery Date</span>
                  <span className="text-sm font-medium">{formatDate(client.deliveryDate)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank Status</span>
                  <Badge
                    className={cn(
                      "h-5 px-2 py-0.5 rounded-md text-xs",
                      LLC_BANK_STATUS_CONFIG[client.bankStatus]?.bgColor,
                      LLC_BANK_STATUS_CONFIG[client.bankStatus]?.color
                    )}
                  >
                    {LLC_BANK_STATUS_CONFIG[client.bankStatus]?.label}
                  </Badge>
                </div>
                {client.bankApproved && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bank Approved</span>
                    <span className="text-sm font-medium">{client.bankApproved}</span>
                  </div>
                )}
                {client.bankApplicationDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Application Date</span>
                    <span className="text-sm font-medium">{formatDate(client.bankApplicationDate)}</span>
                  </div>
                )}
                {client.bankApprovalDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Approval Date</span>
                    <span className="text-sm font-medium">{formatDate(client.bankApprovalDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border border-border rounded-[14px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.notes || client.additionalNotes ? (
                  <div className="space-y-2">
                    {client.notes && <p className="text-sm">{client.notes}</p>}
                    {client.additionalNotes && (
                      <p className="text-sm text-muted-foreground">{client.additionalNotes}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Client Documents</CardTitle>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(LLC_DOCUMENT_CATEGORY_CONFIG).map(([category, config]) => {
                    const categoryDocs = documents.filter((d) => d.category === category)
                    if (categoryDocs.length === 0) return null
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-2">{config.label}</h4>
                        <div className="space-y-2">
                          {categoryDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  {doc.fileName && (
                                    <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                                  )}
                                </div>
                              </div>
                              <Badge
                                className={cn(
                                  "h-5 px-2 py-0.5 rounded-md text-xs",
                                  LLC_DOCUMENT_STATUS_CONFIG[doc.status]?.bgColor,
                                  LLC_DOCUMENT_STATUS_CONFIG[doc.status]?.color
                                )}
                              >
                                {LLC_DOCUMENT_STATUS_CONFIG[doc.status]?.label}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  description="Upload or create documents for this client."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{entry.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        )}
                        {entry.performedByProfile && (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={entry.performedByProfile.avatar || getAvatarForUser(entry.performedByProfile.fullName)}
                                alt={entry.performedByProfile.fullName}
                              />
                              <AvatarFallback className="text-xs">
                                {entry.performedByProfile.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              by {entry.performedByProfile.fullName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Clock}
                  title="No activity yet"
                  description="Activity will appear here as changes are made."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </label>
  )
}

function ClientDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-20 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
