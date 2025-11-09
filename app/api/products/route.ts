import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/products'

// Cache products for 60 seconds
let cachedProducts: any[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60000 // 60 seconds

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now()
    if (cachedProducts && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({ products: cachedProducts }, { status: 200 })
    }

    // Only get active products for public view
    const products = await getAllProducts()
    const activeProducts = products
      .filter((p: any) => p.is_active)
      .map((p: any) => ({
        ...p,
        price: parseFloat(p.price) || 0,
        stock: parseInt(p.stock) || 0
      }))
    
    // Update cache
    cachedProducts = activeProducts
    cacheTimestamp = now
    
    return NextResponse.json({ products: activeProducts }, { status: 200 })
  } catch (error: any) {
    console.error('Get products error:', error)
    
    // If table doesn't exist or database error, return empty array instead of error
    // This allows the UI to show a friendly "no products" message
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }
    
    // For other errors, still return empty array to prevent UI errors
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}

