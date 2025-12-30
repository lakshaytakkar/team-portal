"use client"

import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Layers, Plus, Search, Trash2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getVerticals, deleteVertical, updateVertical } from "@/lib/actions/hierarchy"
import type { Vertical } from "@/lib/types/hierarchy"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateVerticalDialog } from "@/components/admin/CreateVerticalDialog"

async function fetchVerticals() {
  return await getVerticals()
}

export default function AdminVerticalsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingVertical, setEditingVertical] = useState<Vertical | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [verticalToDelete, setVerticalToDelete] = useState<Vertical | null>(null)
  const [selectedVerticals, setSelectedVerticals] = useState<Vertical[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: verticals, isLoading, error, refetch } = useQuery({
    queryKey: ["verticals"],
    queryFn: fetchVerticals,
  })

  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  })

  // Filter and search verticals
  const filteredVerticals = useMemo(() => {
    if (!verticals) return []
    let result = verticals

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((v) => v.isActive)
    } else if (statusFilter === "inactive") {
      result = result.filter((v) => !v.isActive)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.code?.toLowerCase().includes(query) ||
          v.description?.toLowerCase().includes(query)
      )
    }

    return result
  }, [verticals, statusFilter, searchQuery])

  const handleDelete = async () => {
    if (!verticalToDelete) return
    try {
      await deleteVertical(verticalToDelete.id)
      toast.success(`Vertical "${verticalToDelete.name}" deleted`)
      setDeleteConfirmOpen(false)
      setVerticalToDelete(null)
      await refetch()
    } catch (error) {
      toast.error(`Failed to delete vertical: ${error instanceof Error ? error.message : "Unknown error"}`)
      setDeleteConfirmOpen(false)
    }
  }

  const handleToggleActive = async (vertical: Vertical) => {
    try {
      await updateVertical({
        id: vertical.id,
        isActive: !vertical.isActive,
      })
      toast.success(`Vertical "${vertical.name}" ${!vertical.isActive ? "activated" : "deactivated"}`)
      await refetch()
    } catch (error) {
      toast.error(`Failed to update vertical: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVerticals.length === 0) return
    try {
      await Promise.all(selectedVerticals.map((v) => deleteVertical(v.id)))
      toast.success(`${selectedVerticals.length} vertical(s) deleted`)
      setSelectedVerticals([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to delete verticals: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleBulkActivate = async () => {
    if (selectedVerticals.length === 0) return
    try {
      await Promise.all(selectedVerticals.map((v) => updateVertical({ id: v.id, isActive: true })))
      toast.success(`${selectedVerticals.length} vertical(s) activated`)
      setSelectedVerticals([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to activate verticals: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedVerticals.length === 0) return
    try {
      await Promise.all(selectedVerticals.map((v) => updateVertical({ id: v.id, isActive: false })))
      toast.success(`${selectedVerticals.length} vertical(s) deactivated`)
      setSelectedVerticals([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to deactivate verticals: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const toggleVerticalSelection = (vertical: Vertical) => {
    setSelectedVerticals((prev) => {
      if (prev.find((v) => v.id === vertical.id)) {
        return prev.filter((v) => v.id !== vertical.id)
      }
      return [...prev, vertical]
    })
  }

  const toggleSelectAll = () => {
    if (selectedVerticals.length === filteredVerticals.length) {
      setSelectedVerticals([])
    } else {
      setSelectedVerticals([...filteredVerticals])
    }
  }

  const isAllSelected = filteredVerticals.length > 0 && selectedVerticals.length === filteredVerticals.length
  const isSomeSelected = selectedVerticals.length > 0 && selectedVerticals.length < filteredVerticals.length

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="border border-border rounded-2xl">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Verticals Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage business verticals and their configurations</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load verticals"
          message="We couldn't load the verticals. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Verticals Management</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage business verticals and their configurations</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Vertical
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card className="border border-border rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search verticals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="h-[38px] px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {selectedVerticals.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedVerticals.length} selected</span>
                  <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredVerticals.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No verticals found"
              description={
                searchQuery || statusFilter
                  ? "Try adjusting your search or filters."
                  : "No verticals have been created yet."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[44px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerticals.map((vertical) => (
                  <TableRow
                    key={vertical.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/verticals/${vertical.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedVerticals.some((v) => v.id === vertical.id)}
                        onCheckedChange={() => toggleVerticalSelection(vertical)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{vertical.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {vertical.organizationId
                          ? organizations.find((o) => o.id === vertical.organizationId)?.name || "-"
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground font-mono">
                        {vertical.code || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {vertical.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={vertical.isActive ? "default" : "secondary"}
                        className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                      >
                        {vertical.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(vertical.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu
                        entityType="new-vertical"
                        entityId={vertical.id}
                        entityName={vertical.name}
                        detailUrl={`/admin/verticals/${vertical.id}`}
                        onEdit={() => {
                          setEditingVertical(vertical)
                          setIsCreateDialogOpen(true)
                        }}
                        onDelete={async () => {
                          setVerticalToDelete(vertical)
                          setDeleteConfirmOpen(true)
                        }}
                        customActions={[
                          {
                            label: vertical.isActive ? "Deactivate" : "Activate",
                            icon: vertical.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />,
                            onClick: () => handleToggleActive(vertical),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <CreateVerticalDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setEditingVertical(null)
          }
        }}
        editingVertical={editingVertical}
        onSuccess={() => {
          refetch()
          setEditingVertical(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Vertical</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{verticalToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

