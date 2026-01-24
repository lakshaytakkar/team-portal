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
import { Building, Plus, Search, Trash2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getOrganizations, deleteOrganization, updateOrganization } from "@/lib/actions/hierarchy"
import type { Organization } from "@/lib/types/hierarchy"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateOrganizationDialog } from "@/components/admin/CreateOrganizationDialog"

async function fetchOrganizations() {
  return await getOrganizations()
}

export default function AdminOrganizationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null)
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const { data: organizations, isLoading, error, refetch } = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  })

  // Filter and search organizations
  const filteredOrganizations = useMemo(() => {
    if (!organizations) return []
    let result = organizations

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((o) => o.isActive)
    } else if (statusFilter === "inactive") {
      result = result.filter((o) => !o.isActive)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(query) ||
          o.code?.toLowerCase().includes(query) ||
          o.description?.toLowerCase().includes(query)
      )
    }

    return result
  }, [organizations, statusFilter, searchQuery])

  const handleDelete = async () => {
    if (!organizationToDelete) return
    try {
      await deleteOrganization(organizationToDelete.id)
      toast.success(`Organization "${organizationToDelete.name}" deleted`)
      setDeleteConfirmOpen(false)
      setOrganizationToDelete(null)
      await refetch()
    } catch (error) {
      toast.error(`Failed to delete organization: ${error instanceof Error ? error.message : "Unknown error"}`)
      setDeleteConfirmOpen(false)
    }
  }

  const handleToggleActive = async (organization: Organization) => {
    try {
      await updateOrganization({
        id: organization.id,
        isActive: !organization.isActive,
      })
      toast.success(`Organization "${organization.name}" ${!organization.isActive ? "activated" : "deactivated"}`)
      await refetch()
    } catch (error) {
      toast.error(`Failed to update organization: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedOrganizations.length === 0) return
    try {
      await Promise.all(selectedOrganizations.map((o) => deleteOrganization(o.id)))
      toast.success(`${selectedOrganizations.length} organization(s) deleted`)
      setSelectedOrganizations([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to delete organizations: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleBulkActivate = async () => {
    if (selectedOrganizations.length === 0) return
    try {
      await Promise.all(selectedOrganizations.map((o) => updateOrganization({ id: o.id, isActive: true })))
      toast.success(`${selectedOrganizations.length} organization(s) activated`)
      setSelectedOrganizations([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to activate organizations: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedOrganizations.length === 0) return
    try {
      await Promise.all(selectedOrganizations.map((o) => updateOrganization({ id: o.id, isActive: false })))
      toast.success(`${selectedOrganizations.length} organization(s) deactivated`)
      setSelectedOrganizations([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to deactivate organizations: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const toggleOrganizationSelection = (organization: Organization) => {
    setSelectedOrganizations((prev) => {
      if (prev.find((o) => o.id === organization.id)) {
        return prev.filter((o) => o.id !== organization.id)
      }
      return [...prev, organization]
    })
  }

  const toggleSelectAll = () => {
    if (selectedOrganizations.length === filteredOrganizations.length) {
      setSelectedOrganizations([])
    } else {
      setSelectedOrganizations([...filteredOrganizations])
    }
  }

  const isAllSelected = filteredOrganizations.length > 0 && selectedOrganizations.length === filteredOrganizations.length
  const isSomeSelected = selectedOrganizations.length > 0 && selectedOrganizations.length < filteredOrganizations.length

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
            <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Organizations Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage organizations and their configurations</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load organizations"
          message="We couldn't load the organizations. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">Organizations Management</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage organizations and their configurations</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
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
                placeholder="Search organizations..."
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
              {selectedOrganizations.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedOrganizations.length} selected</span>
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
          {filteredOrganizations.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No organizations found"
              description={
                searchQuery || statusFilter
                  ? "Try adjusting your search or filters."
                  : "No organizations have been created yet."
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
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[44px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((organization) => (
                  <TableRow
                    key={organization.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/organizations/${organization.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedOrganizations.some((o) => o.id === organization.id)}
                        onCheckedChange={() => toggleOrganizationSelection(organization)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{organization.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground font-mono">
                        {organization.code || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {organization.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={organization.isActive ? "default" : "secondary"}
                        className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                      >
                        {organization.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(organization.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu
                        entityType="organization"
                        entityId={organization.id}
                        entityName={organization.name}
                        detailUrl={`/admin/organizations/${organization.id}`}
                        onEdit={() => {
                          setEditingOrganization(organization)
                          setIsCreateDialogOpen(true)
                        }}
                        onDelete={async () => {
                          setOrganizationToDelete(organization)
                          setDeleteConfirmOpen(true)
                        }}
                        customActions={[
                          {
                            label: organization.isActive ? "Deactivate" : "Activate",
                            icon: organization.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />,
                            onClick: () => handleToggleActive(organization),
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
      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setEditingOrganization(null)
          }
        }}
        editingOrganization={editingOrganization}
        onSuccess={() => {
          refetch()
          setEditingOrganization(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{organizationToDelete?.name}"? This action cannot be undone.
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

