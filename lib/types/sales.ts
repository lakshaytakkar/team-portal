export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost"
export type LeadSource = "website" | "linkedin" | "referral" | "cold-call" | "event" | "other"

export type DealStage = "prospecting" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired"
export type AutomationLogType = "email" | "whatsapp"
export type AutomationLogStatus = "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed" | "read"

export interface SalesUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Lead {
  id: string
  company: string
  contactName: string
  email: string
  phone?: string
  status: LeadStatus
  source?: LeadSource
  value?: number
  assignedTo: SalesUser
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  name: string
  company: string
  contactName: string
  value: number
  stage: DealStage
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  assignedTo: SalesUser
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QuotationItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  company: string
  contactName: string
  email: string
  amount: number
  status: QuotationStatus
  validUntil: string
  assignedTo: SalesUser
  items: QuotationItem[]
  createdAt: string
  updatedAt: string
}

export interface AutomationLog {
  id: string
  type: AutomationLogType
  recipient: string
  subject?: string
  message?: string
  status: AutomationLogStatus
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  readAt?: string
  assignedTo: SalesUser
  createdAt: string
}

