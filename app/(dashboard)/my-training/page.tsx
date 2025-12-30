"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, Search, Filter, Clock, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Training, TrainingStatus } from "@/lib/types/my-workspace"
import { initialTrainings } from "@/lib/data/my-workspace"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchTrainings() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return initialTrainings
}

const statusConfig: Record<TrainingStatus, { label: string; variant: "neutral-outline" | "primary-outline" | "green-outline" }> = {
  "not-started": { label: "Not Started", variant: "neutral-outline" },
  "in-progress": { label: "In Progress", variant: "primary-outline" },
  completed: { label: "Completed", variant: "green-outline" },
}

export default function MyTrainingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const { data: trainings, isLoading, error, refetch } = useQuery({
    queryKey: ["trainings", "v2"],
    queryFn: fetchTrainings,
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <Card className="border border-border rounded-[14px]">
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border border-border rounded-2xl">
                  <CardContent className="p-5">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load trainings"
        message="We couldn't load your trainings. Please check your connection and try again."
        onRetry={() => refetch()}
      />
    )
  }

  const categories = Array.from(new Set(trainings?.map((t) => t.category) || []))
  const filteredTrainings =
    trainings?.filter((training) => {
      const matchesSearch =
        training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        training.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        training.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || training.category === selectedCategory
      return matchesSearch && matchesCategory
    }) || []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Training</h1>
            <p className="text-xs text-white/90 mt-0.5">Access your training courses and resources</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 py-2 bg-white">
          <h2 className="text-base font-semibold text-foreground">Training Courses</h2>
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
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-[38px] px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="gap-2 h-[38px]">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {filteredTrainings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTrainings.map((training) => {
                const status = statusConfig[training.status]
                return (
                  <Link key={training.id} href={`/my-training/${training.id}`}>
                    <Card className="border border-border rounded-2xl hover:border-primary transition-colors cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-base text-foreground leading-6 tracking-[0.32px]">
                                {training.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {training.description}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                                {training.category}
                              </Badge>
                              {training.duration && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{training.duration} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {training.status === "in-progress" && training.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progress</span>
                              <span className="text-xs font-medium text-foreground">{training.progress}%</span>
                            </div>
                            <div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-l-full transition-all",
                                  training.progress === 100 ? "bg-status-completed-foreground" : "bg-primary"
                                )}
                                style={{ width: `${training.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <Badge variant={status.variant} className="h-5 px-2 py-0.5 rounded-2xl text-xs">
                            {status.label}
                          </Badge>
                          {training.status === "in-progress" && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Play className="h-3 w-3" />
                              <span>Continue</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No trainings found"
              description={searchQuery || selectedCategory !== "all" ? "Try adjusting your search or filters." : "Training content and resources will be available here."}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
