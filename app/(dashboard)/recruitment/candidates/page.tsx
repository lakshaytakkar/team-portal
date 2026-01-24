"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
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
  FileDown,
  Search,
  Filter,
  UserPlus,
  FileText,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Candidate, CandidateStatus } from "@/lib/types/candidate"
import { getCandidates, updateCandidateStatus, getCandidateTimeline, getRecruitmentMetrics, deleteCandidate } from "@/lib/actions/recruitment"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { CandidateRowActions } from "@/components/recruitment/CandidateRowActions"
import { RecruitmentTopbarActions, type ViewMode } from "@/components/recruitment/RecruitmentTopbarActions"
import { RecruitmentFilterPanel } from "@/components/recruitment/RecruitmentFilterPanel"
import { BulkActionsBar } from "@/components/recruitment/BulkActionsBar"
import { KanbanPipeline } from "@/components/recruitment/KanbanPipeline"
import { CandidateTimeline } from "@/components/recruitment/CandidateTimeline"
import { CreateCandidateDialog } from "@/components/recruitment/CreateCandidateDialog"
import { toast } from "@/components/ui/sonner"
import type { Action } from "@/lib/utils/actions"
import type { FilterDefinition, FilterValue } from "@/lib/utils/filters"
import { getAvailableFilters } from "@/lib/utils/filters"
import { bulkUpdateCandidates } from "@/lib/actions/recruitment"
import { exportCandidatesToCSV } from "@/lib/utils/export"
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

async function fetchCandidates() {
  return await getCandidates()
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "New", variant: "default" },
  screening: { label: "Screening", variant: "secondary" },
  interview: { label: "Interview", variant: "default" },
  offer: { label: "Offer", variant: "secondary" },
  hired: { label: "Hired", variant: "default" },
  rejected: { label: "Rejected", variant: "outline" },
}

const sourceConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  linkedin: { label: "LinkedIn", variant: "default" },
  referral: { label: "Referral", variant: "secondary" },
  "job-board": { label: "Job Board", variant: "outline" },
  website: { label: "Website", variant: "default" },
  other: { label: "Other", variant: "outline" },
}

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filterValues, setFilterValues] = useState<FilterValue>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const viewParam = searchParams.get("view") || "team"
  const isMyView = viewParam === "my"

  // Get filter definitions
  const filterDefinitions: FilterDefinition[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'new', label: 'New' },
        { value: 'screening', label: 'Screening' },
        { value: 'interview', label: 'Interview' },
        { value: 'offer', label: 'Offer' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    {
      id: 'source',
      label: 'Source',
      type: 'multiselect',
      options: [
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'referral', label: 'Referral' },
        { value: 'job-board', label: 'Job Board' },
        { value: 'website', label: 'Website' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'dateFrom',
      label: 'Date From',
      type: 'date',
    },
    {
      id: 'dateTo',
      label: 'Date To',
      type: 'date',
    },
  ]

  const quickFilters = [
    {
      id: 'new',
      label: 'New',
      filters: { status: ['new'] },
    },
    {
      id: 'in-interview',
      label: 'In Interview',
      filters: { status: ['interview'] },
    },
    {
      id: 'offers',
      label: 'Offers',
      filters: { status: ['offer'] },
    },
    {
      id: 'hired',
      label: 'Hired',
      filters: { status: ['hired'] },
    },
  ]

  const { data: candidates, isLoading, error, refetch } = useQuery({
    queryKey: ["candidates"],
    queryFn: fetchCandidates,
  })

  const { data: metrics } = useQuery({
    queryKey: ["recruitment-metrics"],
    queryFn: () => getRecruitmentMetrics(),
  })

  const statusChangeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      updateCandidateStatus(id, status, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({ queryKey: ["recruitment-metrics"] })
      toast.success("Status updated successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to update status", {
        description: error.message,
      })
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: { ids: string[]; updates: { status?: CandidateStatus } }) =>
      bulkUpdateCandidates(updates),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({ queryKey: ["recruitment-metrics"] })
      setSelectedCandidates(new Set())
      toast.success(`Updated ${result.updated} candidates`)
      if (result.errors.length > 0) {
        toast.error(`Some updates failed: ${result.errors.join(", ")}`)
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update candidates", {
        description: error.message,
      })
    },
  })

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    await statusChangeMutation.mutateAsync({ id: candidateId, status: newStatus })
  }

  const handleBulkStatusChange = () => {
    if (selectedCandidates.size === 0) return
    // Open a dialog to select status - for now, just show a toast
    toast.info("Bulk status change dialog coming soon")
  }

  const handleBulkExport = () => {
    if (selectedCandidates.size === 0) return
    if (!candidates) return
    try {
      exportCandidatesToCSV(candidates, {
        filename: `candidates-selected-${new Date().toISOString().split('T')[0]}`,
        selectedIds: Array.from(selectedCandidates),
      })
      toast.success(`Exporting ${selectedCandidates.size} selected candidates`)
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleBulkDelete = () => {
    if (selectedCandidates.size === 0) return
    toast.info("Bulk delete confirmation coming soon")
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    await deleteCandidate(candidateId)
    await queryClient.invalidateQueries({ queryKey: ["candidates"] })
  }

  // Filter by view mode (my vs team) - for now, show all, but this would filter by assignedTo in real app
  // NOTE: useMemo must be called before any early returns to maintain consistent hook order
  const filteredCandidates = useMemo(() => {
    let filtered = candidates || []

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.positionApplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.skills?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filter values
    if (filterValues.status && Array.isArray(filterValues.status) && filterValues.status.length > 0) {
      filtered = filtered.filter((c) => filterValues.status.includes(c.status))
    }

    if (filterValues.source && Array.isArray(filterValues.source) && filterValues.source.length > 0) {
      filtered = filtered.filter((c) => c.source && filterValues.source.includes(c.source))
    }

    if (filterValues.dateFrom) {
      const dateFrom = new Date(filterValues.dateFrom as string)
      filtered = filtered.filter((c) => new Date(c.createdAt) >= dateFrom)
    }

    if (filterValues.dateTo) {
      const dateTo = new Date(filterValues.dateTo as string)
      dateTo.setHours(23, 59, 59, 999)
      filtered = filtered.filter((c) => new Date(c.createdAt) <= dateTo)
    }

    return filtered
  }, [candidates, searchQuery, filterValues])

  // Keyboard shortcuts - must be called before early returns
  useKeyboardShortcuts([
    {
      key: "n",
      ctrl: true,
      action: () => setIsCreateCandidateOpen(true),
      description: "Create new candidate",
    },
    {
      key: "f",
      ctrl: true,
      action: () => setIsFilterOpen(!isFilterOpen),
      description: "Toggle filters",
    },
    {
      key: "e",
      ctrl: true,
      action: () => {
        if (candidates && candidates.length > 0) {
          exportCandidatesToCSV(candidates, {
            filename: `candidates-${new Date().toISOString().split('T')[0]}`,
            selectedIds: selectedCandidates.size > 0 ? Array.from(selectedCandidates) : undefined,
          })
          toast.success("Export started")
        }
      },
      description: "Export candidates",
    },
  ])

  // Early returns for loading and error states - after all hooks
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
        title="Failed to load candidates"
        message="We couldn't load candidates. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const newCount = candidates?.filter(c => c.status === "new").length || 0
  const interviewCount = candidates?.filter(c => c.status === "interview").length || 0
  const offerCount = candidates?.filter(c => c.status === "offer").length || 0
  const hiredCount = candidates?.filter(c => c.status === "hired").length || 0

  // Calculate days in stage for each candidate
  const getDaysInStage = (candidate: Candidate) => {
    return Math.floor(
      (new Date().getTime() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const handleBulkSelect = (candidateId: string, selected: boolean) => {
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(candidateId)
      } else {
        newSet.delete(candidateId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map((c) => c.id)))
    }
  }

  // Topbar actions
  const primaryActions: Action[] = [
    {
      id: "create-candidate",
      type: "create",
      label: "New Candidate",
      onClick: () => setIsCreateCandidateOpen(true),
    },
  ]

  const secondaryActions: Action[] = [
    {
      id: "export",
      type: "export",
      label: "Export",
      onClick: () => {
        if (!candidates || candidates.length === 0) {
          toast.error("No candidates to export")
          return
        }
        try {
          exportCandidatesToCSV(candidates, {
            filename: `candidates-${new Date().toISOString().split('T')[0]}`,
            selectedIds: selectedCandidates.size > 0 ? Array.from(selectedCandidates) : undefined,
          })
          toast.success("Export started", {
            description: selectedCandidates.size > 0
              ? `Exporting ${selectedCandidates.size} selected candidates`
              : "Exporting all candidates",
          })
        } catch (error) {
          toast.error("Export failed", {
            description: error instanceof Error ? error.message : "An error occurred",
          })
        }
      },
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {isMyView ? "My Candidates" : "Candidates"}
            </h1>
            <p className="text-xs text-white/90 mt-0.5">
              {isMyView
                ? "Manage your candidates and track recruitment pipeline"
                : "Manage all team candidates, track recruitment pipeline, and monitor hiring progress"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            New
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {newCount}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            In Interview
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {interviewCount}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Offers Sent
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {offerCount}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="border border-border rounded-2xl p-[18px] bg-white">
          <p className="text-sm text-muted-foreground font-medium leading-5 tracking-[0.28px] mb-0.5">
            Hired
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xl font-semibold text-foreground leading-[1.35]">
              {hiredCount}
            </p>
            <div className="bg-primary/10 rounded-lg w-9 h-9 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-white">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-[38px]"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                    {Object.keys(filterValues).length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {Object.keys(filterValues).length}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle filters (Ctrl+F)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RecruitmentTopbarActions
            primary={primaryActions}
            secondary={secondaryActions}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            availableViewModes={["table", "kanban", "timeline"]}
          />
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="px-5 pb-3 border-b border-border">
            <RecruitmentFilterPanel
              filters={filterDefinitions}
              values={filterValues}
              onChange={setFilterValues}
              onClear={() => setFilterValues({})}
              quickFilters={quickFilters}
              collapsible={false}
            />
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedCandidates.size > 0 && (
          <div className="px-5 py-3 border-b border-border">
            <BulkActionsBar
              selectedCount={selectedCandidates.size}
              onClearSelection={() => setSelectedCandidates(new Set())}
              onBulkStatusChange={handleBulkStatusChange}
              onBulkExport={handleBulkExport}
              onBulkDelete={handleBulkDelete}
            />
          </div>
        )}

        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
                  <TableHead className="w-[44px] px-3 py-0">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-border"
                    />
                  </TableHead>
                  <TableHead className="w-[200px] px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Name</span>
                  </TableHead>
                  <TableHead className="px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Position</span>
                  </TableHead>
                  <TableHead className="px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Contact</span>
                  </TableHead>
                  <TableHead className="px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Source</span>
                  </TableHead>
                  <TableHead className="px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                  </TableHead>
                  <TableHead className="w-[100px] px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Days in Stage</span>
                  </TableHead>
                  <TableHead className="w-[144px] px-3 py-0">
                    <span className="text-sm font-medium text-muted-foreground">Applied</span>
                  </TableHead>
                  <TableHead className="w-[44px] px-3 py-0"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => {
                    const status = statusConfig[candidate.status] || statusConfig.new
                    const source = candidate.source ? (sourceConfig[candidate.source] || sourceConfig.other) : null
                    const daysInStage = getDaysInStage(candidate)
                    return (
                      <TableRow
                        key={candidate.id}
                        className="border-b border-border cursor-pointer hover:bg-muted/30"
                        onClick={() => router.push(`/recruitment/candidates/${candidate.id}`)}
                      >
                        <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedCandidates.has(candidate.id)}
                            onChange={(e) => handleBulkSelect(candidate.id, e.target.checked)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{candidate.fullName}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{candidate.positionApplied}</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{candidate.phone}</span>
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
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">{daysInStage}d</span>
                        </TableCell>
                        <TableCell className="px-3">
                          <span className="text-sm font-medium text-foreground">
                            {new Date(candidate.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                          <CandidateRowActions
                            candidate={candidate}
                            canView={true}
                            canEdit={true}
                            canDelete={true}
                            onDelete={() => handleDeleteCandidate(candidate.id)}
                            showBulkSelect={false}
                            onScheduleInterview={() => {
                              router.push(`/recruitment/interviews?candidate=${candidate.id}`)
                            }}
                            onChangeStatus={() => {
                              // TODO: Open status change dialog
                              toast.info("Status change dialog coming soon")
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24">
                      <EmptyState
                        icon={UserPlus}
                        title="No candidates found"
                        description={searchQuery ? "Try adjusting your search criteria." : "Get started by adding your first candidate."}
                        action={
                          !searchQuery
                            ? {
                                label: "Add Candidate",
                                onClick: () => setIsCreateCandidateOpen(true),
                              }
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="p-5">
            <KanbanPipeline
              candidates={filteredCandidates}
              onStatusChange={handleStatusChange}
              onCandidateClick={(candidate) => router.push(`/recruitment/candidates/${candidate.id}`)}
            />
          </div>
        )}

        {viewMode === "timeline" && (
          <div className="p-5">
            {filteredCandidates.length > 0 ? (
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <CandidateTimelineItem key={candidate.id} candidate={candidate} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserPlus}
                title="No candidates found"
                description="Get started by adding your first candidate."
                action={{
                  label: "Add Candidate",
                  onClick: () => setIsCreateCandidateOpen(true),
                }}
              />
            )}
          </div>
        )}
      </Card>

      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
    </div>
  )
}

// Timeline item component for list view
function CandidateTimelineItem({ candidate }: { candidate: Candidate }) {
  const router = useRouter()
  const { data: timeline } = useQuery({
    queryKey: ["candidate-timeline", candidate.id],
    queryFn: () => getCandidateTimeline(candidate.id),
    enabled: false, // Will be enabled when timeline view is active
  })

  return (
    <Card
      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/recruitment/candidates/${candidate.id}?tab=timeline`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground">{candidate.fullName}</h4>
          <p className="text-xs text-muted-foreground mt-1">{candidate.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={statusConfig[candidate.status]?.variant || "default"} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
              {statusConfig[candidate.status]?.label || candidate.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Applied {new Date(candidate.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation()
          router.push(`/recruitment/candidates/${candidate.id}?tab=timeline`)
        }}>
          View Timeline
        </Button>
      </div>
    </Card>
  )
}

