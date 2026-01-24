"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Plus, Search, Calendar, Users, Tag } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { toast } from "@/components/ui/sonner"
import { format } from "date-fns"
import { getMeetingNotes, deleteMeetingNote } from "@/lib/actions/meeting-notes"
import type { MeetingNote } from "@/lib/types/meeting-notes"
import { useUser } from "@/lib/hooks/useUser"
import { RowActionsMenu } from "@/components/actions/RowActionsMenu"
import { CreateMeetingNoteDialog } from "@/components/meeting-notes/CreateMeetingNoteDialog"
import { EditMeetingNoteDialog } from "@/components/meeting-notes/EditMeetingNoteDialog"
import { useRouter } from "next/navigation"
import { getUsers } from "@/lib/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

export default function AdminMeetingNotesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [userIdFilter, setUserIdFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null)

  const filters = useMemo(() => {
    const f: any = {}
    if (searchQuery.trim().length >= 2) {
      f.search = searchQuery.trim()
    }
    if (userIdFilter !== "all") {
      f.userId = [userIdFilter]
    }
    if (dateFrom) {
      f.dateFrom = dateFrom
    }
    if (dateTo) {
      f.dateTo = dateTo
    }
    return f
  }, [searchQuery, userIdFilter, dateFrom, dateTo])

  const { data: notes, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-meeting-notes", filters],
    queryFn: async () => await getMeetingNotes(filters),
    enabled: !userLoading && !!user,
  })

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !userLoading && !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMeetingNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-meeting-notes"] })
      queryClient.invalidateQueries({ queryKey: ["my-meeting-notes"] })
      toast.success("Meeting note deleted successfully")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete meeting note", { description: error.message })
    },
  })

  const handleEdit = (note: MeetingNote) => {
    setEditingNote(note)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting note?")) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="p-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load meeting notes"
        message="We couldn't load meeting notes. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-[1.35]">Meeting Notes Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all employee meeting notes
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-border rounded-[14px]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meeting notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={userIdFilter} onValueChange={setUserIdFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="w-[150px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="w-[150px]"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="divide-y divide-border">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/meeting-notes/${note.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{note.title}</h3>
                      {note.user && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getAvatarForUser(note.user.name)} />
                            <AvatarFallback className="text-xs">
                              {note.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{note.user.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.content}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(note.meetingDate), "MMM dd, yyyy")}
                      </div>
                      {note.attendees && note.attendees.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {note.attendees.length} attendee{note.attendees.length !== 1 ? "s" : ""}
                        </div>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityType="meeting-note"
                      entityId={note.id}
                      entityName={note.title}
                      detailUrl={`/admin/meeting-notes/${note.id}`}
                      canView={true}
                      canEdit={true}
                      canDelete={true}
                      onEdit={() => handleEdit(note)}
                      onDelete={() => handleDelete(note.id)}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12">
              <EmptyState
                icon={FileText}
                title="No meeting notes found"
                description={
                  searchQuery || userIdFilter !== "all" || dateFrom || dateTo
                    ? "Try adjusting your search or filters."
                    : "No meeting notes have been created yet."
                }
              />
            </div>
          )}
        </div>
      </Card>

      {/* Dialogs */}
      <CreateMeetingNoteDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {editingNote && (
        <EditMeetingNoteDialog
          open={!!editingNote}
          onOpenChange={(open) => {
            if (!open) setEditingNote(null)
          }}
          note={editingNote}
        />
      )}
    </div>
  )
}

