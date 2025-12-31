"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Building2 } from "lucide-react"
import { getVerticals, createVertical, updateVertical, deleteVertical } from "@/lib/actions/hr"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

async function fetchVerticals() {
  return await getVerticals()
}

export default function VerticalsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", code: "", description: "" })

  const { data: verticals, isLoading, error, refetch } = useQuery({
    queryKey: ["verticals"],
    queryFn: fetchVerticals,
  })

  const filteredVerticals = verticals?.filter(
    (vertical) =>
      vertical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vertical.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    try {
      await createVertical({
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ["verticals"] })
      toast.success("Vertical created successfully")
      setCreateDialogOpen(false)
      setFormData({ name: "", code: "", description: "" })
    } catch (error) {
      toast.error("Failed to create vertical", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load verticals"
        message="We couldn't load verticals. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Verticals</h1>
            <p className="text-xs text-white/90 mt-0.5">Manage business verticals</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Vertical
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search verticals..."
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
          ) : filteredVerticals && filteredVerticals.length > 0 ? (
            <div className="space-y-3">
              {filteredVerticals.map((vertical) => (
                <Card key={vertical.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{vertical.name}</h3>
                          {vertical.code && (
                            <span className="text-sm text-muted-foreground">({vertical.code})</span>
                          )}
                        </div>
                        {vertical.description && (
                          <p className="text-sm text-muted-foreground">{vertical.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No verticals yet"
              description="Create your first business vertical to get started."
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Vertical</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., USA Dropshipping"
              />
            </div>
            <div className="space-y-2">
              <Label>Code (Optional)</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., usa-dropshipping"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this vertical..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

