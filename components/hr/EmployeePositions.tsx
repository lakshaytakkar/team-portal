"use client"

import { useQuery } from "@tanstack/react-query"
import { getPositions } from "@/lib/actions/hr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Briefcase, Calendar } from "lucide-react"
import { CreatePositionDialog } from "./CreatePositionDialog"
import { useState } from "react"
import type { Position } from "@/lib/types/hierarchy"

interface EmployeePositionsProps {
  employeeId: string
}

export function EmployeePositions({ employeeId }: EmployeePositionsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["positions", employeeId],
    queryFn: () => getPositions(employeeId),
  })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading positions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Positions</h3>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      {positions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No positions assigned. Add a position to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </div>
      )}

      <CreatePositionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        employeeId={employeeId}
      />
    </div>
  )
}

function PositionCard({ position }: { position: Position }) {
  return (
    <Card className={position.isPrimary ? "border-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {position.title || position.role?.name || "Untitled Position"}
              {position.isPrimary && (
                <Badge variant="default" className="text-xs">Primary</Badge>
              )}
              {!position.isActive && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {position.role && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {position.role.name}
                </span>
              )}
              {position.team && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {position.team.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          {position.startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Started: {new Date(position.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {position.endDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Ended: {new Date(position.endDate).toLocaleDateString()}</span>
            </div>
          )}
          {position.team?.vertical && (
            <div className="text-muted-foreground">
              Vertical: {position.team.vertical.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}






