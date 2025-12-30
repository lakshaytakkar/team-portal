"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  UserCheck,
  Clock,
  CheckCircle2,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Onboarding } from "@/lib/types/hr"
import { getOnboardings } from "@/lib/actions/hr"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchOnboardings() {
  return await getOnboardings()
}

const statusConfig: Record<string, { label: string; borderColor: string; textColor: string; dotColor: string }> = {
  pending: {
    label: "Pending",
    borderColor: "border-[#f59e0b]",
    textColor: "text-[#f59e0b]",
    dotColor: "bg-[#f59e0b]",
  },
  "in-progress": {
    label: "In Progress",
    borderColor: "border-[#3b82f6]",
    textColor: "text-[#3b82f6]",
    dotColor: "bg-[#3b82f6]",
  },
  completed: {
    label: "Completed",
    borderColor: "border-[#339d88]",
    textColor: "text-[#339d88]",
    dotColor: "bg-[#339d88]",
  },
  "on-hold": {
    label: "On Hold",
    borderColor: "border-muted-foreground",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: React.ElementType
}) {
  return (
    <Card className="border border-border rounded-2xl p-[18px] bg-white">
      <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
        {title}
      </p>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xl font-semibold text-foreground leading-[1.35]">
          {value}
        </p>
        <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function HROnboardingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: onboardings, isLoading, error, refetch } = useQuery({
    queryKey: ["onboardings"],
    queryFn: fetchOnboardings,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
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
        title="Failed to load onboardings"
        message="We couldn't load onboarding records. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const filteredOnboardings = onboardings?.filter(
    (onboarding) =>
      onboarding.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      onboarding.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const pendingCount = onboardings?.filter(o => o.status === "pending").length || 0
  const inProgressCount = onboardings?.filter(o => o.status === "in-progress").length || 0
  const completedCount = onboardings?.filter(o => o.status === "completed").length || 0
  const totalTasks = onboardings?.reduce((sum, o) => sum + o.tasks.length, 0) || 0
  const completedTasks = onboardings?.reduce((sum, o) => sum + o.tasks.filter(t => t.completed).length, 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Onboarding</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage employee onboarding processes and tasks</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="default" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Onboarding
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="In Progress" value={inProgressCount.toString()} icon={Clock} />
        <StatCard title="Pending" value={pendingCount.toString()} icon={UserCheck} />
        <StatCard title="Completed" value={completedCount.toString()} icon={CheckCircle2} />
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Onboarding Processes</h2>
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
                  <span className="text-sm font-medium text-muted-foreground">Employee</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Employee ID</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Tasks Progress</span>
                </TableHead>
                <TableHead className="w-[144px] px-3">
                  <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                </TableHead>
                <TableHead className="px-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead className="w-[44px] px-3"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOnboardings.length > 0 ? (
                filteredOnboardings.map((onboarding) => {
                  const status = statusConfig[onboarding.status] || statusConfig.pending
                  const completedTaskCount = onboarding.tasks.filter(t => t.completed).length
                  const progress = onboarding.tasks.length > 0 ? Math.round((completedTaskCount / onboarding.tasks.length) * 100) : 0
                  return (
                    <TableRow key={onboarding.id} className="border-b border-border">
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarForUser(onboarding.employeeId)} alt={onboarding.employeeName} />
                            <AvatarFallback className="text-xs">
                              {onboarding.employeeName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{onboarding.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">{onboarding.employeeId}</span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-[100px] h-2 bg-border rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                progress === 100
                                  ? "bg-status-completed-foreground rounded-[10px]"
                                  : "bg-status-completed-foreground rounded-l-full"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            {completedTaskCount}/{onboarding.tasks.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(onboarding.startDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarForUser(onboarding.assignedTo.id || onboarding.assignedTo.name)} alt={onboarding.assignedTo.name} />
                            <AvatarFallback className="text-xs">
                              {onboarding.assignedTo.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{onboarding.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 px-1.5 py-0.5 rounded-2xl text-xs gap-1 bg-background",
                            status.borderColor,
                            status.textColor
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3">
                        <RowActionsMenu
                          entityType="onboarding"
                          entityId={onboarding.id}
                          entityName={onboarding.employeeName}
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
                  <TableCell colSpan={7} className="h-24">
                    <EmptyState
                      icon={UserCheck}
                      title="No onboarding processes yet"
                      description="Create onboarding processes for new employees."
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
