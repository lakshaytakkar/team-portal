"use client"

import * as React from "react"
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "./DateRangePicker"
import { cn } from "@/lib/utils"
import type { FilterDefinition, FilterValue } from "@/lib/utils/filters"

export interface FilterPanelProps {
  filters: FilterDefinition[]
  values: FilterValue
  onChange: (values: FilterValue) => void
  onClear?: () => void
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onClear,
  className,
  collapsible = false,
  defaultOpen = true,
}: FilterPanelProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [localValues, setLocalValues] = React.useState<FilterValue>(values)

  React.useEffect(() => {
    setLocalValues(values)
  }, [values])

  const handleFilterChange = (filterId: string, value: any) => {
    const newValues = { ...localValues, [filterId]: value }
    setLocalValues(newValues)
    onChange(newValues)
  }

  const handleClearFilter = (filterId: string) => {
    const newValues = { ...localValues }
    delete newValues[filterId]
    setLocalValues(newValues)
    onChange(newValues)
  }

  const handleClearAll = () => {
    setLocalValues({})
    onChange({})
    if (onClear) {
      onClear()
    }
  }

  const getActiveFiltersCount = (): number => {
    return Object.keys(localValues).filter((key) => {
      const value = localValues[key]
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      if (typeof value === 'object' && 'from' in value && value.from === null && value.to === null) return false
      return true
    }).length
  }

  const getFilterDisplayValue = (filter: FilterDefinition): string => {
    const value = localValues[filter.id]
    if (!value) return ''

    if (filter.type === 'multiselect' && Array.isArray(value)) {
      const options = filter.options || []
      const selectedLabels = value
        .map((v) => options.find((opt) => opt.value === v)?.label)
        .filter(Boolean)
      return selectedLabels.length > 0 ? selectedLabels.join(', ') : ''
    }

    if (filter.type === 'select' && filter.options) {
      const option = filter.options.find((opt) => opt.value === value)
      return option?.label || String(value)
    }

    if (filter.type === 'daterange' && typeof value === 'object' && 'from' in value) {
      const range = value as { from?: Date | null; to?: Date | null }
      if (range.from && range.to) {
        const fromStr = range.from.toLocaleDateString()
        const toStr = range.to.toLocaleDateString()
        return fromStr === toStr ? fromStr : `${fromStr} - ${toStr}`
      }
      if (range.from) return `${range.from.toLocaleDateString()} - ...`
      return ''
    }

    return String(value)
  }

  const activeFiltersCount = getActiveFiltersCount()

  const renderFilterInput = (filter: FilterDefinition) => {
    const value = localValues[filter.id]
    const hasValue = value !== null && value !== undefined && value !== ''

    switch (filter.type) {
      case 'text':
        return (
          <Input
            value={value as string || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
            className="w-full"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value ? Number(e.target.value) : '')}
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
            className="w-full"
          />
        )

      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(val) => handleFilterChange(filter.id, val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        const selectedValues = (Array.isArray(value) ? value : []) as string[]
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filter.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.id}-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const newSelected = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((v) => v !== option.value)
                      handleFilterChange(filter.id, newSelected)
                    }}
                  />
                  <Label
                    htmlFor={`${filter.id}-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full"
            required={filter.required}
          />
        )

      case 'daterange':
        const dateValue = value as { from?: Date | null; to?: Date | null } | undefined
        return (
          <DateRangePicker
            value={{ from: dateValue?.from ?? null, to: dateValue?.to ?? null }}
            onChange={(range) => handleFilterChange(filter.id, range)}
            required={filter.required}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  const content = (
    <div className="space-y-4">
      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b">
          <span className="text-sm font-medium text-muted-foreground">
            Active Filters:
          </span>
          {filters.map((filter) => {
            const displayValue = getFilterDisplayValue(filter)
            if (!displayValue) return null

            return (
              <Badge
                key={filter.id}
                variant="secondary"
                className="gap-1.5"
              >
                <span className="font-medium">{filter.label}:</span>
                <span className="font-normal">{displayValue}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter(filter.id)}
                  className="ml-1 rounded-sm hover:bg-current/20 p-0.5"
                  aria-label={`Clear ${filter.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-auto py-1 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map((filter) => (
          <div key={filter.id} className="flex flex-col gap-2">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
              {filter.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>
    </div>
  )

  if (collapsible) {
    return (
      <div className={cn("border rounded-lg", className)}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-semibold">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {open && <div className="p-4 pt-0 border-t">{content}</div>}
      </div>
    )
  }

  return (
    <div className={cn("border rounded-lg p-4", className)}>
      {content}
    </div>
  )
}

