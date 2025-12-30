"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function MyMeetingNotesPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">My Meeting Notes</h1>
            <p className="text-xs text-white/90 mt-0.5">View and manage your meeting notes</p>
          </div>
        </div>
      </div>
      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <EmptyState
            icon={FileText}
            title="My Meeting Notes"
            description="Meeting notes and summaries will be available here."
          />
        </CardContent>
      </Card>
    </div>
  )
}
