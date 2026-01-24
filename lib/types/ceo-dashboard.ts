export interface BusinessOverviewMetrics {
  arr: {
    current: number
    change: number
    changeLabel: string
    lastYear: number
  }
  mrr: {
    current: number
    change: number
    changeLabel: string
    lastMonth: number
  }
  employeeGrowth: {
    current: number
    change: number
    changeLabel: string
    lastMonth: number
  }
  projectHealth: {
    score: number
    onTrack: number
    atRisk: number
    blocked: number
    total: number
  }
  customerGrowth: {
    current: number
    change: number
    changeLabel: string
    lastMonth: number
  }
  teamProductivity: {
    current: number
    change: number
    changeLabel: string
    lastMonth: number
  }
}

export interface RiskAlert {
  id: string
  type: 'alert' | 'risk'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  category: 'financial' | 'sales' | 'hr' | 'operations' | 'projects'
  link?: string
  linkLabel?: string
}

export interface GrowthEngineMetric {
  label: string
  value: string | number
  change?: number
  trend: 'up' | 'down' | 'neutral'
  chartData?: Array<{ date: string; value: number }>
}

export interface GrowthEngine {
  department: 'finance' | 'sales' | 'hr' | 'operations'
  metrics: GrowthEngineMetric[]
}

export interface RevenueDataPoint {
  date: string
  current: number
  forecasted?: number
}

export interface RevenueTrends {
  arr: RevenueDataPoint[]
  mrr: RevenueDataPoint[]
  period: 'monthly' | 'quarterly' | 'yearly'
}

export interface DepartmentPerformance {
  department: string
  performance: number // 0-100
  metrics: {
    label: string
    value: number
  }[]
}

