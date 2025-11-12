import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromSession } from '@/lib/auth'
import { 
  getAllBlockedCountriesIncludingExpired, 
  setBlockedCountries, 
  updateBlockedCountryExpiration,
  removeBlockedCountry,
  calculateExpiration,
  BlockDuration,
  ALL_COUNTRIES 
} from '@/lib/blockedCountries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const countries = await getAllBlockedCountriesIncludingExpired()
    return NextResponse.json({ 
      blockedCountries: countries,
      allCountries: ALL_COUNTRIES
    })
  } catch (error: any) {
    console.error('Error fetching blocked countries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked countries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { country_codes, duration } = await request.json()

    if (!Array.isArray(country_codes)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of country codes.' },
        { status: 400 }
      )
    }

    // Validate all country codes
    const validCodes = country_codes.filter((code: string) => 
      typeof code === 'string' && code.length === 2
    )

    if (validCodes.length === 0) {
      return NextResponse.json(
        { error: 'No valid country codes provided' },
        { status: 400 }
      )
    }

    // Calculate expiration from duration
    const expiresAt = duration ? calculateExpiration(duration as BlockDuration) : null

    await setBlockedCountries(validCodes, expiresAt)
    
    const updated = await getAllBlockedCountriesIncludingExpired()
    return NextResponse.json({ 
      countries: updated, 
      message: `Successfully updated blocked countries (${validCodes.length} countries)` 
    })
  } catch (error: any) {
    console.error('Error updating blocked countries:', error)
    return NextResponse.json(
      { error: 'Failed to update blocked countries' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { country_code, duration } = await request.json()

    if (!country_code || typeof country_code !== 'string' || country_code.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      )
    }

    const expiresAt = duration ? calculateExpiration(duration as BlockDuration) : null
    const updated = await updateBlockedCountryExpiration(country_code, expiresAt)

    if (!updated) {
      return NextResponse.json(
        { error: 'Country not found in blocked list' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      country: updated, 
      message: 'Block expiration updated successfully' 
    })
  } catch (error: any) {
    console.error('Error updating block expiration:', error)
    return NextResponse.json(
      { error: 'Failed to update block expiration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromSession(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const country_code = searchParams.get('country_code')

    if (!country_code || country_code.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      )
    }

    const removed = await removeBlockedCountry(country_code)
    
    if (!removed) {
      return NextResponse.json(
        { error: 'Country not found in blocked list' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Country removed from blocked list' })
  } catch (error: any) {
    console.error('Error removing blocked country:', error)
    return NextResponse.json(
      { error: 'Failed to remove blocked country' },
      { status: 500 }
    )
  }
}

