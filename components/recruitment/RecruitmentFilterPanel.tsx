"use client"

import * as React from "react"
import { X, Filter, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { FilterDefinition, FilterValue } from "@/lib/utils/filters"
import { FilterPanel } from "@/components/filters/FilterPanel"

export interface FilterPreset {
  id: string
  name: string
  filters: FilterValue
  isDefault?: boolean
}

export interface RecruitmentFilterPanelProps {
  filters: FilterDefinition[]
  values: FilterValue
  onChange: (values: FilterValue) => void
  onClear?: () => void
  presets?: FilterPreset[]
  onPresetSelect?: (preset: FilterPreset) => void
  quickFilters?: Array<{ id: string; label: string; filters: FilterValue }>
  onQuickFilterClick?: (filters: FilterValue) => void
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export function RecruitmentFilterPanel({
  filters,
  values,
  onChange,
  onClear,
  presets = [],
  onPresetSelect,
  quickFilters = [],
  onQuickFilterClick,
  className,
  collapsible = false,
  defaultOpen = true,
}: RecruitmentFilterPanelProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [savedFiltersOpen, setSavedFiltersOpen] = React.useState(false)

  const activeFiltersCount = Object.keys(values).filter((key) => {
    const value = values[key]
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    if (typeof value === 'object' && 'from' in value && value.from === null && value.to === null) return false
    return true
  }).length

  const handlePresetSelect = (preset: FilterPreset) => {
    onChange(preset.filters)
    if (onPresetSelect) {
      onPresetSelect(preset)
    }
    setSavedFiltersOpen(false)
  }

  const handleQuickFilterClick = (quickFilter: { filters: FilterValue }) => {
    onChange(quickFilter.filters)
    if (onQuickFilterClick) {
      onQuickFilterClick(quickFilter.filters)
    }
  }

  const defaultPresets: FilterPreset[] = [
    {
      id: "today-interviews",
      name: "Today's Interviews",
      filters: {
        date: new Date().toISOString().split('T')[0],
        status: ['scheduled'],
      },
    },
    {
      id: "pending-evaluations",
      name: "Pending Evaluations",
      filters: {
        status: ['completed'],
        hasEvaluation: false,
      },
    },
    {
      id: "my-candidates",
      name: "My Candidates",
      filters: {
        assignedTo: 'me',
      },
    },
  ]

  const allPresets = [...defaultPresets, ...presets]

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick Filter Chips */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {quickFilters.map((quickFilter) => {
            const isActive = Object.keys(quickFilter.filters).every((key) => {
              const filterValue = quickFilter.filters[key]
              const currentValue = values[key]
              if (Array.isArray(filterValue) && Array.isArray(currentValue)) {
                return filterValue.every((v) => currentValue.includes(v))
              }
              return filterValue === currentValue
            })
            return (
              <Button
                key={quickFilter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilterClick(quickFilter)}
                className="h-7 px-3 text-xs"
              >
                {quickFilter.label}
              </Button>
            )
          })}
        </div>
      )}

      {/* Filter Panel with Presets */}
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="font-semibold">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
              {collapsible && (
                open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {allPresets.length > 0 && (
              <TooltipProvider>
                <Popover open={savedFiltersOpen} onOpenChange={setSavedFiltersOpen}>
                  <Tooltip>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                          Presets
                        </Button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <TooltipContent>
                      <p>Quick filter presets</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-1">
                      {allPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <span>{preset.name}</span>
                          {preset.isDefault && (
                            <BookmarkCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipProvider>
            )}
          </div>
          {activeFiltersCount > 0 && onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-7 px-2 text-xs">
              Clear All
            </Button>
          )}
        </div>
        {open && (
          <div className="p-4">
            <FilterPanel
              filters={filters}
              values={values}
              onChange={onChange}
              onClear={onClear}
              collapsible={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

