"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PermissionCard } from "./PermissionCard"
import { ModulePermissionGroup, RolePermissions } from "@/lib/types/permissions"

interface PermissionsMatrixProps {
  permissionDefinitions: ModulePermissionGroup[]
  rolePermissions: RolePermissions
  selectedRole: string
  isReadOnly?: boolean
  loading?: boolean
  onPermissionChange?: (permissionKey: string, allowed: boolean) => void
}

export function PermissionsMatrix({
  permissionDefinitions,
  rolePermissions,
  selectedRole,
  isReadOnly = false,
  loading = false,
  onPermissionChange,
}: PermissionsMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handlePermissionToggle = (permissionKey: string, currentValue: boolean) => {
    if (isReadOnly || !onPermissionChange) return
    onPermissionChange(permissionKey, !currentValue)
  }

  const handleModuleSelectAll = (moduleId: string, checked: boolean) => {
    if (isReadOnly || !onPermissionChange) return
    const group = permissionDefinitions.find((g) => g.moduleId === moduleId)
    if (!group) return

    group.permissions.forEach((perm) => {
      onPermissionChange(perm.key, checked)
    })
  }

  const areAllModulePermissionsSelected = (moduleId: string): boolean => {
    const group = permissionDefinitions.find((g) => g.moduleId === moduleId)
    if (!group) return false
    return group.permissions.every((perm) => rolePermissions[perm.key] === true)
  }

  const areSomeModulePermissionsSelected = (moduleId: string): boolean => {
    const group = permissionDefinitions.find((g) => g.moduleId === moduleId)
    if (!group) return false
    const selectedCount = group.permissions.filter((perm) => rolePermissions[perm.key] === true).length
    return selectedCount > 0 && selectedCount < group.permissions.length
  }

  const filteredPermissionGroups = useMemo(() => {
    if (!searchQuery.trim()) return permissionDefinitions
    return permissionDefinitions.filter(
      (group) =>
        group.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.permissions.some(
          (perm) =>
            perm.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm.key.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
  }, [searchQuery, permissionDefinitions])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-10 max-w-md" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="w-full rounded-2xl">
              <CardContent className="px-4 pb-3">
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-18" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search modules or permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredPermissionGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No modules or permissions found matching your search.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary hover:underline mt-4"
              >
                Clear Search
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredPermissionGroups.map((group) => {
            const allSelected = areAllModulePermissionsSelected(group.moduleId)
            const someSelected = areSomeModulePermissionsSelected(group.moduleId)
            const selectedCount = group.permissions.filter((perm) => rolePermissions[perm.key] === true).length

            return (
              <PermissionCard
                key={group.moduleId}
                group={group}
                rolePermissions={rolePermissions}
                isReadOnly={isReadOnly}
                onPermissionChange={handlePermissionToggle}
                onSelectAll={handleModuleSelectAll}
                allSelected={allSelected}
                someSelected={someSelected}
                selectedCount={selectedCount}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

