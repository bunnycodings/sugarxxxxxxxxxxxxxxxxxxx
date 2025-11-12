import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllUsers } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    let cookieStore
    try {
      cookieStore = await cookies()
    } catch (cookieError: any) {
      console.error('Cookies error:', cookieError)
      return NextResponse.json(
        { error: 'Failed to access cookies', details: process.env.NODE_ENV === 'development' ? cookieError.message : undefined },
        { status: 500 }
      )
    }
    
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await getAllUsers()
    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error('Get users error:', error)
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Internal server error'
      : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    )
  }
}

