'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { resolveDepartmentId, resolveProfileId, normalizeOptional } from '@/lib/utils/foreign-keys'
import { getUserFriendlyErrorMessage, logDatabaseError } from '@/lib/utils/errors'
import { getAvatarForUser } from '@/lib/utils/avatars'
import type {
  Application as FrontendApplication,
  ApplicationStatus,
  Interview as FrontendInterview,
  Evaluation as FrontendEvaluation,
  JobRole as FrontendJobRole,
  JobPosting as FrontendJobPosting,
  JobPortal as FrontendJobPortal,
  JobListing as FrontendJobListing,
  RecruitmentUser,
} from '@/lib/types/recruitment'
import type { Candidate, CandidateStatus, CandidateSource } from '@/lib/types/candidate'

// Type alias for JobPosting
type JobPosting = FrontendJobPosting

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function toRecruitmentUser(profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null): RecruitmentUser | undefined {
  if (!profile) return undefined
  return {
    id: profile.id,
    name: profile.full_name ?? 'Unknown',
    email: profile.email,
    avatar: profile.avatar_url ?? getAvatarForUser(profile.full_name ?? 'U'),
  }
}

// ============================================================================
// CANDIDATES
// ============================================================================

export async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((c) => ({
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone ?? '',
    positionApplied: 'Open Application',
    status: c.status as CandidateStatus,
    source: c.source as CandidateSource | undefined,
    resume: c.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: c.linked_in ?? undefined,
    skills: c.skills ?? undefined,
    experience: c.experience ?? undefined,
    education: c.education ?? undefined,
    notes: c.notes ?? undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone ?? '',
    positionApplied: 'Open Application',
    status: data.status as CandidateStatus,
    source: data.source as CandidateSource | undefined,
    resume: data.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: data.linked_in ?? undefined,
    skills: data.skills ?? undefined,
    experience: data.experience ?? undefined,
    education: data.education ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

interface CreateCandidateInput {
  fullName: string
  email: string
  phone?: string
  source?: 'linkedin' | 'referral' | 'job-board' | 'website' | 'other'
  resume?: string
  linkedIn?: string
  skills?: string
  experience?: string
  education?: string
  expectedSalary?: number
  notes?: string
}

export async function createCandidate(input: CreateCandidateInput): Promise<Candidate> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      source: input.source,
      resume: input.resume,
      linked_in: input.linkedIn,
      skills: input.skills,
      experience: input.experience,
      education: input.education,
      expected_salary: input.expectedSalary,
      notes: input.notes,
      status: 'new',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/recruitment/candidates')

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone ?? '',
    positionApplied: 'Open Application',
    status: data.status as CandidateStatus,
    source: data.source as CandidateSource | undefined,
    resume: data.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: data.linked_in ?? undefined,
    skills: data.skills ?? undefined,
    experience: data.experience ?? undefined,
    education: data.education ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

interface UpdateCandidateInput {
  id: string
  fullName?: string
  email?: string
  phone?: string
  status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  source?: 'linkedin' | 'referral' | 'job-board' | 'website' | 'other'
  resume?: string
  linkedIn?: string
  skills?: string
  experience?: string
  education?: string
  expectedSalary?: number
  notes?: string
}

export async function updateCandidate(input: UpdateCandidateInput): Promise<Candidate> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.fullName !== undefined) update.full_name = input.fullName
  if (input.email !== undefined) update.email = input.email
  if (input.phone !== undefined) update.phone = input.phone
  if (input.status !== undefined) update.status = input.status
  if (input.source !== undefined) update.source = input.source
  if (input.resume !== undefined) update.resume = input.resume
  if (input.linkedIn !== undefined) update.linked_in = input.linkedIn
  if (input.skills !== undefined) update.skills = input.skills
  if (input.experience !== undefined) update.experience = input.experience
  if (input.education !== undefined) update.education = input.education
  if (input.expectedSalary !== undefined) update.expected_salary = input.expectedSalary
  if (input.notes !== undefined) update.notes = input.notes

  const { data, error } = await supabase
    .from('candidates')
    .update(update)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/recruitment/candidates')
  revalidatePath(`/recruitment/candidates/${input.id}`)

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone ?? '',
    positionApplied: 'Open Application',
    status: data.status as CandidateStatus,
    source: data.source as CandidateSource | undefined,
    resume: data.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: data.linked_in ?? undefined,
    skills: data.skills ?? undefined,
    experience: data.experience ?? undefined,
    education: data.education ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteCandidate(id: string): Promise<void> {
  const supabase = await createClient()

  // Check if candidate has active applications
  const { data: applications } = await supabase
    .from('applications')
    .select('id')
    .eq('candidate_id', id)
    .is('deleted_at', null)
    .limit(1)

  if (applications && applications.length > 0) {
    throw new Error('Cannot delete candidate with active applications')
  }

  const { error } = await supabase
    .from('candidates')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/recruitment/candidates')
}

// ============================================================================
// ENHANCED RELATION FUNCTIONS
// ============================================================================

export interface CandidateWithRelations extends Candidate {
  applications: FrontendApplication[]
  interviews: FrontendInterview[]
  evaluations: FrontendEvaluation[]
  applicationsCount: number
  interviewsCount: number
  evaluationsCount: number
}

export async function getCandidateWithRelations(id: string): Promise<CandidateWithRelations | null> {
  const supabase = await createClient()

  const candidate = await getCandidateById(id)
  if (!candidate) return null

  // Get all applications for this candidate
  const { data: applicationsData } = await supabase
    .from('applications')
    .select(`
      *,
      job_posting:job_postings(title),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .eq('candidate_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const applications: FrontendApplication[] = (applicationsData || []).map((row) => ({
    id: row.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    position: row.job_posting?.title ?? 'Unknown Position',
    status: row.status,
    appliedDate: row.applied_date,
    source: row.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(row.assigned_to),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  // Get all interviews for applications
  const applicationIds = applications.map((app) => app.id)
  const { data: interviewsData } = applicationIds.length > 0
    ? await supabase
        .from('interviews')
        .select(`
          *,
          application:applications(
            candidate:candidates(full_name, email),
            job_posting:job_postings(title)
          ),
          interviewer:profiles(id, full_name, email, avatar_url)
        `)
        .in('application_id', applicationIds)
        .order('interview_date', { ascending: false })
    : { data: null }

  const interviews: FrontendInterview[] = (interviewsData || []).map((row) => ({
    id: row.id,
    candidateName: row.application?.candidate?.full_name ?? candidate.fullName,
    candidateEmail: row.application?.candidate?.email ?? candidate.email,
    position: row.application?.job_posting?.title ?? 'Unknown Position',
    interviewDate: row.interview_date,
    interviewTime: row.interview_time,
    interviewType: row.interview_type,
    interviewer: toRecruitmentUser(row.interviewer)!,
    status: row.status,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  // Get all evaluations for interviews
  const interviewIds = interviews.map((int) => int.id)
  const { data: evaluationsData } = interviewIds.length > 0
    ? await supabase
        .from('evaluations')
        .select(`
          *,
          interview:interviews(
            application:applications(
              candidate:candidates(full_name, email),
              job_posting:job_postings(title)
            )
          ),
          evaluated_by:profiles(id, full_name, email, avatar_url)
        `)
        .in('interview_id', interviewIds)
        .order('evaluated_at', { ascending: false })
    : { data: null }

  const evaluations: FrontendEvaluation[] = (evaluationsData || []).map((row) => ({
    id: row.id,
    candidateName: row.interview?.application?.candidate?.full_name ?? candidate.fullName,
    candidateEmail: row.interview?.application?.candidate?.email ?? candidate.email,
    position: row.interview?.application?.job_posting?.title ?? 'Unknown Position',
    evaluatedBy: toRecruitmentUser(row.evaluated_by)!,
    technicalScore: row.technical_score,
    communicationScore: row.communication_score,
    culturalFitScore: row.cultural_fit_score,
    overallScore: row.overall_score,
    feedback: row.feedback ?? '',
    recommendation: row.recommendation,
    evaluationRound: row.evaluation_round ?? 'level_1',
    evaluatedAt: row.evaluated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return {
    ...candidate,
    applications,
    interviews,
    evaluations,
    applicationsCount: applications.length,
    interviewsCount: interviews.length,
    evaluationsCount: evaluations.length,
  }
}

export interface ApplicationWithRelations extends FrontendApplication {
  candidate: Candidate
  jobPosting: JobPosting
  interviews: FrontendInterview[]
  evaluation?: FrontendEvaluation
  interviewsCount: number
}

export async function getApplicationWithRelations(id: string): Promise<ApplicationWithRelations | null> {
  const supabase = await createClient()

  const { data: appData, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(*),
      job_posting:job_postings(
        *,
        department:departments(name),
        posted_by:profiles(id, full_name, email, avatar_url)
      ),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !appData) return null

  const candidate: Candidate = {
    id: appData.candidate.id,
    fullName: appData.candidate.full_name,
    email: appData.candidate.email,
    phone: appData.candidate.phone ?? '',
    positionApplied: appData.job_posting?.title ?? 'Unknown Position',
    status: appData.candidate.status as CandidateStatus,
    source: appData.candidate.source as CandidateSource | undefined,
    resume: appData.candidate.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: appData.candidate.linked_in ?? undefined,
    skills: appData.candidate.skills ?? undefined,
    experience: appData.candidate.experience ?? undefined,
    education: appData.candidate.education ?? undefined,
    notes: appData.candidate.notes ?? undefined,
    createdAt: appData.candidate.created_at,
    updatedAt: appData.candidate.updated_at,
  }

  const jobPosting: JobPosting = {
    id: appData.job_posting.id,
    title: appData.job_posting.title,
    department: appData.job_posting.department?.name ?? 'Unknown',
    location: appData.job_posting.location ?? '',
    employmentType: appData.job_posting.employment_type,
    status: appData.job_posting.status,
    roleType: appData.job_posting.role_type ?? 'internal',
    postedDate: appData.job_posting.posted_date ?? undefined,
    closingDate: appData.job_posting.closing_date ?? undefined,
    description: appData.job_posting.description ?? undefined,
    requirements: appData.job_posting.requirements ?? undefined,
    postedBy: toRecruitmentUser(appData.job_posting.posted_by)!,
    views: appData.job_posting.views ?? 0,
    applications: appData.job_posting.applications_count ?? 0,
    openings: appData.job_posting.openings ?? 1,
    experienceMinYears: appData.job_posting.experience_min_years ?? undefined,
    experienceMaxYears: appData.job_posting.experience_max_years ?? undefined,
    skills: appData.job_posting.skills ?? undefined,
    preferredIndustries: appData.job_posting.preferred_industries ?? undefined,
    createdAt: appData.job_posting.created_at,
    updatedAt: appData.job_posting.updated_at,
  }

  // Get interviews for this application
  const { data: interviewsData } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        candidate:candidates(full_name, email),
        job_posting:job_postings(title)
      ),
      interviewer:profiles(id, full_name, email, avatar_url)
    `)
    .eq('application_id', id)
    .order('interview_date', { ascending: false })

  const interviews: FrontendInterview[] = (interviewsData || []).map((row) => ({
    id: row.id,
    candidateName: row.application?.candidate?.full_name ?? candidate.fullName,
    candidateEmail: row.application?.candidate?.email ?? candidate.email,
    position: row.application?.job_posting?.title ?? jobPosting.title,
    interviewDate: row.interview_date,
    interviewTime: row.interview_time,
    interviewType: row.interview_type,
    interviewer: toRecruitmentUser(row.interviewer)!,
    status: row.status,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  // Get evaluation for completed interviews (if any)
  const completedInterviewIds = interviews.filter((int) => int.status === 'completed').map((int) => int.id)
  let evaluation: FrontendEvaluation | undefined
  if (completedInterviewIds.length > 0) {
    const { data: evalData } = await supabase
      .from('evaluations')
      .select(`
        *,
        interview:interviews(
          application:applications(
            candidate:candidates(full_name, email),
            job_posting:job_postings(title)
          )
        ),
        evaluated_by:profiles(id, full_name, email, avatar_url)
      `)
      .in('interview_id', completedInterviewIds)
      .limit(1)
      .single()

    if (evalData) {
      evaluation = {
        id: evalData.id,
        candidateName: evalData.interview?.application?.candidate?.full_name ?? candidate.fullName,
        candidateEmail: evalData.interview?.application?.candidate?.email ?? candidate.email,
        position: evalData.interview?.application?.job_posting?.title ?? jobPosting.title,
        evaluatedBy: toRecruitmentUser(evalData.evaluated_by)!,
        technicalScore: evalData.technical_score,
        communicationScore: evalData.communication_score,
        culturalFitScore: evalData.cultural_fit_score,
        overallScore: evalData.overall_score,
        feedback: evalData.feedback ?? '',
        recommendation: evalData.recommendation,
        evaluationRound: evalData.evaluation_round ?? 'level_1',
        evaluatedAt: evalData.evaluated_at,
        createdAt: evalData.created_at,
        updatedAt: evalData.updated_at,
      }
    }
  }

  return {
    id: appData.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    position: jobPosting.title,
    status: appData.status,
    appliedDate: appData.applied_date,
    source: appData.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(appData.assigned_to),
    notes: appData.notes ?? undefined,
    createdAt: appData.created_at,
    updatedAt: appData.updated_at,
    candidate,
    jobPosting,
    interviews,
    evaluation,
    interviewsCount: interviews.length,
  }
}

export interface InterviewWithRelations extends FrontendInterview {
  application: FrontendApplication
  candidate: Candidate
  evaluation?: FrontendEvaluation
}

export async function getInterviewWithRelations(id: string): Promise<InterviewWithRelations | null> {
  const supabase = await createClient()

  const { data: interviewData, error } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        *,
        candidate:candidates(*),
        job_posting:job_postings(title),
        assigned_to:profiles(id, full_name, email, avatar_url)
      ),
      interviewer:profiles(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error || !interviewData) return null

  const candidateData = interviewData.application?.candidate
  const candidate: Candidate = {
    id: candidateData.id,
    fullName: candidateData.full_name,
    email: candidateData.email,
    phone: candidateData.phone ?? '',
    positionApplied: interviewData.application?.job_posting?.title ?? 'Unknown Position',
    status: candidateData.status as CandidateStatus,
    source: candidateData.source as CandidateSource | undefined,
    resume: candidateData.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: candidateData.linked_in ?? undefined,
    skills: candidateData.skills ?? undefined,
    experience: candidateData.experience ?? undefined,
    education: candidateData.education ?? undefined,
    notes: candidateData.notes ?? undefined,
    createdAt: candidateData.created_at,
    updatedAt: candidateData.updated_at,
  }

  const application: FrontendApplication = {
    id: interviewData.application.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    position: interviewData.application?.job_posting?.title ?? 'Unknown Position',
    status: interviewData.application.status,
    appliedDate: interviewData.application.applied_date,
    source: interviewData.application.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(interviewData.application.assigned_to),
    notes: interviewData.application.notes ?? undefined,
    createdAt: interviewData.application.created_at,
    updatedAt: interviewData.application.updated_at,
  }

  // Get evaluation if exists
  const { data: evalData } = await supabase
    .from('evaluations')
    .select(`
      *,
      interview:interviews(
        application:applications(
          candidate:candidates(full_name, email),
          job_posting:job_postings(title)
        )
      ),
      evaluated_by:profiles(id, full_name, email, avatar_url)
    `)
    .eq('interview_id', id)
    .single()

  const evaluation: FrontendEvaluation | undefined = evalData
    ? {
        id: evalData.id,
        candidateName: evalData.interview?.application?.candidate?.full_name ?? candidate.fullName,
        candidateEmail: evalData.interview?.application?.candidate?.email ?? candidate.email,
        position: evalData.interview?.application?.job_posting?.title ?? application.position,
        evaluatedBy: toRecruitmentUser(evalData.evaluated_by)!,
        technicalScore: evalData.technical_score,
        communicationScore: evalData.communication_score,
        culturalFitScore: evalData.cultural_fit_score,
        overallScore: evalData.overall_score,
        feedback: evalData.feedback ?? '',
        recommendation: evalData.recommendation,
        evaluationRound: evalData.evaluation_round ?? 'level_1',
        evaluatedAt: evalData.evaluated_at,
        createdAt: evalData.created_at,
        updatedAt: evalData.updated_at,
      }
    : undefined

  return {
    id: interviewData.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    position: application.position,
    interviewDate: interviewData.interview_date,
    interviewTime: interviewData.interview_time,
    interviewType: interviewData.interview_type,
    interviewer: toRecruitmentUser(interviewData.interviewer)!,
    status: interviewData.status,
    location: interviewData.location ?? undefined,
    notes: interviewData.notes ?? undefined,
    createdAt: interviewData.created_at,
    updatedAt: interviewData.updated_at,
    application,
    candidate,
    evaluation,
  }
}

export interface JobPostingWithApplications extends Omit<JobPosting, 'applications'> {
  applications: FrontendApplication[]
  applicationsCount: number
}

export async function getJobPostingWithApplications(id: string): Promise<JobPostingWithApplications | null> {
  const supabase = await createClient()

  const posting = await getJobPostings()
  const jobPosting = posting.find((p) => p.id === id)
  if (!jobPosting) return null

  // Get all applications for this job posting
  const { data: applicationsData } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(full_name, email),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .eq('job_posting_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const applications: FrontendApplication[] = (applicationsData || []).map((row) => ({
    id: row.id,
    candidateName: row.candidate?.full_name ?? 'Unknown',
    candidateEmail: row.candidate?.email ?? '',
    position: jobPosting.title,
    status: row.status,
    appliedDate: row.applied_date,
    source: row.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(row.assigned_to),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return {
    ...jobPosting,
    applications,
    applicationsCount: applications.length,
  }
}

// ============================================================================
// TIMELINE & ACTIVITY
// ============================================================================

export interface TimelineItem {
  id: string
  type: 'application' | 'interview' | 'evaluation' | 'status_change' | 'note'
  title: string
  description: string
  date: string
  userId?: string
  userName?: string
  relatedId?: string
  relatedType?: string
}

export async function getCandidateTimeline(candidateId: string): Promise<TimelineItem[]> {
  const supabase = await createClient()
  const timeline: TimelineItem[] = []

  // Get candidate
  const candidate = await getCandidateById(candidateId)
  if (!candidate) return []

  // Get applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_date,
      created_at,
      updated_at,
      job_posting:job_postings(title)
    `)
    .eq('candidate_id', candidateId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (applications) {
    for (const app of applications) {
      const jobPosting = app.job_posting as unknown as { title: string } | null
      timeline.push({
        id: `app-${app.id}`,
        type: 'application',
        title: `Applied for ${jobPosting?.title ?? 'Position'}`,
        description: `Application status: ${app.status}`,
        date: app.applied_date || app.created_at,
        relatedId: app.id,
        relatedType: 'application',
      })

      // Track status changes (if status changed after creation)
      if (app.updated_at !== app.created_at && app.status !== 'applied') {
        timeline.push({
          id: `app-status-${app.id}`,
          type: 'status_change',
          title: `Status changed to ${app.status}`,
          description: `Application for ${jobPosting?.title ?? 'Position'}`,
          date: app.updated_at,
          relatedId: app.id,
          relatedType: 'application',
        })
      }
    }
  }

  // Get interviews
  const applicationIds = applications?.map((a) => a.id) || []
  if (applicationIds.length > 0) {
    const { data: interviews } = await supabase
      .from('interviews')
      .select(`
        id,
        interview_date,
        interview_time,
        status,
        created_at,
        updated_at,
        application:applications(
          job_posting:job_postings(title)
        ),
        interviewer:profiles(id, full_name, email)
      `)
      .in('application_id', applicationIds)
      .order('interview_date', { ascending: false })

    if (interviews) {
      for (const interview of interviews) {
        const interviewer = interview.interviewer as unknown as { id: string; full_name: string; email: string } | null
        const application = interview.application as unknown as { job_posting: { title: string } | null } | null
        timeline.push({
          id: `int-${interview.id}`,
          type: 'interview',
          title: `Interview scheduled`,
          description: `${interview.interview_date} at ${interview.interview_time} - ${interview.status}`,
          date: interview.interview_date,
          relatedId: interview.id,
          relatedType: 'interview',
          userId: interviewer?.id,
          userName: interviewer?.full_name ?? undefined,
        })

        if (interview.status === 'completed' && interview.updated_at !== interview.created_at) {
          timeline.push({
            id: `int-completed-${interview.id}`,
            type: 'status_change',
            title: `Interview completed`,
            description: `Interview for ${application?.job_posting?.title ?? 'Position'}`,
            date: interview.updated_at,
            relatedId: interview.id,
            relatedType: 'interview',
          })
        }
      }
    }
  }

  // Get evaluations
  const interviewIds = timeline
    .filter((item) => item.relatedType === 'interview')
    .map((item) => item.relatedId!)
  if (interviewIds.length > 0) {
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        id,
        evaluated_at,
        overall_score,
        recommendation,
        evaluated_by:profiles(id, full_name, email),
        interview:interviews(
          application:applications(
            job_posting:job_postings(title)
          )
        )
      `)
      .in('interview_id', interviewIds)
      .order('evaluated_at', { ascending: false })

    if (evaluations) {
      for (const evaluation of evaluations) {
        const evaluatedBy = evaluation.evaluated_by as unknown as { id: string; full_name: string; email: string } | null
        timeline.push({
          id: `eval-${evaluation.id}`,
          type: 'evaluation',
          title: `Evaluation completed`,
          description: `Score: ${evaluation.overall_score}/10 - Recommendation: ${evaluation.recommendation}`,
          date: evaluation.evaluated_at,
          relatedId: evaluation.id,
          relatedType: 'evaluation',
          userId: evaluatedBy?.id,
          userName: evaluatedBy?.full_name ?? undefined,
        })
      }
    }
  }

  // Sort by date (newest first)
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return timeline
}

// ============================================================================
// STATUS SYNC & UPDATES
// ============================================================================

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus,
  autoSync: boolean = true
): Promise<Candidate> {
  const supabase = await createClient()

  try {
    // Validate candidate exists
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!existingCandidate) {
      throw new Error('Candidate not found')
    }

    // Validate status transition (prevent invalid transitions)
    const validTransitions: Record<CandidateStatus, CandidateStatus[]> = {
      new: ['screening', 'rejected'],
      screening: ['interview', 'rejected'],
      interview: ['offer', 'rejected'],
      offer: ['hired', 'rejected'],
      hired: [], // Terminal state
      rejected: [], // Terminal state
    }

    const currentStatus = existingCandidate.status as CandidateStatus
    if (!validTransitions[currentStatus]?.includes(status) && currentStatus !== status) {
      // Allow same status or terminal states to be set manually
      if (status !== 'hired' && status !== 'rejected' && currentStatus !== status) {
        throw new Error(`Cannot transition from ${currentStatus} to ${status}. Valid transitions: ${validTransitions[currentStatus]?.join(', ') || 'none'}`)
      }
    }

    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('candidates')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Auto-sync: If status is "hired" or "rejected", check applications
    if (autoSync && (status === 'hired' || status === 'rejected')) {
      const { data: applications } = await supabase
        .from('applications')
        .select('id, status')
        .eq('candidate_id', id)
        .is('deleted_at', null)

      if (applications && applications.length > 0) {
        // Update all applications to match candidate status
        const newAppStatus = status === 'hired' ? 'hired' : 'rejected'
        await supabase
          .from('applications')
          .update({ status: newAppStatus, updated_at: new Date().toISOString() })
          .in('id', applications.map((a) => a.id))
      }
    }

    revalidatePath('/recruitment/candidates')
    revalidatePath(`/recruitment/candidates/${id}`)

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone ?? '',
      positionApplied: 'Open Application',
      status: data.status as CandidateStatus,
      source: data.source as CandidateSource | undefined,
      resume: data.resume ?? undefined,
      coverLetter: undefined,
      linkedIn: data.linked_in ?? undefined,
      skills: data.skills ?? undefined,
      experience: data.experience ?? undefined,
      education: data.education ?? undefined,
      notes: data.notes ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateCandidateStatus')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

interface BulkUpdateCandidatesInput {
  ids: string[]
  updates: {
    status?: CandidateStatus
    assignedToId?: string
    source?: CandidateSource
  }
}

export async function bulkUpdateCandidates(input: BulkUpdateCandidatesInput): Promise<{ updated: number; errors: string[] }> {
  const supabase = await createClient()
  const errors: string[] = []
  let updated = 0

  try {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.updates.status !== undefined) update.status = input.updates.status
    if (input.updates.source !== undefined) update.source = input.updates.source

    // Handle assigned_to separately if needed (would require a different table structure)
    // For now, we'll just update status and source

    const { error } = await supabase
      .from('candidates')
      .update(update)
      .in('id', input.ids)

    if (error) {
      errors.push(error.message)
    } else {
      updated = input.ids.length
    }

    revalidatePath('/recruitment/candidates')

    return { updated, errors }
  } catch (error) {
    logDatabaseError(error, 'bulkUpdateCandidates')
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    return { updated, errors }
  }
}

// ============================================================================
// METRICS & ANALYTICS
// ============================================================================

export interface RecruitmentMetrics {
  activeCandidates: number
  candidatesByStatus: Record<CandidateStatus, number>
  openPositions: number
  interviewsThisWeek: number
  offersPending: number
  averageTimeToHire: number // in days
  sourceEffectiveness: Record<string, number>
  conversionRates: {
    applicationToInterview: number
    interviewToOffer: number
    offerToHired: number
  }
}

export async function getRecruitmentMetrics(filters?: {
  dateFrom?: string
  dateTo?: string
  departmentId?: string
}): Promise<RecruitmentMetrics> {
  const supabase = await createClient()

  // Active candidates
  let candidatesQuery = supabase.from('candidates').select('status, source, created_at').is('deleted_at', null)
  if (filters?.dateFrom) {
    candidatesQuery = candidatesQuery.gte('created_at', filters.dateFrom)
  }
  if (filters?.dateTo) {
    candidatesQuery = candidatesQuery.lte('created_at', filters.dateTo)
  }
  const { data: candidates } = await candidatesQuery

  const candidatesByStatus: Record<CandidateStatus, number> = {
    new: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  }

  const sourceEffectiveness: Record<string, number> = {}

  candidates?.forEach((c) => {
    candidatesByStatus[c.status as CandidateStatus] = (candidatesByStatus[c.status as CandidateStatus] || 0) + 1
    if (c.source) {
      sourceEffectiveness[c.source] = (sourceEffectiveness[c.source] || 0) + 1
    }
  })

  const activeCandidates = candidates?.filter((c) => c.status !== 'hired' && c.status !== 'rejected').length || 0

  // Open positions (job postings with status published)
  let postingsQuery = supabase.from('job_postings').select('id, status').is('deleted_at', null)
  if (filters?.departmentId) {
    postingsQuery = postingsQuery.eq('department_id', filters.departmentId)
  }
  const { data: postings } = await postingsQuery
  const openPositions = postings?.filter((p) => p.status === 'published').length || 0

  // Interviews this week
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const { data: interviews } = await supabase
    .from('interviews')
    .select('id, interview_date')
    .gte('interview_date', weekStart.toISOString().split('T')[0])
    .lt('interview_date', weekEnd.toISOString().split('T')[0])

  const interviewsThisWeek = interviews?.length || 0

  // Offers pending (applications with status "offer")
  const { data: offers } = await supabase
    .from('applications')
    .select('id')
    .eq('status', 'offer')
    .is('deleted_at', null)

  const offersPending = offers?.length || 0

  // Calculate conversion rates
  const { data: allApplications } = await supabase
    .from('applications')
    .select('id, status')
    .is('deleted_at', null)

  const totalApplications = allApplications?.length || 0
  const applicationsInInterview = allApplications?.filter((a) => a.status === 'interview' || a.status === 'offer' || a.status === 'hired').length || 0
  const applicationsWithOffers = allApplications?.filter((a) => a.status === 'offer' || a.status === 'hired').length || 0
  const applicationsHired = allApplications?.filter((a) => a.status === 'hired').length || 0

  const conversionRates = {
    applicationToInterview: totalApplications > 0 ? (applicationsInInterview / totalApplications) * 100 : 0,
    interviewToOffer: applicationsInInterview > 0 ? (applicationsWithOffers / applicationsInInterview) * 100 : 0,
    offerToHired: applicationsWithOffers > 0 ? (applicationsHired / applicationsWithOffers) * 100 : 0,
  }

  // Calculate average time to hire (simplified - from application to hired)
  const { data: hiredApplications } = await supabase
    .from('applications')
    .select('applied_date, updated_at')
    .eq('status', 'hired')
    .is('deleted_at', null)

  let averageTimeToHire = 0
  if (hiredApplications && hiredApplications.length > 0) {
    const times = hiredApplications
      .map((app) => {
        const applied = new Date(app.applied_date)
        const hired = new Date(app.updated_at)
        return (hired.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24) // days
      })
      .filter((days) => days > 0)
    averageTimeToHire = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  return {
    activeCandidates,
    candidatesByStatus,
    openPositions,
    interviewsThisWeek,
    offersPending,
    averageTimeToHire: Math.round(averageTimeToHire * 10) / 10,
    sourceEffectiveness,
    conversionRates,
  }
}

export interface RecruitmentDashboardMetrics {
  activeJobPosts: number
  activeJobPostsChange: number // change this week
  totalApplicants: number
  totalApplicantsChange: number // percentage change this month
  interviewsScheduled: number
  interviewsScheduledChange: number // change this week
  hiresCompleted: number
  hiresCompletedChange: number // change this week
  applicationsOverTime: Array<{
    month: string
    thisPeriod: number
    lastPeriod: number
  }>
}

export async function getRecruitmentDashboardMetrics(): Promise<RecruitmentDashboardMetrics> {
  const supabase = await createClient()

  // Active job posts (published status)
  const { data: allJobPostings } = await supabase
    .from('job_postings')
    .select('id, status, created_at')
    .is('deleted_at', null)

  const activeJobPosts = allJobPostings?.filter((p) => p.status === 'published').length || 0

  // Calculate change this week
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const activeJobPostsThisWeek = allJobPostings?.filter(
    (p) => p.status === 'published' && new Date(p.created_at) >= weekStart
  ).length || 0
  const activeJobPostsLastWeek = allJobPostings?.filter(
    (p) => p.status === 'published' && new Date(p.created_at) >= lastWeekStart && new Date(p.created_at) < weekStart
  ).length || 0
  const activeJobPostsChange = activeJobPostsThisWeek - activeJobPostsLastWeek

  // Total applicants
  const { data: allApplications } = await supabase
    .from('applications')
    .select('id, applied_date, created_at')
    .is('deleted_at', null)

  const totalApplicants = allApplications?.length || 0

  // Calculate percentage change this month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const lastMonthStart = new Date(monthStart)
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
  const lastMonthEnd = new Date(monthStart)

  const applicantsThisMonth = allApplications?.filter(
    (a) => new Date(a.applied_date || a.created_at) >= monthStart
  ).length || 0
  const applicantsLastMonth = allApplications?.filter(
    (a) => {
      const date = new Date(a.applied_date || a.created_at)
      return date >= lastMonthStart && date < lastMonthEnd
    }
  ).length || 0
  const totalApplicantsChange = applicantsLastMonth > 0
    ? ((applicantsThisMonth - applicantsLastMonth) / applicantsLastMonth) * 100
    : applicantsThisMonth > 0 ? 100 : 0

  // Interviews scheduled
  const { data: allInterviews } = await supabase
    .from('interviews')
    .select('id, interview_date, status')
    .is('deleted_at', null)

  const interviewsScheduled = allInterviews?.filter((i) => i.status === 'scheduled').length || 0

  // Calculate change this week
  const interviewsThisWeek = allInterviews?.filter(
    (i) => {
      const date = new Date(i.interview_date)
      return date >= weekStart && i.status === 'scheduled'
    }
  ).length || 0
  const interviewsLastWeek = allInterviews?.filter(
    (i) => {
      const date = new Date(i.interview_date)
      return date >= lastWeekStart && date < weekStart && i.status === 'scheduled'
    }
  ).length || 0
  const interviewsScheduledChange = interviewsThisWeek - interviewsLastWeek

  // Hires completed
  const { data: hiredApplications } = await supabase
    .from('applications')
    .select('id, updated_at, status')
    .eq('status', 'hired')
    .is('deleted_at', null)

  const hiresCompleted = hiredApplications?.length || 0

  // Calculate change this week
  const hiresThisWeek = hiredApplications?.filter(
    (a) => {
      const date = new Date(a.updated_at)
      return date >= weekStart
    }
  ).length || 0
  const hiresLastWeek = hiredApplications?.filter(
    (a) => {
      const date = new Date(a.updated_at)
      return date >= lastWeekStart && date < weekStart
    }
  ).length || 0
  const hiresCompletedChange = hiresThisWeek - hiresLastWeek

  // Applications over time (last 12 months)
  const applicationsOverTime: Array<{ month: string; thisPeriod: number; lastPeriod: number }> = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 11; i >= 0; i--) {
    const currentDate = new Date()
    currentDate.setMonth(currentDate.getMonth() - i)
    const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Last year same month
    const lastYearMonthStart = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
    const lastYearMonthEnd = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() + 1, 0)

    const thisPeriod = allApplications?.filter((a) => {
      const date = new Date(a.applied_date || a.created_at)
      return date >= monthStartDate && date <= monthEndDate
    }).length || 0

    const lastPeriod = allApplications?.filter((a) => {
      const date = new Date(a.applied_date || a.created_at)
      return date >= lastYearMonthStart && date <= lastYearMonthEnd
    }).length || 0

    applicationsOverTime.push({
      month: monthNames[currentDate.getMonth()],
      thisPeriod,
      lastPeriod,
    })
  }

  return {
    activeJobPosts,
    activeJobPostsChange,
    totalApplicants,
    totalApplicantsChange: Math.round(totalApplicantsChange * 10) / 10,
    interviewsScheduled,
    interviewsScheduledChange,
    hiresCompleted,
    hiresCompletedChange,
    applicationsOverTime,
  }
}

// ============================================================================
// ADVANCED SEARCH
// ============================================================================

export interface SearchFilters {
  status?: CandidateStatus[]
  source?: CandidateSource[]
  dateFrom?: string
  dateTo?: string
  recruiterId?: string
  departmentId?: string
  jobPostingId?: string
  skills?: string
  experienceMin?: number
  experienceMax?: number
}

export async function searchCandidates(query: string, filters?: SearchFilters): Promise<Candidate[]> {
  const supabase = await createClient()

  let searchQuery = supabase.from('candidates').select('*').is('deleted_at', null)

  // Text search
  if (query) {
    searchQuery = searchQuery.or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,skills.ilike.%${query}%,experience.ilike.%${query}%,notes.ilike.%${query}%`
    )
  }

  // Status filter
  if (filters?.status && filters.status.length > 0) {
    searchQuery = searchQuery.in('status', filters.status)
  }

  // Source filter
  if (filters?.source && filters.source.length > 0) {
    searchQuery = searchQuery.in('source', filters.source)
  }

  // Date range filter
  if (filters?.dateFrom) {
    searchQuery = searchQuery.gte('created_at', filters.dateFrom)
  }
  if (filters?.dateTo) {
    searchQuery = searchQuery.lte('created_at', filters.dateTo)
  }

  // Skills filter (text search in skills field)
  if (filters?.skills) {
    searchQuery = searchQuery.ilike('skills', `%${filters.skills}%`)
  }

  const { data, error } = await searchQuery.order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  // Filter by job posting if specified (requires join through applications)
  let filteredData = data
  if (filters?.jobPostingId) {
    const { data: applications } = await supabase
      .from('applications')
      .select('candidate_id')
      .eq('job_posting_id', filters.jobPostingId)
      .is('deleted_at', null)

    const candidateIds = new Set(applications?.map((a) => a.candidate_id) || [])
    filteredData = data.filter((c) => candidateIds.has(c.id))
  }

  return filteredData.map((c) => ({
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone ?? '',
    positionApplied: 'Open Application',
    status: c.status as CandidateStatus,
    source: c.source as CandidateSource | undefined,
    resume: c.resume ?? undefined,
    coverLetter: undefined,
    linkedIn: c.linked_in ?? undefined,
    skills: c.skills ?? undefined,
    experience: c.experience ?? undefined,
    education: c.education ?? undefined,
    notes: c.notes ?? undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

// ============================================================================
// SAVED FILTERS
// ============================================================================

export interface SavedFilter {
  id: string
  name: string
  filters: SearchFilters
  userId: string
  createdAt: string
}

export async function getSavedFilters(userId: string): Promise<SavedFilter[]> {
  // For now, return empty array - would need a saved_filters table
  // This is a placeholder for future implementation
  return []
}

// ============================================================================
// APPLICATIONS
// ============================================================================

export async function getApplicationById(id: string): Promise<FrontendApplication | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(full_name, email),
      job_posting:job_postings(title),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    candidateName: data.candidate?.full_name ?? 'Unknown',
    candidateEmail: data.candidate?.email ?? '',
    position: data.job_posting?.title ?? 'Unknown Position',
    status: data.status,
    appliedDate: data.applied_date,
    source: data.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(data.assigned_to),
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function getApplications(): Promise<FrontendApplication[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(full_name, email),
      job_posting:job_postings(title),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    candidateName: row.candidate?.full_name ?? 'Unknown',
    candidateEmail: row.candidate?.email ?? '',
    position: row.job_posting?.title ?? 'Unknown Position',
    status: row.status,
    appliedDate: row.applied_date,
    source: row.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(row.assigned_to),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

interface CreateApplicationInput {
  candidateId: string
  jobPostingId: string
  source?: string
  assignedToId?: string
  notes?: string
}

export async function createApplication(input: CreateApplicationInput): Promise<FrontendApplication> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .insert({
      candidate_id: input.candidateId,
      job_posting_id: input.jobPostingId,
      applied_date: new Date().toISOString().split('T')[0],
      source: input.source,
      assigned_to_id: input.assignedToId,
      notes: input.notes,
      status: 'applied',
    })
    .select(`
      *,
      candidate:candidates(full_name, email),
      job_posting:job_postings(title),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/recruitment/applications')
  revalidatePath('/recruitment/job-postings')

  return {
    id: data.id,
    candidateName: data.candidate?.full_name ?? 'Unknown',
    candidateEmail: data.candidate?.email ?? '',
    position: data.job_posting?.title ?? 'Unknown Position',
    status: data.status,
    appliedDate: data.applied_date,
    source: data.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(data.assigned_to),
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

interface UpdateApplicationInput {
  id: string
  status?: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  assignedToId?: string
  notes?: string
}

export async function updateApplication(input: UpdateApplicationInput): Promise<FrontendApplication> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.status !== undefined) update.status = input.status
  if (input.assignedToId !== undefined) update.assigned_to_id = input.assignedToId
  if (input.notes !== undefined) update.notes = input.notes

  const { data, error } = await supabase
    .from('applications')
    .update(update)
    .eq('id', input.id)
    .select(`
      *,
      candidate:candidates(full_name, email, id),
      job_posting:job_postings(title),
      assigned_to:profiles(id, full_name, email, avatar_url)
    `)
    .single()

  if (error) throw new Error(error.message)

  // Auto-sync: Update candidate status based on application status
  if (input.status !== undefined && data.candidate?.id) {
    const candidateStatusMap: Record<ApplicationStatus, CandidateStatus | null> = {
      applied: 'new',
      screening: 'screening',
      interview: 'interview',
      offer: 'offer',
      hired: 'hired',
      rejected: 'rejected',
    }

    const newCandidateStatus = candidateStatusMap[input.status]
    if (newCandidateStatus) {
      // Check if candidate has other active applications
      const { data: otherApps } = await supabase
        .from('applications')
        .select('id, status')
        .eq('candidate_id', data.candidate.id)
        .neq('id', input.id)
        .is('deleted_at', null)

      // Get current candidate status
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('status')
        .eq('id', data.candidate.id)
        .single()

      const currentCandidateStatus = candidateData?.status as CandidateStatus

      // Only update candidate status if:
      // 1. Status is "hired" (always update - highest priority)
      // 2. Status is "rejected" and no other active applications (only if candidate not already hired)
      // 3. Other statuses: update to match, but don't downgrade from hired
      let shouldUpdate = false
      if (input.status === 'hired') {
        shouldUpdate = true
      } else if (input.status === 'rejected') {
        shouldUpdate = (!otherApps || otherApps.length === 0) && currentCandidateStatus !== 'hired'
      } else {
        // For applied, screening, interview, offer
        shouldUpdate = currentCandidateStatus !== 'hired'
      }

      if (shouldUpdate) {
        await supabase
          .from('candidates')
          .update({ status: newCandidateStatus, updated_at: new Date().toISOString() })
          .eq('id', data.candidate.id)
      }
    }
  }

  revalidatePath('/recruitment/applications')
  revalidatePath('/recruitment/candidates')

  return {
    id: data.id,
    candidateName: data.candidate?.full_name ?? 'Unknown',
    candidateEmail: data.candidate?.email ?? '',
    position: data.job_posting?.title ?? 'Unknown Position',
    status: data.status,
    appliedDate: data.applied_date,
    source: data.source ?? 'website',
    resume: undefined,
    assignedTo: toRecruitmentUser(data.assigned_to),
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// ============================================================================
// INTERVIEWS
// ============================================================================

export async function getInterviewById(id: string): Promise<FrontendInterview | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        candidate:candidates(full_name, email),
        job_posting:job_postings(title)
      ),
      interviewer:profiles(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    candidateName: data.application?.candidate?.full_name ?? 'Unknown',
    candidateEmail: data.application?.candidate?.email ?? '',
    position: data.application?.job_posting?.title ?? 'Unknown Position',
    interviewDate: data.interview_date,
    interviewTime: data.interview_time,
    interviewType: data.interview_type,
    interviewer: toRecruitmentUser(data.interviewer)!,
    status: data.status,
    location: data.location ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function getInterviews(): Promise<FrontendInterview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        candidate:candidates(full_name, email),
        job_posting:job_postings(title)
      ),
      interviewer:profiles(id, full_name, email, avatar_url)
    `)
    .order('interview_date', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    candidateName: row.application?.candidate?.full_name ?? 'Unknown',
    candidateEmail: row.application?.candidate?.email ?? '',
    position: row.application?.job_posting?.title ?? 'Unknown Position',
    interviewDate: row.interview_date,
    interviewTime: row.interview_time,
    interviewType: row.interview_type,
    interviewer: toRecruitmentUser(row.interviewer)!,
    status: row.status,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

interface CreateInterviewInput {
  applicationId: string
  interviewerId: string
  interviewDate: string
  interviewTime: string
  interviewType: 'phone' | 'video' | 'in-person'
  location?: string
  notes?: string
}

export async function createInterview(input: CreateInterviewInput): Promise<FrontendInterview> {
  const supabase = await createClient()

  try {
    // Validate application exists and is not rejected
    const { data: application } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', input.applicationId)
      .is('deleted_at', null)
      .single()

    if (!application) {
      throw new Error('Application not found')
    }

    if (application.status === 'rejected') {
      throw new Error('Cannot schedule interview for a rejected application')
    }

    if (application.status === 'hired') {
      throw new Error('Cannot schedule interview for a hired application')
    }

    // Validate interviewer exists
    const { data: interviewer } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', input.interviewerId)
      .single()

    if (!interviewer) {
      throw new Error('Interviewer not found')
    }

    // Validate interview date is not in the past
    const interviewDateTime = new Date(`${input.interviewDate}T${input.interviewTime}`)
    if (interviewDateTime < new Date()) {
      throw new Error('Interview date and time cannot be in the past')
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert({
        application_id: input.applicationId,
        interviewer_id: input.interviewerId,
        interview_date: input.interviewDate,
        interview_time: input.interviewTime,
        interview_type: input.interviewType,
        location: input.location,
        notes: input.notes,
        status: 'scheduled',
      })
      .select(`
        *,
        application:applications(
          candidate:candidates(full_name, email),
          job_posting:job_postings(title)
        ),
        interviewer:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) throw new Error(error.message)

    // Update application status (only if not already further in pipeline)
    const validStatuses = ['applied', 'screening']
    if (validStatuses.includes(application.status)) {
      await supabase
        .from('applications')
        .update({ status: 'interview', updated_at: new Date().toISOString() })
        .eq('id', input.applicationId)
    }

    revalidatePath('/recruitment/interviews')
    revalidatePath('/recruitment/applications')

    return {
      id: data.id,
      candidateName: data.application?.candidate?.full_name ?? 'Unknown',
      candidateEmail: data.application?.candidate?.email ?? '',
      position: data.application?.job_posting?.title ?? 'Unknown Position',
      interviewDate: data.interview_date,
      interviewTime: data.interview_time,
      interviewType: data.interview_type,
      interviewer: toRecruitmentUser(data.interviewer)!,
      status: data.status,
      location: data.location ?? undefined,
      notes: data.notes ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createInterview')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

interface UpdateInterviewInput {
  id: string
  interviewDate?: string
  interviewTime?: string
  interviewType?: 'phone' | 'video' | 'in-person'
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  location?: string
  notes?: string
  feedback?: string
}

export async function updateInterview(input: UpdateInterviewInput): Promise<FrontendInterview> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.interviewDate !== undefined) update.interview_date = input.interviewDate
  if (input.interviewTime !== undefined) update.interview_time = input.interviewTime
  if (input.interviewType !== undefined) update.interview_type = input.interviewType
  if (input.status !== undefined) update.status = input.status
  if (input.location !== undefined) update.location = input.location
  if (input.notes !== undefined) update.notes = input.notes
  if (input.feedback !== undefined) update.feedback = input.feedback

  const { data, error } = await supabase
    .from('interviews')
    .update(update)
    .eq('id', input.id)
    .select(`
      *,
      application:applications(
        id,
        status,
        candidate:candidates(full_name, email),
        job_posting:job_postings(title)
      ),
      interviewer:profiles(id, full_name, email, avatar_url)
    `)
    .single()

  if (error) throw new Error(error.message)

  // Auto-sync: Update application status when interview is completed
  if (input.status === 'completed' && data.application?.id) {
    // Only update if application status is not already further in pipeline
    const currentAppStatus = data.application.status
    const validStatuses = ['applied', 'screening', 'interview']
    if (validStatuses.includes(currentAppStatus)) {
      await supabase
        .from('applications')
        .update({ status: 'interview', updated_at: new Date().toISOString() })
        .eq('id', data.application.id)
    }
  }

  revalidatePath('/recruitment/interviews')
  revalidatePath('/recruitment/applications')

  return {
    id: data.id,
    candidateName: data.application?.candidate?.full_name ?? 'Unknown',
    candidateEmail: data.application?.candidate?.email ?? '',
    position: data.application?.job_posting?.title ?? 'Unknown Position',
    interviewDate: data.interview_date,
    interviewTime: data.interview_time,
    interviewType: data.interview_type,
    interviewer: toRecruitmentUser(data.interviewer)!,
    status: data.status,
    location: data.location ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// ============================================================================
// EVALUATIONS
// ============================================================================

export async function getEvaluationById(id: string): Promise<FrontendEvaluation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      interview:interviews(
        application:applications(
          candidate:candidates(full_name, email),
          job_posting:job_postings(title)
        )
      ),
      evaluated_by:profiles(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    candidateName: data.interview?.application?.candidate?.full_name ?? 'Unknown',
    candidateEmail: data.interview?.application?.candidate?.email ?? '',
    position: data.interview?.application?.job_posting?.title ?? 'Unknown Position',
    evaluatedBy: toRecruitmentUser(data.evaluated_by)!,
    technicalScore: data.technical_score,
    communicationScore: data.communication_score,
    culturalFitScore: data.cultural_fit_score,
    overallScore: data.overall_score,
    departmentFitScore: data.department_fit_score ?? undefined,
    leadershipScore: data.leadership_score ?? undefined,
    strengths: data.strengths ?? undefined,
    weaknesses: data.weaknesses ?? undefined,
    feedback: data.feedback ?? '',
    recommendation: data.recommendation,
    evaluationRound: data.evaluation_round ?? 'level_1',
    evaluatorTitle: data.evaluator_title ?? undefined,
    isFinalDecision: data.is_final_decision ?? false,
    finalStatus: data.final_status ?? undefined,
    evaluatedAt: data.evaluated_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function getEvaluations(round?: 'level_1' | 'level_2'): Promise<FrontendEvaluation[]> {
  const supabase = await createClient()

  let query = supabase
    .from('evaluations')
    .select(`
      *,
      interview:interviews(
        application:applications(
          candidate:candidates(full_name, email),
          job_posting:job_postings(title)
        )
      ),
      evaluated_by:profiles(id, full_name, email, avatar_url)
    `)
    .order('evaluated_at', { ascending: false })

  // Filter by round if specified
  if (round) {
    query = query.eq('evaluation_round', round)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    candidateName: row.interview?.application?.candidate?.full_name ?? 'Unknown',
    candidateEmail: row.interview?.application?.candidate?.email ?? '',
    position: row.interview?.application?.job_posting?.title ?? 'Unknown Position',
    evaluatedBy: toRecruitmentUser(row.evaluated_by)!,
    technicalScore: row.technical_score,
    communicationScore: row.communication_score,
    culturalFitScore: row.cultural_fit_score,
    overallScore: row.overall_score,
    departmentFitScore: row.department_fit_score ?? undefined,
    leadershipScore: row.leadership_score ?? undefined,
    strengths: row.strengths ?? undefined,
    weaknesses: row.weaknesses ?? undefined,
    feedback: row.feedback ?? '',
    recommendation: row.recommendation,
    evaluationRound: row.evaluation_round ?? 'level_1',
    evaluatorTitle: row.evaluator_title ?? undefined,
    isFinalDecision: row.is_final_decision ?? false,
    finalStatus: row.final_status ?? undefined,
    evaluatedAt: row.evaluated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

/**
 * Get evaluations grouped by candidate for progress tracking
 */
export async function getEvaluationProgress(): Promise<{
  candidateId: string
  candidateName: string
  candidateEmail: string
  position: string
  interviewId: string
  level1?: FrontendEvaluation
  level2?: FrontendEvaluation
  status: 'pending_level_1' | 'pending_level_2' | 'completed' | 'rejected'
}[]> {
  const supabase = await createClient()

  // Get all completed interviews with their evaluations
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      id,
      application:applications(
        candidate:candidates(id, full_name, email),
        job_posting:job_postings(title)
      ),
      evaluations(
        *,
        evaluated_by:profiles(id, full_name, email, avatar_url)
      )
    `)
    .eq('status', 'completed')
    .order('interview_date', { ascending: false })

  if (error) throw new Error(error.message)
  if (!interviews) return []

  return interviews.map((interview) => {
    const evaluations = interview.evaluations || []
    const level1 = evaluations.find((e: any) => e.evaluation_round === 'level_1' || !e.evaluation_round)
    const level2 = evaluations.find((e: any) => e.evaluation_round === 'level_2')
    const app = Array.isArray(interview.application) ? interview.application[0] : interview.application
    const candidate = Array.isArray(app?.candidate) ? app?.candidate[0] : app?.candidate
    const jobPosting = Array.isArray(app?.job_posting) ? app?.job_posting[0] : app?.job_posting

    let status: 'pending_level_1' | 'pending_level_2' | 'completed' | 'rejected' = 'pending_level_1'

    if (level1 && level1.recommendation === 'no-hire') {
      status = 'rejected'
    } else if (level1 && level2) {
      status = level2.recommendation === 'no-hire' ? 'rejected' : 'completed'
    } else if (level1) {
      status = 'pending_level_2'
    }

    const mapEval = (e: any): FrontendEvaluation | undefined => {
      if (!e) return undefined
      return {
        id: e.id,
        candidateName: candidate?.full_name ?? 'Unknown',
        candidateEmail: candidate?.email ?? '',
        position: jobPosting?.title ?? 'Unknown Position',
        evaluatedBy: toRecruitmentUser(e.evaluated_by)!,
        technicalScore: e.technical_score,
        communicationScore: e.communication_score,
        culturalFitScore: e.cultural_fit_score,
        overallScore: e.overall_score,
        departmentFitScore: e.department_fit_score ?? undefined,
        leadershipScore: e.leadership_score ?? undefined,
        strengths: e.strengths ?? undefined,
        weaknesses: e.weaknesses ?? undefined,
        feedback: e.feedback ?? '',
        recommendation: e.recommendation,
        evaluationRound: e.evaluation_round ?? 'level_1',
        evaluatorTitle: e.evaluator_title ?? undefined,
        isFinalDecision: e.is_final_decision ?? false,
        finalStatus: e.final_status ?? undefined,
        evaluatedAt: e.evaluated_at,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }
    }

    return {
      candidateId: candidate?.id ?? '',
      candidateName: candidate?.full_name ?? 'Unknown',
      candidateEmail: candidate?.email ?? '',
      position: jobPosting?.title ?? 'Unknown Position',
      interviewId: interview.id,
      level1: mapEval(level1),
      level2: mapEval(level2),
      status,
    }
  })
}

interface CreateEvaluationInput {
  interviewId: string
  evaluatedById: string
  technicalScore: number
  communicationScore: number
  culturalFitScore: number
  overallScore: number
  departmentFitScore?: number
  leadershipScore?: number
  strengths?: string
  weaknesses?: string
  feedback: string
  recommendation: 'hire' | 'maybe' | 'no-hire'
  // Multi-round fields
  evaluationRound?: 'level_1' | 'level_2'
  evaluatorTitle?: string
  isFinalDecision?: boolean
  finalStatus?: 'selected' | 'rejected' | 'on_hold' | 'pending'
}

export async function createEvaluation(input: CreateEvaluationInput): Promise<FrontendEvaluation> {
  const supabase = await createClient()
  const round = input.evaluationRound || 'level_1'

  try {
    // Validate interview exists and is completed
    const { data: interview } = await supabase
      .from('interviews')
      .select('id, status, application_id')
      .eq('id', input.interviewId)
      .single()

    if (!interview) {
      throw new Error('Interview not found')
    }

    if (interview.status !== 'completed') {
      throw new Error('Evaluation can only be created for completed interviews')
    }

    // Check if evaluation for this round already exists
    const { data: existingEval } = await supabase
      .from('evaluations')
      .select('id, evaluation_round')
      .eq('interview_id', input.interviewId)
      .eq('evaluation_round', round)
      .single()

    if (existingEval) {
      throw new Error(`${round === 'level_1' ? 'Level 1' : 'Level 2'} evaluation already exists for this interview`)
    }

    // For Level 2, check that Level 1 exists and passed
    if (round === 'level_2') {
      const { data: level1Eval } = await supabase
        .from('evaluations')
        .select('id, recommendation')
        .eq('interview_id', input.interviewId)
        .eq('evaluation_round', 'level_1')
        .single()

      if (!level1Eval) {
        throw new Error('Level 1 evaluation must be completed before Level 2')
      }

      if (level1Eval.recommendation === 'no-hire') {
        throw new Error('Cannot create Level 2 evaluation - candidate was rejected in Level 1')
      }
    }

    // Validate scores are within range
    const scores = [
      input.technicalScore,
      input.communicationScore,
      input.culturalFitScore,
      input.overallScore,
    ]
    if (scores.some((score) => score < 0 || score > 10)) {
      throw new Error('Scores must be between 0 and 10')
    }

    // Validate evaluated_by exists
    const { data: evaluator } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', input.evaluatedById)
      .single()

    if (!evaluator) {
      throw new Error('Evaluator not found')
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        interview_id: input.interviewId,
        evaluated_by_id: input.evaluatedById,
        technical_score: input.technicalScore,
        communication_score: input.communicationScore,
        cultural_fit_score: input.culturalFitScore,
        overall_score: input.overallScore,
        department_fit_score: input.departmentFitScore,
        leadership_score: input.leadershipScore,
        strengths: input.strengths,
        weaknesses: input.weaknesses,
        feedback: input.feedback,
        recommendation: input.recommendation,
        evaluation_round: round,
        evaluator_title: input.evaluatorTitle,
        is_final_decision: input.isFinalDecision || round === 'level_2',
        final_status: input.finalStatus,
        evaluated_at: new Date().toISOString(),
      })
      .select(`
        *,
        interview:interviews(
          application:applications(
            candidate:candidates(full_name, email),
            job_posting:job_postings(title)
          )
        ),
        evaluated_by:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) throw new Error(error.message)

    // Update interview status to completed (if not already)
    if (interview.status !== 'completed') {
      await supabase
        .from('interviews')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', input.interviewId)
    }

    // Auto-sync: Update application status based on evaluation
    if (interview.application_id) {
      const { data: appData } = await supabase
        .from('applications')
        .select('id, status')
        .eq('id', interview.application_id)
        .single()

      if (appData) {
        let newStatus = appData.status

        // If Level 2 is done and recommended hire, move to offer
        if (round === 'level_2' && input.recommendation === 'hire') {
          newStatus = 'offer'
        }
        // If rejected at any level, mark as rejected
        else if (input.recommendation === 'no-hire') {
          newStatus = 'rejected'
        }
        // Otherwise keep in interview stage
        else if (['applied', 'screening'].includes(appData.status)) {
          newStatus = 'interview'
        }

        if (newStatus !== appData.status) {
          await supabase
            .from('applications')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', interview.application_id)
        }
      }
    }

    revalidatePath('/recruitment/evaluations')
    revalidatePath('/recruitment/interviews')
    revalidatePath('/recruitment/applications')

    return {
      id: data.id,
      candidateName: data.interview?.application?.candidate?.full_name ?? 'Unknown',
      candidateEmail: data.interview?.application?.candidate?.email ?? '',
      position: data.interview?.application?.job_posting?.title ?? 'Unknown Position',
      evaluatedBy: toRecruitmentUser(data.evaluated_by)!,
      technicalScore: data.technical_score,
      communicationScore: data.communication_score,
      culturalFitScore: data.cultural_fit_score,
      overallScore: data.overall_score,
      departmentFitScore: data.department_fit_score ?? undefined,
      leadershipScore: data.leadership_score ?? undefined,
      strengths: data.strengths ?? undefined,
      weaknesses: data.weaknesses ?? undefined,
      feedback: data.feedback ?? '',
      recommendation: data.recommendation,
      evaluationRound: data.evaluation_round ?? 'level_1',
      evaluatorTitle: data.evaluator_title ?? undefined,
      isFinalDecision: data.is_final_decision ?? false,
      finalStatus: data.final_status ?? undefined,
      evaluatedAt: data.evaluated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createEvaluation')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

// ============================================================================
// JOB ROLES
// ============================================================================

export async function getJobRoles(): Promise<FrontendJobRole[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_roles')
    .select(`
      *,
      department:departments(name)
    `)
    .is('deleted_at', null)
    .order('title', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    department: row.department?.name ?? 'Unknown',
    status: row.status,
    description: row.description ?? undefined,
    requirements: row.requirements ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

interface CreateJobRoleInput {
  title: string
  departmentId?: string
  description?: string
  requirements?: string
  status?: 'active' | 'inactive' | 'filled'
}

export async function createJobRole(input: CreateJobRoleInput): Promise<FrontendJobRole> {
  const supabase = await createClient()

  try {
    const normalizedDescription = normalizeOptional(input.description)
    const normalizedRequirements = normalizeOptional(input.requirements)
    const resolvedDepartmentId = await resolveDepartmentId(input.departmentId, false)

    if (!input.title) {
      throw new Error('Job role title is required')
    }

    const { data, error } = await supabase
      .from('job_roles')
      .insert({
        title: input.title,
        department_id: resolvedDepartmentId,
        description: normalizedDescription,
        requirements: normalizedRequirements,
        status: input.status || 'active',
      })
      .select(`
        *,
        department:departments(name)
      `)
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/recruitment/job-roles')

    return {
      id: data.id,
      title: data.title,
      department: data.department?.name ?? 'Unknown',
      status: data.status,
      description: data.description ?? undefined,
      requirements: data.requirements ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createJobRole')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

interface UpdateJobRoleInput {
  id: string
  title?: string
  departmentId?: string
  description?: string
  requirements?: string
  status?: 'active' | 'inactive' | 'filled'
}

export async function updateJobRole(input: UpdateJobRoleInput): Promise<FrontendJobRole> {
  const supabase = await createClient()

  try {
    const normalizedDescription = normalizeOptional(input.description)
    const normalizedRequirements = normalizeOptional(input.requirements)
    const resolvedDepartmentId = input.departmentId !== undefined
      ? await resolveDepartmentId(input.departmentId, false)
      : undefined

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) update.title = input.title
    if (resolvedDepartmentId !== undefined) update.department_id = resolvedDepartmentId
    if (normalizedDescription !== undefined) update.description = normalizedDescription
    if (normalizedRequirements !== undefined) update.requirements = normalizedRequirements
    if (input.status !== undefined) update.status = input.status

    const { data, error } = await supabase
      .from('job_roles')
      .update(update)
      .eq('id', input.id)
      .select(`
        *,
        department:departments(name)
      `)
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/recruitment/job-roles')

    return {
      id: data.id,
      title: data.title,
      department: data.department?.name ?? 'Unknown',
      status: data.status,
      description: data.description ?? undefined,
      requirements: data.requirements ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateJobRole')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function getJobRoleById(id: string): Promise<FrontendJobRole | null> {
  const supabase = await createClient()

  try {
    // First try to get the job role with department
    const { data, error } = await supabase
      .from('job_roles')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching job role:', error)
      return null
    }
    if (!data) return null

    // Try to get created_by and updated_by profiles separately (graceful fallback)
    let createdByProfile = null
    let updatedByProfile = null
    
    if (data.created_by) {
      const { data: createdBy } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', data.created_by)
        .single()
      createdByProfile = createdBy
    }

    if (data.updated_by) {
      const { data: updatedBy } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', data.updated_by)
        .single()
      updatedByProfile = updatedBy
    }

    // Get related counts - handle gracefully if tables don't exist or queries fail
    let jobPostingsCount = 0
    let applicationsCount = 0
    let jobListingsCount = 0
    let interviewsCount = 0
    let hiresCount = 0

    try {
      // Get job postings with matching title
      const { data: matchingPostings } = await supabase
        .from('job_postings')
        .select('id')
        .eq('title', data.title)
        .is('deleted_at', null)
        .limit(100)

      const postingIds = matchingPostings?.map(p => p.id) ?? []
      jobPostingsCount = postingIds.length

      if (postingIds.length > 0) {
        // Get applications for these postings
        const { data: applications } = await supabase
          .from('applications')
          .select('id, status')
          .in('job_posting_id', postingIds)
          .is('deleted_at', null)

        applicationsCount = applications?.length ?? 0
        const applicationIds = applications?.map(a => a.id) ?? []
        hiresCount = applications?.filter(a => a.status === 'hired').length ?? 0

        if (applicationIds.length > 0) {
          // Get interviews count
          const { data: interviews } = await supabase
            .from('interviews')
            .select('id', { count: 'exact', head: true })
            .in('application_id', applicationIds)
            .is('deleted_at', null)
          
          interviewsCount = interviews?.length ?? 0
        }
      }

      // Get job listings count
      const { data: listings } = await supabase
        .from('job_listings')
        .select('id', { count: 'exact', head: true })
        .eq('job_role_id', id)
        .is('deleted_at', null)
      
      jobListingsCount = listings?.length ?? 0
    } catch (countError) {
      // Silently fail counts if tables don't exist
      console.warn('Error fetching counts:', countError)
    }

    return {
      id: data.id,
      title: data.title,
      department: data.department?.name ?? 'Unknown',
      status: data.status,
      description: data.description ?? undefined,
      requirements: data.requirements ?? undefined,
      experienceMinYears: data.experience_min_years ?? undefined,
      experienceMaxYears: data.experience_max_years ?? undefined,
      skills: data.skills ?? undefined,
      preferredIndustries: data.preferred_industries ?? undefined,
      roleType: data.role_type ?? undefined,
      openings: data.openings ?? undefined,
      salaryMin: data.salary_min ?? undefined,
      salaryMax: data.salary_max ?? undefined,
      location: data.location ?? undefined,
      employmentType: data.employment_type ?? undefined,
      masterJd: data.master_jd ?? undefined,
      jdAttachmentUrl: data.jd_attachment_url ?? undefined,
      responsibilities: data.responsibilities ?? undefined,
      createdBy: toRecruitmentUser(createdByProfile),
      updatedBy: toRecruitmentUser(updatedByProfile),
      jobPostingsCount,
      applicationsCount,
      jobListingsCount,
      interviewsCount,
      hiresCount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Error in getJobRoleById:', error)
    return null
  }
}

export async function getRelatedJobRoles(jobRoleId: string, excludeId: string, limit: number = 3): Promise<FrontendJobRole[]> {
  const supabase = await createClient()

  try {
    // First get the current job role to find similar ones
    const { data: currentRole } = await supabase
      .from('job_roles')
      .select('department_id, skills, experience_min_years, experience_max_years')
      .eq('id', jobRoleId)
      .single()

    if (!currentRole) return []

    // Find related roles by same department or similar skills
    let query = supabase
      .from('job_roles')
      .select(`
        *,
        department:departments(name)
      `)
      .neq('id', excludeId)
      .is('deleted_at', null)
      .limit(limit)

    // Filter by same department if available
    if (currentRole.department_id) {
      query = query.eq('department_id', currentRole.department_id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching related job roles:', error)
      return []
    }
    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      department: row.department?.name ?? 'Unknown',
      status: row.status,
      description: row.description ?? undefined,
      requirements: row.requirements ?? undefined,
      experienceMinYears: row.experience_min_years ?? undefined,
      experienceMaxYears: row.experience_max_years ?? undefined,
      skills: row.skills ?? undefined,
      location: row.location ?? undefined,
      employmentType: row.employment_type ?? undefined,
      salaryMin: row.salary_min ?? undefined,
      salaryMax: row.salary_max ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.warn('Error in getRelatedJobRoles:', error)
    return []
  }
}

export async function getJobPostingsByRole(roleId: string): Promise<FrontendJobPosting[]> {
  const supabase = await createClient()

  try {
    // First get the job role title to match postings
    const { data: role } = await supabase
      .from('job_roles')
      .select('title')
      .eq('id', roleId)
      .single()

    if (!role) return []

    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        department:departments(name),
        posted_by:profiles(id, full_name, email, avatar_url)
      `)
      .eq('title', role.title)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching job postings by role:', error)
      return []
    }
    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      department: row.department?.name ?? 'Unknown',
      location: row.location ?? '',
      employmentType: row.employment_type,
      status: row.status,
      roleType: row.role_type ?? 'internal',
      postedDate: row.posted_date ?? undefined,
      closingDate: row.closing_date ?? undefined,
      description: row.description ?? undefined,
      requirements: row.requirements ?? undefined,
      postedBy: toRecruitmentUser(row.posted_by)!,
      views: row.views ?? 0,
      applications: row.applications_count ?? 0,
      openings: row.openings ?? 1,
      experienceMinYears: row.experience_min_years ?? undefined,
      experienceMaxYears: row.experience_max_years ?? undefined,
      skills: row.skills ?? undefined,
      preferredIndustries: row.preferred_industries ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.warn('Error in getJobPostingsByRole:', error)
    return []
  }
}

export async function getApplicationsByRole(roleId: string): Promise<FrontendApplication[]> {
  const supabase = await createClient()

  try {
    // First get the job role title to match postings
    const { data: role } = await supabase
      .from('job_roles')
      .select('title')
      .eq('id', roleId)
      .single()

    if (!role) return []

    // Get job posting IDs with matching title
    const { data: postings } = await supabase
      .from('job_postings')
      .select('id')
      .eq('title', role.title)
      .is('deleted_at', null)

    if (!postings || postings.length === 0) return []

    const postingIds = postings.map(p => p.id)

    // Try to get assigned_to profile separately if foreign key doesn't work
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        candidate:candidates(id, full_name, email),
        job_posting:job_postings(id, title)
      `)
      .in('job_posting_id', postingIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching applications by role:', error)
      return []
    }
    if (!data) return []

    // Get assigned_to profiles separately
    const applicationsWithAssignedTo = await Promise.all(
      data.map(async (row) => {
        let assignedTo = undefined
        if (row.assigned_to_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', row.assigned_to_id)
            .single()
          assignedTo = toRecruitmentUser(profile)
        }

        return {
          id: row.id,
          candidateName: row.candidate?.full_name ?? 'Unknown',
          candidateEmail: row.candidate?.email ?? '',
          position: row.job_posting?.title ?? 'Unknown Position',
          status: row.status,
          appliedDate: row.applied_at ?? row.created_at,
          source: row.source ?? 'unknown',
          resume: row.resume ?? undefined,
          assignedTo,
          notes: row.notes ?? undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      })
    )

    return applicationsWithAssignedTo
  } catch (error) {
    console.warn('Error in getApplicationsByRole:', error)
    return []
  }
}

export async function getJobRoleAnalytics(roleId: string): Promise<{
  totalApplications: number
  interviewRate: number
  hireRate: number
  averageTimeToFill: number
  activePostings: number
  applicationsOverTime?: Array<{ date: string; count: number }>
  sourceBreakdown?: Array<{ source: string; count: number }>
}> {
  const supabase = await createClient()

  // Get role title
  const { data: role } = await supabase
    .from('job_roles')
    .select('title, created_at')
    .eq('id', roleId)
    .single()

  if (!role) {
    return {
      totalApplications: 0,
      interviewRate: 0,
      hireRate: 0,
      averageTimeToFill: 0,
      activePostings: 0,
    }
  }

  // Get job postings with matching title
  const { data: postings } = await supabase
    .from('job_postings')
    .select('id, status, created_at')
    .eq('title', role.title)
    .is('deleted_at', null)

  if (!postings || postings.length === 0) {
    return {
      totalApplications: 0,
      interviewRate: 0,
      hireRate: 0,
      averageTimeToFill: 0,
      activePostings: postings?.filter(p => p.status === 'published').length ?? 0,
    }
  }

  const postingIds = postings.map(p => p.id)

  // Get applications
  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, source, created_at')
    .in('job_posting_id', postingIds)
    .is('deleted_at', null)

  // Get interviews
  const { data: interviews } = await supabase
    .from('interviews')
    .select('id, application_id')
    .in('application_id', applications?.map(a => a.id) ?? [])
    .is('deleted_at', null)

  const totalApplications = applications?.length ?? 0
  const totalInterviews = interviews?.length ?? 0
  const totalHires = applications?.filter(a => a.status === 'hired').length ?? 0

  const interviewRate = totalApplications > 0 ? (totalInterviews / totalApplications) * 100 : 0
  const hireRate = totalApplications > 0 ? (totalHires / totalApplications) * 100 : 0

  // Calculate average time to fill (from posting creation to first hire)
  let averageTimeToFill = 0
  if (totalHires > 0 && postings.length > 0) {
    const hireDates = applications
      ?.filter(a => a.status === 'hired')
      .map(a => new Date(a.created_at).getTime()) ?? []
    
    const postingDates = postings.map(p => new Date(p.created_at).getTime())
    
    if (hireDates.length > 0 && postingDates.length > 0) {
      const timeToFillValues = hireDates.map(hireDate => {
        const postingDate = Math.min(...postingDates.filter(pd => pd <= hireDate))
        return (hireDate - postingDate) / (1000 * 60 * 60 * 24) // days
      })
      averageTimeToFill = timeToFillValues.reduce((a, b) => a + b, 0) / timeToFillValues.length
    }
  }

  const activePostings = postings.filter(p => p.status === 'published').length

  // Source breakdown
  const sourceBreakdown = applications?.reduce((acc, app) => {
    const source = app.source || 'unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  return {
    totalApplications,
    interviewRate: Math.round(interviewRate * 10) / 10,
    hireRate: Math.round(hireRate * 10) / 10,
    averageTimeToFill: Math.round(averageTimeToFill * 10) / 10,
    activePostings,
    sourceBreakdown: Object.entries(sourceBreakdown).map(([source, count]) => ({ source, count })),
  }
}

// ============================================================================
// JOB POSTINGS
// ============================================================================

export async function getJobPostingById(id: string): Promise<FrontendJobPosting | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      department:departments(name),
      posted_by:profiles(id, full_name, email, avatar_url)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  if (!data) return null

  return {
    id: data.id,
    title: data.title,
    department: data.department?.name ?? 'Unknown',
    location: data.location ?? '',
    employmentType: data.employment_type,
    status: data.status,
    roleType: data.role_type ?? 'internal',
    postedDate: data.posted_date ?? undefined,
    closingDate: data.closing_date ?? undefined,
    description: data.description ?? undefined,
    requirements: data.requirements ?? undefined,
    postedBy: toRecruitmentUser(data.posted_by)!,
    views: data.views ?? 0,
    applications: data.applications_count ?? 0,
    openings: data.openings ?? 1,
    experienceMinYears: data.experience_min_years ?? undefined,
    experienceMaxYears: data.experience_max_years ?? undefined,
    skills: data.skills ?? undefined,
    preferredIndustries: data.preferred_industries ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function getJobPostings(): Promise<FrontendJobPosting[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      department:departments(name),
      posted_by:profiles(id, full_name, email, avatar_url)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    department: row.department?.name ?? 'Unknown',
    location: row.location ?? '',
    employmentType: row.employment_type,
    status: row.status,
    roleType: row.role_type ?? 'internal',
    postedDate: row.posted_date ?? undefined,
    closingDate: row.closing_date ?? undefined,
    description: row.description ?? undefined,
    requirements: row.requirements ?? undefined,
    postedBy: toRecruitmentUser(row.posted_by)!,
    views: row.views ?? 0,
    applications: row.applications_count ?? 0,
    openings: row.openings ?? 1,
    experienceMinYears: row.experience_min_years ?? undefined,
    experienceMaxYears: row.experience_max_years ?? undefined,
    skills: row.skills ?? undefined,
    preferredIndustries: row.preferred_industries ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

interface CreateJobPostingInput {
  title: string
  departmentId?: string
  location?: string
  employmentType?: 'full-time' | 'part-time' | 'contract'
  description?: string
  requirements?: string
  responsibilities?: string
  salaryMin?: number
  salaryMax?: number
  postedById?: string
  status?: 'draft' | 'published' | 'closed'
  closingDate?: string
}

export async function createJobPosting(input: CreateJobPostingInput): Promise<FrontendJobPosting> {
  const supabase = await createClient()

  try {
    const normalizedLocation = normalizeOptional(input.location)
    const normalizedDescription = normalizeOptional(input.description)
    const normalizedRequirements = normalizeOptional(input.requirements)
    const normalizedResponsibilities = normalizeOptional(input.responsibilities)

    const resolvedDepartmentId = await resolveDepartmentId(input.departmentId, false)
    const resolvedPostedById = input.postedById
      ? await resolveProfileId(input.postedById, false)
      : null

    // Get a default poster if not provided
    let postedById = resolvedPostedById
    if (!postedById) {
      const { data: firstProfile } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single()
      postedById = firstProfile?.id || null
    }

    if (!input.title) {
      throw new Error('Job posting title is required')
    }

    const status = input.status || 'draft'
    const postedDate = status === 'published' ? new Date().toISOString().split('T')[0] : null

    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        title: input.title,
        department_id: resolvedDepartmentId,
        location: normalizedLocation,
        employment_type: input.employmentType || 'full-time',
        description: normalizedDescription,
        requirements: normalizedRequirements,
        responsibilities: normalizedResponsibilities,
        salary_min: input.salaryMin,
        salary_max: input.salaryMax,
        posted_by_id: postedById,
        closing_date: input.closingDate,
        status,
        posted_date: postedDate,
        views: 0,
        applications_count: 0,
      })
      .select(`
        *,
        department:departments(name),
        posted_by:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/recruitment/job-postings')

    return {
      id: data.id,
      title: data.title,
      department: data.department?.name ?? 'Unknown',
      location: data.location ?? '',
      employmentType: data.employment_type,
      status: data.status,
      postedDate: data.posted_date ?? undefined,
      closingDate: data.closing_date ?? undefined,
      description: data.description ?? undefined,
      requirements: data.requirements ?? undefined,
      postedBy: toRecruitmentUser(data.posted_by)!,
      views: data.views ?? 0,
      applications: data.applications_count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'createJobPosting')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

interface UpdateJobPostingInput {
  id: string
  title?: string
  departmentId?: string
  location?: string
  employmentType?: 'full-time' | 'part-time' | 'contract'
  description?: string
  requirements?: string
  responsibilities?: string
  salaryMin?: number
  salaryMax?: number
  status?: 'draft' | 'published' | 'closed'
  closingDate?: string
}

export async function updateJobPosting(input: UpdateJobPostingInput): Promise<FrontendJobPosting> {
  const supabase = await createClient()

  try {
    const normalizedLocation = normalizeOptional(input.location)
    const normalizedDescription = normalizeOptional(input.description)
    const normalizedRequirements = normalizeOptional(input.requirements)
    const normalizedResponsibilities = normalizeOptional(input.responsibilities)

    const resolvedDepartmentId = input.departmentId !== undefined
      ? await resolveDepartmentId(input.departmentId, false)
      : undefined

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) update.title = input.title
    if (resolvedDepartmentId !== undefined) update.department_id = resolvedDepartmentId
    if (normalizedLocation !== undefined) update.location = normalizedLocation
    if (input.employmentType !== undefined) update.employment_type = input.employmentType
    if (normalizedDescription !== undefined) update.description = normalizedDescription
    if (normalizedRequirements !== undefined) update.requirements = normalizedRequirements
    if (normalizedResponsibilities !== undefined) update.responsibilities = normalizedResponsibilities
    if (input.salaryMin !== undefined) update.salary_min = input.salaryMin
    if (input.salaryMax !== undefined) update.salary_max = input.salaryMax
    if (input.status !== undefined) update.status = input.status
    if (input.closingDate !== undefined) update.closing_date = input.closingDate

    // If publishing for first time, set posted date
    if (input.status === 'published') {
      const { data: existing } = await supabase
        .from('job_postings')
        .select('posted_date')
        .eq('id', input.id)
        .single()

      if (existing && !existing.posted_date) {
        update.posted_date = new Date().toISOString().split('T')[0]
      }
    }

    const { data, error } = await supabase
      .from('job_postings')
      .update(update)
      .eq('id', input.id)
      .select(`
        *,
        department:departments(name),
        posted_by:profiles(id, full_name, email, avatar_url)
      `)
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/recruitment/job-postings')

    return {
      id: data.id,
      title: data.title,
      department: data.department?.name ?? 'Unknown',
      location: data.location ?? '',
      employmentType: data.employment_type,
      status: data.status,
      postedDate: data.posted_date ?? undefined,
      closingDate: data.closing_date ?? undefined,
      description: data.description ?? undefined,
      requirements: data.requirements ?? undefined,
      postedBy: toRecruitmentUser(data.posted_by)!,
      views: data.views ?? 0,
      applications: data.applications_count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logDatabaseError(error, 'updateJobPosting')
    const friendlyMessage = getUserFriendlyErrorMessage(error)
    throw new Error(friendlyMessage)
  }
}

export async function deleteJobPosting(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('job_postings')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/recruitment/job-postings')
}

// ============================================================================
// JOB PORTALS
// ============================================================================

export async function getJobPortals(): Promise<FrontendJobPortal[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_portals')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url ?? '',
    status: row.status,
    apiKey: row.api_key ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

interface CreateJobPortalInput {
  name: string
  url?: string
  status?: 'active' | 'inactive'
  apiKey?: string
  notes?: string
}

export async function createJobPortal(input: CreateJobPortalInput): Promise<FrontendJobPortal> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_portals')
    .insert({
      name: input.name,
      url: input.url,
      status: input.status || 'active',
      api_key: input.apiKey,
      notes: input.notes,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/recruitment/job-portals')

  return {
    id: data.id,
    name: data.name,
    url: data.url ?? '',
    status: data.status,
    apiKey: data.api_key ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

interface UpdateJobPortalInput {
  id: string
  name?: string
  url?: string
  status?: 'active' | 'inactive'
  apiKey?: string
  notes?: string
}

export async function updateJobPortal(input: UpdateJobPortalInput): Promise<FrontendJobPortal> {
  const supabase = await createClient()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) update.name = input.name
  if (input.url !== undefined) update.url = input.url
  if (input.status !== undefined) update.status = input.status
  if (input.apiKey !== undefined) update.api_key = input.apiKey
  if (input.notes !== undefined) update.notes = input.notes

  const { data, error } = await supabase
    .from('job_portals')
    .update(update)
    .eq('id', input.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/recruitment/job-portals')

  return {
    id: data.id,
    name: data.name,
    url: data.url ?? '',
    status: data.status,
    apiKey: data.api_key ?? undefined,
    notes: data.notes ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// ============================================================================
// JOB LISTINGS
// ============================================================================

export async function getJobListings(): Promise<FrontendJobListing[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_listings')
    .select(`
      *,
      job_role:job_roles(
        id,
        title,
        department:departments(name),
        status,
        description,
        requirements,
        experience_min_years,
        experience_max_years,
        skills,
        preferred_industries,
        role_type,
        openings,
        salary_min,
        salary_max,
        location,
        employment_type,
        master_jd,
        jd_attachment_url,
        responsibilities,
        created_at,
        updated_at
      ),
      job_portal:job_portals(
        id,
        name,
        url,
        status,
        api_key,
        notes,
        created_at,
        updated_at
      ),
      posted_by:profiles!job_listings_created_by_fkey(id, full_name, email, avatar_url)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => {
    const jobRole = row.job_role
    const jobPortal = row.job_portal
    const postedBy = row.posted_by

    return {
      id: row.id,
      jobRole: {
        id: jobRole?.id ?? '',
        title: jobRole?.title ?? 'Unknown Role',
        department: (jobRole?.department as { name: string } | null)?.name ?? 'Unknown',
        status: jobRole?.status ?? 'inactive',
        description: jobRole?.description ?? undefined,
        requirements: jobRole?.requirements ?? undefined,
        experienceMinYears: jobRole?.experience_min_years ?? undefined,
        experienceMaxYears: jobRole?.experience_max_years ?? undefined,
        skills: jobRole?.skills ?? undefined,
        preferredIndustries: jobRole?.preferred_industries ?? undefined,
        roleType: jobRole?.role_type ?? undefined,
        openings: jobRole?.openings ?? undefined,
        salaryMin: jobRole?.salary_min ?? undefined,
        salaryMax: jobRole?.salary_max ?? undefined,
        location: jobRole?.location ?? undefined,
        employmentType: jobRole?.employment_type ?? undefined,
        masterJd: jobRole?.master_jd ?? undefined,
        jdAttachmentUrl: jobRole?.jd_attachment_url ?? undefined,
        responsibilities: jobRole?.responsibilities ?? undefined,
        createdAt: jobRole?.created_at ?? row.created_at,
        updatedAt: jobRole?.updated_at ?? row.updated_at,
      },
      jobPortal: {
        id: jobPortal?.id ?? '',
        name: jobPortal?.name ?? 'Unknown Portal',
        url: jobPortal?.url ?? '',
        status: jobPortal?.status ?? 'inactive',
        apiKey: jobPortal?.api_key ?? undefined,
        notes: jobPortal?.notes ?? undefined,
        createdAt: jobPortal?.created_at ?? row.created_at,
        updatedAt: jobPortal?.updated_at ?? row.updated_at,
      },
      portalListingUrl: row.portal_listing_url ?? undefined,
      portalListingId: row.portal_listing_id ?? undefined,
      customTitle: row.custom_title ?? undefined,
      customJd: row.custom_jd ?? undefined,
      postedDate: row.posted_date ?? undefined,
      expiryDate: row.expiry_date ?? undefined,
      status: row.status,
      views: row.views ?? 0,
      applicationsCount: row.applications_count ?? 0,
      notes: row.notes ?? undefined,
      postedBy: toRecruitmentUser(postedBy),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })
}
