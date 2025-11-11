import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/orders'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Normalize order total to number (MySQL DECIMAL returns as string)
    const normalizedOrder = {
      ...order,
      total: parseFloat(order.total) || 0
    }

    return NextResponse.json({ order: normalizedOrder }, { status: 200 })
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to get order' 
    }, { status: 500 })
  }
}

