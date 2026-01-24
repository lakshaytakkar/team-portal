export interface Campaign {
  id: string
  name: string
  type: string
  status: string
  openRate: number
  conversionRate: number
  leadsGenerated: number
  startDate: string
}

export interface CampaignPerformanceData {
  date: string
  opens: number
  conversions: number
}

export interface CampaignTypeData {
  type: string
  count: number
  color: string
}

export const marketingDashboardStats = {
  activeCampaigns: 18,
  activeCampaignsChange: 12.5,
  emailOpenRate: 24.8,
  emailOpenRateChange: 3.2,
  conversionRate: 5.6,
  conversionRateChange: 1.2,
  totalLeadsGenerated: 1245,
  totalLeadsGeneratedChange: 18.5,
}

export const campaignPerformanceData: CampaignPerformanceData[] = [
  { date: "Week 1", opens: 4500, conversions: 245 },
  { date: "Week 2", opens: 5200, conversions: 289 },
  { date: "Week 3", opens: 4800, conversions: 267 },
  { date: "Week 4", opens: 5600, conversions: 312 },
  { date: "Week 5", opens: 5100, conversions: 285 },
  { date: "Week 6", opens: 5900, conversions: 330 },
]

export const campaignTypeData: CampaignTypeData[] = [
  { type: "Email", count: 8, color: "var(--chart-1)" },
  { type: "WhatsApp", count: 5, color: "var(--chart-2)" },
  { type: "Social Media", count: 3, color: "var(--chart-3)" },
  { type: "Content", count: 2, color: "var(--chart-4)" },
]

export const recentCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale 2025",
    type: "Email",
    status: "Active",
    openRate: 28.5,
    conversionRate: 6.2,
    leadsGenerated: 234,
    startDate: "2025-05-15",
  },
  {
    id: "2",
    name: "Product Launch",
    type: "WhatsApp",
    status: "Active",
    openRate: 45.2,
    conversionRate: 8.1,
    leadsGenerated: 189,
    startDate: "2025-05-20",
  },
  {
    id: "3",
    name: "Q2 Newsletter",
    type: "Email",
    status: "Completed",
    openRate: 22.3,
    conversionRate: 4.8,
    leadsGenerated: 156,
    startDate: "2025-04-01",
  },
  {
    id: "4",
    name: "LinkedIn Campaign",
    type: "Social Media",
    status: "Active",
    openRate: 18.7,
    conversionRate: 3.5,
    leadsGenerated: 98,
    startDate: "2025-05-25",
  },
]
