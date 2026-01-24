import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { UserContextProvider } from "@/lib/providers/UserContextProvider"
import { getCurrentUserContext } from "@/lib/utils/user-context"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Load user context once at layout level
  const userContext = await getCurrentUserContext()

  // Redirect to sign-in if not authenticated
  if (!userContext) {
    redirect('/sign-in')
  }

  return (
    <ErrorBoundary>
      <UserContextProvider initialUser={userContext}>
        <DashboardLayout>{children}</DashboardLayout>
      </UserContextProvider>
    </ErrorBoundary>
  )
}

