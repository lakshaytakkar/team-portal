/**
 * Route guard utilities for v1 authorization
 * Enforces access rules based on user context
 */

import { redirect } from 'next/navigation'
import type { UserContext } from '@/lib/types/user-context'

/**
 * Check if user can access a route
 * Returns true if allowed, false otherwise
 */
export function canAccessRoute(pathname: string, user: UserContext | null): boolean {
  if (!user) {
    return false
  }

  // /my-* routes are accessible to both employee and superadmin
  if (pathname.startsWith('/my-')) {
    return true
  }

  // Org-wide routes require superadmin
  const orgWideRoutes = [
    '/tasks',
    '/projects',
    '/admin',
    '/ceo',
  ]

  const isOrgWideRoute = orgWideRoutes.some(route => pathname.startsWith(route))

  if (isOrgWideRoute) {
    return user.isSuperadmin
  }

  // Knowledge base and resources are accessible to all
  if (pathname === '/knowledge-base' || pathname === '/my-resources') {
    return true
  }

  // Default: allow access (other routes may have their own guards)
  return true
}

/**
 * Get default redirect path based on user role
 */
export function getDefaultPath(user: UserContext | null): string {
  if (!user) {
    return '/sign-in'
  }

  if (user.isSuperadmin) {
    return '/tasks'
  }

  return '/my-tasks'
}

/**
 * Guard a route - redirects if user cannot access
 * Use this in page components or layout
 */
export async function guardRoute(
  pathname: string,
  user: UserContext | null
): Promise<void> {
  if (!user) {
    redirect('/sign-in')
  }

  if (!canAccessRoute(pathname, user)) {
    redirect(getDefaultPath(user))
  }
}

