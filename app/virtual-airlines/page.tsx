'use client'

import { useState, useEffect } from 'react'
import ProductGrid from '@/components/ProductGrid'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  category?: string
  image_url?: string
  stock: number
  is_active: boolean
  created_at: string
}

export default function VirtualAirlines() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products/category?category=Virtual Airlines', {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
          Virtual Airlines
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Explore our premium virtual airline products and services.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading products...</div>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
