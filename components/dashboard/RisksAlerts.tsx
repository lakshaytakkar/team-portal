"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Calendar, FileWarning, Users, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RiskAlert } from "@/lib/types/ceo-dashboard"
import Link from "next/link"

interface RisksAlertsProps {
  alerts: RiskAlert[]
}

const getIcon = (category: RiskAlert['category']) => {
  switch (category) {
    case 'financial':
      return DollarSign
    case 'sales':
      return TrendingUp
    case 'hr':
      return Users
    case 'operations':
    case 'projects':
      return FileWarning
    default:
      return AlertTriangle
  }
}

const getSeverityColor = (severity: RiskAlert['severity']) => {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function RisksAlerts({ alerts }: RisksAlertsProps) {
  const [activeTab, setActiveTab] = useState<'alert' | 'risk'>('alert')

  const filteredAlerts = alerts.filter((alert) => alert.type === activeTab)

  return (
    <Card className="border border-border rounded-[14px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Risks & Alert</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'alert' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('alert')}
              className="h-8 px-3 text-xs"
            >
              Alert
            </Button>
            <Button
              variant={activeTab === 'risk' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('risk')}
              className="h-8 px-3 text-xs"
            >
              Risk
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No {activeTab === 'alert' ? 'alerts' : 'risks'} at this time
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getIcon(alert.category)
            const severityColor = getSeverityColor(alert.severity)

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  severityColor
                )}
              >
                <div className="mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                      <p className="text-sm opacity-90">{alert.description}</p>
                    </div>
                  </div>
                  {alert.link && alert.linkLabel && (
                    <Link
                      href={alert.link}
                      className="text-xs font-medium mt-2 inline-block hover:underline"
                    >
                      {alert.linkLabel} →
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

