"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { getEmployeeAssets, returnEmployeeAsset } from "@/lib/actions/employee-assets"
import { toast } from "@/components/ui/sonner"
import { Package, Calendar, RotateCcw, ChevronDown, ChevronRight } from "lucide-react"
import { AssetImage } from "./AssetImage"
import type { AssetAssignment } from "@/lib/types/hr"

interface EmployeeAssetsProps {
  employeeId: string
}

export function EmployeeAssets({ employeeId }: EmployeeAssetsProps) {
  const [showHistorical, setShowHistorical] = useState(false)
  const queryClient = useQueryClient()

  const { data: assets, isLoading } = useQuery({
    queryKey: ["employee-assets", employeeId],
    queryFn: () => getEmployeeAssets(employeeId),
  })

  const handleReturnAsset = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to return this asset?")) {
      return
    }

    try {
      await returnEmployeeAsset(assignmentId)
      queryClient.invalidateQueries({ queryKey: ["employee-assets", employeeId] })
      toast.success("Asset returned successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to return asset")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-border rounded-2xl">
              <CardContent className="p-4">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const current = assets?.current || []
  const historical = assets?.historical || []

  return (
    <div className="space-y-4">
      {/* Current Assignments */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Assignments</h3>
        {current.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Package}
                title="No assets currently assigned"
                description="This employee has no assets assigned at the moment."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {current.map((assignment) => (
              <AssetAssignmentCard
                key={assignment.id}
                assignment={assignment}
                onReturn={handleReturnAsset}
              />
            ))}
          </div>
        )}
      </div>

      {/* Historical Assignments */}
      {historical.length > 0 && (
        <div>
          <Button
            variant="ghost"
            onClick={() => setShowHistorical(!showHistorical)}
            className="flex items-center gap-2 p-0 h-auto"
          >
            {showHistorical ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <h3 className="text-lg font-semibold">Historical Assignments ({historical.length})</h3>
          </Button>
          {showHistorical && (
            <div className="mt-4 space-y-3">
              {historical.map((assignment) => (
                <AssetAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  isHistorical
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface AssetAssignmentCardProps {
  assignment: AssetAssignment
  onReturn?: (assignmentId: string) => void
  isHistorical?: boolean
}

function AssetAssignmentCard({ assignment, onReturn, isHistorical }: AssetAssignmentCardProps) {
  return (
    <Card className="border border-border rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Asset Image */}
          <div className="flex-shrink-0">
            <AssetImage
              imageUrl={assignment.asset.imageUrl}
              assetTypeIcon={assignment.asset.assetType.icon}
              alt={assignment.asset.name}
              size="sm"
            />
          </div>

          {/* Asset Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm text-foreground">{assignment.asset.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {assignment.asset.assetType.name}
                </p>
              </div>
              {!isHistorical && onReturn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReturn(assignment.id)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Return
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {assignment.asset.serialNumber && (
                <span>SN: {assignment.asset.serialNumber}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
              </span>
              {assignment.returnDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Returned: {new Date(assignment.returnDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {assignment.returnNotes && (
              <div className="text-xs text-muted-foreground">
                <strong>Return notes:</strong> {assignment.returnNotes}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

