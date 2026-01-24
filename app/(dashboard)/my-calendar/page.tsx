"use client"

import { useState, ReactNode } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CreateEventDialog } from "@/components/calendar/CreateEventDialog"

type CalendarView = "month" | "week" | "day"

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: "primary" | "secondary"
}

// Sample events data
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Town Hall Meeting",
    start: new Date(2025, 6, 11, 13, 0), // July 11, 2025, 1 PM
    end: new Date(2025, 6, 11, 14, 0),
    color: "primary",
  },
  {
    id: "2",
    title: "Training Session",
    start: new Date(2025, 6, 11, 13, 0),
    end: new Date(2025, 6, 11, 14, 0),
    color: "secondary",
  },
  {
    id: "3",
    title: "Town Hall Meeting",
    start: new Date(2025, 6, 1, 13, 0),
    end: new Date(2025, 6, 1, 14, 0),
    color: "primary",
  },
  {
    id: "4",
    title: "Training Session",
    start: new Date(2025, 6, 1, 13, 0),
    end: new Date(2025, 6, 1, 14, 0),
    color: "secondary",
  },
]

export default function MyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 11)) // July 11, 2025
  const [view, setView] = useState<CalendarView>("month")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(month + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground leading-[1.35]">
          {formatMonthYear(currentDate)}
        </h1>
        <div className="flex items-center gap-3">
          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate("prev")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DFE1E7] bg-white shadow-lumin-xs hover:bg-accent transition-colors"
            >
              <ChevronUp className="h-4 w-4 text-[#666D80]" />
            </button>
            <button
              onClick={() => navigateDate("next")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DFE1E7] bg-white shadow-lumin-xs hover:bg-accent transition-colors"
            >
              <ChevronDown className="h-4 w-4 text-[#666D80]" />
            </button>
          </div>
          {/* View switcher */}
          <div className="flex items-center gap-2 rounded-lg border border-[#DFE1E7] bg-white p-1">
            {(["month", "week", "day"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                  view === v
                    ? "bg-primary text-white"
                    : "text-[#666D80] hover:bg-[#F6F8FA]"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {/* Create Schedule button */}
          <Button onClick={() => setIsCreateEventOpen(true)}>Create Schedule</Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-[14px] border border-[#DFE1E6] bg-white overflow-hidden">
        {view === "month" && (
          <MonthView currentDate={currentDate} events={sampleEvents} />
        )}
        {view === "week" && (
          <WeekView currentDate={currentDate} events={sampleEvents} />
        )}
        {view === "day" && (
          <DayView currentDate={currentDate} events={sampleEvents} />
        )}
      </div>

      <CreateEventDialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen} />
    </div>
  )
}

// Month View Component
function MonthView({
  currentDate,
  events,
}: {
  currentDate: Date
  events: CalendarEvent[]
}) {
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Get days from previous month to fill the first week
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return []
    return events.filter((event) => {
      const eventDate = event.start
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      )
    })
  }

  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const renderDays = () => {
    const days: ReactNode[] = []
    const totalCells = 42 // 6 weeks * 7 days

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const isCurrentMonth = false
      const dayEvents = getEventsForDay(day, isCurrentMonth)
      days.push(
        <DayCell
          key={`prev-${day}`}
          day={day}
          isCurrentMonth={isCurrentMonth}
          isToday={false}
          events={dayEvents}
        />
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentMonth = true
      const dayEvents = getEventsForDay(day, isCurrentMonth)
      days.push(
        <DayCell
          key={day}
          day={day}
          isCurrentMonth={isCurrentMonth}
          isToday={isToday(day, isCurrentMonth)}
          events={dayEvents}
        />
      )
    }

    // Next month days to fill the grid
    const remainingDays = totalCells - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const isCurrentMonth = false
      const dayEvents = getEventsForDay(day, isCurrentMonth)
      days.push(
        <DayCell
          key={`next-${day}`}
          day={day}
          isCurrentMonth={isCurrentMonth}
          isToday={false}
          events={dayEvents}
        />
      )
    }

    return days
  }

  return (
    <div className="flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-[#DFE1E6]">
        {weekDays.map((day) => (
          <div
            key={day}
            className="flex h-10 items-center justify-center border-r border-[#DFE1E6] last:border-r-0"
          >
            <span className="text-sm font-medium text-[#666D80]">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {renderDays()}
      </div>
    </div>
  )
}

// Day Cell Component
function DayCell({
  day,
  isCurrentMonth,
  isToday,
  events,
}: {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}) {
  const bgColor = isCurrentMonth ? "bg-white" : "bg-[#F6F8FA]"
  const textColor = isCurrentMonth
    ? isToday
      ? "text-[#0D0D12]"
      : "text-[#0D0D12]"
    : "text-[#A4ACB9]"

  return (
    <div
      className={cn(
        "flex min-h-[128px] flex-col border-b border-r border-[#DFE1E6] p-3",
        bgColor
      )}
    >
      <div className="mb-2 flex items-center justify-end">
        {isToday ? (
          <div className="flex h-[21px] w-[21px] items-center justify-center rounded bg-primary">
            <span className="text-[10px] font-semibold leading-[1.5] text-white">
              {day}
            </span>
          </div>
        ) : (
          <span
            className={cn(
              "text-sm font-normal leading-[1.5] tracking-[0.28px]",
              textColor
            )}
          >
            {day}
          </span>
        )}
      </div>
      {events.length > 0 && (
        <div className="flex flex-col gap-1">
          {events.slice(0, 2).map((event) => (
            <EventBadge key={event.id} event={event} />
          ))}
          {events.length > 2 && (
            <span className="text-[10px] font-medium leading-[1.5] text-[#0D0D12] tracking-[0.2px]">
              +{events.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Event Badge Component
function EventBadge({ event }: { event: CalendarEvent }) {
  const bgColor =
    event.color === "primary" ? "bg-blue-50" : "bg-[#FFF9E8]"
  const borderColor =
    event.color === "primary" ? "bg-primary" : "bg-[#FAC515]"

  return (
    <div className={cn("relative flex h-6 items-center rounded px-2", bgColor)}>
      <div
        className={cn(
          "absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full",
          borderColor
        )}
      />
      <span className="flex-1 text-[10px] font-normal leading-[1.5] text-[#36394A] tracking-[0.2px]">
        {event.title}
      </span>
    </div>
  )
}

// Week View Component
function WeekView({
  currentDate,
  events,
}: {
  currentDate: Date
  events: CalendarEvent[]
}) {
  // Get the week's dates (starting from Monday of the week containing currentDate)
  const getWeekDates = () => {
    const dates: Date[] = []
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(currentDate)
    
    // Calculate days to subtract to get to Monday (or Sunday if week starts on Sunday)
    // For Monday start: if day is Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startOfWeek.setDate(currentDate.getDate() + daysToMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()
  const timeSlots = [
    "All day",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
  ]

  const isCurrentDay = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = event.start
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const parseTimeSlot = (timeSlot: string): number | null => {
    if (timeSlot === "All day") return null
    const [time, period] = timeSlot.split(" ")
    const hour = parseInt(time)
    if (period === "PM" && hour !== 12) return hour + 12
    if (period === "AM" && hour === 12) return 0
    return hour
  }

  return (
    <div className="flex h-[812px]">
      {/* Time column */}
      <div className="w-20 flex-shrink-0">
        {timeSlots.map((time, idx) => (
          <div
            key={time}
            className={cn(
              "flex h-full items-center justify-end border-b border-r border-[#DFE1E6] px-3",
              idx === 0 ? "h-11" : "flex-1"
            )}
          >
            <span className="text-sm font-medium text-[#666D80]">{time}</span>
          </div>
        ))}
      </div>

      {/* Days columns */}
      <div className="flex flex-1">
        {weekDates.map((date, dateIdx) => {
          const isToday = isCurrentDay(date)
          return (
            <div key={dateIdx} className="flex flex-1 flex-col">
              {/* Day header */}
              <div
                className={cn(
                  "flex h-11 items-center justify-center border-b border-[#DFE1E6]",
                  isToday && "bg-white"
                )}
              >
                {isToday ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-[#0D0D12]">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <div className="flex h-[21px] w-[21px] items-center justify-center rounded bg-primary">
                      <span className="text-sm font-medium leading-[1.5] text-white tracking-[0.28px]">
                        {date.getDate()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-[#666D80]">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                    })}{" "}
                    {date.getDate()}
                  </span>
                )}
              </div>

              {/* Time slots */}
              {timeSlots.map((time, timeIdx) => {
                const hour = parseTimeSlot(time)
                const dateEvents = getEventsForDate(date)
                // For time slots, show events that start in that hour
                // For "All day", we could show all-day events, but for now leave empty
                const slotEvents =
                  hour === null
                    ? []
                    : dateEvents.filter((event) => {
                        const eventHour = event.start.getHours()
                        return eventHour === hour
                      })
                const bgColor =
                  dateIdx === weekDates.length - 1 ? "bg-[#F6F8FA]" : "bg-white"

                if (timeIdx === 0) {
                  // All day slot
                  return (
                    <div
                      key={time}
                      className={cn(
                        "h-[54.86px] border-b border-[#DFE1E7]",
                        bgColor
                      )}
                    />
                  )
                }

                if (slotEvents.length > 0) {
                  return (
                    <div
                      key={time}
                      className={cn(
                        "relative flex flex-1 flex-col gap-1 border-b border-[#DFE1E7] p-2",
                        bgColor
                      )}
                    >
                      {slotEvents.map((event) => {
                        const startTime = event.start.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                        })
                        const endTime = event.end.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                        })
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "relative flex flex-col rounded px-2 py-1",
                              event.color === "primary"
                                ? "bg-blue-50"
                                : "bg-[#FFF9E8]"
                            )}
                          >
                            <span className="text-[10px] font-medium leading-[1.5] text-[#A4ACB9] tracking-[0.2px]">
                              {event.title}
                            </span>
                            <span className="text-[10px] font-normal leading-[1.5] text-[#A4ACB9] tracking-[0.2px]">
                              {startTime} - {endTime}
                            </span>
                            <div
                              className={cn(
                                "absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full",
                                event.color === "primary"
                                  ? "bg-[#B0A9FC]"
                                  : "bg-[#FAC515]"
                              )}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                }

                return (
                  <div
                    key={time}
                    className={cn(
                      "h-[54.86px] border-b border-[#DFE1E7]",
                      bgColor
                    )}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Day View Component
function DayView({
  currentDate,
  events,
}: {
  currentDate: Date
  events: CalendarEvent[]
}) {
  const timeSlots = [
    "All day",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
  ]

  const parseTimeSlot = (timeSlot: string): number | null => {
    if (timeSlot === "All day") return null
    const [time, period] = timeSlot.split(" ")
    const hour = parseInt(time)
    if (period === "PM" && hour !== 12) return hour + 12
    if (period === "AM" && hour === 12) return 0
    return hour
  }

  const getEventsForTimeSlot = (timeSlot: string) => {
    const hour = parseTimeSlot(timeSlot)
    if (hour === null) return []

    return events.filter((event) => {
      const eventDate = event.start
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getHours() === hour
      )
    })
  }

  return (
    <div className="flex h-[812px]">
      {/* Time column */}
      <div className="w-20 flex-shrink-0">
        {timeSlots.map((time, idx) => (
          <div
            key={time}
            className={cn(
              "flex h-full items-center justify-end border-b border-r border-[#DFE1E6] px-3",
              idx === 0 ? "h-11" : "flex-1"
            )}
          >
            <span className="text-sm font-medium text-[#666D80]">{time}</span>
          </div>
        ))}
      </div>

      {/* Day column */}
      <div className="flex flex-1 flex-col">
        {/* Day header */}
        <div className="flex h-11 items-center justify-center border-b border-[#DFE1E6]">
          <span className="text-sm font-medium text-[#0D0D12]">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Time slots */}
        {timeSlots.map((time, timeIdx) => {
          const slotEvents = getEventsForTimeSlot(time)

          if (timeIdx === 0) {
            return (
              <div
                key={time}
                className="h-[54.86px] border-b border-[#DFE1E7]"
              />
            )
          }

          if (slotEvents.length > 0) {
            return (
              <div
                key={time}
                className="flex flex-1 flex-col gap-1 border-b border-[#DFE1E7] p-2"
              >
                {slotEvents.map((event) => {
                  const startTime = event.start.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                  })
                  const endTime = event.end.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                  })
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "relative flex flex-col rounded px-2 py-1",
                        event.color === "primary" ? "bg-blue-50" : "bg-[#FFF9E8]"
                      )}
                    >
                      <span className="text-[10px] font-medium leading-[1.5] text-[#A4ACB9] tracking-[0.2px]">
                        {event.title}
                      </span>
                      <span className="text-[10px] font-normal leading-[1.5] text-[#A4ACB9] tracking-[0.2px]">
                        {startTime} - {endTime}
                      </span>
                      <div
                        className={cn(
                          "absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full",
                          event.color === "primary" ? "bg-[#B0A9FC]" : "bg-[#FAC515]"
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            )
          }

          return (
            <div
              key={time}
              className="h-[54.86px] border-b border-[#DFE1E7]"
            />
          )
        })}
      </div>
    </div>
  )
}
