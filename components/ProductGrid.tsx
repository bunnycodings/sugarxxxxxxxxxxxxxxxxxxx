'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

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

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      const data = await response.json()
      setIsAuthenticated(data.authenticated || false)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Prevent adding to cart if stock is 0 or less
    if (product.stock <= 0) {
      showToast('This product is out of stock and cannot be purchased.', 'error')
      return
    }
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${product.id}`)
      return
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image_url: product.image_url,
      category: product.category
    })
    showToast('Product added to cart!', 'success')
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 max-w-2xl mx-auto">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            No Products Available
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            There are no available products in this category right now.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Stay tuned! New products will be available soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
        >
          <div className="relative h-48 bg-gradient-to-br from-pink-200 to-blue-200 dark:from-pink-900 dark:to-blue-900">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.stock > 0 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {product.stock > 0 ? `In Stock` : 'Out of Stock'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-2">
              <span className="px-3 py-1 rounded-full text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                {product.category || 'Uncategorized'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {product.description || 'No description available'}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    ฿{((Number(product.price) || 0) * 1.07).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (incl. VAT)
                  </span>
                </div>
                {product.stock > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {product.stock} available
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {product.stock > 0 ? (
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={checkingAuth}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!isAuthenticated ? 'Login to Buy' : 'Add to Cart'}
                  </button>
                ) : (
                  <button 
                    disabled
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed font-medium text-sm"
                  >
                    Out of Stock
                  </button>
                )}
                <Link
                  href={`/products/${product.id}`}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-pink-300 dark:border-pink-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all font-medium text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

