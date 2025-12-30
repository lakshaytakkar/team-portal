export type ApplicationStatus = "applied" | "screening" | "interview" | "offer" | "hired" | "rejected"
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled"
export type JobRoleStatus = "active" | "inactive" | "filled"
export type JobPortalStatus = "active" | "inactive"
export type JobListingStatus = "draft" | "active" | "paused" | "expired" | "closed"
export type RoleType = "client_facing" | "internal" | "hybrid"
export type EvaluationRound = "level_1" | "level_2"
export type FinalStatus = "selected" | "rejected" | "on_hold" | "pending"

export interface RecruitmentUser {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface Application {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  status: ApplicationStatus
  appliedDate: string
  source: string
  resume?: string
  assignedTo?: RecruitmentUser
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  interviewDate: string
  interviewTime: string
  interviewType: "phone" | "video" | "in-person"
  interviewer: RecruitmentUser
  status: InterviewStatus
  location?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Evaluation {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  evaluatedBy: RecruitmentUser
  // Scores
  technicalScore: number
  communicationScore: number
  culturalFitScore: number
  overallScore: number
  departmentFitScore?: number
  leadershipScore?: number
  // Feedback
  strengths?: string
  weaknesses?: string
  feedback: string
  recommendation: "hire" | "maybe" | "no-hire"
  // Multi-round evaluation fields
  evaluationRound: EvaluationRound
  evaluatorTitle?: string
  isFinalDecision?: boolean
  finalStatus?: FinalStatus
  // Timestamps
  evaluatedAt: string
  createdAt: string
  updatedAt: string
}

// For displaying evaluation progress
export interface EvaluationProgress {
  candidateId: string
  candidateName: string
  candidateEmail: string
  position: string
  level1Evaluation?: Evaluation
  level2Evaluation?: Evaluation
  currentStatus: "pending_level_1" | "pending_level_2" | "completed" | "rejected"
}

export interface JobRole {
  id: string
  title: string
  department: string
  status: JobRoleStatus
  description?: string
  requirements?: string
  // Extended schema fields
  experienceMinYears?: number
  experienceMaxYears?: number
  skills?: string[]
  preferredIndustries?: string[]
  roleType?: RoleType
  openings?: number
  salaryMin?: number
  salaryMax?: number
  location?: string
  employmentType?: "full-time" | "part-time" | "contract" | "internship"
  masterJd?: string
  jdAttachmentUrl?: string
  responsibilities?: string
  // Admin metadata
  createdBy?: RecruitmentUser
  updatedBy?: RecruitmentUser
  // Related counts
  jobPostingsCount?: number
  applicationsCount?: number
  jobListingsCount?: number
  interviewsCount?: number
  hiresCount?: number
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface JobPortal {
  id: string
  name: string
  url: string
  status: JobPortalStatus
  apiKey?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employmentType: "full-time" | "part-time" | "contract" | "internship"
  status: "draft" | "published" | "closed"
  roleType?: RoleType
  postedDate?: string
  closingDate?: string
  description?: string
  requirements?: string
  postedBy: RecruitmentUser
  views?: number
  applications?: number
  openings?: number
  experienceMinYears?: number
  experienceMaxYears?: number
  skills?: string[]
  preferredIndustries?: string[]
  createdAt: string
  updatedAt: string
}

export interface JobListing {
  id: string
  jobRole: JobRole
  jobPortal: JobPortal
  portalListingUrl?: string
  portalListingId?: string
  customTitle?: string
  customJd?: string
  postedDate?: string
  expiryDate?: string
  status: JobListingStatus
  views: number
  applicationsCount: number
  notes?: string
  postedBy?: RecruitmentUser
  createdAt: string
  updatedAt: string
}

