import pool from './db'
import { decreaseStockForOrder } from './orders'

export interface Payment {
  id?: number
  order_id: number
  payment_method?: string
  mtcn_no?: string
  sender_name?: string
  transaction_date?: string
  amount: number
  payment_proof_url?: string
  payer_first_name?: string
  payer_last_name?: string
  payer_phone?: string
  payer_address?: string
  payer_city?: string
  payer_country?: string
  stripe_payment_intent_id?: string
  stripe_checkout_session_id?: string
  status: string
  created_at?: string
}

export async function createPayment(payment: Payment) {
  try {
    const paymentMethod = payment.payment_method || 'wise'
    const paymentStatus = payment.status || 'pending'
    
    // Build dynamic query based on payment method
    let query = 'INSERT INTO payments (order_id, payment_method, amount, status'
    let values: any[] = [payment.order_id, paymentMethod, payment.amount, paymentStatus]
    let placeholders = '?, ?, ?, ?'
    
    if (paymentMethod === 'wise' || paymentMethod === 'western_union') {
      query += ', mtcn_no, sender_name, transaction_date'
      placeholders += ', ?, ?, ?'
      values.push(payment.mtcn_no || null, payment.sender_name || null, payment.transaction_date || null)
    }
    
    if (paymentMethod === 'western_union') {
      query += ', payer_first_name, payer_last_name, payer_phone, payer_address, payer_city, payer_country'
      placeholders += ', ?, ?, ?, ?, ?, ?'
      values.push(
        payment.payer_first_name || null,
        payment.payer_last_name || null,
        payment.payer_phone || null,
        payment.payer_address || null,
        payment.payer_city || null,
        payment.payer_country || null
      )
    }
    
    if (payment.payment_proof_url) {
      query += ', payment_proof_url'
      placeholders += ', ?'
      values.push(payment.payment_proof_url)
    }
    
    if (payment.stripe_payment_intent_id) {
      query += ', stripe_payment_intent_id'
      placeholders += ', ?'
      values.push(payment.stripe_payment_intent_id)
    }
    
    if (payment.stripe_checkout_session_id) {
      query += ', stripe_checkout_session_id'
      placeholders += ', ?'
      values.push(payment.stripe_checkout_session_id)
    }
    
    query += `) VALUES (${placeholders})`
    
    const [result] = await pool.execute(query, values) as any[]

    // Get current order status before updating
    const [currentOrderRows] = await pool.execute(
      'SELECT status FROM orders WHERE id = ?',
      [payment.order_id]
    ) as any[]
    
    const previousStatus = currentOrderRows.length > 0 ? currentOrderRows[0].status : null

    // Update order status based on payment status
    const orderStatus = paymentStatus === 'completed' ? 'paid' : 'payment_pending'
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [orderStatus, payment.order_id]
    )

    // Decrease stock if payment is completed and order is being marked as paid for the first time
    if (paymentStatus === 'completed' && previousStatus !== 'paid' && previousStatus !== 'completed') {
      await decreaseStockForOrder(payment.order_id, previousStatus)
    }

    return { id: result.insertId }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

