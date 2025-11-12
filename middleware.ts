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
  
  // Check if user has visited main page (required before accessing other pages)
  const hasVisitedMainPage = request.cookies.get('visited_main_page')?.value === 'true'
  
  // Pages that don't require visiting main page first
  const allowedPaths = [
    '/', // Main page itself
    '/api', // API routes
    '/admin', // Admin routes
    '/_next', // Next.js internal
    '/favicon.ico', // Favicon
  ]
  
  const isAllowedPath = allowedPaths.some(allowedPath => 
    path === allowedPath || path.startsWith(allowedPath + '/')
  )
  
  // If user tries to access a page without visiting main page first, redirect to main page
  if (!isAllowedPath && !hasVisitedMainPage && !isVercelInternalRequest(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Set visited main page cookie
  const response = NextResponse.next()
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

