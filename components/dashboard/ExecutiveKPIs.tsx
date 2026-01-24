"use client"

import * as React from "react"
import Link from "next/link"
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckSquare, 
  DollarSign,
  Activity,
  ArrowRight
} from "lucide-react"
import { DashboardStatCard } from "./DashboardStatCard"
import { cn } from "@/lib/utils"

interface KPIData {
  revenue?: {
    value: string | number
    change: string
    changeLabel: string
  }
  employees?: {
    value: string | number
    change: string
    changeLabel: string
  }
  projects?: {
    value: string | number
    change: string
    changeLabel: string
  }
  tasks?: {
    value: string | number
    change: string
    changeLabel: string
  }
  activeProjects?: {
    value: string | number
    change: string
    changeLabel: string
  }
  completionRate?: {
    value: string | number
    change: string
    changeLabel: string
  }
}

interface ExecutiveKPIsProps {
  data?: KPIData
  isLoading?: boolean
  className?: string
}

export function ExecutiveKPIs({ data, isLoading, className }: ExecutiveKPIsProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: "Revenue",
      value: data?.revenue?.value || "0",
      change: data?.revenue?.change || "+0%",
      changeLabel: data?.revenue?.changeLabel || "vs last month",
      icon: DollarSign,
      href: "/ceo/sales-summary",
      variant: "positive" as const,
    },
    {
      title: "Employees",
      value: data?.employees?.value || 0,
      change: data?.employees?.change || "+0%",
      changeLabel: data?.employees?.changeLabel || "vs last month",
      icon: Users,
      href: "/ceo/hr-summary",
      variant: "positive" as const,
    },
    {
      title: "Projects",
      value: data?.projects?.value || 0,
      change: data?.projects?.change || "+0%",
      changeLabel: data?.projects?.changeLabel || "vs last month",
      icon: Briefcase,
      href: "/ceo/explorers/projects",
      variant: "positive" as const,
    },
    {
      title: "Tasks",
      value: data?.tasks?.value || 0,
      change: data?.tasks?.change || "+0%",
      changeLabel: data?.tasks?.changeLabel || "vs last month",
      icon: CheckSquare,
      href: "/ceo/explorers/tasks",
      variant: "positive" as const,
    },
    {
      title: "Active Projects",
      value: data?.activeProjects?.value || 0,
      change: data?.activeProjects?.change || "+0%",
      changeLabel: data?.activeProjects?.changeLabel || "active",
      icon: Activity,
      href: "/projects",
      variant: "positive" as const,
    },
    {
      title: "Completion Rate",
      value: data?.completionRate?.value || "0%",
      change: data?.completionRate?.change || "+0%",
      changeLabel: data?.completionRate?.changeLabel || "this month",
      icon: TrendingUp,
      href: "/ceo/performance-analytics",
      variant: "positive" as const,
    },
  ]

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
      {kpis.map((kpi) => (
        <Link key={kpi.title} href={kpi.href} className="group">
          <DashboardStatCard
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeLabel={kpi.changeLabel}
            icon={kpi.icon}
            variant={kpi.variant}
            className="h-full transition-all group-hover:shadow-md group-hover:border-primary/50"
          />
        </Link>
      ))}
    </div>
  )
}










