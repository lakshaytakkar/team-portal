"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileBarChart } from "lucide-react"

export default function CeoReportsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Reports & Insights</h1>
            <p className="text-xs text-white/90 mt-0.5">Generate and view executive reports</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">Executive Reports</p>
            <p className="text-sm text-muted-foreground">
              Generate and view executive reports and insights
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
