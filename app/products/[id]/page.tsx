'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

export const dynamic = 'force-dynamic'

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

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
    if (params.id) {
      fetchProduct(Number(params.id))
    }
  }, [params.id])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()
      setIsAuthenticated(data.authenticated || false)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        setError('Failed to load product')
        return
      }
      const data = await response.json()
      if (data.product) {
        setProduct(data.product)
      } else {
        setError('Product not found')
      }
    } catch (err) {
      setError('An error occurred while loading product')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-gray-500">Loading product...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error || 'Product not found'}</div>
            <Link
              href="/products"
              className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="container mx-auto px-4">
        <Link
          href="/products"
          className="inline-flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 mb-6 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex md:flex-col">
            <div className="w-full relative aspect-video max-h-[600px] bg-gradient-to-br from-pink-200 to-blue-200 dark:from-pink-800 dark:to-blue-800">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24"%3ENo Image Available%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="w-full p-8">
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                  {product.category || 'Uncategorized'}
                </span>
              </div>
              <h1 className="text-4xl font-display font-bold mb-4 text-gray-900 dark:text-gray-100">
                {product.name}
              </h1>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-pink-600 dark:text-pink-400">
                    ฿{((Number(product.price) || 0) * 1.07).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (incl. 7% VAT)
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Base price: ฿{(Number(product.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (excl. VAT)
                </p>
              </div>
              {product.description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Product Descriptions
                  </h2>
                  <div className="space-y-2">
                    {product.description.split('\n').filter(line => line.trim()).map((line, index) => (
                      <div key={index} className="flex items-start text-gray-600 dark:text-gray-300 leading-relaxed">
                        <span className="mr-3 text-pink-600 dark:text-pink-400 font-bold">-</span>
                        <span>{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-lg font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>
              <div className="space-y-4">
                {product.stock > 0 ? (
                  !isAuthenticated ? (
                    <button 
                      onClick={() => {
                        router.push(`/login?redirect=/products/${product.id}`)
                      }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg"
                    >
                      Login to Add to Cart
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        // Double-check stock before adding to cart
                        if (product.stock <= 0) {
                          showToast('This product is out of stock and cannot be purchased.', 'error')
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
                      }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg"
                    >
                      Add to Cart
                    </button>
                  )
                ) : (
                  <button disabled className="w-full px-6 py-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold text-lg">
                    Out of Stock
                  </button>
                )}
                <Link
                  href="/redeem"
                  className="block w-full px-6 py-4 text-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-pink-300 dark:border-pink-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all font-semibold"
                >
                  Redeem with Code
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

