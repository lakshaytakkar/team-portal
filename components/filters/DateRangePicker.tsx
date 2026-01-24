"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

export type { DateRange }

export interface DateRangePickerProps {
  value?: { from: Date | null; to: Date | null }
  onChange?: (range: { from: Date | null; to: Date | null }) => void
  mode?: 'range' | 'single'
  presets?: boolean
  placeholder?: string
  className?: string
  required?: boolean
}

const PRESETS = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return { from: today, to: today }
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      return { from: yesterday, to: yesterday }
    },
  },
  {
    label: 'This Week',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const firstDayOfWeek = new Date(today)
      const day = firstDayOfWeek.getDay()
      const diff = firstDayOfWeek.getDate() - day
      firstDayOfWeek.setDate(diff)
      return { from: firstDayOfWeek, to: today }
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: firstDayOfMonth, to: today }
    },
  },
  {
    label: 'Last Month',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: firstDayOfLastMonth, to: lastDayOfLastMonth }
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return { from: sevenDaysAgo, to: today }
    },
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return { from: thirtyDaysAgo, to: today }
    },
  },
]

export function DateRangePicker({
  value,
  onChange,
  mode = 'range',
  presets = true,
  placeholder = 'Select date range',
  className,
  required = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    const range = preset.getValue()
    if (onChange) {
      onChange(range)
    }
    setOpen(false)
  }

  const handleClear = () => {
    if (onChange) {
      onChange({ from: null, to: null })
    }
  }

  const formatDisplayValue = (): string => {
    if (!value || (!value.from && !value.to)) {
      return placeholder
    }

    if (mode === 'single') {
      if (value.from) {
        return format(value.from, "dd / MM / yyyy")
      }
      return placeholder
    }

    if (value.from && value.to) {
      const fromStr = format(value.from, "dd / MM / yyyy")
      const toStr = format(value.to, "dd / MM / yyyy")
      if (fromStr === toStr) {
        return fromStr
      }
      return `${fromStr} - ${toStr}`
    }

    if (value.from) {
      return `${format(value.from, "dd / MM / yyyy")} - ...`
    }

    return placeholder
  }

  const hasValue = value && (value.from || value.to)
  
  const calendarValue = value
    ? {
        from: value.from || undefined,
        to: value.to || undefined,
      }
    : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-[52px] rounded-xl border border-[#dfe1e7] text-base tracking-[0.32px]",
            !hasValue && "text-[#818898]",
            className
          )}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {presets && (
            <div className="flex flex-col gap-2 p-4 border-b">
              <Label className="text-xs font-semibold text-muted-foreground">Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-left text-sm"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className={cn(presets && "border-t")}>
            {mode === 'single' ? (
              <Calendar
                mode="single"
                selected={value?.from || undefined}
                onSelect={(date) => {
                  if (onChange) {
                    onChange({ from: date || null, to: date || null })
                  }
                  setOpen(false)
                }}
                initialFocus
              />
            ) : (
              <Calendar
                mode="range"
                selected={calendarValue}
                onSelect={(range) => {
                  if (onChange && range) {
                    onChange({
                      from: range.from || null,
                      to: range.to || null,
                    })
                  }
                  // Close when both dates are selected
                  if (range?.from && range?.to) {
                    setOpen(false)
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
            )}
          </div>

          {hasValue && (
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

