"use client"

import * as React from "react"
import type { UserContext } from "@/lib/types/user-context"

interface UserContextValue {
  user: UserContext | null
  isLoading: boolean
}

const UserContext = React.createContext<UserContextValue | undefined>(undefined)

export function UserContextProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: UserContext | null
}) {
  const [user] = React.useState<UserContext | null>(initialUser)

  return (
    <UserContext.Provider value={{ user, isLoading: false }}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * Hook to access current user context
 * Must be used within UserContextProvider
 */
export function useUserContext(): UserContextValue {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within UserContextProvider")
  }
  return context
}

