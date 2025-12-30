"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { CreateDailyReportDialog } from "@/components/my/CreateDailyReportDialog"

export default function MyDailyReportingPage() {
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Daily Reporting</h1>
            <p className="text-xs text-white/90 mt-0.5">Submit and track your daily work reports</p>
          </div>
          <Button onClick={() => setIsCreateReportOpen(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Daily Report
          </Button>
        </div>
      </div>
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <EmptyState
            icon={FileText}
            title="My Daily Reporting"
            description="Daily reports and updates will be available here."
            action={{
              label: "Create Report",
              onClick: () => setIsCreateReportOpen(true),
            }}
          />
        </CardContent>
      </Card>
      <CreateDailyReportDialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen} />
    </div>
  )
}
