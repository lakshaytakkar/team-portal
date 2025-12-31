"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import {
  createDailyReport,
  getDailyReportCategories,
  getCategoryFormConfig,
} from "@/lib/actions/daily-reports"
import { useUser } from "@/lib/hooks/useUser"
import type { DailyReportCategory, FormField, DailyReportFieldType } from "@/lib/types/daily-reports"
import { cn } from "@/lib/utils"

interface CreateDailyReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDailyReportDialog({ open, onOpenChange }: CreateDailyReportDialogProps) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [formConfig, setFormConfig] = useState<DailyReportCategory['formConfig'] | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({
    date: new Date().toISOString().split('T')[0],
    tasksCompleted: [],
    tasksPlanned: [],
    blockers: [],
    notes: "",
  })
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["daily-report-categories"],
    queryFn: getDailyReportCategories,
    enabled: open,
  })

  // Fetch form config when category is selected
  const { data: categoryFormConfig } = useQuery({
    queryKey: ["category-form-config", selectedCategory],
    queryFn: () => getCategoryFormConfig(selectedCategory),
    enabled: !!selectedCategory && open,
  })

  // Update form config when category changes
  useEffect(() => {
    if (categoryFormConfig) {
      setFormConfig(categoryFormConfig)
      // Reset to step 1 when category changes
      setCurrentStep(1)
    }
  }, [categoryFormConfig])

  // Get total steps from form config
  const totalSteps = formConfig?.steps?.length || 1

  // Get current step config
  const currentStepConfig = formConfig?.steps?.find(s => s.step === currentStep)

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setFieldValues({}) // Reset field values when category changes
  }

  const handleFieldChange = (fieldKey: string, value: any) => {
    if (fieldKey === 'tasks_completed' || fieldKey === 'tasks_planned' || fieldKey === 'blockers') {
      // Handle array fields - split by newline
      const arrayValue = typeof value === 'string' 
        ? value.split('\n').filter(item => item.trim().length > 0)
        : Array.isArray(value) ? value : []
      setFormData({ ...formData, [fieldKey]: arrayValue })
    } else if (fieldKey.startsWith('field_')) {
      // Department-specific field
      setFieldValues({ ...fieldValues, [fieldKey]: value })
    } else {
      setFormData({ ...formData, [fieldKey]: value })
    }
  }

  const validateCurrentStep = (): boolean => {
    if (!currentStepConfig) return true

    for (const field of currentStepConfig.fields) {
      if (field.required) {
        const fieldKey = field.key
        let value: any

        if (fieldKey === 'tasks_completed' || fieldKey === 'tasks_planned' || fieldKey === 'blockers') {
          value = formData[fieldKey]
        } else if (fieldKey.startsWith('field_')) {
          value = fieldValues[fieldKey]
        } else {
          value = formData[fieldKey]
        }

        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error("Please fill all required fields", {
            description: `${field.label} is required`,
            duration: 3000,
          })
          return false
        }
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    try {
      // Build field values array from all steps
      const allFields = formConfig?.steps.flatMap(s => s.fields) || []
      const fieldValuesArray = Object.entries(fieldValues).map(([key, value]) => {
        const fieldKey = key.replace('field_', '')
        const field = allFields.find(f => f.key === fieldKey)
        
        return {
          fieldKey,
          fieldValue: value,
          fieldType: field?.type || 'text' as DailyReportFieldType,
        }
      })

      await createDailyReport({
        date: formData.date,
        categoryId: selectedCategory || undefined,
        departmentId: user?.departmentId || undefined,
        tasksCompleted: formData.tasksCompleted || [],
        tasksPlanned: formData.tasksPlanned || [],
        blockers: formData.blockers || [],
        notes: formData.notes || undefined,
        status: 'draft',
        fieldValues: fieldValuesArray,
      })

      await queryClient.invalidateQueries({ queryKey: ["my-daily-reports"] })
      await queryClient.invalidateQueries({ queryKey: ["my-daily-report-stats"] })
      toast.success("Daily report saved as draft", {
        description: "Your report has been saved and can be edited later",
        duration: 3000,
      })
      handleClose()
    } catch (error) {
      console.error("Error saving daily report:", error)
      toast.error("Failed to save daily report", {
        description: error instanceof Error ? error.message : "An error occurred",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    try {
      // Build field values array from all steps
      const allFields = formConfig?.steps.flatMap(s => s.fields) || []
      const fieldValuesArray = Object.entries(fieldValues).map(([key, value]) => {
        const fieldKey = key.replace('field_', '')
        const field = allFields.find(f => f.key === fieldKey)
        
        return {
          fieldKey,
          fieldValue: value,
          fieldType: field?.type || 'text' as DailyReportFieldType,
        }
      })

      await createDailyReport({
        date: formData.date,
        categoryId: selectedCategory || undefined,
        departmentId: user?.departmentId || undefined,
        tasksCompleted: formData.tasksCompleted || [],
        tasksPlanned: formData.tasksPlanned || [],
        blockers: formData.blockers || [],
        notes: formData.notes || undefined,
        status: 'submitted',
        fieldValues: fieldValuesArray,
      })

      await queryClient.invalidateQueries({ queryKey: ["my-daily-reports"] })
      await queryClient.invalidateQueries({ queryKey: ["my-daily-report-stats"] })
      toast.success("Daily report submitted successfully", {
        description: "Your report has been submitted",
        duration: 3000,
      })
      handleClose()
    } catch (error) {
      console.error("Error submitting daily report:", error)
      toast.error("Failed to submit daily report", {
        description: error instanceof Error ? error.message : "An error occurred",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      tasksCompleted: [],
      tasksPlanned: [],
      blockers: [],
      notes: "",
    })
    setFieldValues({})
    setSelectedCategory("")
    setFormConfig(null)
    setCurrentStep(1)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const renderField = (field: FormField) => {
    const fieldKey = field.key
    const isStandardField = ['date', 'tasks_completed', 'tasks_planned', 'blockers', 'notes'].includes(fieldKey)
    const isFieldValue = !isStandardField
    
    let value: any
    if (fieldKey === 'tasks_completed' || fieldKey === 'tasks_planned' || fieldKey === 'blockers') {
      value = Array.isArray(formData[fieldKey]) ? formData[fieldKey].join('\n') : ''
    } else if (isFieldValue) {
      const actualKey = `field_${fieldKey}`
      value = fieldValues[actualKey] || ''
    } else {
      value = formData[fieldKey] || ''
    }

    switch (field.type) {
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
            required={field.required}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(isFieldValue ? `field_${fieldKey}` : fieldKey, e.target.value ? Number(e.target.value) : 0)}
            placeholder={field.placeholder}
            className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )
      case 'array':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder || "Enter one item per line"}
            className="min-h-[120px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
            required={field.required}
          />
        )
      case 'text':
      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => {
              const targetKey = isFieldValue ? `field_${fieldKey}` : fieldKey
              handleFieldChange(targetKey, e.target.value)
            }}
            placeholder={field.placeholder}
            className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
            required={field.required}
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 rounded-[16px]" showCloseButton={false}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#dfe1e7] flex-shrink-0">
          <DialogTitle className="text-[18px] font-semibold leading-[1.4] tracking-[0.36px] text-[#0d0d12] m-0">
            Create Daily Report
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
        {formConfig && formConfig.steps.length > 1 && (
          <div className="flex items-center gap-4 px-6 py-6 border-b border-[#dfe1e7] flex-shrink-0 overflow-x-auto">
            {formConfig.steps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-2.5 flex-shrink-0">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[14px] font-medium leading-[1.5] tracking-[0.28px]",
                  currentStep === step.step ? 'bg-[#40c4aa] text-white' : 'bg-[#dfe1e7] text-white'
                )}>
                  {step.step}
                </div>
                <span className={cn(
                  "text-[14px] font-medium leading-[1.5] tracking-[0.28px] whitespace-nowrap",
                  currentStep === step.step ? 'text-[#0d0d12]' : 'text-[#818898]'
                )}>
                  {step.title}
                </span>
                {index < formConfig.steps.length - 1 && (
                  <div className="h-0 w-8 border-t border-[#dfe1e7]" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Content */}
        <form className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {/* Step 0: Category Selection (if no category selected) */}
            {!selectedCategory && (
              <div className="space-y-4">
                <h3 className="text-[16px] font-medium leading-[1.5] tracking-[0.32px] text-[#0d0d12] mb-0">
                  Select Report Category
                </h3>
                <div className="space-y-2">
                  <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]">
                    Category <span className="text-[#df1c41]">*</span>
                  </Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Render current step fields */}
            {selectedCategory && currentStepConfig && (
              <div className="space-y-4">
                <h3 className="text-[16px] font-medium leading-[1.5] tracking-[0.32px] text-[#0d0d12] mb-0">
                  {currentStepConfig.title}
                </h3>
                {currentStepConfig.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-[14px] font-medium leading-[1.5] tracking-[0.28px] text-[#666d80]">
                      {field.label} {field.required && <span className="text-[#df1c41]">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  size="md"
                  className="w-[128px]"
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSaveDraft}
                variant="outline"
                size="md"
                className="w-[128px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
              </Button>
            </div>
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  size="md"
                  className="w-[128px]"
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  size="md"
                  className="w-[128px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

