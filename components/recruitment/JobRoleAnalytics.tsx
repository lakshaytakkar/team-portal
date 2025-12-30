"use client"

import { Card } from "@/components/ui/card"

interface JobRoleAnalyticsProps {
  analytics?: {
    totalApplications: number
    interviewRate: number
    hireRate: number
    averageTimeToFill: number
    activePostings: number
    applicationsOverTime?: Array<{ date: string; count: number }>
    sourceBreakdown?: Array<{ source: string; count: number }>
  }
}

export function JobRoleAnalytics({ analytics }: JobRoleAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Applications</p>
          <p className="text-lg font-semibold text-foreground">{analytics.totalApplications}</p>
        </Card>
        <Card className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Interview Rate</p>
          <p className="text-lg font-semibold text-foreground">{analytics.interviewRate}%</p>
        </Card>
        <Card className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Hire Rate</p>
          <p className="text-lg font-semibold text-foreground">{analytics.hireRate}%</p>
        </Card>
        <Card className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Time to Fill</p>
          <p className="text-lg font-semibold text-foreground">
            {analytics.averageTimeToFill > 0 ? `${Math.round(analytics.averageTimeToFill)} days` : "N/A"}
          </p>
        </Card>
        <Card className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Active Postings</p>
          <p className="text-lg font-semibold text-foreground">{analytics.activePostings}</p>
        </Card>
      </div>

      {analytics.sourceBreakdown && analytics.sourceBreakdown.length > 0 && (
        <Card className="border border-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Source Breakdown</h4>
          <div className="space-y-2">
            {analytics.sourceBreakdown.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{source.source}</span>
                <span className="text-sm font-medium text-foreground">{source.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Detailed charts and graphs coming soon</p>
      </div>
    </div>
  )
}

