import { NextRequest, NextResponse } from 'next/server'
import { getRedeemCodeByCode } from '@/lib/redeemCodes'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, items } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ 
        error: 'Redeem code is required' 
      }, { status: 400 })
    }

    const redeemCode = await getRedeemCodeByCode(code.toUpperCase().trim())

    if (!redeemCode) {
      return NextResponse.json({ 
        error: 'Invalid redeem code' 
      }, { status: 404 })
    }

    // Check if code is active
    if (!redeemCode.is_active) {
      return NextResponse.json({ 
        error: 'This redeem code is no longer active' 
      }, { status: 400 })
    }

    // Check if code has expired
    if (redeemCode.expires_at) {
      const expiresAt = new Date(redeemCode.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json({ 
          error: 'This redeem code has expired' 
        }, { status: 400 })
      }
    }

    // Check if code has reached max uses
    if (redeemCode.max_uses && redeemCode.used_count && redeemCode.used_count >= redeemCode.max_uses) {
      return NextResponse.json({ 
        error: 'This redeem code has reached its maximum uses' 
      }, { status: 400 })
    }

    // If code is product-specific, check if any items match
    if (redeemCode.product_id && items && Array.isArray(items)) {
      const hasMatchingProduct = items.some((item: any) => item.id === redeemCode.product_id)
      if (!hasMatchingProduct) {
        return NextResponse.json({ 
          error: 'This redeem code is not valid for the products in your cart' 
        }, { status: 400 })
      }
    }

    return NextResponse.json({ 
      valid: true,
      code: redeemCode.code,
      discount_percent: redeemCode.discount_percent || 0,
      discount_amount: redeemCode.discount_amount || 0,
      product_id: redeemCode.product_id || null
    }, { status: 200 })
  } catch (error: any) {
    console.error('Validate redeem code error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to validate redeem code' 
    }, { status: 500 })
  }
}

