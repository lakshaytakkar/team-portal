"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { getVerticals, getDepartments, getRoles, getTeams } from "@/lib/actions/hr"
import type { CreatePositionInput } from "@/lib/types/hierarchy"
import { useState, useEffect } from "react"

const NONE_VALUE = "__none__"

interface PositionFormProps {
  employeeId: string
  value: Partial<CreatePositionInput>
  onChange: (value: Partial<CreatePositionInput>) => void
  errors?: Record<string, string>
}

export function PositionForm({ employeeId, value, onChange, errors }: PositionFormProps) {
  const [selectedVerticalId, setSelectedVerticalId] = useState<string | null>(value.teamId ? null : null)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)

  // Fetch data
  const { data: verticals = [] } = useQuery({
    queryKey: ["verticals"],
    queryFn: () => getVerticals(),
  })

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  })

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", selectedVerticalId, selectedDepartmentId],
    queryFn: () => getTeams(selectedVerticalId || undefined, selectedDepartmentId || undefined),
    enabled: !!selectedDepartmentId,
  })

  // When team is selected, extract department and vertical
  useEffect(() => {
    if (value.teamId && teams.length > 0) {
      const team = teams.find((t) => t.id === value.teamId)
      if (team) {
        setSelectedDepartmentId(team.departmentId)
        setSelectedVerticalId(team.verticalId || null)
      }
    }
  }, [value.teamId, teams])

  // Auto-select team when department and vertical are selected
  useEffect(() => {
    if (selectedDepartmentId && teams.length > 0 && !value.teamId) {
      const matchingTeam = teams.find(
        (t) =>
          t.departmentId === selectedDepartmentId &&
          (selectedVerticalId ? t.verticalId === selectedVerticalId : t.verticalId === null)
      )
      if (matchingTeam) {
        onChange({ ...value, teamId: matchingTeam.id })
      }
    }
  }, [selectedDepartmentId, selectedVerticalId, teams, value.teamId])

  const handleVerticalChange = (verticalId: string) => {
    const vId = verticalId === NONE_VALUE ? null : verticalId
    setSelectedVerticalId(vId)
    setSelectedDepartmentId(null)
    onChange({ ...value, teamId: undefined })
  }

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId)
    onChange({ ...value, teamId: undefined })
  }

  const handleTeamChange = (teamId: string) => {
    onChange({ ...value, teamId })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
          Vertical (Optional)
        </Label>
        <Select value={selectedVerticalId || NONE_VALUE} onValueChange={handleVerticalChange}>
          <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
            <SelectValue placeholder="Select vertical (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>None (Vertical-agnostic)</SelectItem>
            {verticals.map((vertical) => (
              <SelectItem key={vertical.id} value={vertical.id}>
                {vertical.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.verticalId && (
          <p className="text-sm text-red-500">{errors.verticalId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
          Department <span className="text-[#df1c41]">*</span>
        </Label>
        <Select value={selectedDepartmentId || ""} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.departmentId && (
          <p className="text-sm text-red-500">{errors.departmentId}</p>
        )}
      </div>

      {selectedDepartmentId && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
            Team <span className="text-[#df1c41]">*</span>
          </Label>
          <Select value={value.teamId || ""} onValueChange={handleTeamChange}>
            <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.teamId && (
            <p className="text-sm text-red-500">{errors.teamId}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
          Role <span className="text-[#df1c41]">*</span>
        </Label>
        <Select value={value.roleId || ""} onValueChange={(roleId) => onChange({ ...value, roleId })}>
          <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.roleId && (
          <p className="text-sm text-red-500">{errors.roleId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
          Title (Optional)
        </Label>
        <Input
          value={value.title || ""}
          onChange={(e) => onChange({ ...value, title: e.target.value || undefined })}
          placeholder="Override role title (e.g., Senior Sales Executive)"
          className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
          Start Date
        </Label>
        <Input
          type="date"
          value={value.startDate || ""}
          onChange={(e) => onChange({ ...value, startDate: e.target.value || undefined })}
          className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPrimary"
          checked={value.isPrimary || false}
          onCheckedChange={(checked) => onChange({ ...value, isPrimary: checked === true })}
        />
        <Label htmlFor="isPrimary" className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px] cursor-pointer">
          Set as primary position
        </Label>
      </div>
    </div>
  )
}

