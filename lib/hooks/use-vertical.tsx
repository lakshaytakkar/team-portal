"use client"

/**
 * Vertical Context Hook
 * 
 * IMPORTANT: This context is ONLY used by superadmin users for vertical switching.
 * For non-superadmin users, the hook returns safe defaults and has no effect.
 * 
 * The vertical switcher functionality is completely hidden from non-superadmin users.
 */

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from "react"

const VERTICAL_STORAGE_KEY = "selected-vertical"

interface VerticalContextType {
  selectedVerticals: string[] // Empty array means "All"
  setSelectedVerticals: (verticals: string[]) => void
  toggleVertical: (verticalId: string) => void
}

const VerticalContext = createContext<VerticalContextType | undefined>(undefined)

export function VerticalProvider({ children }: { children: ReactNode }) {
  const [selectedVerticals, setSelectedVerticalsState] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(VERTICAL_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSelectedVerticalsState(Array.isArray(parsed) ? parsed : [])
      } catch {
        // Legacy format: single value
        setSelectedVerticalsState(stored === "all" ? [] : [stored])
      }
    }
  }, [])

  const setSelectedVerticals = (verticals: string[]) => {
    setSelectedVerticalsState(verticals)
    // Store in localStorage
    localStorage.setItem(VERTICAL_STORAGE_KEY, JSON.stringify(verticals))
  }

  const toggleVertical = (verticalId: string) => {
    setSelectedVerticalsState((prev) => {
      const newSelection = prev.includes(verticalId)
        ? prev.filter((id) => id !== verticalId)
        : [...prev, verticalId]
      localStorage.setItem(VERTICAL_STORAGE_KEY, JSON.stringify(newSelection))
      return newSelection
    })
  }

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    selectedVerticals,
    setSelectedVerticals,
    toggleVertical,
  }), [selectedVerticals])

  return (
    <VerticalContext.Provider value={contextValue}>
      {children}
    </VerticalContext.Provider>
  )
}

/**
 * Hook to access vertical context
 * Returns safe defaults if context is not available
 * This allows the hook to be used conditionally without errors
 */
export function useVertical() {
  const context = useContext(VerticalContext)
  if (context === undefined) {
    // Return safe defaults if context is not available
    // This prevents errors when hook is used outside provider
    return {
      selectedVerticals: [],
      setSelectedVerticals: () => {},
      toggleVertical: () => {},
    }
  }
  return context
}

