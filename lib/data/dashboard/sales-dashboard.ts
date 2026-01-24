export interface Deal {
  id: string
  name: string
  company: string
  value: number
  stage: string
  owner: string
  closeDate: string
}

export interface RevenueData {
  date: string
  revenue: number
}

export interface PipelineData {
  stage: string
  count: number
  value: number
  color: string
}

export const salesDashboardStats = {
  totalRevenue: 2450000,
  totalRevenueChange: 12.5,
  activeDeals: 156,
  activeDealsChange: 15.3,
  conversionRate: 34.2,
  conversionRateChange: 2.3,
  newLeads: 89,
  newLeadsChange: 8.5,
}

export const revenueData: RevenueData[] = [
  { date: "Jan", revenue: 180000 },
  { date: "Feb", revenue: 210000 },
  { date: "Mar", revenue: 195000 },
  { date: "Apr", revenue: 230000 },
  { date: "May", revenue: 245000 },
  { date: "Jun", revenue: 260000 },
]

export const pipelineData: PipelineData[] = [
  { stage: "Qualified", count: 45, value: 450000, color: "var(--chart-1)" },
  { stage: "Proposal", count: 32, value: 680000, color: "var(--chart-2)" },
  { stage: "Negotiation", count: 28, value: 560000, color: "var(--chart-3)" },
  { stage: "Closed Won", count: 51, value: 760000, color: "var(--chart-4)" },
]

export const recentDeals: Deal[] = [
  {
    id: "1",
    name: "Enterprise License",
    company: "TechCorp Inc.",
    value: 125000,
    stage: "Negotiation",
    owner: "Sarah Johnson",
    closeDate: "2025-06-15",
  },
  {
    id: "2",
    name: "Annual Subscription",
    company: "Global Solutions",
    value: 85000,
    stage: "Proposal",
    owner: "Mike Davis",
    closeDate: "2025-06-20",
  },
  {
    id: "3",
    name: "Custom Integration",
    company: "StartupXYZ",
    value: 45000,
    stage: "Qualified",
    owner: "Emily Carter",
    closeDate: "2025-07-01",
  },
  {
    id: "4",
    name: "Premium Package",
    company: "Mega Corp",
    value: 150000,
    stage: "Closed Won",
    owner: "John Doe",
    closeDate: "2025-05-30",
  },
]
