export type CandidateStatus = "new" | "screening" | "interview" | "offer" | "hired" | "rejected"
export type CandidateSource = "linkedin" | "referral" | "job-board" | "website" | "other"

export interface Candidate {
  id: string
  fullName: string
  email: string
  phone: string
  positionApplied: string
  status: CandidateStatus
  source?: CandidateSource
  resume?: string
  coverLetter?: string
  linkedIn?: string
  experience?: string
  education?: string
  skills?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CandidateData {
  candidates: Candidate[]
}

