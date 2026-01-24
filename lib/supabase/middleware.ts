import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth token and get user
  // Using getUser() which is compatible with @supabase/ssr
  let user = null
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (!authError && authUser) {
      user = authUser
    }
  } catch (error) {
    // If auth check fails, user remains null (not authenticated)
    // Silently continue - don't block the request
  }

  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/sign-in',
    '/forgot-password',
    '/reset-password',
  ]

  // Also allow static assets, API routes, and Next.js internal routes
  const isPublicRoute = 
    publicRoutes.includes(pathname) || 
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/dev') || // Allow dev routes
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)

  // Root path is public (info page)
  const isRootPath = pathname === '/'

  // If the route is NOT public, NOT root, and user is not authenticated, redirect to sign-in
  if (!isPublicRoute && !isRootPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Protect root path - redirect to dashboard if logged in, or allow if not
  if (isRootPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/projects'
    return NextResponse.redirect(url)
  }

  // Don't redirect away from sign-in/sign-up pages - let the client-side handle it
  // This allows users to explicitly navigate to sign-in even if they have a session
  // The sign-in page will handle showing appropriate message or redirecting client-side

  return supabaseResponse
}
