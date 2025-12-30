"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Crown, Shield, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Available roles and departments
const ROLES = [
  { value: "executive", label: "Executive" },
  { value: "manager", label: "Manager" },
  { value: "superadmin", label: "SuperAdmin" },
] as const

const DEPARTMENTS = [
  { value: "sales", label: "Sales" },
  { value: "hr-recruitment", label: "HR & Recruitment" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "analytics", label: "Analytics" },
  { value: "rnd", label: "Research & Development" },
  { value: "development", label: "Development" },
] as const

interface FilterHeaderProps {
  selectedRoles: string[]
  selectedDepartments: string[]
  isSuperAdminView: boolean
  isCeoView: boolean
  onRoleChange: (roles: string[]) => void
  onDepartmentChange: (departments: string[]) => void
  onSuperAdminToggle: (checked: boolean) => void
  onCeoViewToggle: (checked: boolean) => void
  isCollapsed?: boolean
  onToggle?: () => void
  // New hierarchy filters
  selectedVerticals?: string[]
  selectedTeams?: string[]
  onVerticalChange?: (verticals: string[]) => void
  onTeamChange?: (teams: string[]) => void
  verticals?: Array<{ id: string; name: string }>
  teams?: Array<{ id: string; name: string }>
}

export function FilterHeader({ 
  selectedRoles, 
  selectedDepartments, 
  isSuperAdminView,
  isCeoView,
  onRoleChange,
  onDepartmentChange,
  onSuperAdminToggle,
  onCeoViewToggle,
  isCollapsed = false,
  onToggle,
  selectedVerticals = [],
  selectedTeams = [],
  onVerticalChange,
  onTeamChange,
  verticals = [],
  teams = [],
}: FilterHeaderProps) {
  const handleRoleToggle = (roleValue: string) => {
    const newRoles = selectedRoles.includes(roleValue)
      ? selectedRoles.filter((r) => r !== roleValue)
      : [...selectedRoles, roleValue]
    onRoleChange(newRoles)
  }

  const handleDepartmentToggle = (deptValue: string) => {
    let newDepartments: string[]
    
    // Merge HR and Recruitment - selecting "hr-recruitment" selects both "hr" and "recruitment"
    if (deptValue === "hr-recruitment") {
      const hasHrOrRecruitment = selectedDepartments.includes("hr") || selectedDepartments.includes("recruitment")
      
      if (hasHrOrRecruitment) {
        // Remove both HR and Recruitment
        newDepartments = selectedDepartments.filter((d) => d !== "hr" && d !== "recruitment")
      } else {
        // Add both HR and Recruitment
        newDepartments = [...selectedDepartments.filter((d) => d !== "hr" && d !== "recruitment"), "hr", "recruitment"]
      }
    } else {
      // For other departments, toggle normally
      newDepartments = selectedDepartments.includes(deptValue)
        ? selectedDepartments.filter((d) => d !== deptValue)
        : [...selectedDepartments, deptValue]
    }
    
    onDepartmentChange(newDepartments)
  }

  const handleRemoveRole = (e: React.MouseEvent, roleValue: string) => {
    e.stopPropagation()
    const newRoles = selectedRoles.filter((r) => r !== roleValue)
    onRoleChange(newRoles)
  }

  const handleRemoveDepartment = (e: React.MouseEvent, deptValue: string) => {
    e.stopPropagation()
    
    // Merge HR and Recruitment - removing "hr-recruitment" removes both "hr" and "recruitment"
    let newDepartments: string[]
    if (deptValue === "hr-recruitment") {
      newDepartments = selectedDepartments.filter((d) => d !== "hr" && d !== "recruitment")
    } else {
      newDepartments = selectedDepartments.filter((d) => d !== deptValue)
    }
    
    onDepartmentChange(newDepartments)
  }

  const handleSuperAdminToggleChange = (checked: boolean) => {
    if (checked) {
      // Clear all selections when enabling superadmin view (for exclusive view)
      onRoleChange([])
      onDepartmentChange([])
      onCeoViewToggle(false) // Disable CEO view when SuperAdmin is enabled
    }
    onSuperAdminToggle(checked)
  }

  const handleCeoViewToggleChange = (checked: boolean) => {
    if (checked) {
      // Clear all selections when enabling CEO view
      onRoleChange([])
      onDepartmentChange([])
      onSuperAdminToggle(false) // Disable SuperAdmin view when CEO is enabled
    }
    onCeoViewToggle(checked)
  }

  const handleVerticalToggle = (verticalId: string) => {
    if (!onVerticalChange) return
    const newVerticals = selectedVerticals.includes(verticalId)
      ? selectedVerticals.filter((v) => v !== verticalId)
      : [...selectedVerticals, verticalId]
    onVerticalChange(newVerticals)
  }

  const handleTeamToggle = (teamId: string) => {
    if (!onTeamChange) return
    const newTeams = selectedTeams.includes(teamId)
      ? selectedTeams.filter((t) => t !== teamId)
      : [...selectedTeams, teamId]
    onTeamChange(newTeams)
  }

  const handleRemoveVertical = (e: React.MouseEvent, verticalId: string) => {
    e.stopPropagation()
    if (!onVerticalChange) return
    onVerticalChange(selectedVerticals.filter((v) => v !== verticalId))
  }

  const handleRemoveTeam = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation()
    if (!onTeamChange) return
    onTeamChange(selectedTeams.filter((t) => t !== teamId))
  }

  const clearAll = () => {
    onRoleChange([])
    onDepartmentChange([])
    if (onVerticalChange) onVerticalChange([])
    if (onTeamChange) onTeamChange([])
  }

  // Count unique departments (HR and Recruitment count as one)
  const uniqueDepartments = new Set(selectedDepartments)
  const uniqueDeptCount = uniqueDepartments.has("hr") && uniqueDepartments.has("recruitment") 
    ? uniqueDepartments.size - 1 // Subtract 1 because hr and recruitment count as one
    : uniqueDepartments.size
  
  const totalSelected = selectedRoles.length + uniqueDeptCount + selectedVerticals.length + selectedTeams.length
  const hasSelections = totalSelected > 0
  const hasHierarchyFilters = verticals.length > 0 || teams.length > 0

  if (isCollapsed) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 left-0 border-b border-[#1a1a1a] bg-[#0d0d12] z-40 transition-all duration-300">
      <div className="px-3 py-1.5 flex items-center gap-2">
        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center hover:bg-[#1a1a1a] rounded-md p-1.5 transition-colors"
            aria-label="Hide filter header"
          >
            <ChevronUp className="h-4 w-4 text-[#a0a0a0]" />
          </button>
        )}
        {/* CEO Toggle */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#2a2a2a] bg-[#1a1a1a]">
          <Crown className="h-3.5 w-3.5 text-[#897efa]" />
          <Label htmlFor="ceo-toggle" className="text-sm font-medium text-[#e0e0e0] cursor-pointer whitespace-nowrap tracking-[0.28px]">
            CEO View
          </Label>
          <Switch
            id="ceo-toggle"
            checked={isCeoView}
            onCheckedChange={handleCeoViewToggleChange}
            className="data-[state=checked]:bg-[#897efa]"
          />
        </div>

        {/* SuperAdmin Toggle */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#2a2a2a] bg-[#1a1a1a]">
          <Shield className="h-3.5 w-3.5 text-[#897efa]" />
          <Label htmlFor="superadmin-toggle" className="text-sm font-medium text-[#e0e0e0] cursor-pointer whitespace-nowrap tracking-[0.28px]">
            SuperAdmin View
          </Label>
          <Switch
            id="superadmin-toggle"
            checked={isSuperAdminView}
            onCheckedChange={handleSuperAdminToggleChange}
            className="data-[state=checked]:bg-[#897efa]"
          />
        </div>

        {/* Divider */}
        {!isSuperAdminView && !isCeoView && <div className="h-6 w-px bg-[#2a2a2a]" />}

        {/* Verticals - Primary Filter */}
        {!isSuperAdminView && !isCeoView && hasHierarchyFilters && verticals.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#a0a0a0] uppercase tracking-[0.28px] whitespace-nowrap">Verticals:</span>
              <Tabs value={selectedVerticals[0] || ""} className="w-auto">
                <TabsList className="bg-[#1a1a1a] p-0.5 rounded-lg h-auto border border-[#2a2a2a] w-auto">
                  {verticals.map((vertical) => {
                    const isSelected = selectedVerticals.includes(vertical.id)
                    return (
                      <TabsTrigger
                        key={vertical.id}
                        value={vertical.id}
                        onClick={() => handleVerticalToggle(vertical.id)}
                        className={cn(
                          "h-8 px-3 py-0 rounded-md text-sm font-medium leading-4 tracking-[0.28px] data-[state=active]:bg-[#897efa] data-[state=active]:text-white data-[state=inactive]:text-[#a0a0a0] data-[state=inactive]:font-medium transition-colors",
                          isSelected && "bg-[#897efa]/20 text-[#897efa] border border-[#897efa]/40"
                        )}
                      >
                        {vertical.name}
                        {isSelected && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-[#ff4444]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveVertical(e, vertical.id)
                            }}
                          />
                        )}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </Tabs>
            </div>
            <div className="h-6 w-px bg-[#2a2a2a]" />
          </>
        )}

        {/* Teams - Secondary Filter */}
        {!isSuperAdminView && !isCeoView && hasHierarchyFilters && teams.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#a0a0a0] uppercase tracking-[0.28px] whitespace-nowrap">Teams:</span>
              <Tabs value={selectedTeams[0] || ""} className="w-auto">
                <TabsList className="bg-[#1a1a1a] p-0.5 rounded-lg h-auto border border-[#2a2a2a] w-auto">
                  {teams.map((team) => {
                    const isSelected = selectedTeams.includes(team.id)
                    return (
                      <TabsTrigger
                        key={team.id}
                        value={team.id}
                        onClick={() => handleTeamToggle(team.id)}
                        className={cn(
                          "h-8 px-3 py-0 rounded-md text-sm font-medium leading-4 tracking-[0.28px] data-[state=active]:bg-[#897efa] data-[state=active]:text-white data-[state=inactive]:text-[#a0a0a0] data-[state=inactive]:font-medium transition-colors",
                          isSelected && "bg-[#897efa]/20 text-[#897efa] border border-[#897efa]/40"
                        )}
                      >
                        {team.name}
                        {isSelected && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-[#ff4444]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveTeam(e, team.id)
                            }}
                          />
                        )}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </Tabs>
            </div>
            <div className="h-6 w-px bg-[#2a2a2a]" />
          </>
        )}

        {/* Divider */}
        {!isSuperAdminView && !isCeoView && <div className="h-6 w-px bg-[#2a2a2a]" />}

        {/* Departments */}
        {!isSuperAdminView && !isCeoView && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-[#a0a0a0] uppercase tracking-[0.28px] whitespace-nowrap">Depts:</span>
            <Tabs value={selectedDepartments[0] || ""} className="w-auto">
              <TabsList className="bg-[#1a1a1a] p-0.5 rounded-lg h-auto border border-[#2a2a2a] w-auto">
                {DEPARTMENTS.map((dept) => {
                  // Check if HR & Recruitment is selected (they're merged - check for "hr" or "recruitment" in selectedDepartments)
                  const isHrRecruitmentSelected = dept.value === "hr-recruitment"
                    ? (selectedDepartments.includes("hr") || selectedDepartments.includes("recruitment"))
                    : selectedDepartments.includes(dept.value)
                  
                  return (
                    <TabsTrigger
                      key={dept.value}
                      value={dept.value}
                      onClick={() => handleDepartmentToggle(dept.value)}
                      className={cn(
                        "h-8 px-3 py-0 rounded-md text-sm font-medium leading-4 tracking-[0.28px] data-[state=active]:bg-[#897efa] data-[state=active]:text-white data-[state=inactive]:text-[#a0a0a0] data-[state=inactive]:font-medium transition-colors",
                        isHrRecruitmentSelected && "bg-[#897efa]/20 text-[#897efa] border border-[#897efa]/40"
                      )}
                    >
                      {dept.label}
                      {isHrRecruitmentSelected && (
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer hover:text-[#ff4444]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveDepartment(e, dept.value)
                          }}
                        />
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Divider */}
        {!isSuperAdminView && !isCeoView && <div className="h-6 w-px bg-[#2a2a2a]" />}

        {/* Roles */}
        {!isSuperAdminView && !isCeoView && (
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-sm font-medium text-[#a0a0a0] uppercase tracking-[0.28px] whitespace-nowrap">Roles:</span>
            <Tabs value={selectedRoles[0] || ""} className="w-auto flex-1">
              <TabsList className="bg-[#1a1a1a] p-0.5 rounded-lg h-auto border border-[#2a2a2a] w-auto">
                {ROLES.map((role) => (
                  <TabsTrigger
                    key={role.value}
                    value={role.value}
                    onClick={() => handleRoleToggle(role.value)}
                    className={cn(
                      "h-8 px-3 py-0 rounded-md text-sm font-medium leading-4 tracking-[0.28px] data-[state=active]:bg-[#897efa] data-[state=active]:text-white data-[state=inactive]:text-[#a0a0a0] data-[state=inactive]:font-medium transition-colors",
                      selectedRoles.includes(role.value) && "bg-[#897efa]/20 text-[#897efa] border border-[#897efa]/40"
                    )}
                  >
                    {role.label}
                    {selectedRoles.includes(role.value) && (
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-[#ff4444]"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveRole(e, role.value)
                        }}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Clear All Button */}
        {!isSuperAdminView && !isCeoView && hasSelections && (
          <button
            onClick={clearAll}
            className="text-sm font-medium text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors px-2 py-1 rounded hover:bg-[#1a1a1a] whitespace-nowrap tracking-[0.28px]"
          >
            Clear ({totalSelected})
          </button>
        )}
      </div>
    </div>
  )
}
