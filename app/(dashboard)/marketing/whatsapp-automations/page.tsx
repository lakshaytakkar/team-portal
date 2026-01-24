"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Search,
  Filter,
  MessageSquare,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WhatsAppAutomation } from "@/lib/types/marketing"
import { initialWhatsAppAutomations } from "@/lib/data/marketing"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchWhatsAppAutomations() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialWhatsAppAutomations
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }> = {
  active: { label: "Active", variant: "default", icon: PlayCircle },
  paused: { label: "Paused", variant: "secondary", icon: PauseCircle },
  draft: { label: "Draft", variant: "outline", icon: PauseCircle },
}

export default function MarketingWhatsAppAutomationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: automations, isLoading, error, refetch } = useQuery({
    queryKey: ["whatsapp-automations"],
    queryFn: fetchWhatsAppAutomations,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
        title="Failed to load WhatsApp automations"
        message="We couldn't load WhatsApp automations. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredAutomations = automations?.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">WhatsApp Automations</h1>
            <p className="text-xs text-white/90 mt-0.5">Create automated WhatsApp workflows triggered by lead events</p>
          </div>
          <Button variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">WhatsApp Automations</h2>
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
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="w-[200px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Trigger</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Template</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Recipients</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Sent</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Delivered</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Read</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutomations.length > 0 ? (
                filteredAutomations.map((automation) => {
                  const status = statusConfig[automation.status] || statusConfig.draft
                  const StatusIcon = status.icon
                  return (
                    <TableRow key={automation.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{automation.name}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                          {automation.trigger}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{automation.template}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{automation.recipients || 0}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{automation.sent || 0}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{automation.delivered || 0}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{automation.read || 0}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="whatsapp-automation"
                          entityId={automation.id}
                          entityName={automation.name}
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
                  <TableCell colSpan={9} className="h-24">
                    <EmptyState
                      icon={MessageSquare}
                      title="No WhatsApp automations yet"
                      description="Create automated WhatsApp workflows to engage leads automatically."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
