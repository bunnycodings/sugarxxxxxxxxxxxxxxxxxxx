import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders'
import pool, { executeWithRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, total, customer, payment_method, redeem_code } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }

    // Validate total - check for null, undefined, NaN, or < 0 (allow 0 for testing)
    const totalValue = typeof total === 'string' ? parseFloat(total) : Number(total)
    if (totalValue === null || totalValue === undefined || isNaN(totalValue) || totalValue < 0) {
      console.error('Invalid total received:', { total, totalValue, type: typeof total })
      return NextResponse.json({ 
        error: 'Valid total is required. Please refresh the page and try again.' 
      }, { status: 400 })
    }

    if (!customer || !customer.name || !customer.email) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 })
    }

    // Check stock availability for all items before creating order
    for (const item of items) {
      try {
        const result = await executeWithRetry(async () =>
          pool.execute('SELECT stock FROM products WHERE id = ?', [item.id])
        ) as any[]
        const [rows] = result
        
        if (rows.length === 0) {
          return NextResponse.json({ 
            error: `Product "${item.name}" not found` 
          }, { status: 400 })
        }
        
        const productStock = rows[0].stock || 0
        if (productStock <= 0) {
          return NextResponse.json({ 
            error: `"${item.name}" is out of stock and cannot be purchased` 
          }, { status: 400 })
        }
        
        if (item.quantity > productStock) {
          return NextResponse.json({ 
            error: `Insufficient stock for "${item.name}". Only ${productStock} available, but ${item.quantity} requested.` 
          }, { status: 400 })
        }
      } catch (error: any) {
        console.error('Stock check error:', error)
        return NextResponse.json({ 
          error: `Failed to check stock for "${item.name}"` 
        }, { status: 500 })
      }
    }

    const order = await createOrder({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || null,
      total: totalValue, // Use the validated totalValue
      status: 'pending',
      payment_method: payment_method || 'wise',
      items: items
    })

    // If redeem code was used, increment its usage count
    if (redeem_code) {
      try {
        await pool.execute(
          'UPDATE redeem_codes SET used_count = COALESCE(used_count, 0) + 1 WHERE code = ?',
          [redeem_code.toUpperCase().trim()]
        )
      } catch (redeemError) {
        console.error('Failed to update redeem code usage:', redeemError)
        // Don't fail the order if redeem code update fails
      }
    }

    return NextResponse.json({ 
      success: true,
      orderId: order.id 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create order' 
    }, { status: 500 })
  }
}

