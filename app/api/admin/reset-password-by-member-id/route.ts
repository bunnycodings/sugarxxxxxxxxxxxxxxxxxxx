import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resetUserPassword, getUserByMemberId } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { memberId, newPassword } = await request.json()

    // Validation
    if (!memberId || !newPassword) {
      return NextResponse.json(
        { error: 'Member ID and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user exists by member ID
    const user = await getUserByMemberId(memberId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this Member ID' },
        { status: 404 }
      )
    }

    // Reset password
    await resetUserPassword(user.id, newPassword)

    return NextResponse.json(
      { message: 'Password reset successfully', user: { id: user.id, email: user.email, memberId: user.member_id } },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Reset password error:', error)
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Internal server error'
      : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    )
  }
}

