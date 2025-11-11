import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

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

    // Get all products
    const products = await getAllProducts()
    
    // Ensure products is an array (handles build-time when DB might not be available)
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }
    
    const allProducts = products.map((p: any) => ({
      ...p,
      price: parseFloat(p.price) || 0,
      stock: parseInt(p.stock) || 0
    }))
    
    // Update cache
    cachedProducts = allProducts
    cacheTimestamp = now
    
    return NextResponse.json({ products: allProducts }, { status: 200 })
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

