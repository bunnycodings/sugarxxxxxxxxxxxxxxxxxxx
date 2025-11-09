import pool from './db'

export interface Payment {
  id?: number
  order_id: number
  mtcn_no: string
  sender_name: string
  transaction_date: string
  amount: number
  payment_proof_url?: string
  status: string
  created_at?: string
}

export async function createPayment(payment: Payment) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO payments (order_id, mtcn_no, sender_name, transaction_date, amount, payment_proof_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        payment.order_id,
        payment.mtcn_no,
        payment.sender_name,
        payment.transaction_date,
        payment.amount,
        payment.payment_proof_url || null,
        'pending'
      ]
    ) as any[]

    // Update order status
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['payment_pending', payment.order_id]
    )

    return { id: result.insertId }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

