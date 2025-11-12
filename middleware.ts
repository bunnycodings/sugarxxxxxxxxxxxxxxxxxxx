import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cache for blocked countries (in-memory, resets on server restart)
// This cache is shared across all middleware executions
let blockedCountriesCache: string[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getBlockedCountries(): Promise<string[]> {
  const now = Date.now()
  
  // Return cached data if still valid
  if (blockedCountriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return blockedCountriesCache
  }

  try {
    // Fetch from API endpoint (which also has its own caching)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   ''
    
    const response = await fetch(`${baseUrl}/api/blocked-countries`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'SugarBunny-Stores-Middleware/1.0'
      }
    })

    if (response.ok) {
      const data = await response.json()
      blockedCountriesCache = data.countries || []
      cacheTimestamp = now
      return blockedCountriesCache || []
    }
  } catch (error) {
    console.error('Error fetching blocked countries in middleware:', error)
    // If fetch fails, use cached data if available, otherwise allow access (fail open)
    if (blockedCountriesCache) {
      return blockedCountriesCache
    }
  }

  // Default to empty array (fail open - allow access if we can't determine blocked countries)
  return []
}

export async function middleware(request: NextRequest) {
  // Get country from Vercel's geolocation (if available)
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country')
  
  // Fetch blocked countries from database (with caching)
  const blockedCountries = await getBlockedCountries()
  
  // If country is in blocked list, block access
  if (country && blockedCountries.length > 0 && blockedCountries.includes(country.toUpperCase())) {
    return NextResponse.redirect(new URL('/blocked', request.url))
  }
  
  // Fallback: If no geolocation available, try to detect from IP
  // This is useful for local development or non-Vercel deployments
  if (!country && blockedCountries.length > 0) {
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
          const detectedCountry = await geoResponse.text().then(t => t.trim().toUpperCase())
          if (blockedCountries.includes(detectedCountry)) {
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
     * Note: API routes are also blocked for blocked country IPs
     */
    '/((?!_next/static|_next/image|favicon.ico|blocked).*)',
  ],
}

