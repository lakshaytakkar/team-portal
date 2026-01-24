export type ReportStatus = "draft" | "published" | "archived"
export type DomainStatus = "active" | "expired" | "pending"

export interface AnalyticsUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface WebsiteTraffic {
  id: string
  website: string
  date: string
  visitors: number
  pageViews: number
  sessions: number
  bounceRate: number
  avgSessionDuration: number
  createdAt: string
}

export interface Conversion {
  id: string
  website: string
  event: string
  value?: number
  occurredAt: string
  source?: string
  createdAt: string
}

export interface ClientReport {
  id: string
  clientName: string
  reportType: "monthly" | "quarterly" | "annual" | "custom"
  period: string
  status: ReportStatus
  generatedAt?: string
  generatedBy: AnalyticsUser
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Domain {
  id: string
  domain: string
  status: DomainStatus
  expiryDate?: string
  registrar?: string
  nameservers?: string[]
  createdAt: string
  updatedAt: string
}

