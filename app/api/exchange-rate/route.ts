import { NextRequest, NextResponse } from 'next/server'

// Cache for exchange rate
let cachedRate: { rate: number; lastUpdated: string; date: string } | null = null

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Check if we have a cached rate for today
    if (cachedRate && cachedRate.date === today) {
      return NextResponse.json({
        rate: cachedRate.rate,
        lastUpdated: cachedRate.lastUpdated,
        date: cachedRate.date
      }, { status: 200 })
    }

    // Fetch new rate from API
    // Using exchangerate-api.com (free, no API key required)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 86400 } // Revalidate once per day (24 hours)
    })

    if (!response.ok) {
      // If API fails, try alternative API
      const altResponse = await fetch('https://open.er-api.com/v6/latest/USD', {
        next: { revalidate: 86400 }
      })
      
      if (!altResponse.ok) {
        // Use fallback rate if all APIs fail
        const fallbackRate = 35.5
        cachedRate = {
          rate: fallbackRate,
          lastUpdated: new Date().toISOString(),
          date: today
        }
        return NextResponse.json({
          rate: fallbackRate,
          lastUpdated: cachedRate.lastUpdated,
          date: today,
          source: 'fallback'
        }, { status: 200 })
      }

      const altData = await altResponse.json()
      const thbRate = altData.rates?.THB || 35.5
      
      cachedRate = {
        rate: thbRate,
        lastUpdated: new Date().toISOString(),
        date: today
      }
      
      return NextResponse.json({
        rate: thbRate,
        lastUpdated: cachedRate.lastUpdated,
        date: today,
        source: 'open.er-api.com'
      }, { status: 200 })
    }

    const data = await response.json()
    const thbRate = data.rates?.THB || 35.5

    // Cache the rate for today
    cachedRate = {
      rate: thbRate,
      lastUpdated: new Date().toISOString(),
      date: today
    }

    return NextResponse.json({
      rate: thbRate,
      lastUpdated: cachedRate.lastUpdated,
      date: today,
      source: 'exchangerate-api.com'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Exchange rate API error:', error)
    
    // Return fallback rate if error occurs
    const fallbackRate = cachedRate?.rate || 35.5
    return NextResponse.json({
      rate: fallbackRate,
      lastUpdated: cachedRate?.lastUpdated || new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      source: 'cached'
    }, { status: 200 })
  }
}

