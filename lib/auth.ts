import bcrypt from 'bcryptjs'
import pool from './db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string) {
  try {
    const hashedPassword = await hashPassword(password)
    
    // Generate member ID
    // First, get the next ID by checking existing users
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM users') as any[]
    const count = countResult[0]?.count || 0
    const memberId = `SB${String(count + 1).padStart(6, '0')}`
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, member_id) VALUES (?, ?, ?)',
      [email, hashedPassword, memberId]
    ) as any[]
    
    return { ...result, memberId }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    // If table doesn't exist, try to initialize database
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function createAdmin(email: string, password: string) {
  try {
    const hashedPassword = await hashPassword(password)
    const [result] = await pool.execute(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    )
    return result
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getAdminByEmail(email: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    // If table doesn't exist, try to initialize database
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getAllUsers() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, member_id, created_at FROM users ORDER BY created_at DESC'
    ) as any[]
    return rows
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function resetUserPassword(userId: number, newPassword: string) {
  try {
    const hashedPassword = await hashPassword(newPassword)
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    )
    return result
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getUserById(userId: number) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, member_id, created_at, password FROM users WHERE id = ?',
      [userId]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getUserByMemberId(memberId: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, member_id, created_at FROM users WHERE member_id = ?',
      [memberId]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function updateUserPassword(userId: number, newPassword: string) {
  try {
    const hashedPassword = await hashPassword(newPassword)
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    ) as any[]
    return result.affectedRows > 0
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      console.error('Database tables not found. Please run: npm run setup-db')
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

