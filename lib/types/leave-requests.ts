/**
 * Leave Requests Types
 */

import type { LeaveRequestStatus } from './my-workspace'

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'other'

export interface LeaveRequestMetadata {
  coveragePlan?: string
  contactDuringLeave?: string
  documents?: string[]
}

export interface LeaveRequestUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface LeaveRequest {
  id: string
  userId: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  status: LeaveRequestStatus
  reason?: string
  approvedById?: string | null
  approvedAt?: string | null
  approvalNotes?: string | null
  metadata?: LeaveRequestMetadata
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
  // Joined data
  user?: LeaveRequestUser
  approvedBy?: LeaveRequestUser
}

export interface CreateLeaveRequestInput {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  coveragePlan?: string
  contactDuringLeave?: string
  documents?: string[]
}

export interface UpdateLeaveRequestInput {
  type?: LeaveType
  startDate?: string
  endDate?: string
  reason?: string
  coveragePlan?: string
  contactDuringLeave?: string
  documents?: string[]
}

export interface ApproveLeaveRequestInput {
  approvalNotes?: string
}

