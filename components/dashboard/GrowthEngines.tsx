"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GrowthEngine } from "@/lib/types/ceo-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface GrowthEnginesProps {
  engines: GrowthEngine[]
}

const departmentLabels: Record<GrowthEngine['department'], string> = {
  finance: 'Finance',
  sales: 'Sales',
  hr: 'Customer Success',
  operations: 'Operations',
}

const departmentColors: Record<GrowthEngine['department'], string> = {
  finance: 'var(--chart-1)',
  sales: 'var(--chart-2)',
  hr: 'var(--chart-3)',
  operations: 'var(--chart-4)',
}

export function GrowthEngines({ engines }: GrowthEnginesProps) {
  const [timePeriod, setTimePeriod] = useState<string>('30')

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-[#10b981]" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-[#ef4444]" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {engines.map((engine) => {
        const departmentLabel = departmentLabels[engine.department]
        const departmentColor = departmentColors[engine.department]

        return (
          <Card key={engine.department} className="border border-border rounded-[14px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{departmentLabel}</CardTitle>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger className="h-7 w-[100px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last Quarter</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {engine.metrics.map((metric, index) => {
                const hasChart = metric.chartData && metric.chartData.length > 0
                const chartConfig: ChartConfig = {
                  [metric.label]: {
                    label: metric.label,
                    color: departmentColor,
                  },
                }

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {metric.label}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-foreground">
                        {typeof metric.value === 'number'
                          ? metric.value.toLocaleString()
                          : metric.value}
                      </span>
                      {metric.change !== undefined && (
                        <span
                          className={cn(
                            "text-xs font-medium",
                            metric.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
                          )}
                        >
                          {metric.change >= 0 ? '+' : ''}
                          {metric.change.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {hasChart && (
                      <div className="h-[40px] w-full">
                        <ChartContainer config={chartConfig} className="h-full">
                          <LineChart data={metric.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={departmentColor}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ChartContainer>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

