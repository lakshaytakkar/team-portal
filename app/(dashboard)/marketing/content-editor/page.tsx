"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Edit } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function MarketingContentEditorPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Content Editor</h1>
            <p className="text-xs text-white/90 mt-0.5">Edit website content, pages, blog posts</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <EmptyState
            icon={Edit}
            title="Content Editor"
            description="Rich content editor for editing website content, pages, and blog posts. This feature will be available soon."
          />
        </CardContent>
      </Card>
    </div>
  )
}
