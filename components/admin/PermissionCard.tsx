"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ModulePermissionGroup, RolePermissions } from "@/lib/types/permissions"

interface PermissionCardProps {
  group: ModulePermissionGroup
  rolePermissions: RolePermissions
  isReadOnly: boolean
  onPermissionChange?: (permissionKey: string, allowed: boolean) => void
  onSelectAll?: (moduleId: string, checked: boolean) => void
  allSelected: boolean
  someSelected: boolean
  selectedCount: number
}

export function PermissionCard({
  group,
  rolePermissions,
  isReadOnly,
  onPermissionChange,
  onSelectAll,
  allSelected,
  someSelected,
  selectedCount,
}: PermissionCardProps) {
  const totalPermissions = group.permissions.length

  const handlePermissionToggle = (permissionKey: string, currentValue: boolean) => {
    if (isReadOnly || !onPermissionChange) return
    onPermissionChange(permissionKey, !currentValue)
  }

  return (
    <Card className="border border-border rounded-2xl hover:border-primary/20 transition-colors w-full">
      <CardHeader className="pb-2 px-4 pt-3 border-b border-border">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <CardTitle className="text-sm font-semibold truncate" title={group.moduleName}>
            {group.moduleName}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {selectedCount}/{totalPermissions}
            </span>
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => {
                if (!onSelectAll) return
                if (someSelected && !allSelected) {
                  onSelectAll(group.moduleId, true)
                } else {
                  onSelectAll(group.moduleId, checked === true)
                }
              }}
              disabled={isReadOnly}
              className={`flex-shrink-0 ${someSelected && !allSelected ? "opacity-75" : ""}`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {group.permissions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No permissions</p>
        ) : (
          <div className="flex flex-wrap gap-x-2 gap-y-2">
            {group.permissions.map((perm) => {
              const isAllowed = rolePermissions[perm.key] === true

              return (
                <div key={perm.key} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`perm-${perm.key}`}
                    checked={isAllowed}
                    onCheckedChange={() => handlePermissionToggle(perm.key, isAllowed)}
                    disabled={isReadOnly}
                    className="flex-shrink-0"
                  />
                  <label
                    htmlFor={`perm-${perm.key}`}
                    className="text-xs cursor-pointer hover:text-primary transition-colors leading-tight whitespace-nowrap"
                    title={perm.description || perm.label}
                  >
                    {perm.label}
                  </label>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

