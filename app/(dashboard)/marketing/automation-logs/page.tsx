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
  FileDown,
  Search,
  Filter,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AutomationLog } from "@/lib/types/marketing"
import { initialAutomationLogs } from "@/lib/data/marketing"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"

async function fetchAutomationLogs() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialAutomationLogs
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }> = {
  sent: { label: "Sent", variant: "default", icon: Send },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle2 },
  opened: { label: "Opened", variant: "secondary", icon: CheckCircle2 },
  clicked: { label: "Clicked", variant: "default", icon: CheckCircle2 },
  bounced: { label: "Bounced", variant: "outline", icon: Send },
  failed: { label: "Failed", variant: "outline", icon: Send },
}

export default function MarketingAutomationLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ["marketing-automation-logs"],
    queryFn: fetchAutomationLogs,
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
        title="Failed to load automation logs"
        message="We couldn't load automation logs. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredLogs = logs?.filter(
    (log) =>
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.message?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Automation Logs</h1>
            <p className="text-xs text-white/90 mt-0.5">Track sent messages, opens, clicks, responses</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button variant="outline" size="default" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Automation Logs</h2>
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
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Recipient</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Subject/Message</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Sent At</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Campaign</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const status = statusConfig[log.status] || statusConfig.sent
                  const StatusIcon = status.icon
                  return (
                    <TableRow key={log.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          {log.type === "email" ? (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs capitalize">
                            {log.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{log.recipient}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{log.subject || log.message || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{log.campaign || "—"}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="automation-log"
                          entityId={log.id}
                          entityName={log.recipient}
                          canView={true}
                          canEdit={false}
                          canDelete={false}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={Mail}
                      title="No automation logs yet"
                      description="Automation logs will appear here once automations are triggered."
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
