"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, Trash2, GraduationCap } from "lucide-react"
import { getTrainingById, getAllTrainingProgress, deleteTraining } from "@/lib/actions/trainings"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { useUser } from "@/lib/hooks/useUser"
import { TrainingForm } from "@/components/training/TrainingForm"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

export default function AdminTrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const trainingId = params.id as string
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: training, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-training", trainingId],
    queryFn: async () => await getTrainingById(trainingId),
    enabled: !userLoading && !!user,
  })

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["training-progress", trainingId],
    queryFn: async () => await getAllTrainingProgress(trainingId),
    enabled: !userLoading && !!user && !!trainingId,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      toast.success("Training deleted successfully")
      router.push("/admin/training")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete training", {
        description: error.message,
      })
    },
  })

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this training? This action cannot be undone.")) {
      await deleteMutation.mutateAsync(trainingId)
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
        title="Failed to load training"
        message="We couldn't load this training. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  if (!training) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Training not found"
        description="The training you're looking for doesn't exist or has been deleted."
      />
    )
  }

  const completionRate =
    progressData && progressData.length > 0
      ? (progressData.filter((p) => p.status === "completed").length /
          progressData.length) *
        100
      : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/training")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
              {training.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Training details and progress overview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Training Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">
                  {training.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="mt-1">
                    {training.category ? (
                      <Badge variant="outline">{training.category}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="mt-1 text-sm">
                    {training.duration ? `${training.duration} minutes` : "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Playlist</label>
                <p className="mt-1">
                  {training.playlist ? (
                    <Badge variant="secondary">{training.playlist.name}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not in a playlist</span>
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Video URL</label>
                <p className="mt-1">
                  <a
                    href={training.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {training.videoUrl}
                  </a>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="mt-1">
                  <Badge
                    variant={training.isActive ? "green-outline" : "neutral-outline"}
                  >
                    {training.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Enrollments
                </label>
                <p className="mt-1 text-2xl font-semibold">
                  {progressData?.length || 0}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </label>
                <p className="mt-1 text-2xl font-semibold">
                  {Math.round(completionRate)}%
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  In Progress
                </label>
                <p className="mt-1 text-2xl font-semibold">
                  {progressData?.filter((p) => p.status === "in-progress").length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {progressLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : progressData && progressData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Accessed</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressData.map((progress) => (
                  <TableRow key={progress.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={getAvatarForUser(progress.user?.name || "user")}
                          />
                          <AvatarFallback>
                            {progress.user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {progress.user?.name || "Unknown"}
                          </p>
                          {progress.user?.email && (
                            <p className="text-xs text-muted-foreground">
                              {progress.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          progress.status === "completed"
                            ? "green-outline"
                            : progress.status === "in-progress"
                            ? "primary-outline"
                            : "neutral-outline"
                        }
                      >
                        {progress.status === "completed"
                          ? "Completed"
                          : progress.status === "in-progress"
                          ? "In Progress"
                          : "Not Started"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${progress.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {progress.progressPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(progress.lastAccessedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {progress.completedAt
                        ? new Date(progress.completedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No progress data"
              description="No users have started this training yet."
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isEditOpen && training && (
        <TrainingForm
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          training={training}
          onSuccess={() => {
            setIsEditOpen(false)
            queryClient.invalidateQueries({ queryKey: ["admin-training", trainingId] })
            queryClient.invalidateQueries({ queryKey: ["admin-trainings"] })
          }}
        />
      )}
    </div>
  )
}

