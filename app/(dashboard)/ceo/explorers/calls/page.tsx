"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Phone } from "lucide-react"

export default function CeoAllCallsExplorerPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">All Calls Explorer</h1>
            <p className="text-xs text-white/90 mt-0.5">Explore all calls across the organization</p>
          </div>
        </div>
      </div>

      <Card className="border border-border rounded-[14px]">
        <CardContent className="p-12">
          <div className="text-center">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground mb-2">All Calls Explorer</p>
            <p className="text-sm text-muted-foreground mb-4">
              Explorer view for all calls across the organization
            </p>
            <Link href="/my-calls" className="text-primary hover:underline text-sm font-medium inline-block mt-6">
              View All Calls →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
