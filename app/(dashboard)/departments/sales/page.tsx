"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function SalesDashboardPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Sales Dashboard</h1>
            <p className="text-xs text-white/90 mt-0.5">Sales department overview, pipeline metrics, and performance insights</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">Sales Department Dashboard</p>
            <p className="text-sm text-muted-foreground mb-4">
              Sales department overview, pipeline metrics, and performance insights
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Link href="/sales/leads" className="text-primary hover:underline text-sm font-medium">
                View Leads →
              </Link>
              <Link href="/sales/deals" className="text-primary hover:underline text-sm font-medium">
                View Deals →
              </Link>
              <Link href="/sales/pipeline" className="text-primary hover:underline text-sm font-medium">
                View Pipeline →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
