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
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
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

