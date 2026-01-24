"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createJobPosting } from "@/lib/actions/recruitment"
import { getDepartments } from "@/lib/actions/hr"
import { Loader2, X } from "lucide-react"

interface CreateJobPostingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Salary range options matching Figma design pattern
const salaryRanges = [
  { label: "$1000 - $2000 / month", min: 1000, max: 2000 },
  { label: "$2000 - $3000 / month", min: 2000, max: 3000 },
  { label: "$3000 - $5000 / month", min: 3000, max: 5000 },
  { label: "$5000 - $8000 / month", min: 5000, max: 8000 },
  { label: "$8000+ / month", min: 8000, max: undefined },
]

// Experience level options
const experienceLevels = [
  { label: "Junior", value: "junior", minYears: 0, maxYears: 2 },
  { label: "Mid", value: "mid", minYears: 2, maxYears: 5 },
  { label: "Senior", value: "senior", minYears: 5, maxYears: 10 },
  { label: "Lead", value: "lead", minYears: 10, maxYears: undefined },
]

export function CreateJobPostingDialog({ open, onOpenChange }: CreateJobPostingDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobType: "",
    category: "",
    experienceLevel: "",
    salaryRange: "",
  })

  // Fetch departments for Category dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    enabled: open,
  })

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    try {
      const selectedSalaryRange = salaryRanges.find(r => r.label === formData.salaryRange)
      
      // Handle job type: "remote" maps to location, others map to employmentType
      const isRemote = formData.jobType === 'remote'
      const employmentType = isRemote ? 'full-time' : (formData.jobType as 'full-time' | 'part-time' | 'contract' | undefined)
      const location = isRemote ? 'Remote' : undefined

      await createJobPosting({
        title: formData.jobTitle,
        departmentId: formData.category || undefined,
        employmentType,
        location,
        salaryMin: selectedSalaryRange?.min,
        salaryMax: selectedSalaryRange?.max,
        status: 'draft',
      })

      await queryClient.invalidateQueries({ queryKey: ["job-postings"] })
      toast.success("Job posting saved as draft", { description: `Job posting ${formData.jobTitle} has been saved`, duration: 3000 })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Error saving job posting:", error)
      toast.error("Failed to save job posting", { description: error instanceof Error ? error.message : "An error occurred", duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    // Validate required fields
    if (!formData.jobTitle || !formData.companyName || !formData.jobType || !formData.category || !formData.experienceLevel || !formData.salaryRange) {
      toast.error("Please fill all required fields", { description: "All fields marked with * are required", duration: 3000 })
      return
    }
    
    // For now, save as draft since steps 2 and 3 are not implemented yet
    // In the future, this will move to step 2
    handleSaveDraft()
  }

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      companyName: "",
      jobType: "",
      category: "",
      experienceLevel: "",
      salaryRange: "",
    })
    setCurrentStep(1)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 rounded-[16px]" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#dfe1e7] flex-shrink-0">
          <DialogTitle className="text-[18px] font-semibold leading-[1.4] tracking-[0.36px] text-[#0d0d12] m-0" style={{ fontFamily: 'var(--font-inter-tight)' }}>
            Post a Job
          </DialogTitle>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full border border-[#dfe1e7] flex items-center justify-center hover:bg-accent transition-colors"
            type="button"
          >
            <X className="h-6 w-6 text-[#0d0d12]" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-[#dfe1e7] flex-shrink-0">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-medium leading-[1.5] tracking-[0.28px] ${currentStep === 1 ? 'bg-[#40c4aa] text-white' : 'bg-[#dfe1e7] text-white'}`} style={{ fontFamily: 'var(--font-inter-tight)' }}>
              1
            </div>
            <span className={`text-[14px] font-medium leading-[1.5] tracking-[0.28px] ${currentStep === 1 ? 'text-[#0d0d12]' : 'text-[#818898]'}`} style={{ fontFamily: 'var(--font-inter-tight)' }}>
              Basic Information
            </span>
          </div>
          
          {/* Connector */}
          <div className="h-0 w-8 border-t border-[#dfe1e7]" />
          
          {/* Step 2 */}
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-medium leading-[1.5] tracking-[0.28px] ${currentStep === 2 ? 'bg-[#40c4aa] text-white' : 'bg-[#dfe1e7] text-white'}`} style={{ fontFamily: 'var(--font-inter-tight)' }}>
              2
            </div>
            <span className={`text-[14px] font-medium leading-[1.5] tracking-[0.28px] ${currentStep === 2 ? 'text-[#0d0d12]' : 'text-[#818898]'}`} style={{ fontFamily: 'var(--font-inter-tight)' }}>
              Job Details
            </span>
          </div>
          
          {/* Connector */}
          <div className="h-0 w-8 border-t border-[#dfe1e7]" />
          
          {/* Step 3 */}
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-medium leading-[1.5] tracking-[0.28px] ${currentStep === 3 ? 'bg-[#40c4aa] text-white' : 'bg-[#dfe1e7] text-white'}`} style={{ fontFamily: 'var(--font-inter-tight)' }}>
              3
            </div>
            <span className={`text-[14px] font-medium leading-[1.5] tracking-[0.28px] ${currentStep === 3 ? 'text-[#0d0d12]' : 'text-[#818898]'}`} style={{ fontFamily: 'var(--font-inter-tight)' }}>
              Additional Info
            </span>
          </div>
        </div>

        {/* Form Content */}
        <form className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {currentStep === 1 && (
              <>
                <h3 className="text-[16px] font-medium leading-[1.5] tracking-[0.32px] text-[#0d0d12] mb-0" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                  Basic Information
                </h3>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Job Title <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="Frontend Developer"
                    className="h-[52px] rounded-[12px] border-[#dfe1e7] text-[16px] leading-[1.5] tracking-[0.32px] placeholder:text-[#818898]"
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Company Name <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="TechHire Inc"
                    className="h-[52px] rounded-[12px] border-[#dfe1e7] text-[16px] leading-[1.5] tracking-[0.32px] placeholder:text-[#818898]"
                    required
                  />
                </div>

                {/* Job Type */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Job Type <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                    <SelectTrigger className="h-[52px] rounded-[12px] border-[#dfe1e7] text-[16px] leading-[1.5] tracking-[0.32px]">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Category <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-[52px] rounded-[12px] border-[#dfe1e7] text-[16px] leading-[1.5] tracking-[0.32px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Experience Level <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                    <SelectTrigger className="h-[52px] rounded-[12px] border-[#dfe1e7] text-[16px] leading-[1.5] tracking-[0.32px]">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]" style={{ fontFamily: 'var(--font-inter-tight)' }}>
                    Salary Range <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Select value={formData.salaryRange} onValueChange={(value) => setFormData({ ...formData, salaryRange: value })}>
                    <SelectTrigger className="h-[52px] rounded-[12px] border-[#dfe1e7] text-[16px] leading-[1.5] tracking-[0.32px]">
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryRanges.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3.5 px-6 py-6 border-t border-[#dfe1e7] flex-shrink-0">
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="secondary"
              size="default"
              className="h-12 px-4 rounded-[10px] border border-[#dfe1e7] bg-white text-[#0d0d12] shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              size="default"
              className="h-12 px-4 rounded-[10px] border border-[#301da4] bg-[#301da4] text-white shadow-[0px_1px_2px_0px_rgba(13,13,18,0.06)] w-[131px]"
              disabled={isSubmitting}
            >
              Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



