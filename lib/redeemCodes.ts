import pool from './db'
import crypto from 'crypto'

export interface RedeemCode {
  id?: number
  code: string
  product_id?: number | null
  discount_percent?: number
  discount_amount?: number
  max_uses?: number
  used_count?: number
  expires_at?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export function generateCode(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function getAllRedeemCodes() {
  try {
    const [rows] = await pool.execute(
      `SELECT rc.*, p.name as product_name 
       FROM redeem_codes rc 
       LEFT JOIN products p ON rc.product_id = p.id 
       ORDER BY rc.created_at DESC`
    ) as any[]
    return rows
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getRedeemCodeByCode(code: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM redeem_codes WHERE code = ?',
      [code]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function createRedeemCode(codeData: Partial<RedeemCode>) {
  try {
    // Generate unique code if not provided
    let code = codeData.code
    if (!code) {
      let attempts = 0
      do {
        code = generateCode()
        const existing = await getRedeemCodeByCode(code)
        if (!existing) break
        attempts++
        if (attempts > 10) {
          code = generateCode(16) // Try longer code
        }
      } while (attempts < 20)
    }

    const [result] = await pool.execute(
      'INSERT INTO redeem_codes (code, product_id, discount_percent, discount_amount, max_uses, expires_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        code,
        codeData.product_id || null,
        codeData.discount_percent || 0,
        codeData.discount_amount || 0,
        codeData.max_uses || 1,
        codeData.expires_at || null,
        codeData.is_active !== undefined ? codeData.is_active : true
      ]
    ) as any[]
    return { id: result.insertId, code }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Code already exists. Try generating a new one.')
    }
    throw error
  }
}

export async function deleteRedeemCode(id: number) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM redeem_codes WHERE id = ?',
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

