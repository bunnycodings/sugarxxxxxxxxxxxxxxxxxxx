import pool from './db'

export interface Order {
  id?: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  payment_method?: string
  items: any[]
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id?: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
}

export async function createOrder(order: Order) {
  try {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Create order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (customer_name, customer_email, customer_phone, total, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
        [
          order.customer_name,
          order.customer_email,
          order.customer_phone || null,
          order.total,
          'pending',
          order.payment_method || 'stripe'
        ]
      ) as any[]

      const orderId = orderResult.insertId

      // Create order items
      for (const item of order.items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [
            orderId,
            item.id,
            item.name,
            item.quantity,
            item.price
          ]
        )
      }

      await connection.commit()
      return { id: orderId }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getOrderById(id: number) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    ) as any[]
    
    if (rows.length === 0) {
      return null
    }
    
    const order = rows[0]
    
    // Get order items with product codes
    const [itemRows] = await pool.execute(
      `SELECT oi.*, p.product_code 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    ) as any[]
    
    order.items = itemRows || []
    
    return order
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

