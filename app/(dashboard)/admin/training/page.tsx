"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Trash2, Edit, Eye, GraduationCap } from "lucide-react"
import type { Training, Playlist, TrainingFilters } from "@/lib/types/trainings"
import { cn } from "@/lib/utils"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import {
  getTrainings,
  getPlaylists,
  deleteTraining,
  deletePlaylist,
} from "@/lib/actions/trainings"
import { useUser } from "@/lib/hooks/useUser"
import { useRouter } from "next/navigation"
import { TrainingForm } from "@/components/training/TrainingForm"
import { PlaylistForm } from "@/components/training/PlaylistForm"

export default function AdminTrainingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [playlistFilter, setPlaylistFilter] = useState<string>("all")
  const [isCreateTrainingOpen, setIsCreateTrainingOpen] = useState(false)
  const [isEditTrainingOpen, setIsEditTrainingOpen] = useState(false)
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Build filters
  const filters = useMemo<TrainingFilters>(() => {
    const f: TrainingFilters = {}
    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }
    if (categoryFilter !== "all") {
      f.category = [categoryFilter]
    }
    if (playlistFilter !== "all") {
      f.playlistId = [playlistFilter]
    }
    return f
  }, [searchQuery, categoryFilter, playlistFilter])

  const { data: trainings, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-trainings", filters],
    queryFn: async () => await getTrainings(filters),
    enabled: !userLoading && !!user,
  })

  const { data: playlists } = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => await getPlaylists({ isActive: true }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] })
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      toast.success("Training deleted successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete training", {
        description: error.message,
      })
    },
  })

  const categories = Array.from(
    new Set(trainings?.map((t) => t.category).filter((c): c is string => Boolean(c)) || [])
  )

  const handleCreateTraining = () => {
    setEditingTraining(null)
    setIsCreateTrainingOpen(true)
  }

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training)
    setIsEditTrainingOpen(true)
  }

  const handleDeleteTraining = async (id: string) => {
    if (confirm("Are you sure you want to delete this training?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load trainings"
        message="We couldn't load trainings. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Training Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage training courses and playlists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatePlaylistOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Button>
          <Button size="sm" onClick={handleCreateTraining}>
            <Plus className="h-4 w-4 mr-2" />
            New Training
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Trainings</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-[38px] border-border rounded-lg"
              />
            </div>
            <Select value={playlistFilter} onValueChange={setPlaylistFilter}>
              <SelectTrigger className="h-[38px] w-[180px]">
                <SelectValue placeholder="All Playlists" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Playlists</SelectItem>
                {playlists?.map((playlist) => (
                  <SelectItem key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-[38px] w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {trainings && trainings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>
                      {training.category && (
                        <Badge variant="outline">{training.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {training.playlist ? (
                        <Badge variant="secondary">{training.playlist.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {training.duration ? `${training.duration} min` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={training.isActive ? "green-outline" : "neutral-outline"}
                      >
                        {training.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        entityType="training"
                        entityId={training.id}
                        entityName={training.title}
                        canView={true}
                        canEdit={true}
                        canDelete={true}
                        detailUrl={`/admin/training/${training.id}`}
                        onEdit={() => handleEditTraining(training)}
                        onDelete={() => handleDeleteTraining(training.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12">
              <EmptyState
                icon={GraduationCap}
                title="No trainings found"
                description={
                  searchQuery || categoryFilter !== "all" || playlistFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Create your first training course to get started."
                }
              />
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Training Dialog */}
      {isCreateTrainingOpen && (
        <TrainingForm
          open={isCreateTrainingOpen}
          onOpenChange={setIsCreateTrainingOpen}
          onSuccess={() => {
            setIsCreateTrainingOpen(false)
            queryClient.invalidateQueries({ queryKey: ["admin-trainings"] })
            queryClient.invalidateQueries({ queryKey: ["trainings"] })
          }}
        />
      )}

      {isEditTrainingOpen && editingTraining && (
        <TrainingForm
          open={isEditTrainingOpen}
          onOpenChange={setIsEditTrainingOpen}
          training={editingTraining}
          onSuccess={() => {
            setIsEditTrainingOpen(false)
            setEditingTraining(null)
            queryClient.invalidateQueries({ queryKey: ["admin-trainings"] })
            queryClient.invalidateQueries({ queryKey: ["trainings"] })
          }}
        />
      )}

      {/* Create Playlist Dialog */}
      {isCreatePlaylistOpen && (
        <PlaylistForm
          open={isCreatePlaylistOpen}
          onOpenChange={setIsCreatePlaylistOpen}
          onSuccess={() => {
            setIsCreatePlaylistOpen(false)
            queryClient.invalidateQueries({ queryKey: ["playlists"] })
          }}
        />
      )}
    </div>
  )
}

