"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Plus, Search, Trash2, Lock, Check, Upload, RefreshCw, Mail, Phone, Building2, Calendar, User as UserIcon } from "lucide-react"
import { AdminUser } from "@/lib/types/admin"
import { CreateUserDialog } from "@/components/admin/CreateUserDialog"
import { getUsers, deleteUser, suspendUser, activateUser, bulkDeleteUsers, bulkSuspendUsers, bulkActivateUsers } from "@/lib/actions/admin"
import { createUserColumns } from "@/components/admin/UserColumns"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { DetailDialog } from "@/components/details"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix"
import { permissionDefinitions, defaultRolePermissions } from "@/lib/data/permissions"
import { getUserPermissions, updateUserPermissions } from "@/lib/actions/admin"
import type { RolePermissions } from "@/lib/types/permissions"
import { Save } from "lucide-react"

async function fetchUsers() {
  return await getUsers()
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [userToSuspend, setUserToSuspend] = useState<AdminUser | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoleTab, setSelectedRoleTab] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AdminUser | null>(null)
  const [userPermissions, setUserPermissions] = useState<RolePermissions>({})
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  // Calculate role counts
  const roleCounts = useMemo(() => {
    if (!users) return { all: 0, executive: 0, manager: 0, superadmin: 0 }
    const counts = {
      all: users.length,
      executive: users.filter((u) => u.role === "executive").length,
      manager: users.filter((u) => u.role === "manager").length,
      superadmin: users.filter((u) => u.role === "superadmin").length,
    }
    return counts
  }, [users])

  // Filter and search users
  const filteredUsers = useMemo(() => {
    if (!users) return []
    let result = users

    // Apply role filter
    if (selectedRoleTab && selectedRoleTab !== "all") {
      result = result.filter((user) => user.role === selectedRoleTab)
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((user) => user.status === statusFilter)
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      )
    }

    return result
  }, [users, selectedRoleTab, statusFilter, searchQuery])

  const columns = useMemo(
    () =>
      createUserColumns({
        onViewDetails: (user) => {
          setSelectedUserForDetail(user)
          setDetailDialogOpen(true)
        },
        onEdit: (user) => {
          setEditingUser(user)
          setIsCreateUserOpen(true)
        },
        onDelete: (user) => {
          setUserToDelete(user)
          setDeleteConfirmOpen(true)
        },
        onSuspend: (user) => {
          setUserToSuspend(user)
          setSuspendConfirmOpen(true)
        },
        onActivate: async (user) => {
          try {
            await activateUser(user.id)
            toast.success(`User ${user.name} activated`)
            await refetch()
          } catch (error) {
            toast.error(`Failed to activate user: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        },
        onSendEmail: (user) => {
          // TODO: Implement send email
          toast.info(`Send email to ${user.email}`)
        },
      }),
    [refetch]
  )

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await deleteUser(userToDelete.id)
      toast.success(`User ${userToDelete.name} deleted`)
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
      await refetch()
    } catch (error) {
      toast.error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDeleteConfirmOpen(false)
    }
  }

  const handleSuspend = async () => {
    if (!userToSuspend) return
    try {
      await suspendUser(userToSuspend.id)
      toast.success(`User ${userToSuspend.name} suspended`)
      setSuspendConfirmOpen(false)
      setUserToSuspend(null)
      await refetch()
    } catch (error) {
      toast.error(`Failed to suspend user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSuspendConfirmOpen(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return
    try {
      await bulkDeleteUsers(selectedUsers.map(u => u.id))
      toast.success(`${selectedUsers.length} user(s) deleted`)
      setSelectedUsers([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to delete users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleBulkSuspend = async () => {
    if (selectedUsers.length === 0) return
    try {
      await bulkSuspendUsers(selectedUsers.map(u => u.id))
      toast.success(`${selectedUsers.length} user(s) suspended`)
      setSelectedUsers([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to suspend users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) return
    try {
      await bulkActivateUsers(selectedUsers.map(u => u.id))
      toast.success(`${selectedUsers.length} user(s) activated`)
      setSelectedUsers([])
      await refetch()
    } catch (error) {
      toast.error(`Failed to activate users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleUserSelection = (user: AdminUser) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id)
      }
      return [...prev, user]
    })
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers([...filteredUsers])
    }
  }

  const isAllSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length

  // Fetch user permissions when detail dialog opens
  useEffect(() => {
    if (detailDialogOpen && selectedUserForDetail) {
      setIsLoadingPermissions(true)
      getUserPermissions(selectedUserForDetail.id)
        .then((perms) => {
          // If permissions are all false (user not in DB), merge with role defaults
          const hasAnyPermissions = Object.values(perms).some((v) => v === true)
          if (!hasAnyPermissions && selectedUserForDetail.role) {
            // Merge with role defaults
            const roleDefaults = defaultRolePermissions[selectedUserForDetail.role] || {}
            setUserPermissions({ ...roleDefaults, ...perms })
          } else {
            setUserPermissions(perms)
          }
          setIsLoadingPermissions(false)
        })
        .catch((error) => {
          console.error('Failed to load user permissions:', error)
          // Fallback to role defaults
          const roleDefaults = defaultRolePermissions[selectedUserForDetail.role] || {}
          setUserPermissions(roleDefaults)
          setIsLoadingPermissions(false)
        })
    } else {
      // Reset permissions when dialog closes
      setUserPermissions({})
    }
  }, [detailDialogOpen, selectedUserForDetail])

  const handlePermissionChange = useCallback((permissionKey: string, allowed: boolean) => {
    setUserPermissions((prev) => ({
      ...prev,
      [permissionKey]: allowed,
    }))
  }, [])

  const handleSavePermissions = useCallback(async () => {
    if (!selectedUserForDetail) return

    setIsSavingPermissions(true)
    try {
      await updateUserPermissions(selectedUserForDetail.id, userPermissions)
      toast.success(`Permissions for ${selectedUserForDetail.name} saved successfully`)
      await refetch()
    } catch (error) {
      console.error('Failed to save permissions:', error)
      toast.error('Failed to save permissions')
    } finally {
      setIsSavingPermissions(false)
    }
  }, [selectedUserForDetail, userPermissions, refetch])

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
            <h1 className="text-xl font-semibold text-foreground leading-[1.35]">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage users, assign roles, and configure user permissions</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load users"
          message="We couldn't load the users. Please check your connection and try again."
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
            <h1 className="text-lg font-semibold tracking-tight text-white">User Management</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage users, assign roles, and configure user permissions</p>
          </div>
          <Button onClick={() => setIsCreateUserOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Role Tabs */}
      <Tabs value={selectedRoleTab || "all"} onValueChange={(value) => setSelectedRoleTab(value === "all" ? null : value)}>
        <TabsList className="h-9">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2 h-5 px-2 py-0.5 rounded-2xl text-xs">
              {roleCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="executive">
            Executive
            <Badge variant="secondary" className="ml-2 h-5 px-2 py-0.5 rounded-2xl text-xs">
              {roleCounts.executive}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="manager">
            Manager
            <Badge variant="secondary" className="ml-2 h-5 px-2 py-0.5 rounded-2xl text-xs">
              {roleCounts.manager}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="superadmin">
            SuperAdmin
            <Badge variant="secondary" className="ml-2 h-5 px-2 py-0.5 rounded-2xl text-xs">
              {roleCounts.superadmin}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters and Actions */}
      <Card className="border border-border rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                <option value="suspended">Suspended</option>
              </select>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedUsers.length} selected</span>
                  <Button variant="outline" size="sm" onClick={handleBulkActivate}>
                    <Check className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkSuspend}>
                    <Lock className="h-4 w-4 mr-2" />
                    Suspend
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
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={searchQuery || selectedRoleTab || statusFilter ? "Try adjusting your search or filters." : "No users have been created yet."}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.some((u) => u.id === user.id)}
                        onCheckedChange={() => toggleUserSelection(user)}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key}>{column.render(user)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <CreateUserDialog 
        open={isCreateUserOpen} 
        onOpenChange={(open) => {
          setIsCreateUserOpen(open)
          if (!open) {
            setEditingUser(null)
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">User:</span> {userToDelete.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {userToDelete.email}
              </p>
            </div>
          )}
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

      {/* Suspend Confirmation Dialog */}
      <Dialog open={suspendConfirmOpen} onOpenChange={setSuspendConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>Are you sure you want to suspend this user? They will not be able to access the platform.</DialogDescription>
          </DialogHeader>
          {userToSuspend && (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">User:</span> {userToSuspend.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {userToSuspend.email}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      {selectedUserForDetail && (
        <DetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={`View details for ${selectedUserForDetail.name}`}
          tabs={[
            {
              id: "overview",
              label: "Overview",
              content: (
                <div className="space-y-6">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUserForDetail.avatarUrl} alt={selectedUserForDetail.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                        {selectedUserForDetail.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{selectedUserForDetail.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedUserForDetail.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            selectedUserForDetail.status === "active"
                              ? "default"
                              : selectedUserForDetail.status === "suspended"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {selectedUserForDetail.status.charAt(0).toUpperCase() + selectedUserForDetail.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {selectedUserForDetail.role.charAt(0).toUpperCase() + selectedUserForDetail.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Contact Information</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedUserForDetail.email}`} className="text-sm text-primary hover:text-primary/80">
                          {selectedUserForDetail.email}
                        </a>
                      </div>
                      {selectedUserForDetail.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${selectedUserForDetail.phoneNumber}`} className="text-sm text-primary hover:text-primary/80">
                            {selectedUserForDetail.phoneNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Department Information */}
                  {selectedUserForDetail.department && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">Department</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-foreground">{selectedUserForDetail.department}</p>
                      </div>
                    </div>
                  )}

                  {/* Account Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Account Information</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm text-foreground">
                          {selectedUserForDetail.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-sm text-foreground">
                          {selectedUserForDetail.updatedAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {selectedUserForDetail.username && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Username</span>
                          <span className="text-sm text-foreground">{selectedUserForDetail.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: "permissions",
              label: "Permissions",
              content: (
                <div className="space-y-4">
                  <PermissionsMatrix
                    permissionDefinitions={permissionDefinitions}
                    rolePermissions={userPermissions}
                    selectedRole={selectedUserForDetail.role}
                    isReadOnly={false}
                    loading={isLoadingPermissions}
                    onPermissionChange={handlePermissionChange}
                  />
                </div>
              ),
            },
          ]}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="default"
                onClick={handleSavePermissions}
                disabled={isSavingPermissions || isLoadingPermissions}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSavingPermissions ? "Saving..." : "Save Permissions"}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setDetailDialogOpen(false)
                    setEditingUser(selectedUserForDetail)
                    setIsCreateUserOpen(true)
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}
