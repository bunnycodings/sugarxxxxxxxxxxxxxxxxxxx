import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Blocked country code (UK)
const BLOCKED_COUNTRY = 'GB'

export async function middleware(request: NextRequest) {
  // Get country from Vercel's geolocation (if available)
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country')
  
  // If country is UK, block access
  if (country === BLOCKED_COUNTRY) {
    return NextResponse.redirect(new URL('/blocked', request.url))
  }
  
  // Fallback: If no geolocation available, try to detect from IP
  // This is useful for local development or non-Vercel deployments
  if (!country) {
    try {
      const ip = request.ip || 
                 request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') ||
                 'unknown'
      
      // Only check if we have a real IP (not localhost)
      if (ip && ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        // Use a free IP geolocation API as fallback
        const geoResponse = await fetch(`https://ipapi.co/${ip}/country_code/`, {
          headers: {
            'User-Agent': 'SugarBunny-Stores/1.0'
          }
        })
        
        if (geoResponse.ok) {
          const detectedCountry = await geoResponse.text()
          if (detectedCountry.trim() === BLOCKED_COUNTRY) {
            return NextResponse.redirect(new URL('/blocked', request.url))
          }
        }
      }
    } catch (error) {
      // If geolocation check fails, allow access (fail open)
      // This prevents blocking legitimate users if the service is down
      console.error('Geolocation check failed:', error)
    }
  }
  
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - blocked (the blocked page itself)
     * 
     * Note: API routes are also blocked for UK IPs
     */
    '/((?!_next/static|_next/image|favicon.ico|blocked).*)',
  ],
}

