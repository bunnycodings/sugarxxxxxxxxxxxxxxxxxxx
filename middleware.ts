import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isVercelInternalRequest(request: NextRequest): boolean {
  // Check for Vercel internal request indicators
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check for Vercel screenshot requests
  if (userAgent.toLowerCase().includes('vercel-screenshot')) {
    return true
  }
  
  // Check if it's a Vercel internal request (SSR, edge functions, etc.)
  if (userAgent.includes('vercel') && userAgent.includes('bot')) {
    return true
  }
  
  // Check for Vercel internal headers (middleware rewrites, etc.)
  if (request.headers.get('x-middleware-rewrite') || 
      request.headers.get('x-vercel-cache') === 'HIT') {
    return true
  }
  
  return false
}


export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Get or create computer ID
  let computerId = request.cookies.get('computer_id')?.value
  if (!computerId) {
    computerId = generateComputerId()
  }
  
  // Check if user has visited main page (required before accessing other pages)
  const hasVisitedMainPage = request.cookies.get('visited_main_page')?.value === 'true'
  
  // Pages that don't require visiting main page first
  const allowedPaths = [
    '/', // Main page itself
    '/api', // API routes
    '/admin', // Admin routes
    '/_next', // Next.js internal
    '/favicon.ico', // Favicon
    '/blocked', // Blocked page
  ]
  
  const isAllowedPath = allowedPaths.some(allowedPath => 
    path === allowedPath || path.startsWith(allowedPath + '/')
  )
  
  // If user tries to access a page without visiting main page first, redirect to main page
  if (!isAllowedPath && !hasVisitedMainPage && !isVercelInternalRequest(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Get country from Vercel's geolocation (if available) - for tracking only
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country')
  const detectedCountry = country?.toUpperCase()
  
  // Track visitor ONLY on the main page (/) and skip Vercel internal requests
  const isMainPage = path === '/'
  const isVercelRequest = isVercelInternalRequest(request)
  const shouldTrack = isMainPage && !isVercelRequest
  
  // Check if this computer ID has already been tracked (prevent duplicates)
  const hasBeenTracked = trackedComputerIds.has(computerId)
  
  if (shouldTrack && !hasBeenTracked) {
    // Mark this computer ID as tracked
    trackedComputerIds.add(computerId)
    
    // Limit the Set size to prevent memory issues (keep last 1000 computer IDs)
    if (trackedComputerIds.size > 1000) {
      const firstId = trackedComputerIds.values().next().value
      if (firstId) {
        trackedComputerIds.delete(firstId)
      }
    }
    
    // Get user personal information if logged in
    let userInfo: { email?: string; realName?: string; address?: string; userCity?: string; discord?: string } | null = null
    try {
      const cookieStore = await cookies()
      const userSession = cookieStore.get('user_session')
      if (userSession) {
        try {
          const sessionData = JSON.parse(userSession.value)
          if (sessionData.userId) {
            userInfo = await getUserPersonalInfo(sessionData.userId)
          }
        } catch (e) {
          // Invalid session data, ignore
        }
      }
    } catch (error) {
      // Failed to get user info, continue without it
      console.error('Error getting user session:', error)
    }
    
    // Visitor tracking removed
  }
  
  // Set cookies when user visits main page
  const response = NextResponse.next()
  
  // Set computer ID cookie (persistent, 1 year)
  if (!request.cookies.get('computer_id')) {
    response.cookies.set('computer_id', computerId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }
  
  // Set visited main page cookie
  if (path === '/' && !hasVisitedMainPage) {
    response.cookies.set('visited_main_page', 'true', {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }
  
  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

