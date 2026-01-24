"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Layers, Edit, ArrowLeft, Calendar, User, CheckCircle2, XCircle } from "lucide-react"
import { getVerticalById, updateVertical } from "@/lib/actions/hierarchy"
import type { Vertical } from "@/lib/types/hierarchy"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { CreateVerticalDialog } from "@/components/admin/CreateVerticalDialog"

async function fetchVertical(id: string) {
  return await getVerticalById(id)
}

export default function VerticalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const verticalId = params.id as string
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: vertical, isLoading, error, refetch } = useQuery({
    queryKey: ["vertical", verticalId],
    queryFn: () => fetchVertical(verticalId),
    enabled: !!verticalId,
  })

  const handleToggleActive = async () => {
    if (!vertical) return
    try {
      await updateVertical({
        id: vertical.id,
        isActive: !vertical.isActive,
      })
      toast.success(`Vertical ${!vertical.isActive ? "activated" : "deactivated"}`)
      await refetch()
    } catch (error) {
      toast.error(`Failed to update vertical: ${error instanceof Error ? error.message : "Unknown error"}`)
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

  if (error || !vertical) {
    return (
      <div className="space-y-5">
        <ErrorState
          title="Vertical not found"
          message="The vertical you're looking for doesn't exist or has been deleted."
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
            onClick={() => router.push("/admin/verticals")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground leading-[1.35]">{vertical.name}</h1>
              <Badge
                variant={vertical.isActive ? "default" : "secondary"}
                className="h-5 px-2 py-0.5 rounded-2xl text-xs"
              >
                {vertical.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {vertical.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleActive}>
            {vertical.isActive ? (
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
          <Button size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border border-border rounded-[14px]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border px-6 pt-4">
            <TabsList className="bg-muted p-0.5 rounded-xl w-full">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex-1">
                Teams
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex-1">
                Statistics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                    <p className="text-sm font-medium text-foreground">{vertical.name}</p>
                  </div>
                  {vertical.code && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Code</p>
                      <p className="text-sm font-mono text-foreground">{vertical.code}</p>
                    </div>
                  )}
                  {vertical.description && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Description
                      </p>
                      <p className="text-sm text-foreground">{vertical.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <Badge
                      variant={vertical.isActive ? "default" : "secondary"}
                      className="h-5 px-2 py-0.5 rounded-2xl text-xs"
                    >
                      {vertical.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Metadata
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
                      <p className="text-sm text-foreground">
                        {new Date(vertical.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Updated</p>
                      <p className="text-sm text-foreground">
                        {new Date(vertical.updatedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="p-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Teams Associated with This Vertical
              </h3>
              <p className="text-sm text-muted-foreground">
                Teams that belong to this vertical will be displayed here. This feature will be implemented
                when team management is integrated.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="p-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Statistics
              </h3>
              <p className="text-sm text-muted-foreground">
                Statistics and analytics for this vertical will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Dialog */}
      <CreateVerticalDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingVertical={vertical}
        onSuccess={() => {
          refetch()
          queryClient.invalidateQueries({ queryKey: ["verticals"] })
        }}
      />
    </div>
  )
}

