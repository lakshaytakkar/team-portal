import type { CallStatus, CallOutcome } from "@/lib/types/call"

export const CALL_STATUS_CONFIG: Record<CallStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: "Scheduled", color: "text-blue-700", bgColor: "bg-blue-100" },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100" },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100" },
  rescheduled: { label: "Rescheduled", color: "text-yellow-700", bgColor: "bg-yellow-100" },
}

export const CALL_OUTCOME_CONFIG: Record<CallOutcome, { label: string; color: string; bgColor: string }> = {
  connected: { label: "Connected", color: "text-green-700", bgColor: "bg-green-100" },
  voicemail: { label: "Voicemail", color: "text-blue-700", bgColor: "bg-blue-100" },
  "no-answer": { label: "No Answer", color: "text-gray-700", bgColor: "bg-gray-100" },
  busy: { label: "Busy", color: "text-orange-700", bgColor: "bg-orange-100" },
  "callback-requested": { label: "Callback Requested", color: "text-purple-700", bgColor: "bg-purple-100" },
  "not-interested": { label: "Not Interested", color: "text-red-700", bgColor: "bg-red-100" },
  interested: { label: "Interested", color: "text-green-700", bgColor: "bg-green-100" },
  "meeting-scheduled": { label: "Meeting Scheduled", color: "text-green-700", bgColor: "bg-green-100" },
}

