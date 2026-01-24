"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Shield, Save } from "lucide-react"
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix"
import { permissionDefinitions, defaultRolePermissions } from "@/lib/data/permissions"
import { RolePermissions, UserRole } from "@/lib/types/permissions"
import { toast } from "@/components/ui/sonner"

export default function AdminPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("executive")
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(() => {
    // Initialize with default permissions
    const perms: Record<UserRole, RolePermissions> = {
      executive: { ...defaultRolePermissions.executive },
      manager: { ...defaultRolePermissions.manager },
      superadmin: { ...defaultRolePermissions.superadmin },
    }
    return perms
  })

  const currentPermissions = rolePermissions[selectedRole]

  const handlePermissionChange = useCallback(
    (permissionKey: string, allowed: boolean) => {
      setRolePermissions((prev) => ({
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [permissionKey]: allowed,
        },
      }))
    },
    [selectedRole]
  )

  const handleSave = useCallback(() => {
    // TODO: Implement save API call
    toast.success(`Permissions for ${selectedRole} saved successfully`)
    console.log("Saving permissions for role:", selectedRole, currentPermissions)
  }, [selectedRole, currentPermissions])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Permission Matrix</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage role-based permissions and access control policies</p>
          </div>
          <Button onClick={handleSave} variant="secondary" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Role Tabs */}
      <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
        <TabsList className="h-9">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="manager">Manager</TabsTrigger>
          <TabsTrigger value="superadmin">SuperAdmin</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Permissions Matrix */}
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-5">
          <PermissionsMatrix
            permissionDefinitions={permissionDefinitions}
            rolePermissions={currentPermissions}
            selectedRole={selectedRole}
            isReadOnly={false}
            loading={false}
            onPermissionChange={handlePermissionChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
