"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FileDown,
  Search,
  Filter,
  UserPlus,
  DollarSign,
  Building2,
  Mail,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Lead } from "@/lib/types/sales"
import { initialLeads } from "@/lib/data/sales"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateLeadDialog } from "@/components/sales/CreateLeadDialog"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchLeads() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialLeads
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "New", variant: "default" },
  contacted: { label: "Contacted", variant: "secondary" },
  qualified: { label: "Qualified", variant: "default" },
  converted: { label: "Converted", variant: "default" },
  lost: { label: "Lost", variant: "outline" },
}

const sourceConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  website: { label: "Website", variant: "default" },
  linkedin: { label: "LinkedIn", variant: "secondary" },
  referral: { label: "Referral", variant: "outline" },
  "cold-call": { label: "Cold Call", variant: "outline" },
  event: { label: "Event", variant: "default" },
  other: { label: "Other", variant: "outline" },
}

export default function SalesLeadsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)
  const searchParams = useSearchParams()
  const viewMode = searchParams.get("view") || "team"
  const isMyView = viewMode === "my"
  const { data: leads, isLoading, error, refetch } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border rounded-[14px]">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load leads"
        message="We couldn't load leads. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  // Filter by view mode - would filter by assignedTo in real app
  const filteredLeads = leads?.filter(
    (lead) =>
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const newCount = leads?.filter(l => l.status === "new").length || 0
  const qualifiedCount = leads?.filter(l => l.status === "qualified").length || 0
  const totalValue = leads?.reduce((sum, l) => sum + (l.value || 0), 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {isMyView ? "My Leads" : "Leads"}
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              {isMyView
                ? "Manage your sales leads and track potential customers"
                : "View and manage all team leads, assign leads, and track performance"}
            </p>
          </div>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-border rounded-[14px] flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">New Leads</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{newCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-[14px] flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Qualified</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">{qualifiedCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-border rounded-[14px] flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-primary/10 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground flex-1">Total Value</p>
            </div>
            <p className="text-2xl font-semibold text-foreground leading-[1.3]">
              ${totalValue.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 h-[38px]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
          <Button onClick={() => setIsCreateLeadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[200px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Company</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Contact Info</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Source</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Value</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const status = statusConfig[lead.status] || statusConfig.new
                  const source = lead.source ? (sourceConfig[lead.source] || sourceConfig.other) : null
                  return (
                    <TableRow key={lead.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <Link href={`/sales/leads/${lead.id}`} className="hover:underline">
                          <span className="text-sm font-medium text-foreground">{lead.company}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{lead.contactName}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        {source ? (
                          <Badge variant={source.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {source.label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {lead.value ? `$${lead.value.toLocaleString("en-US")}` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={lead.assignedTo.avatar || getAvatarForUser(lead.assignedTo.id || lead.assignedTo.name)} alt={lead.assignedTo.name} />
                            <AvatarFallback className="text-xs">
                              {lead.assignedTo.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{lead.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="lead"
                          entityId={lead.id}
                          entityName={lead.company}
                          detailUrl={`/sales/leads/${lead.id}`}
                          canView={true}
                          canEdit={true}
                          canDelete={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24">
                    <EmptyState
                      icon={UserPlus}
                      title="No leads yet"
                      description="Get started by adding your first lead."
                      action={{
                        label: "Add Lead",
                        onClick: () => setIsCreateLeadOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateLeadDialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen} />
    </div>
  )
}
