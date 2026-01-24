import {
  Application,
  Interview,
  Evaluation,
  JobRole,
  JobPortal,
  JobPosting,
} from "@/lib/types/recruitment"

export const initialApplications: Application[] = [
  {
    id: "app-1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    position: "Senior Developer",
    status: "interview",
    appliedDate: "2024-01-10",
    source: "LinkedIn",
    resume: "/resumes/john-doe.pdf",
    assignedTo: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    notes: "Strong technical background",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
  {
    id: "app-2",
    candidateName: "Jane Smith",
    candidateEmail: "jane.smith@example.com",
    position: "UI/UX Designer",
    status: "screening",
    appliedDate: "2024-01-15",
    source: "Company Website",
    resume: "/resumes/jane-smith.pdf",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-16T00:00:00Z",
  },
]

export const initialInterviews: Interview[] = [
  {
    id: "int-1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    position: "Senior Developer",
    interviewDate: "2024-01-25",
    interviewTime: "14:00",
    interviewType: "video",
    interviewer: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    status: "scheduled",
    location: "Zoom",
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
]

export const initialEvaluations: Evaluation[] = [
  {
    id: "eval-1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com",
    position: "Senior Developer",
    evaluatedBy: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    technicalScore: 8,
    communicationScore: 7,
    culturalFitScore: 9,
    overallScore: 8,
    feedback: "Excellent technical skills and team fit",
    recommendation: "hire",
    evaluationRound: "level_1",
    evaluatedAt: "2024-01-20T00:00:00Z",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
]

export const initialJobRoles: JobRole[] = [
  {
    id: "role-1",
    title: "Senior Developer",
    department: "Engineering",
    status: "active",
    description: "Lead development of web applications",
    requirements: "5+ years experience, React, Node.js",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-2",
    title: "UI/UX Designer",
    department: "Design",
    status: "active",
    description: "Design user interfaces and experiences",
    requirements: "3+ years experience, Figma, Design Systems",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export const initialJobPortals: JobPortal[] = [
  {
    id: "portal-1",
    name: "LinkedIn Jobs",
    url: "https://linkedin.com/jobs",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "portal-2",
    name: "Indeed",
    url: "https://indeed.com",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export const initialJobPostings: JobPosting[] = [
  {
    id: "post-1",
    title: "Senior Developer",
    department: "Engineering",
    location: "Remote",
    employmentType: "full-time",
    status: "published",
    postedDate: "2024-01-01",
    closingDate: "2024-02-29",
    description: "We are looking for an experienced Senior Developer...",
    requirements: "5+ years experience, React, Node.js, TypeScript",
    postedBy: {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
    },
    views: 1250,
    applications: 45,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
]

