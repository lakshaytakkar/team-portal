export type TemplateType = "email" | "whatsapp"
export type TemplateStatus = "draft" | "active" | "archived"
export type AutomationStatus = "active" | "paused" | "draft"
export type CampaignStatus = "draft" | "scheduled" | "active" | "completed" | "paused"
export type DripStatus = "active" | "paused" | "draft"
export type PageStatus = "draft" | "published" | "archived"

export interface MarketingUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  type: TemplateType
  status: TemplateStatus
  preview?: string
  content?: string
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

export interface WhatsAppTemplate {
  id: string
  name: string
  message: string
  type: TemplateType
  status: TemplateStatus
  preview?: string
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

export interface EmailAutomation {
  id: string
  name: string
  trigger: string
  template: string
  status: AutomationStatus
  recipients?: number
  sent?: number
  opened?: number
  clicked?: number
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

export interface WhatsAppAutomation {
  id: string
  name: string
  trigger: string
  template: string
  status: AutomationStatus
  recipients?: number
  sent?: number
  delivered?: number
  read?: number
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

export interface Drip {
  id: string
  name: string
  description?: string
  status: DripStatus
  steps: number
  recipients?: number
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

export interface Campaign {
  id: string
  name: string
  description?: string
  status: CampaignStatus
  startDate?: string
  endDate?: string
  channels: ("email" | "whatsapp")[]
  recipients?: number
  sent?: number
  opened?: number
  clicked?: number
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

export interface AutomationLog {
  id: string
  type: "email" | "whatsapp"
  recipient: string
  subject?: string
  message?: string
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed"
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  campaign?: string
  automation?: string
  createdAt: string
}

export interface Page {
  id: string
  title: string
  slug: string
  status: PageStatus
  publishedAt?: string
  views?: number
  createdAt: string
  updatedAt: string
  createdBy: MarketingUser
}

