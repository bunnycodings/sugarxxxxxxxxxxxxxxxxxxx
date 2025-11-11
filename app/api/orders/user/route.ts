import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')

    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: number
    try {
      const sessionData = JSON.parse(userSession.value)
      userId = sessionData.userId
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get orders for this user by email
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE customer_email = (SELECT email FROM users WHERE id = ?) ORDER BY created_at DESC',
      [userId]
    ) as any[]

    // Get order items with product file URLs for each order
    const ordersWithItems = await Promise.all(
      rows.map(async (order: any) => {
        const [items] = await pool.execute(
          `SELECT oi.*, p.file_url 
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        ) as any[]
        return { ...order, items: items || [] }
      })
    )

    return NextResponse.json({ orders: ordersWithItems || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Get user orders error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to get orders' 
    }, { status: 500 })
  }
}

