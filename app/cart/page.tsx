'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export const dynamic = 'force-dynamic'

export default function Cart() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, getSubtotal, getVAT, getTotal, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()
      if (!response.ok || !data.authenticated) {
        router.push('/login?redirect=/cart')
        return
      }
    } catch (error) {
      router.push('/login?redirect=/cart')
      return
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    setIsCheckingOut(true)
    router.push('/checkout')
  }

  const subtotal = getSubtotal()
  const vat = getVAT()
  const total = getTotal()

  if (isCheckingAuth) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
          Shopping Cart
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Review your items and proceed to checkout
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 max-w-2xl mx-auto">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Start shopping to add items to your cart!
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold shadow-md"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-4">
                    {item.image_url ? (
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-pink-200 to-blue-200 dark:from-pink-800 dark:to-blue-800 flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {item.name}
                          </h3>
                          {item.category && (
                            <span className="px-2 py-1 rounded-full text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                              {item.category}
                            </span>
                          )}
                          <p className="text-xl font-bold text-pink-600 dark:text-pink-400 mt-2">
                            ฿{(Number(item.price) * item.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ฿{(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Quantity:</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-medium text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>฿{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>VAT (7%)</span>
                    <span>฿{vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                      <span>Total</span>
                      <span>฿{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                <Link
                  href="/products"
                  className="block w-full mt-4 text-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-pink-300 dark:border-pink-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

