export type CallOutcome =
  | "connected"
  | "voicemail"
  | "no-answer"
  | "busy"
  | "callback-requested"
  | "not-interested"
  | "interested"
  | "meeting-scheduled"

export type CallStatus = "scheduled" | "completed" | "cancelled" | "rescheduled"

export interface CallUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Call {
  id: string
  date: string
  time: string
  contactName: string
  company?: string
  phone?: string
  email?: string
  outcome?: CallOutcome
  notes?: string
  nextAction?: string
  nextActionDate?: string
  assignedTo: CallUser
  status: CallStatus
  duration?: number
  recordingUrl?: string
  transcription?: string
  aiSummary?: string
  createdAt: string
  updatedAt: string
}

export interface CallData {
  calls: Call[]
}

