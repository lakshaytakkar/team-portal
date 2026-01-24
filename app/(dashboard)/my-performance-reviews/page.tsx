"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function MyPerformanceReviewsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Performance Reviews</h1>
            <p className="text-xs text-white/90 mt-0.5">View and track your performance reviews</p>
          </div>
        </div>
      </div>
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <EmptyState
            icon={Star}
            title="My Performance Reviews"
            description="Performance reviews and feedback will be available here."
          />
        </CardContent>
      </Card>
    </div>
  )
}
