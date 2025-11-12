import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { getUserById } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Get approved reviews for public display
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, p.name as product_name, u.email as user_email 
       FROM reviews r 
       LEFT JOIN products p ON r.product_id = p.id 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT 50`
    ) as any[]
    
    return NextResponse.json({ reviews: rows }, { status: 200 })
  } catch (error: any) {
    console.error('Get reviews error:', error)
    
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json({ reviews: [] }, { status: 200 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new review
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')?.value

    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let sessionData
    try {
      sessionData = JSON.parse(userSession)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await getUserById(sessionData.userId)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, rating, comment } = body

    if (!product_id || !rating) {
      return NextResponse.json({ error: 'Product ID and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user has already reviewed this product
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [user.id, product_id]
    ) as any[]

    if (existingReviews.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Check if user has purchased this product (order with status completed)
    const [orders] = await pool.execute(
      `SELECT o.id 
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_email = ? AND oi.product_id = ? AND o.status = 'completed'`
    , [user.email, product_id]) as any[]

    if (orders.length === 0) {
      return NextResponse.json({ 
        error: 'You can only review products you have purchased and received' 
      }, { status: 403 })
    }

    // Create review
    const [result] = await pool.execute(
      'INSERT INTO reviews (product_id, user_id, rating, comment, is_approved) VALUES (?, ?, ?, ?, FALSE)',
      [product_id, user.id, rating, comment || null]
    ) as any[]

    return NextResponse.json({ 
      success: true,
      reviewId: result.insertId,
      message: 'Review submitted successfully. It will be visible after admin approval.'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

