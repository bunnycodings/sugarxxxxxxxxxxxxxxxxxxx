import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all orders with their items and payment details
    const [orders] = await pool.execute(
      `SELECT o.*, 
       GROUP_CONCAT(
         CONCAT(oi.product_name, ' (x', oi.quantity, ')')
         SEPARATOR ', '
       ) as items_summary
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    ) as any[]

    // Get order items and payment details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order: any) => {
        // Get order items
        const [items] = await pool.execute(
          `SELECT oi.*, p.name as product_name, p.product_code
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        ) as any[]

        // Get payment details if exists
        const [payments] = await pool.execute(
          `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
          [order.id]
        ) as any[]

        return {
          ...order,
          items: items || [],
          payment: payments[0] || null
        }
      })
    )

    return NextResponse.json({ orders: ordersWithDetails }, { status: 200 })
  } catch (error: any) {
    console.error('Get admin orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get orders' },
      { status: 500 }
    )
  }
}

