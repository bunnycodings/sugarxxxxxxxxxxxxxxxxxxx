import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { decreaseStockForOrder } from '@/lib/orders'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orderId = parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status value
    const validStatuses = ['pending', 'payment_pending', 'paid', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Get current order status before updating
    const [currentOrderRows] = await pool.execute(
      'SELECT status FROM orders WHERE id = ?',
      [orderId]
    ) as any[]
    
    const previousStatus = currentOrderRows.length > 0 ? currentOrderRows[0].status : null

    // Update order status
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    )

    // Decrease stock if order is being marked as paid or completed
    if ((status === 'paid' || status === 'completed') && previousStatus !== 'paid' && previousStatus !== 'completed') {
      await decreaseStockForOrder(orderId, previousStatus)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Update order status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    )
  }
}

