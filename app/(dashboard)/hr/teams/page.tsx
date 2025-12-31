"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"
import { getTeams } from "@/lib/actions/hr"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchTeams() {
  return await getTeams()
}

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: teams, isLoading, error, refetch } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  })

  const filteredTeams = teams?.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.vertical?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <ErrorState
        title="Failed to load teams"
        message="We couldn't load teams. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Teams</h1>
            <p className="text-xs text-white/90 mt-0.5">View all teams (auto-generated from department × vertical combinations)</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTeams && filteredTeams.length > 0 ? (
            <div className="space-y-3">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{team.name}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>Department: {team.department?.name ?? "Unknown"}</span>
                        {team.vertical && <span> • Vertical: {team.vertical.name}</span>}
                        {!team.vertical && <span> • Vertical-agnostic</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No teams yet"
              description="Teams are automatically created when departments and verticals are combined."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

