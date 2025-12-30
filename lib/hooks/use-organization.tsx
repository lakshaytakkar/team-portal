"use client"

/**
 * Organization Context Hook
 * 
 * IMPORTANT: This context is ONLY used by superadmin and CEO users for organization switching.
 * For other users, the hook returns safe defaults and has no effect.
 * 
 * The organization switcher functionality is completely hidden from non-superadmin/CEO users.
 */

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { useUser } from "./useUser"

const ORGANIZATION_STORAGE_KEY = "selected-organization"

interface OrganizationContextType {
  selectedOrganizations: string[] // Empty array means "All"
  setSelectedOrganizations: (organizations: string[]) => void
  toggleOrganization: (organizationId: string) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [selectedOrganizations, setSelectedOrganizationsState] = useState<string[]>([])

  // Load from localStorage on mount, only if user is superadmin or CEO
  useEffect(() => {
    if (user?.role === 'superadmin' || user?.role === 'ceo') {
      const stored = localStorage.getItem(ORGANIZATION_STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSelectedOrganizationsState(Array.isArray(parsed) ? parsed : [])
        } catch {
          // Legacy format: single value
          setSelectedOrganizationsState(stored === "all" ? [] : [stored])
        }
      }
    } else {
      // Reset for non-superadmin/CEO users
      setSelectedOrganizationsState([])
    }
  }, [user?.role])

  const setSelectedOrganizations = (organizations: string[]) => {
    if (user?.role === 'superadmin' || user?.role === 'ceo') {
      setSelectedOrganizationsState(organizations)
      // Store in localStorage
      localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(organizations))
    }
  }

  const toggleOrganization = (organizationId: string) => {
    if (user?.role === 'superadmin' || user?.role === 'ceo') {
      setSelectedOrganizationsState((prev) => {
        const newSelection = prev.includes(organizationId)
          ? prev.filter((id) => id !== organizationId)
          : [...prev, organizationId]
        localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(newSelection))
        return newSelection
      })
    }
  }

  // For non-superadmin/CEO, provide a dummy context that doesn't affect state
  const contextValue = (user?.role === 'superadmin' || user?.role === 'ceo')
    ? { selectedOrganizations, setSelectedOrganizations, toggleOrganization }
    : { selectedOrganizations: [], setSelectedOrganizations: () => {}, toggleOrganization: () => {} }

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  )
}

/**
 * Hook to access organization context
 * Returns safe defaults if context is not available
 * This allows the hook to be used conditionally without errors
 */
export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    // Return safe defaults if context is not available
    // This prevents errors when hook is used outside provider
    return {
      selectedOrganizations: [],
      setSelectedOrganizations: () => {},
      toggleOrganization: () => {},
    }
  }
  return context
}

