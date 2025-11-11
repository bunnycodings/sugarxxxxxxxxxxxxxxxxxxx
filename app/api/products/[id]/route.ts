import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/products'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await getProductById(id)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only return active products for public view
    if (!product.is_active) {
      return NextResponse.json({ error: 'Product not available' }, { status: 404 })
    }

    // Ensure price is a number
    const normalizedProduct = {
      ...product,
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0
    }

    return NextResponse.json({ product: normalizedProduct }, { status: 200 })
  } catch (error: any) {
    console.error('Get product error:', error)
    
    // If table doesn't exist, return 404 instead of 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    )
  }
}

