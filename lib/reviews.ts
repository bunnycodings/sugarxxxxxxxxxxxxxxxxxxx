import pool from './db'

export interface Review {
  id?: number
  product_id: number
  user_id: number
  rating: number
  comment?: string
  is_approved?: boolean
  created_at?: string
  updated_at?: string
}

export async function getAllReviews() {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, p.name as product_name, u.email as user_email 
       FROM reviews r 
       LEFT JOIN products p ON r.product_id = p.id 
       LEFT JOIN users u ON r.user_id = u.id 
       ORDER BY r.created_at DESC`
    ) as any[]
    return rows
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getReviewById(id: number) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE id = ?',
      [id]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function approveReview(id: number) {
  try {
    const [result] = await pool.execute(
      'UPDATE reviews SET is_approved = TRUE WHERE id = ?',
      [id]
    ) as any[]
    return result.affectedRows > 0
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function rejectReview(id: number) {
  try {
    const [result] = await pool.execute(
      'UPDATE reviews SET is_approved = FALSE WHERE id = ?',
      [id]
    ) as any[]
    return result.affectedRows > 0
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function deleteReview(id: number) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM reviews WHERE id = ?',
      [id]
    ) as any[]
    return result.affectedRows > 0
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getApprovedReviews() {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, p.name as product_name, u.email as user_email 
       FROM reviews r 
       LEFT JOIN products p ON r.product_id = p.id 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.is_approved = TRUE
       ORDER BY r.created_at DESC`
    ) as any[]
    return rows
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return []
    }
    throw error
  }
}

export async function getUserReviewForProduct(userId: number, productId: number) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return null
    }
    throw error
  }
}

