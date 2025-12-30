"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function CeoPerformanceAnalyticsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Performance Analytics</h1>
            <p className="text-xs text-white/90 mt-0.5">View comprehensive performance analytics</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">Performance Analytics</p>
            <p className="text-sm text-muted-foreground">
              Comprehensive performance analytics and insights will be available here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
