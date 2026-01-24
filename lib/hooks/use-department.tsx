"use client"

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from "react"
import { useUser } from "./useUser"

const DEPARTMENT_STORAGE_KEY = "selected-department"

interface DepartmentContextType {
  selectedDepartments: string[] // Empty array means "All"
  setSelectedDepartments: (departments: string[]) => void
  toggleDepartment: (departmentId: string) => void
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined)

/**
 * Provides the selected department context.
 * This provider and its associated hook are intended for use by superadmin users only.
 * For non-superadmin users, the hook will return default values that effectively disable department filtering.
 */
export function DepartmentProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [selectedDepartments, setSelectedDepartmentsState] = useState<string[]>([])

  // Load from localStorage on mount, only if user is superadmin
  useEffect(() => {
    if (user?.role === 'superadmin') {
      const stored = localStorage.getItem(DEPARTMENT_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSelectedDepartmentsState(Array.isArray(parsed) ? parsed : [])
        } catch {
          // Legacy format: single value
          setSelectedDepartmentsState(stored === "all" ? [] : [stored])
        }
      }
    } else {
      // Reset for non-superadmin users
      setSelectedDepartmentsState([])
    }
  }, [user?.role])

  const setSelectedDepartments = (departments: string[]) => {
    if (user?.role === 'superadmin') {
      setSelectedDepartmentsState(departments)
      // Store in localStorage
      localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(departments))
    }
  }

  const toggleDepartment = (departmentId: string) => {
    if (user?.role === 'superadmin') {
      setSelectedDepartmentsState((prev) => {
        const newSelection = prev.includes(departmentId)
          ? prev.filter((id) => id !== departmentId)
          : [...prev, departmentId]
        localStorage.setItem(DEPARTMENT_STORAGE_KEY, JSON.stringify(newSelection))
        return newSelection
      })
    }
  }

  // For non-superadmin, provide a dummy context that doesn't affect state
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    if (user?.role === 'superadmin') {
      return { selectedDepartments, setSelectedDepartments, toggleDepartment }
    }
    return { selectedDepartments: [], setSelectedDepartments: () => {}, toggleDepartment: () => {} }
  }, [user?.role, selectedDepartments])

  return (
    <DepartmentContext.Provider value={contextValue}>
      {children}
    </DepartmentContext.Provider>
  )
}

export function useDepartment() {
  const context = useContext(DepartmentContext)
  if (context === undefined) {
    // Return safe defaults if context is not available
    return {
      selectedDepartments: [],
      setSelectedDepartments: () => {},
      toggleDepartment: () => {},
    }
  }
  return context
}

