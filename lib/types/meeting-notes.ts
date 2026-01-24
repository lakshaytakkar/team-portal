export interface MeetingNote {
  id: string
  userId: string
  title: string
  content: string
  meetingDate: string // YYYY-MM-DD
  attendees?: Array<{
    name: string
    role?: string
    email?: string
  }>
  tags?: string[]
  createdAt: string
  updatedAt: string
  createdBy?: { id: string; name: string }
  updatedBy?: { id: string; name: string }
  // Related data
  user?: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
}

// Input types
export interface CreateMeetingNoteInput {
  title: string
  content: string
  meetingDate: string
  attendees?: Array<{
    name: string
    role?: string
    email?: string
  }>
  tags?: string[]
}

export interface UpdateMeetingNoteInput {
  title?: string
  content?: string
  meetingDate?: string
  attendees?: Array<{
    name: string
    role?: string
    email?: string
  }>
  tags?: string[]
}

// Filter types
export interface MeetingNoteFilters {
  userId?: string[]
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  search?: string
}

