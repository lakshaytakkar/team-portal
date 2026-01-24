"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { VerticalProvider } from "@/lib/hooks/use-vertical"
import { DepartmentProvider } from "@/lib/hooks/use-department"
import { OrganizationProvider } from "@/lib/hooks/use-organization"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            retry: 1, // Only retry once on failure
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <OrganizationProvider>
          <VerticalProvider>
            <DepartmentProvider>
              {children}
              <Toaster />
            </DepartmentProvider>
          </VerticalProvider>
        </OrganizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

