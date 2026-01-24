export type AttendanceStatus = "present" | "absent" | "late" | "half-day" | "leave"
export type CorrectionStatus = "pending" | "approved" | "rejected"

export interface Attendance {
  id: string
  userId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  workHours?: number
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  // Related data
  user?: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
}

export interface AttendanceCorrection {
  id: string
  attendanceId: string
  requestedById: string
  requestedDate: string
  requestedCheckIn?: string
  requestedCheckOut?: string
  reason: string
  status: CorrectionStatus
  reviewedById?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
  updatedAt: string
  // Related data
  attendance?: Attendance
  requestedBy?: {
    id: string
    name: string
    email?: string
  }
  reviewedBy?: {
    id: string
    name: string
    email?: string
  }
}

// Input types
export interface CreateAttendanceInput {
  userId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status?: AttendanceStatus
  notes?: string
}

export interface UpdateAttendanceInput {
  checkInTime?: string
  checkOutTime?: string
  status?: AttendanceStatus
  notes?: string
}

export interface CreateCorrectionInput {
  attendanceId: string
  requestedDate: string
  requestedCheckIn?: string
  requestedCheckOut?: string
  reason: string
}

export interface UpdateCorrectionInput {
  status: CorrectionStatus
  reviewNotes?: string
}

// Filter types
export interface AttendanceFilters {
  userId?: string[]
  dateFrom?: string
  dateTo?: string
  status?: AttendanceStatus[]
  search?: string
}

