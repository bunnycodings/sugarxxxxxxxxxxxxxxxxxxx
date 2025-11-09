import { NextRequest, NextResponse } from 'next/server'
import pool, { executeWithRetry } from '@/lib/db'

// Cache for category products
const categoryCache = new Map<string, { products: any[], timestamp: number }>()
const CACHE_TTL = 60000 // 60 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
  }

  try {

    // Check cache first
    const cached = categoryCache.get(category)
    const now = Date.now()
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({ products: cached.products }, { status: 200 })
    }

    // Query directly with category filter for better performance
    // Use retry logic for connection errors
    const result = await executeWithRetry(async () => 
      pool.execute(
        'SELECT id, name, description, price, category, image_url, stock, is_active, created_at FROM products WHERE category = ? AND is_active = 1 ORDER BY created_at DESC',
        [category]
      )
    ) as any[]
    const [rows] = result
    
    const filteredProducts = rows.map((p: any) => ({
      ...p,
      price: parseFloat(p.price) || 0,
      stock: parseInt(p.stock) || 0
    }))
    
    // Update cache
    categoryCache.set(category, { products: filteredProducts, timestamp: now })
    
    return NextResponse.json({ products: filteredProducts }, { status: 200 })
  } catch (error: any) {
    console.error('Get products by category error:', error)
    
    // If table doesn't exist or database error, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }
    
    // For "too many connections" error, return cached data if available or empty array
    if (error.code === 'ER_CON_COUNT_ERROR' || error.errno === 1040) {
      const cached = categoryCache.get(category || '')
      if (cached) {
        return NextResponse.json({ products: cached.products }, { status: 200 })
      }
      return NextResponse.json({ products: [] }, { status: 200 })
    }
    
    // For other errors, still return empty array to prevent UI errors
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}

