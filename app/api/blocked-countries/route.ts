import { NextResponse } from 'next/server'
import { getBlockedCountryCodes } from '@/lib/blockedCountries'

export const dynamic = 'force-dynamic'

// Cache for blocked countries (5 minutes)
let cachedBlockedCountries: string[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  try {
    const now = Date.now()
    
    // Return cached data if still valid
    if (cachedBlockedCountries && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({ countries: cachedBlockedCountries })
    }

    // Fetch fresh data from database
    const countries = await getBlockedCountryCodes()
    
    // Update cache
    cachedBlockedCountries = countries
    cacheTimestamp = now

    return NextResponse.json({ countries })
  } catch (error: any) {
    console.error('Error fetching blocked countries:', error)
    // Return empty array on error (fail open)
    return NextResponse.json({ countries: [] })
  }
}

// Function to clear cache (can be called when countries are updated)
export function clearBlockedCountriesCache() {
  cachedBlockedCountries = null
  cacheTimestamp = 0
}

