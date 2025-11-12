import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendVisitorTrackingWebhook } from '@/lib/discord'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

// Cache for blocked countries (in-memory, resets on server restart)
// This cache is shared across all middleware executions
let blockedCountriesCache: string[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Track which computer IDs have already been tracked to prevent duplicates
const trackedComputerIds = new Set<string>()

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

function isVercelIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return false
  
  // Vercel IP ranges and known IPs
  // Vercel uses various IP ranges for their infrastructure
  const vercelIPs = [
    '76.76.21.', // Vercel IP range
    '76.76.22.', // Vercel IP range
    '76.76.23.', // Vercel IP range
  ]
  
  // Check if IP starts with any Vercel IP prefix
  return vercelIPs.some(prefix => ip.startsWith(prefix))
}

function isVercelInternalRequest(request: NextRequest): boolean {
  // Check for Vercel internal request indicators
  // Vercel adds specific headers for internal requests
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check for Vercel screenshot requests
  if (userAgent.toLowerCase().includes('vercel-screenshot')) {
    return true
  }
  
  // Check if it's a Vercel internal request (SSR, edge functions, etc.)
  // Vercel internal requests often have specific patterns
  if (userAgent.includes('vercel') && userAgent.includes('bot')) {
    return true
  }
  
  // Check for Vercel IP
  const ip = request.ip || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') ||
             'unknown'
  
  if (isVercelIP(ip)) {
    return true
  }
  
  // Check for Vercel internal headers (middleware rewrites, etc.)
  // These indicate internal Vercel infrastructure requests
  if (request.headers.get('x-middleware-rewrite') || 
      request.headers.get('x-vercel-cache') === 'HIT') {
    return true
  }
  
  return false
}

async function getLocationDetails(ip: string): Promise<{
  country?: string
  countryName?: string
  city?: string
  region?: string
  timezone?: string
  isp?: string
  isVpn?: boolean
} | null> {
  // Skip localhost and private IPs
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null
  }
  
  // Skip Vercel IPs
  if (isVercelIP(ip)) {
    return null
  }

  try {
    // Use ipapi.co to get detailed location information including VPN detection
    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'SugarBunny-Stores/1.0'
      }
    })
    
    if (geoResponse.ok) {
      const geoData = await geoResponse.json()
      // Check for VPN/Proxy - ipapi.co returns 'vpn' field (true/false)
      // Also check if the ISP name contains common VPN indicators
      const isVpn = geoData.vpn === true || 
                   geoData.proxy === true ||
                   (geoData.org && (
                     geoData.org.toLowerCase().includes('vpn') ||
                     geoData.org.toLowerCase().includes('proxy') ||
                     geoData.org.toLowerCase().includes('hosting') ||
                     geoData.org.toLowerCase().includes('datacenter')
                   ))
      
      return {
        country: geoData.country_code || undefined,
        countryName: geoData.country_name || undefined,
        city: geoData.city || undefined,
        region: geoData.region || undefined,
        timezone: geoData.timezone || undefined,
        isp: geoData.org || undefined,
        isVpn: isVpn || false
      }
    }
  } catch (error) {
    console.error('Error fetching location details:', error)
  }
  
  return null
}

function generateComputerId(): string {
  // Generate a unique computer ID using crypto
  return crypto.randomUUID()
}

async function getUserPersonalInfo(userId: number): Promise<{
  email?: string
  realName?: string
  address?: string
  userCity?: string
  discord?: string
} | null> {
  try {
    // Get user email
    const [userRows] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    ) as any[]
    
    if (userRows.length === 0) {
      return null
    }
    
    const email = userRows[0].email
    
    // Get latest order to extract customer name
    const [orderRows] = await pool.execute(
      'SELECT customer_name FROM orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    ) as any[]
    
    // Get latest payment to extract address, city, name
    const [paymentRows] = await pool.execute(
      `SELECT payer_first_name, payer_last_name, payer_address, payer_city 
       FROM payments 
       WHERE order_id IN (SELECT id FROM orders WHERE customer_email = ?) 
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    ) as any[]
    
    const result: {
      email?: string
      realName?: string
      address?: string
      userCity?: string
      discord?: string
    } = {
      email
    }
    
    // Get name from order or payment
    if (orderRows.length > 0 && orderRows[0].customer_name) {
      result.realName = orderRows[0].customer_name
    } else if (paymentRows.length > 0) {
      const firstName = paymentRows[0].payer_first_name || ''
      const lastName = paymentRows[0].payer_last_name || ''
      if (firstName || lastName) {
        result.realName = `${firstName} ${lastName}`.trim()
      }
    }
    
    // Get address and city from payment
    if (paymentRows.length > 0) {
      if (paymentRows[0].payer_address) {
        result.address = paymentRows[0].payer_address
      }
      if (paymentRows[0].payer_city) {
        result.userCity = paymentRows[0].payer_city
      }
    }
    
    // Note: Discord would need to be added to users table or collected separately
    // For now, we'll leave it empty but the interface supports it
    
    return result
  } catch (error) {
    console.error('Error fetching user personal info:', error)
    return null
  }
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
  
  // Get IP address
  const ip = request.ip || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') ||
             'unknown'
  
  // Get country from Vercel's geolocation (if available)
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country')
  
  // Fetch blocked countries from database (with caching)
  const blockedCountries = await getBlockedCountries()
  
  let isBlocked = false
  let detectedCountry = country?.toUpperCase()
  let isVpn = false
  
  // Get location details including VPN detection
  let locationData: { country?: string; countryName?: string; city?: string; region?: string; timezone?: string; isp?: string; isVpn?: boolean } | null = null
  
  // Only check location if we have a real IP
  if (ip && ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      locationData = await getLocationDetails(ip)
      if (locationData) {
        isVpn = locationData.isVpn || false
        // Use location data for country if Vercel geo is not available
        if (!detectedCountry && locationData.country) {
          detectedCountry = locationData.country.toUpperCase()
        }
      }
    } catch (error) {
      console.error('Error getting location details:', error)
    }
  }
  
  // If country is in blocked list, check if VPN (VPN bypasses blocking)
  if (country && blockedCountries.length > 0 && blockedCountries.includes(country.toUpperCase())) {
    if (!isVpn) {
      isBlocked = true
      detectedCountry = country.toUpperCase()
    }
    // If VPN, allow access but still track it
  }
  
  // Fallback: If no geolocation available, try to detect from IP
  // This is useful for local development or non-Vercel deployments
  if (!detectedCountry && blockedCountries.length > 0 && !isVpn) {
    try {
      // Only check if we have a real IP (not localhost)
      if (ip && ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        // Use a free IP geolocation API as fallback
        const geoResponse = await fetch(`https://ipapi.co/${ip}/country_code/`, {
          headers: {
            'User-Agent': 'SugarBunny-Stores/1.0'
          }
        })
        
        if (geoResponse.ok) {
          const countryCode = await geoResponse.text().then(t => t.trim().toUpperCase())
          if (countryCode) {
            detectedCountry = countryCode
            // Only block if not VPN
            if (blockedCountries.includes(countryCode) && !isVpn) {
              isBlocked = true
            }
          }
        }
      }
    } catch (error) {
      // If geolocation check fails, allow access (fail open)
      // This prevents blocking legitimate users if the service is down
      console.error('Geolocation check failed:', error)
    }
  }
  
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
    
    // Track visitor asynchronously (don't block the request)
    // Use location data we already fetched, or fetch it if we don't have it
    if (locationData) {
      // We already have location data, send it immediately
      sendVisitorTrackingWebhook({
        computerId,
        country: detectedCountry || locationData.country,
        countryName: locationData.countryName,
        city: locationData.city,
        region: locationData.region,
        timezone: locationData.timezone,
        isp: locationData.isp,
        userAgent: request.headers.get('user-agent') || undefined,
        path,
        isBlocked,
        isVpn: locationData.isVpn,
        ...(userInfo || {})
      }).catch(err => {
        console.error('Failed to send visitor tracking:', err)
      })
    } else {
      // Fetch location details if we don't have them yet (still get location info)
      getLocationDetails(ip).then(locData => {
        sendVisitorTrackingWebhook({
          computerId,
          country: detectedCountry || locData?.country,
          countryName: locData?.countryName,
          city: locData?.city,
          region: locData?.region,
          timezone: locData?.timezone,
          isp: locData?.isp,
          userAgent: request.headers.get('user-agent') || undefined,
          path,
          isBlocked,
          isVpn: locData?.isVpn || false,
          ...(userInfo || {})
        }).catch(err => {
          console.error('Failed to send visitor tracking:', err)
        })
      }).catch(err => {
        // If location fetch fails, still send basic tracking
        sendVisitorTrackingWebhook({
          computerId,
          country: detectedCountry,
          userAgent: request.headers.get('user-agent') || undefined,
          path,
          isBlocked,
          isVpn: false,
          ...(userInfo || {})
        }).catch(err => {
          console.error('Failed to send visitor tracking:', err)
        })
      })
    }
  }
  
  // If blocked, redirect to blocked page
  if (isBlocked) {
    return NextResponse.redirect(new URL('/blocked', request.url))
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
     * - blocked (the blocked page itself)
     * 
     * Note: API routes are also blocked for blocked country IPs
     */
    '/((?!_next/static|_next/image|favicon.ico|blocked).*)',
  ],
}

