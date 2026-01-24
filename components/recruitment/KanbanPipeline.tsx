"use client"

import { useMemo } from "react"
import { KanbanBoard, type KanbanColumn } from "@/components/kanban/KanbanBoard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Candidate, CandidateStatus } from "@/lib/types/candidate"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { CandidateRowActions } from "./CandidateRowActions"
import { useRouter } from "next/navigation"

interface KanbanPipelineProps {
  candidates: Candidate[]
  onStatusChange: (candidateId: string, newStatus: CandidateStatus) => Promise<void>
  onCandidateClick?: (candidate: Candidate) => void
  className?: string
}

const statusColumns: Array<{ id: CandidateStatus; title: string; dotColor: string }> = [
  { id: "new", title: "New", dotColor: "bg-[#3b82f6]" },
  { id: "screening", title: "Screening", dotColor: "bg-[#8b5cf6]" },
  { id: "interview", title: "Interview", dotColor: "bg-[#f59e0b]" },
  { id: "offer", title: "Offer", dotColor: "bg-[#10b981]" },
  { id: "hired", title: "Hired", dotColor: "bg-[#339d88]" },
  { id: "rejected", title: "Rejected", dotColor: "bg-[#df1c41]" },
]

export function KanbanPipeline({
  candidates,
  onStatusChange,
  onCandidateClick,
  className,
}: KanbanPipelineProps) {
  const router = useRouter()

  const columns: KanbanColumn<Candidate>[] = useMemo(() => {
    return statusColumns.map((col) => ({
      id: col.id,
      title: col.title,
      dotColor: col.dotColor,
      items: candidates.filter((c) => c.status === col.id),
    }))
  }, [candidates])

  const handleItemMove = async (itemId: string, newColumnId: string, oldColumnId: string) => {
    const candidate = candidates.find((c) => c.id === itemId)
    if (candidate && newColumnId !== oldColumnId) {
      await onStatusChange(itemId, newColumnId as CandidateStatus)
    }
  }

  const renderCandidateCard = (candidate: Candidate) => {
    const daysInStage = Math.floor(
      (new Date().getTime() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    return (
      <Card
        className="border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => {
          if (onCandidateClick) {
            onCandidateClick(candidate)
          } else {
            router.push(`/recruitment/candidates/${candidate.id}`)
          }
        }}
      >
        <CardContent className="p-0 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{candidate.fullName}</h4>
              <p className="text-xs text-muted-foreground truncate">{candidate.positionApplied}</p>
            </div>
            <CandidateRowActions
              candidate={candidate}
              canView={true}
              canEdit={true}
              canDelete={false}
              onScheduleInterview={() => {
                router.push(`/recruitment/interviews?candidate=${candidate.id}`)
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {candidate.source && (
              <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                {candidate.source}
              </Badge>
            )}
            {daysInStage > 0 && (
              <span className="text-xs text-muted-foreground">{daysInStage}d</span>
            )}
          </div>

          {candidate.email && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={getAvatarForUser(candidate.fullName)} alt={candidate.fullName} />
                <AvatarFallback className="text-xs">
                  {candidate.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{candidate.email}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <KanbanBoard
        columns={columns}
        onItemMove={handleItemMove}
        renderItem={renderCandidateCard}
        getItemId={(candidate) => candidate.id}
      />
    </div>
  )
}

