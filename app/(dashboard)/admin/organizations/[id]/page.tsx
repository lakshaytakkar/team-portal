"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Building, Edit, ArrowLeft, Calendar, User, CheckCircle2, XCircle, Layers } from "lucide-react"
import { getOrganizationById, updateOrganization, getVerticals } from "@/lib/actions/hierarchy"
import type { Organization, Vertical } from "@/lib/types/hierarchy"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { CreateOrganizationDialog } from "@/components/admin/CreateOrganizationDialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function fetchOrganization(id: string) {
  return await getOrganizationById(id)
}

async function fetchVerticals(organizationId: string) {
  return await getVerticals(organizationId)
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const organizationId = params.id as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: organization, isLoading, error, refetch } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => fetchOrganization(organizationId),
    enabled: !!organizationId,
  })

  const { data: verticals = [], isLoading: isLoadingVerticals } = useQuery({
    queryKey: ["verticals", organizationId],
    queryFn: () => fetchVerticals(organizationId),
    enabled: !!organizationId && activeTab === "verticals",
  })

  const handleToggleActive = async () => {
    if (!organization) return
    try {
      await updateOrganization({
        id: organization.id,
        isActive: !organization.isActive,
      })
      toast.success(`Organization ${!organization.isActive ? "activated" : "deactivated"}`)
      await refetch()
    } catch (error) {
      toast.error(`Failed to update organization: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Card className="border border-border rounded-[14px]">
          <CardContent className="p-5">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="space-y-5">
        <ErrorState
          title="Organization not found"
          message="The organization you're looking for doesn't exist or has been deleted."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/organizations")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{organization.name}</h1>
              <Badge
                variant={organization.isActive ? "default" : "secondary"}
                className="h-5 px-2 py-0.5 rounded-2xl text-xs"
              >
                {organization.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {organization.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {organization.isActive ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verticals">Verticals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5 mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Organization Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="text-sm font-medium text-foreground">{organization.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Code</p>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {organization.code || "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">
                    {organization.description || "No description provided"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      variant={organization.isActive ? "default" : "secondary"}
                      className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                    >
                      {organization.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="text-sm text-foreground">
                      {new Date(organization.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verticals" className="space-y-5 mt-5">
          <Card className="border border-border rounded-[14px]">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Verticals</h2>
              {isLoadingVerticals ? (
                <Skeleton className="h-32 w-full" />
              ) : verticals.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No verticals assigned to this organization</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verticals.map((vertical) => (
                      <TableRow
                        key={vertical.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/verticals/${vertical.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{vertical.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground font-mono">
                            {vertical.code || "-"}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/verticals/${vertical.id}`)
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <CreateOrganizationDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
        }}
        editingOrganization={organization}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}

