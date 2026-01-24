"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, CheckCircle2, User, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { bulkUpdateTasks, bulkDeleteTasks, getAssignableUsers, type UpdateTaskInput } from "@/lib/actions/tasks"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TaskStatus, TaskPriority } from "@/lib/types/task"

interface BulkActionsToolbarProps {
  selectedTaskIds: string[]
  onClearSelection: () => void
}

export function BulkActionsToolbar({ selectedTaskIds, onClearSelection }: BulkActionsToolbarProps) {
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<TaskStatus | "">("")
  const [bulkPriority, setBulkPriority] = useState<TaskPriority | "">("")
  const [bulkAssignedTo, setBulkAssignedTo] = useState<string>("")
  
  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: getAssignableUsers,
  })
  
  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: UpdateTaskInput) => bulkUpdateTasks(selectedTaskIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] })
      toast.success(`Updated ${selectedTaskIds.length} task(s)`)
      setBulkStatus("")
      setBulkPriority("")
      setBulkAssignedTo("")
      onClearSelection()
    },
    onError: (error: Error) => {
      toast.error("Failed to update tasks", {
        description: error.message,
      })
    },
  })
  
  const bulkDeleteMutation = useMutation({
    mutationFn: () => bulkDeleteTasks(selectedTaskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task-analytics"] })
      toast.success(`Deleted ${selectedTaskIds.length} task(s)`)
      onClearSelection()
      setIsDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to delete tasks", {
        description: error.message,
      })
      setIsDeleteDialogOpen(false)
    },
  })
  
  const handleBulkStatusUpdate = () => {
    if (!bulkStatus) return
    bulkUpdateMutation.mutate({ status: bulkStatus })
  }
  
  const handleBulkPriorityUpdate = () => {
    if (!bulkPriority) return
    bulkUpdateMutation.mutate({ priority: bulkPriority })
  }
  
  const handleBulkAssign = () => {
    if (!bulkAssignedTo) return
    bulkUpdateMutation.mutate({ assignedTo: bulkAssignedTo })
  }
  
  const handleBulkDelete = async () => {
    // This will be handled by the delete dialog
    setIsDeleteDialogOpen(true)
  }
  
  if (selectedTaskIds.length === 0) {
    return null
  }
  
  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as TaskStatus | "")}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          {bulkStatus && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkStatusUpdate}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Apply Status
            </Button>
          )}
          
          <Select value={bulkPriority} onValueChange={(value) => setBulkPriority(value as TaskPriority | "")}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Update Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {bulkPriority && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkPriorityUpdate}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Apply Priority
            </Button>
          )}
          
          <Select value={bulkAssignedTo} onValueChange={setBulkAssignedTo}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassign</SelectItem>
              {assignableUsers?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {bulkAssignedTo && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkAssign}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <User className="h-4 w-4 mr-2" />
              )}
              Assign
            </Button>
          )}
          
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={bulkUpdateMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tasks</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                bulkDeleteMutation.mutate()
              }}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

