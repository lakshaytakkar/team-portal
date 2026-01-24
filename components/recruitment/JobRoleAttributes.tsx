"use client"

import { Card } from "@/components/ui/card"
import { JobRole } from "@/lib/types/recruitment"

interface JobRoleAttributesProps {
  role: JobRole
}

function getLevelFromExperience(minYears?: number, maxYears?: number): string {
  if (!minYears && !maxYears) return "Not specified"
  if (minYears && minYears <= 2) return "Junior"
  if (minYears && minYears <= 5) return "Mid-Level"
  if (minYears && minYears <= 8) return "Senior"
  return "Expert"
}

function getWorkType(location?: string): string {
  if (!location) return "Not specified"
  const lowerLocation = location.toLowerCase()
  if (lowerLocation.includes("remote")) return "Remote"
  if (lowerLocation.includes("hybrid")) return "Hybrid"
  return "On-site"
}

function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return "Not specified"
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  if (min) return `$${min.toLocaleString()}+`
  if (max) return `Up to $${max.toLocaleString()}`
  return "Not specified"
}

function formatExperienceRange(min?: number, max?: number): string {
  if (!min && !max) return "Not specified"
  if (min && max) return `${min}-${max} years`
  if (min) return `${min}+ years`
  if (max) return `Up to ${max} years`
  return "Not specified"
}

export function JobRoleAttributes({ role }: JobRoleAttributesProps) {
  const level = getLevelFromExperience(role.experienceMinYears, role.experienceMaxYears)
  const workType = getWorkType(role.location)
  const salaryRange = formatSalaryRange(role.salaryMin, role.salaryMax)
  const experienceRange = formatExperienceRange(role.experienceMinYears, role.experienceMaxYears)
  const jobType = role.employmentType ? role.employmentType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()) : "Not specified"

  return (
    <div className="space-y-5">
      {/* Quick Stats */}
      <Card className="border border-[#dfe1e7] rounded-[14px] p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Postings</span>
            <span className="text-sm font-semibold text-foreground">{role.jobPostingsCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Applications</span>
            <span className="text-sm font-semibold text-foreground">{role.applicationsCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Interviews</span>
            <span className="text-sm font-semibold text-foreground">{role.interviewsCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Hires</span>
            <span className="text-sm font-semibold text-foreground">{role.hiresCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Open Positions</span>
            <span className="text-sm font-semibold text-foreground">{role.openings || 0}</span>
          </div>
        </div>
      </Card>

      {/* Job Attributes - Matching Figma Style */}
      <div className="grid grid-cols-2 gap-5">
        {/* Level */}
        <Card className="border border-[#dfe1e7] rounded-[16px] p-4 flex flex-col gap-1 items-center justify-center text-center">
          <p className="text-base text-[#666d80] font-normal">Level</p>
          <p className="text-base text-[#0d0d12] font-medium">{level}</p>
        </Card>

        {/* Experience */}
        <Card className="border border-[#dfe1e7] rounded-[16px] p-4 flex flex-col gap-1 items-center justify-center text-center">
          <p className="text-base text-[#666d80] font-normal">Experience</p>
          <p className="text-base text-[#0d0d12] font-medium">{experienceRange}</p>
        </Card>

        {/* Job Type */}
        <Card className="border border-[#dfe1e7] rounded-[16px] p-4 flex flex-col gap-1 items-center justify-center text-center">
          <p className="text-base text-[#666d80] font-normal">Job Type</p>
          <p className="text-base text-[#0d0d12] font-medium">{jobType}</p>
        </Card>

        {/* Work Type */}
        <Card className="border border-[#dfe1e7] rounded-[16px] p-4 flex flex-col gap-1 items-center justify-center text-center">
          <p className="text-base text-[#666d80] font-normal">Work Type</p>
          <p className="text-base text-[#0d0d12] font-medium">{workType}</p>
        </Card>
      </div>

      {/* Salary Range */}
      <Card className="border border-[#dfe1e7] rounded-[16px] p-4 flex flex-col gap-1 items-center justify-center text-center w-full">
        <p className="text-base text-[#666d80] font-normal">Salary Range</p>
        <p className="text-base text-[#0d0d12] font-medium">{salaryRange}</p>
      </Card>
    </div>
  )
}

