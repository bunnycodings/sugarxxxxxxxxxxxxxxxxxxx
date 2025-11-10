import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      // Return 200 with authenticated: false to prevent console errors
      // This is a status check, not an authentication failure
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      )
    }

    // Verify session (in a real app, you'd check the database)
    // For simplicity, we'll just check if the cookie exists
    // In production, verify against admin_sessions table
    
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    )
  } catch (error) {
    // Return 200 with authenticated: false to prevent console errors
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    )
  }
}

