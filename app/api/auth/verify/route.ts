import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Session check:', { 
        hasSession: !!userSession,
        sessionValue: userSession?.value ? 'exists' : 'missing'
      })
    }

    if (!userSession) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    try {
      const sessionData = JSON.parse(userSession.value)
      
      // Get full user info including member_id
      const { getUserById } = await import('@/lib/auth')
      const user = await getUserById(sessionData.userId)
      
      if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 200 })
      }
      
      return NextResponse.json({ 
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          memberId: user.member_id
        }
      }, { status: 200 })
    } catch {
      // Invalid session data
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}

