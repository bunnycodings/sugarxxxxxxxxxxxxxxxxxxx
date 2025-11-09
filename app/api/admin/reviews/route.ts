import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllReviews, approveReview, rejectReview, deleteReview } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviews = await getAllReviews()
    return NextResponse.json({ reviews }, { status: 200 })
  } catch (error: any) {
    console.error('Get reviews error:', error)
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json({ reviews: [] }, { status: 200 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, id } = body

    if (!action || !id) {
      return NextResponse.json({ error: 'Action and ID are required' }, { status: 400 })
    }

    let success = false
    if (action === 'approve') {
      success = await approveReview(id)
    } else if (action === 'reject') {
      success = await rejectReview(id)
    } else if (action === 'delete') {
      success = await deleteReview(id)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: `Review ${action}d successfully` },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Review action error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

