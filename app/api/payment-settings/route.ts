import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get payment settings from database (public endpoint for payment page)
    const [rows] = await pool.execute(
      'SELECT * FROM payment_settings LIMIT 1'
    ) as any[]

    if (rows.length === 0) {
      // Return default values if no settings exist
      return NextResponse.json({
        wise_account_name: 'Zhong Jie Yong',
        wise_account_number: '1101402249826',
        wise_bank: 'Kasikorn Bank (K-Bank)',
        wise_swift: 'KASITHBK',
        western_union_name: 'Zhong Jie Yong',
        western_union_account_number: '1101402249826',
        western_union_phone: '098-887-0075'
      })
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error('Get payment settings error:', error)
    // If table doesn't exist, return defaults
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json({
        wise_account_name: 'Zhong Jie Yong',
        wise_account_number: '1101402249826',
        wise_bank: 'Kasikorn Bank (K-Bank)',
        wise_swift: 'KASITHBK',
        western_union_name: 'Zhong Jie Yong',
        western_union_account_number: '1101402249826',
        western_union_phone: '098-887-0075'
      })
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment settings' },
      { status: 500 }
    )
  }
}

