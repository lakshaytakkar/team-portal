"use client"

/**
 * VerticalSwitcher Component
 * 
 * IMPORTANT: This component is ONLY for superadmin users.
 * It allows switching between different business verticals to filter
 * sidebar navigation and page content.
 * 
 * This component should ONLY be rendered when user.isSuperadmin === true
 */
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getOrganizations, getVerticals } from "@/lib/actions/hierarchy"
import { getDepartments, getDepartmentMembers } from "@/lib/actions/hr"
import { useOrganization } from "@/lib/hooks/use-organization"
import { useVertical } from "@/lib/hooks/use-vertical"
import { useDepartment } from "@/lib/hooks/use-department"
import { cn } from "@/lib/utils"
import { Layers, Building2, Building, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { VerticalType } from "@/lib/types/hierarchy"

interface VerticalSwitcherProps {
  className?: string
}

// Helper function to get country flag emoji from country name
function getCountryFlag(country: string | null): string {
  if (!country) return "🌍"
  
  const countryFlags: Record<string, string> = {
    "United States": "🇺🇸",
    "India": "🇮🇳",
    "USA": "🇺🇸",
    "US": "🇺🇸",
  }
  
  return countryFlags[country] || "🌍"
}

// Helper function to get vertical type tag color
function getVerticalTypeTag(type: VerticalType | null) {
  if (!type) return null
  
  const tagConfig: Record<VerticalType, { label: string; className: string }> = {
    service: { label: "Service", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    product: { label: "Product", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    saas: { label: "SaaS", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    dropship: { label: "Dropship", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  }
  
  return tagConfig[type]
}

// Icons for different verticals (can be customized per vertical)
const getVerticalIcon = (index: number) => {
  const icons = [
    Layers, // Default icon
    Layers,
    Layers,
    Layers,
    Layers,
  ]
  return icons[index % icons.length]
}

// Icons for different departments (can be customized per department)
const getDepartmentIcon = (index: number) => {
  const icons = [
    Building2, // Default icon
    Building2,
    Building2,
    Building2,
    Building2,
  ]
  return icons[index % icons.length]
}

export function VerticalSwitcher({ className }: VerticalSwitcherProps) {
  const router = useRouter()
  const { selectedOrganizations, toggleOrganization, setSelectedOrganizations } = useOrganization()
  const { selectedVerticals, toggleVertical, setSelectedVerticals } = useVertical()
  const { selectedDepartments, toggleDepartment, setSelectedDepartments } = useDepartment()
  const [open, setOpen] = React.useState(false)
  
  // Fetch organizations
  const { data: organizations = [], isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  })

  // Fetch verticals - filter by selected organizations (if any selected)
  const { data: verticals = [], isLoading: isLoadingVerticals } = useQuery({
    queryKey: ["verticals", selectedOrganizations],
    queryFn: () => {
      // If organizations selected, filter verticals by those organizations
      // If no organizations selected, show all verticals
      if (selectedOrganizations.length > 0) {
        // Fetch verticals for each selected organization and combine
        return Promise.all(
          selectedOrganizations.map((orgId) => getVerticals(orgId))
        ).then((results) => {
          // Flatten and deduplicate
          const allVerticals = results.flat()
          const uniqueVerticals = Array.from(
            new Map(allVerticals.map((v) => [v.id, v])).values()
          )
          return uniqueVerticals
        })
      }
      return getVerticals() // Show all if no org selected
    },
  })

  // Fetch departments - show all for now (can be filtered by teams later)
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  })

  // Fetch department members for all departments at once
  const { data: allDepartmentMembers = {} } = useQuery({
    queryKey: ["all-department-members", departments.map((d) => d.id).join(",")],
    queryFn: async () => {
      const membersMap: Record<string, { manager: any; members: any[] }> = {}
      await Promise.all(
        departments.map(async (dept) => {
          try {
            const members = await getDepartmentMembers(dept.id)
            membersMap[dept.id] = members
          } catch (error) {
            console.warn(`Error fetching members for department ${dept.id}:`, error)
            membersMap[dept.id] = { manager: null, members: [] }
          }
        })
      )
      return membersMap
    },
    enabled: departments.length > 0,
  })

  const handleToggleOrganization = React.useCallback((organizationId: string) => {
    toggleOrganization(organizationId)
  }, [toggleOrganization])

  const handleToggleVertical = React.useCallback((verticalId: string) => {
    toggleVertical(verticalId)
  }, [toggleVertical])

  const handleToggleDepartment = React.useCallback((departmentId: string) => {
    toggleDepartment(departmentId)
  }, [toggleDepartment])

  const handleSelectAllOrganizations = React.useCallback(() => {
    if (selectedOrganizations.length === organizations.length) {
      setSelectedOrganizations([])
    } else {
      setSelectedOrganizations(organizations.map((o) => o.id))
    }
  }, [selectedOrganizations, organizations, setSelectedOrganizations])

  const handleSelectAllVerticals = React.useCallback(() => {
    if (selectedVerticals.length === verticals.length) {
      setSelectedVerticals([])
    } else {
      setSelectedVerticals(verticals.map((v) => v.id))
    }
  }, [selectedVerticals, verticals, setSelectedVerticals])

  const handleSelectAllDepartments = React.useCallback(() => {
    if (selectedDepartments.length === departments.length) {
      setSelectedDepartments([])
    } else {
      setSelectedDepartments(departments.map((d) => d.id))
    }
  }, [selectedDepartments, departments, setSelectedDepartments])

  // Display selected items
  const selectedOrganizationNames = selectedOrganizations.length > 0
    ? selectedOrganizations
        .map((id) => organizations.find((o) => o.id === id)?.name)
        .filter(Boolean)
        .join(", ")
    : "All"

  const selectedVerticalNames = selectedVerticals.length > 0
    ? selectedVerticals
        .map((id) => verticals.find((v) => v.id === id)?.name)
        .filter(Boolean)
        .join(", ")
    : "All"

  const selectedDepartmentNames = selectedDepartments.length > 0
    ? selectedDepartments
        .map((id) => departments.find((d) => d.id === id)?.name)
        .filter(Boolean)
        .join(", ")
    : "All"

  const isLoading = isLoadingOrganizations || isLoadingVerticals || isLoadingDepartments

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex flex-1 gap-3 items-center w-full rounded-lg px-3 py-2 bg-muted/50 hover:bg-muted transition-colors cursor-pointer outline-hidden",
            className
          )}
          aria-label="Switch vertical"
        >
          {/* Black square icon */}
          <div className="relative shrink-0 size-8 bg-black rounded flex items-center justify-center">
            {selectedOrganizations.length > 0 ? (
              <Building className="h-4 w-4 text-white" />
            ) : selectedVerticals.length > 0 ? (
              <Layers className="h-4 w-4 text-white" />
            ) : (
              <Building className="h-4 w-4 text-white" />
            )}
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold leading-tight text-foreground text-base truncate">
              {isLoading ? "Loading..." : selectedOrganizationNames}
            </p>
            <p className="text-sm text-muted-foreground leading-tight truncate mt-0.5">
              {selectedVerticals.length > 0 ? selectedVerticalNames : selectedDepartments.length > 0 ? selectedDepartmentNames : "All"}
            </p>
          </div>
          
          {/* Chevron icon */}
          <div className="shrink-0 flex flex-col items-center">
            <ChevronUp className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )} />
            <ChevronDown className={cn(
              "h-3 w-3 text-muted-foreground -mt-0.5 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[840px] p-0" 
        align="start"
        side="bottom"
        sideOffset={8}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside the popover
          e.preventDefault()
        }}
      >
        <div className="p-1 relative">
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex gap-1">
            {/* Organizations Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="px-3 py-2.5 mb-0.5">
                <h3 className="text-base font-semibold text-foreground">Organizations</h3>
              </div>

              {/* All Option */}
              <button
                onClick={handleSelectAllOrganizations}
                className={cn(
                  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-base outline-hidden transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                  selectedOrganizations.length === 0 && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                )}
              >
                <div className="size-4 shrink-0 flex items-center justify-center">
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1 truncate text-foreground">All</span>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedOrganizations.length === 0 && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                  {selectedOrganizations.length > 0 && selectedOrganizations.length === organizations.length && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>

              {/* Organization List */}
              {organizations.map((organization) => {
                const isSelected = selectedOrganizations.includes(organization.id)
                const flagEmoji = getCountryFlag(organization.country)

                return (
                  <button
                    key={organization.id}
                    onClick={() => handleToggleOrganization(organization.id)}
                    className={cn(
                      "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-base outline-hidden transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                      isSelected && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="size-4 shrink-0 flex items-center justify-center">
                      <span className="text-base leading-none">{flagEmoji}</span>
                    </div>
                    <span className="flex-1 truncate text-foreground">{organization.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Separator */}
            <div className="w-[0.5px] bg-sidebar-border my-1" />

            {/* Verticals Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="px-3 py-2.5 mb-0.5">
                <h3 className="text-base font-semibold text-foreground">Verticals</h3>
              </div>

              {/* All Option */}
              <button
                onClick={handleSelectAllVerticals}
                className={cn(
                  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-base outline-hidden transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                  selectedVerticals.length === 0 && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                )}
              >
                <div className="size-4 shrink-0 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1 truncate text-foreground">All</span>
                <div className="flex items-center gap-2 shrink-0">
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
                    ⌘1
                  </kbd>
                  {(selectedVerticals.length === 0 || selectedVerticals.length === verticals.length) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>

              {/* Vertical List */}
              {verticals.map((vertical) => {
                const Icon = getVerticalIcon(0)
                const isSelected = selectedVerticals.includes(vertical.id)
                const typeTag = getVerticalTypeTag(vertical.type)

                return (
                  <button
                    key={vertical.id}
                    onClick={() => handleToggleVertical(vertical.id)}
                    className={cn(
                      "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-base outline-hidden transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                      isSelected && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="size-4 shrink-0 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1 truncate text-foreground">{vertical.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {typeTag && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          typeTag.className
                        )}>
                          {typeTag.label}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                )
              })}

            </div>

            {/* Separator */}
            <div className="w-[0.5px] bg-sidebar-border my-1" />

            {/* Departments Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="px-3 py-2.5 mb-0.5">
                <h3 className="text-base font-semibold text-foreground">Departments</h3>
              </div>

              {/* All Option */}
              <button
                onClick={handleSelectAllDepartments}
                className={cn(
                  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-base outline-hidden transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                  selectedDepartments.length === 0 && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                )}
              >
                <div className="size-4 shrink-0 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="flex-1 truncate text-foreground text-base">All</span>
                <div className="flex items-center gap-2 shrink-0">
                  {(selectedDepartments.length === 0 || selectedDepartments.length === departments.length) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>

              {/* Department List */}
              {departments.map((department) => {
                const Icon = getDepartmentIcon(0)
                const isSelected = selectedDepartments.includes(department.id)
                
                // Get department members from the pre-fetched data
                const deptMembers = allDepartmentMembers[department.id] || { manager: null, members: [] }

                const allPeople = [
                  ...(deptMembers?.manager ? [deptMembers.manager] : []),
                  ...(deptMembers?.members || []),
                ].slice(0, 4) // Show max 4 avatars (3 visible + 1 in "+X more")
                const remainingCount = (deptMembers?.members?.length || 0) + (deptMembers?.manager ? 1 : 0) - 3

                return (
                  <button
                    key={department.id}
                    onClick={() => handleToggleDepartment(department.id)}
                    className={cn(
                      "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-base outline-hidden transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                      isSelected && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="size-4 shrink-0 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1 truncate text-foreground text-base">{department.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {allPeople.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex -space-x-2">
                                {allPeople.slice(0, 3).map((person, idx) => (
                                  <Avatar key={person.id || idx} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={person.avatar || undefined} alt={person.name} />
                                    <AvatarFallback className="text-[10px]">
                                      {person.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {remainingCount > 0 && (
                                  <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                    +{remainingCount}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <div className="space-y-1">
                                {allPeople.map((person) => (
                                  <div key={person.id} className="text-xs">
                                    {person.name}
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}

            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
