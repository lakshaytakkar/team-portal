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
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RevenueTrends } from "@/lib/types/ceo-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"

interface ARRGrowthChartProps {
  trends: RevenueTrends
  onRefresh?: () => void
  className?: string
}

const chartConfig = {
  current: {
    label: "Current",
    color: "var(--chart-1)",
  },
  forecasted: {
    label: "Forecasted",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ARRGrowthChart({ trends, onRefresh, className }: ARRGrowthChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'arr' | 'mrr'>('arr')
  const [selectedPeriod, setSelectedPeriod] = useState<string>(trends.period)

  const currentData = selectedMetric === 'arr' ? trends.arr : trends.mrr
  const currentValue = currentData[currentData.length - 1]?.current || 0
  const changePercent = currentData.length > 1
    ? ((currentValue - (currentData[currentData.length - 2]?.current || 0)) / (currentData[currentData.length - 2]?.current || 1)) * 100
    : 0

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <Card className={cn("border border-border rounded-[14px]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={selectedMetric === 'arr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('arr')}
              className="h-7 px-3 text-xs font-semibold"
            >
              ARR Growth
            </Button>
            <Button
              variant={selectedMetric === 'mrr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMetric('mrr')}
              className="h-7 px-3 text-xs font-semibold"
            >
              MRR Growth
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-7 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-semibold">{formatCurrency(currentValue)}</span>
            <div className="flex items-center gap-1 text-sm text-[#10b981]">
              <TrendingUp className="h-4 w-4" />
              <span>{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}% MoM</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--chart-1)]" />
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--chart-3)]" />
            <span className="text-muted-foreground">Forecasted</span>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart
            data={currentData}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => [formatCurrency(value), selectedMetric === 'arr' ? 'ARR' : 'MRR']}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            {currentData.some((d) => d.forecasted !== undefined) && (
              <Line
                type="monotone"
                dataKey="forecasted"
                stroke="var(--chart-3)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

