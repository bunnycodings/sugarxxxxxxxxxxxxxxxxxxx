import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/payments'
import { sendDiscordWebhook } from '@/lib/discord'
import pool from '@/lib/db'
import { getOrderById } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const stripe = require('stripe')(stripeSecretKey)
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event
    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret || stripeSecretKey // Fallback to secret key if webhook secret not set
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.order_id

      if (!orderId) {
        console.error('No order_id in session metadata')
        return NextResponse.json({ received: true }, { status: 200 })
      }

      // Check if payment already exists
      const [existingPayments] = await pool.execute(
        'SELECT id FROM payments WHERE order_id = ? AND stripe_checkout_session_id = ?',
        [orderId, session.id]
      ) as any[]

      if (existingPayments.length === 0) {
        const order = await getOrderById(parseInt(orderId))
        if (order) {
          // Create payment record
          await createPayment({
            order_id: parseInt(orderId),
            payment_method: 'stripe',
            amount: order.total,
            stripe_checkout_session_id: session.id,
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
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

