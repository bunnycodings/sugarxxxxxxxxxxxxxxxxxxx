import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get payment settings from database
    const [rows] = await pool.execute(
      'SELECT * FROM payment_settings LIMIT 1'
    ) as any[]

    if (rows.length === 0) {
      // Return default values if no settings exist
      return NextResponse.json({
        settings: {
          wise_account_name: 'Zhong Jie Yong',
          wise_account_number: '1101402249826',
          wise_bank: 'Kasikorn Bank (K-Bank)',
          wise_swift: 'KASITHBK',
          western_union_name: 'Zhong Jie Yong',
          western_union_account_number: '1101402249826',
          western_union_phone: '098-887-0075'
        }
      })
    }

    return NextResponse.json({ settings: rows[0] })
  } catch (error: any) {
    console.error('Get payment settings error:', error)
    // If table doesn't exist, return defaults
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json({
        settings: {
          wise_account_name: 'Zhong Jie Yong',
          wise_account_number: '1101402249826',
          wise_bank: 'Kasikorn Bank (K-Bank)',
          wise_swift: 'KASITHBK',
          western_union_name: 'Zhong Jie Yong',
          western_union_account_number: '1101402249826',
          western_union_phone: '098-887-0075'
        }
      })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      wise_account_name,
      wise_account_number,
      wise_bank,
      wise_swift,
      western_union_name,
      western_union_account_number,
      western_union_phone
    } = body

    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT id FROM payment_settings LIMIT 1'
    ) as any[]

    if (existing.length > 0) {
      // Update existing settings
      await pool.execute(
        `UPDATE payment_settings SET 
          wise_account_name = ?, 
          wise_account_number = ?, 
          wise_bank = ?, 
          wise_swift = ?, 
          western_union_name = ?, 
          western_union_account_number = ?, 
          western_union_phone = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          wise_account_name,
          wise_account_number,
          wise_bank,
          wise_swift,
          western_union_name,
          western_union_account_number,
          western_union_phone,
          existing[0].id
        ]
      )
    } else {
      // Insert new settings
      await pool.execute(
        `INSERT INTO payment_settings (
          wise_account_name, 
          wise_account_number, 
          wise_bank, 
          wise_swift, 
          western_union_name, 
          western_union_account_number, 
          western_union_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          wise_account_name,
          wise_account_number,
          wise_bank,
          wise_swift,
          western_union_name,
          western_union_account_number,
          western_union_phone
        ]
      )
    }

    return NextResponse.json({ success: true, message: 'Payment settings saved successfully' })
  } catch (error: any) {
    console.error('Save payment settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save payment settings' },
      { status: 500 }
    )
  }
}

