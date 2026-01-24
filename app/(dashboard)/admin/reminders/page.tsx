"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  cancelReminder,
} from "@/lib/actions/reminders"
import { getUsers } from "@/lib/actions/admin"
import type {
  Reminder,
  ReminderStatus,
  ReminderPriority,
  CreateReminderInput,
  UpdateReminderInput,
  RecurrencePattern,
} from "@/lib/types/reminder"
import { formatDistanceToNow, format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarForUser } from "@/lib/utils/avatars"

async function fetchReminders() {
  return await getReminders()
}

async function fetchUsers() {
  return await getUsers()
}

function getPriorityColor(priority: ReminderPriority) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "medium":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "low":
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

function getStatusColor(status: ReminderStatus) {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "triggered":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "completed":
      return "bg-green-100 text-green-700 border-green-200"
    case "cancelled":
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export default function AdminRemindersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null)
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<ReminderPriority | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateReminderInput>({
    assignedTo: "",
    title: "",
    message: "",
    reminderDate: "",
    isRecurring: false,
    priority: "medium",
    actionRequired: true,
    actionUrl: "",
  })

  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>({
    type: "daily",
    interval: 1,
  })

  const { data: reminders, isLoading, error, refetch } = useQuery({
    queryKey: ["reminders"],
    queryFn: fetchReminders,
  })

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      setIsCreateOpen(false)
      resetForm()
      toast.success("Reminder created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create reminder")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReminderInput }) =>
      updateReminder(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      setEditingReminder(null)
      resetForm()
      toast.success("Reminder updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update reminder")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      setDeleteConfirmOpen(false)
      setReminderToDelete(null)
      toast.success("Reminder deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete reminder")
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      toast.success("Reminder cancelled successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel reminder")
    },
  })

  const resetForm = () => {
    setFormData({
      assignedTo: "",
      title: "",
      message: "",
      reminderDate: "",
      isRecurring: false,
      priority: "medium",
      actionRequired: true,
      actionUrl: "",
    })
    setRecurrencePattern({
      type: "daily",
      interval: 1,
    })
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      assignedTo: reminder.assignedTo,
      title: reminder.title,
      message: reminder.message,
      reminderDate: reminder.reminderDate,
      isRecurring: reminder.isRecurring,
      priority: reminder.priority,
      actionRequired: reminder.actionRequired,
      actionUrl: reminder.actionUrl || "",
    })
    if (reminder.recurrencePattern) {
      setRecurrencePattern(reminder.recurrencePattern)
    }
    setIsCreateOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.assignedTo || !formData.title || !formData.message || !formData.reminderDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const input: CreateReminderInput | UpdateReminderInput = {
      ...formData,
      recurrencePattern: formData.isRecurring ? recurrencePattern : null,
    }

    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, input })
    } else {
      createMutation.mutate(input as CreateReminderInput)
    }
  }

  // Filter reminders
  const filteredReminders = useMemo(() => {
    if (!reminders) return []

    let result = reminders

    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (priorityFilter) {
      result = result.filter((r) => r.priority === priorityFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.message.toLowerCase().includes(query) ||
          users.find((u) => u.id === r.assignedTo)?.name.toLowerCase().includes(query)
      )
    }

    return result
  }, [reminders, statusFilter, priorityFilter, searchQuery, users])

  // Calculate counts
  const statusCounts = useMemo(() => {
    if (!reminders) return { scheduled: 0, triggered: 0, completed: 0, cancelled: 0 }
    return {
      scheduled: reminders.filter((r) => r.status === "scheduled").length,
      triggered: reminders.filter((r) => r.status === "triggered").length,
      completed: reminders.filter((r) => r.status === "completed").length,
      cancelled: reminders.filter((r) => r.status === "cancelled").length,
    }
  }, [reminders])

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage reminders for users</p>
          </div>
        </div>
        <ErrorState
          title="Failed to load reminders"
          message={error instanceof Error ? error.message : "An error occurred"}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage reminders for users</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Reminder
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reminders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? null : (v as ReminderStatus))}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="triggered">Triggered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter || "all"} onValueChange={(v) => setPriorityFilter(v === "all" ? null : (v as ReminderPriority))}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({reminders?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({statusCounts.scheduled})</TabsTrigger>
          <TabsTrigger value="triggered">Triggered ({statusCounts.triggered})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <RemindersList
            reminders={filteredReminders}
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(r) => {
              setReminderToDelete(r)
              setDeleteConfirmOpen(true)
            }}
            onCancel={(r) => {
              if (r.status === "scheduled" || r.status === "triggered") {
                cancelMutation.mutate(r.id)
              }
            }}
          />
        </TabsContent>
        <TabsContent value="scheduled">
          <RemindersList
            reminders={filteredReminders.filter((r) => r.status === "scheduled")}
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(r) => {
              setReminderToDelete(r)
              setDeleteConfirmOpen(true)
            }}
            onCancel={(r) => cancelMutation.mutate(r.id)}
          />
        </TabsContent>
        <TabsContent value="triggered">
          <RemindersList
            reminders={filteredReminders.filter((r) => r.status === "triggered")}
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(r) => {
              setReminderToDelete(r)
              setDeleteConfirmOpen(true)
            }}
            onCancel={(r) => cancelMutation.mutate(r.id)}
          />
        </TabsContent>
        <TabsContent value="completed">
          <RemindersList
            reminders={filteredReminders.filter((r) => r.status === "completed")}
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(r) => {
              setReminderToDelete(r)
              setDeleteConfirmOpen(true)
            }}
            onCancel={() => {}}
          />
        </TabsContent>
        <TabsContent value="cancelled">
          <RemindersList
            reminders={filteredReminders.filter((r) => r.status === "cancelled")}
            users={users}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(r) => {
              setReminderToDelete(r)
              setDeleteConfirmOpen(true)
            }}
            onCancel={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setEditingReminder(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReminder ? "Edit Reminder" : "Create Reminder"}</DialogTitle>
            <DialogDescription>
              {editingReminder
                ? "Update the reminder details"
                : "Create a new reminder for a user"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To *</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatarUrl || getAvatarForUser(user.id)} />
                          <AvatarFallback className="text-xs">
                            {user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name} ({user.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderDate">Reminder Date & Time *</Label>
                <Input
                  id="reminderDate"
                  type="datetime-local"
                  value={
                    formData.reminderDate
                      ? format(new Date(formData.reminderDate), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      // Convert local datetime to ISO string
                      const localDate = new Date(e.target.value)
                      const isoString = localDate.toISOString()
                      setFormData({ ...formData, reminderDate: isoString })
                    } else {
                      setFormData({ ...formData, reminderDate: "" })
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as ReminderPriority })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="actionRequired"
                checked={formData.actionRequired}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, actionRequired: checked as boolean })
                }
              />
              <Label htmlFor="actionRequired" className="cursor-pointer">
                Action Required (User must acknowledge)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionUrl">Action URL (Optional)</Label>
              <Input
                id="actionUrl"
                value={formData.actionUrl || ""}
                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                placeholder="/tasks/123"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRecurring: checked as boolean })
                }
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">
                Recurring Reminder
              </Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recurrence Type</Label>
                    <Select
                      value={recurrencePattern.type}
                      onValueChange={(value) =>
                        setRecurrencePattern({ ...recurrencePattern, type: value as RecurrencePattern["type"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Interval</Label>
                    <Input
                      type="number"
                      min={1}
                      value={recurrencePattern.interval || 1}
                      onChange={(e) =>
                        setRecurrencePattern({
                          ...recurrencePattern,
                          interval: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                {recurrencePattern.type === "weekly" && (
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                        return (
                          <Button
                            key={day}
                            type="button"
                            variant={
                              recurrencePattern.days_of_week?.includes(day) ? "default" : "outline"
                            }
                            onClick={() => {
                              const days = recurrencePattern.days_of_week || []
                              const newDays = days.includes(day)
                                ? days.filter((d) => d !== day)
                                : [...days, day].sort()
                              setRecurrencePattern({ ...recurrencePattern, days_of_week: newDays })
                            }}
                          >
                            {dayNames[day - 1]}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {recurrencePattern.type === "monthly" && (
                  <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={recurrencePattern.day_of_month || ""}
                      onChange={(e) =>
                        setRecurrencePattern({
                          ...recurrencePattern,
                          day_of_month: parseInt(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={recurrencePattern.end_date || ""}
                    onChange={(e) =>
                      setRecurrencePattern({
                        ...recurrencePattern,
                        end_date: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingReminder(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {editingReminder ? "Updating..." : "Creating..."}
                  </>
                ) : editingReminder ? (
                  "Update Reminder"
                ) : (
                  "Create Reminder"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reminder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reminder? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (reminderToDelete) {
                  deleteMutation.mutate(reminderToDelete.id)
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RemindersList({
  reminders,
  users,
  isLoading,
  onEdit,
  onDelete,
  onCancel,
}: {
  reminders: Reminder[]
  users: any[]
  isLoading: boolean
  onEdit: (reminder: Reminder) => void
  onDelete: (reminder: Reminder) => void
  onCancel: (reminder: Reminder) => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState icon={Bell} title="No reminders" description="No reminders match your filters" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => {
        const assignedUser = users.find((u) => u.id === reminder.assignedTo)
        return (
          <Card key={reminder.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{reminder.title}</h3>
                    <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                    <Badge className={getStatusColor(reminder.status)}>{reminder.status}</Badge>
                    {reminder.isRecurring && (
                      <Badge variant="outline">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{reminder.message}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(reminder.reminderDate), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    {assignedUser && (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={assignedUser.avatarUrl || getAvatarForUser(assignedUser.id)} />
                          <AvatarFallback className="text-xs">
                            {assignedUser.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {assignedUser.name}
                      </div>
                    )}
                    {reminder.triggeredAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Triggered {formatDistanceToNow(new Date(reminder.triggeredAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(reminder)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {(reminder.status === "scheduled" || reminder.status === "triggered") && (
                      <DropdownMenuItem onClick={() => onCancel(reminder)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(reminder)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

