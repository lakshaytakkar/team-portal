/**
 * LLC Clients Management Types
 * For Legal Nations vertical - LLC Formation Services
 */

// ============================================================================
// ENUMS
// ============================================================================

export type LLCClientStatus =
  | 'llc_booked'
  | 'onboarded'
  | 'under_ein'
  | 'under_boi'
  | 'under_banking'
  | 'under_payment_gateway'
  | 'delivered'

export type LLCClientHealth = 'healthy' | 'neutral' | 'at_risk' | 'critical'

export type LLCServicePlan = 'elite' | 'llc'

export type LLCBankStatus =
  | 'not_started'
  | 'documents_pending'
  | 'application_submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type LLCDocumentCategory =
  | 'client_submitted'
  | 'llc_documents'
  | 'bank_documents'
  | 'website_documents'

export type LLCDocumentStatus =
  | 'pending'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'issued'
  | 'delivered'

export type LLCTimelineEventType =
  | 'status_change'
  | 'document_uploaded'
  | 'document_issued'
  | 'note_added'
  | 'payment_received'
  | 'call_scheduled'
  | 'call_completed'
  | 'bank_update'
  | 'milestone'

// ============================================================================
// STATUS CONFIGS (for UI)
// ============================================================================

export const LLC_STATUS_CONFIG: Record<
  LLCClientStatus,
  { label: string; color: string; bgColor: string; order: number }
> = {
  llc_booked: { label: 'LLC Booked', color: 'text-blue-700', bgColor: 'bg-blue-100', order: 1 },
  onboarded: { label: 'Onboarded', color: 'text-purple-700', bgColor: 'bg-purple-100', order: 2 },
  under_ein: { label: 'Under EIN', color: 'text-orange-700', bgColor: 'bg-orange-100', order: 3 },
  under_boi: { label: 'Under BOI', color: 'text-amber-700', bgColor: 'bg-amber-100', order: 4 },
  under_banking: { label: 'Under Banking', color: 'text-cyan-700', bgColor: 'bg-cyan-100', order: 5 },
  under_payment_gateway: { label: 'Under Payment Gateway', color: 'text-indigo-700', bgColor: 'bg-indigo-100', order: 6 },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100', order: 7 },
}

export const LLC_HEALTH_CONFIG: Record<
  LLCClientHealth,
  { label: string; color: string; bgColor: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  healthy: { label: 'Healthy', color: 'text-green-700', bgColor: 'bg-green-100', variant: 'default' },
  neutral: { label: 'Neutral', color: 'text-gray-700', bgColor: 'bg-gray-100', variant: 'secondary' },
  at_risk: { label: 'At Risk', color: 'text-yellow-700', bgColor: 'bg-yellow-100', variant: 'outline' },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', variant: 'destructive' },
}

export const LLC_PLAN_CONFIG: Record<
  LLCServicePlan,
  { label: string; description: string; color: string }
> = {
  elite: { label: 'Elite', description: 'Full service with website', color: 'text-purple-700' },
  llc: { label: 'LLC Basic', description: 'LLC formation only', color: 'text-blue-700' },
}

export const LLC_BANK_STATUS_CONFIG: Record<
  LLCBankStatus,
  { label: string; color: string; bgColor: string }
> = {
  not_started: { label: 'Not Started', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  documents_pending: { label: 'Docs Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  application_submitted: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  under_review: { label: 'Under Review', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export const LLC_DOCUMENT_CATEGORY_CONFIG: Record<
  LLCDocumentCategory,
  { label: string; description: string; icon: string }
> = {
  client_submitted: { label: 'Client Documents', description: 'Documents submitted by client', icon: 'Upload' },
  llc_documents: { label: 'LLC Documents', description: 'LLC formation documents', icon: 'FileText' },
  bank_documents: { label: 'Bank Documents', description: 'Banking-related documents', icon: 'Building2' },
  website_documents: { label: 'Website Documents', description: 'Website and domain documents', icon: 'Globe' },
}

export const LLC_DOCUMENT_STATUS_CONFIG: Record<
  LLCDocumentStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  verified: { label: 'Verified', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  issued: { label: 'Issued', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface LLCBank {
  id: string
  name: string
  code: string
  description?: string
  website?: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface LLCDocumentType {
  id: string
  name: string
  code: string
  category: LLCDocumentCategory
  description?: string
  isRequired: boolean
  forEliteOnly: boolean
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LLCClientAssignee {
  id: string
  employeeId: string
  fullName: string
  email?: string
  avatar?: string
}

export interface LLCClient {
  id: string
  clientCode: string
  serialNumber?: number

  // Client Info
  clientName: string
  email?: string
  phone?: string
  country?: string

  // LLC Info
  llcName?: string
  status: LLCClientStatus
  health?: LLCClientHealth

  // Service
  plan: LLCServicePlan
  websiteIncluded: boolean

  // Dates
  paymentDate?: string
  onboardingDate?: string
  onboardingCallDate?: string
  documentSubmissionDate?: string
  deliveryDate?: string

  // Financial
  amountReceived: number
  remainingPayment: number
  currency: string

  // Banking
  bankId?: string
  bank?: LLCBank
  bankApproved?: string
  bankStatus: LLCBankStatus
  bankApplicationDate?: string
  bankApprovalDate?: string

  // Assignment
  assignedToId?: string
  assignedTo?: LLCClientAssignee

  // External
  externalProjectUrl?: string

  // Notes
  notes?: string
  additionalNotes?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string
}

export interface LLCClientDocument {
  id: string
  clientId: string
  documentTypeId?: string
  documentType?: LLCDocumentType

  // Document Info
  name: string
  fileName?: string
  filePath?: string
  fileSize: number
  mimeType?: string

  // Status
  category: LLCDocumentCategory
  status: LLCDocumentStatus

  // Dates
  submittedDate?: string
  verifiedDate?: string
  issuedDate?: string
  expiryDate?: string

  // Tracking
  submittedBy?: string
  verifiedBy?: string
  issuedBy?: string

  // Notes
  notes?: string
  rejectionReason?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string
}

export interface LLCClientTimelineEntry {
  id: string
  clientId: string
  documentId?: string

  // Event
  eventType: LLCTimelineEventType
  title: string
  description?: string

  // Status Change
  oldStatus?: LLCClientStatus
  newStatus?: LLCClientStatus

  // Metadata
  metadata?: Record<string, unknown>

  // Who
  performedBy?: string
  performedByProfile?: {
    id: string
    fullName: string
    avatar?: string
  }

  createdAt: string
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreateLLCClientInput {
  clientCode?: string
  clientName: string
  email?: string
  phone?: string
  country?: string
  llcName?: string
  plan?: LLCServicePlan
  websiteIncluded?: boolean
  paymentDate?: string
  amountReceived?: number
  remainingPayment?: number
  currency?: string
  assignedToId?: string
  notes?: string
}

export interface UpdateLLCClientInput {
  clientName?: string
  email?: string
  phone?: string
  country?: string
  llcName?: string
  status?: LLCClientStatus
  health?: LLCClientHealth
  plan?: LLCServicePlan
  websiteIncluded?: boolean
  paymentDate?: string
  onboardingDate?: string
  onboardingCallDate?: string
  documentSubmissionDate?: string
  deliveryDate?: string
  amountReceived?: number
  remainingPayment?: number
  currency?: string
  bankId?: string
  bankApproved?: string
  bankStatus?: LLCBankStatus
  bankApplicationDate?: string
  bankApprovalDate?: string
  assignedToId?: string
  externalProjectUrl?: string
  notes?: string
  additionalNotes?: string
}

export interface UploadLLCDocumentInput {
  clientId: string
  documentTypeId?: string
  name: string
  file: File
  category: LLCDocumentCategory
  notes?: string
}

export interface CreateLLCDocumentInput {
  clientId: string
  documentTypeId?: string
  name: string
  category: LLCDocumentCategory
  status?: LLCDocumentStatus
  issuedDate?: string
  expiryDate?: string
  notes?: string
}

export interface UpdateLLCDocumentInput {
  name?: string
  status?: LLCDocumentStatus
  verifiedDate?: string
  issuedDate?: string
  expiryDate?: string
  notes?: string
  rejectionReason?: string
}

export interface AddTimelineEntryInput {
  clientId: string
  eventType: LLCTimelineEventType
  title: string
  description?: string
  metadata?: Record<string, unknown>
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface LLCClientFilters {
  status?: LLCClientStatus | LLCClientStatus[]
  health?: LLCClientHealth | LLCClientHealth[]
  plan?: LLCServicePlan
  bankStatus?: LLCBankStatus
  assignedToId?: string
  country?: string
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
}

export interface LLCDocumentFilters {
  clientId: string
  category?: LLCDocumentCategory
  status?: LLCDocumentStatus
  documentTypeId?: string
}

// ============================================================================
// STATS & AGGREGATES
// ============================================================================

export interface LLCClientStats {
  total: number
  byStatus: Record<LLCClientStatus, number>
  byHealth: Record<LLCClientHealth, number>
  byPlan: Record<LLCServicePlan, number>
  totalRevenue: number
  pendingPayments: number
  thisMonthOnboarded: number
  thisMonthDelivered: number
}

export interface LLCDocumentStats {
  total: number
  byCategory: Record<LLCDocumentCategory, number>
  byStatus: Record<LLCDocumentStatus, number>
  pendingCount: number
  verifiedCount: number
}
