import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await getOrderById(parseInt(orderId))
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Create Stripe Checkout Session
    const stripe = require('stripe')(stripeSecretKey)
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: `Order #${orderId}`,
              description: `Payment for order #${orderId}`,
            },
            unit_amount: Math.round(order.total * 100), // Convert to satang (cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/${orderId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/${orderId}`,
      customer_email: order.customer_email,
      metadata: {
        order_id: orderId.toString(),
      },
    })

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe payment session' },
      { status: 500 }
    )
  }
}

