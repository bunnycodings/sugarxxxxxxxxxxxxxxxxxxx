import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/orders'
import { createPayment } from '@/lib/payments'
import { sendDiscordWebhook } from '@/lib/discord'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, sessionId } = body

    if (!orderId || !sessionId) {
      return NextResponse.json({ error: 'Order ID and session ID are required' }, { status: 400 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const order = await getOrderById(parseInt(orderId))
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify the session with Stripe
    const stripe = require('stripe')(stripeSecretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        verified: false,
        error: 'Payment not completed' 
      }, { status: 200 })
    }

    // Check if payment already exists
    const [existingPayments] = await pool.execute(
      'SELECT id FROM payments WHERE order_id = ? AND stripe_checkout_session_id = ?',
      [orderId, sessionId]
    ) as any[]

    if (existingPayments.length === 0) {
      // Create payment record
      await createPayment({
        order_id: parseInt(orderId),
        payment_method: 'stripe',
        amount: order.total,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'completed'
      })

      // Update order status
      await pool.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['paid', parseInt(orderId)]
      )

      // Send Discord notification
      try {
        const updatedOrder = await getOrderById(parseInt(orderId))
        if (updatedOrder) {
          await sendDiscordWebhook({
            orderId: updatedOrder.id!,
            customerName: updatedOrder.customer_name,
            customerEmail: updatedOrder.customer_email,
            total: updatedOrder.total,
            paymentMethod: 'stripe',
            status: 'completed',
            items: updatedOrder.items.map((item: any) => ({
              name: item.product_name || item.name,
              quantity: item.quantity,
              price: item.price,
              product_code: item.product_code
            }))
          })
        }
      } catch (discordError) {
        console.error('Failed to send Discord notification:', discordError)
        // Don't fail the payment if Discord webhook fails
      }
    }

    return NextResponse.json({ 
      verified: true,
      message: 'Payment verified successfully'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Stripe verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

