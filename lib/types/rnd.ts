export type DocumentStatus = "draft" | "review" | "published" | "archived"

export interface RNDUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface ResearchDoc {
  id: string
  title: string
  description?: string
  content?: string
  category: string
  status: DocumentStatus
  fileUrl?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

export interface Mindmap {
  id: string
  title: string
  description?: string
  content?: string
  category: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

export interface FinancialPlanning {
  id: string
  title: string
  description?: string
  content?: string
  vertical: string
  budget: number
  status: DocumentStatus
  fileUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

export interface NewVertical {
  id: string
  title: string
  description?: string
  content?: string
  marketSize?: number
  status: DocumentStatus
  fileUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

export interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "open" | "reviewing" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

export interface StrategicPlanning {
  id: string
  title: string
  description?: string
  content?: string
  initiative: string
  status: DocumentStatus
  fileUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

export interface MarketResearch {
  id: string
  title: string
  description?: string
  content?: string
  market: string
  status: DocumentStatus
  fileUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: RNDUser
}

