'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export const dynamic = 'force-dynamic'

export default function Checkout() {
  const router = useRouter()
  const { items, getSubtotal, getVAT, getTotal, clearCart } = useCart()
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+66' // Default to Thailand
  })
  const [paymentMethod, setPaymentMethod] = useState<'wise' | 'western_union' | 'promptpay'>('wise')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemCodeError, setRedeemCodeError] = useState('')
  const [validatingCode, setValidatingCode] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    discount_percent: number
    discount_amount: number
  } | null>(null)

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
      
      if (!data.authenticated) {
        router.push('/login?redirect=/checkout')
        return
      }
      
      // Auto-fill email if user is logged in
      if (data.user?.email) {
        setCustomerInfo(prev => ({
          ...prev,
          email: data.user.email
        }))
      }
    } catch (error) {
      router.push('/login?redirect=/checkout')
      return
    } finally {
      setIsCheckingAuth(false)
    }
  }

  // Calculate subtotal (before discount and VAT)
  const subtotal = getSubtotal()
  
  // Calculate discount
  let discountAmount = 0
  let discountedSubtotal = subtotal
  if (appliedDiscount) {
    if (appliedDiscount.discount_percent > 0) {
      discountAmount = (subtotal * appliedDiscount.discount_percent) / 100
    } else if (appliedDiscount.discount_amount > 0) {
      discountAmount = appliedDiscount.discount_amount
    }
    discountedSubtotal = Math.max(0, subtotal - discountAmount)
  }
  
  // Calculate VAT (7% on discounted subtotal)
  const vat = discountedSubtotal * 0.07
  
  // Calculate final total (discounted subtotal + VAT)
  const total = discountedSubtotal + vat

  if (isCheckingAuth) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerInfo.name || !customerInfo.email) {
      setError('Please fill in all required fields')
      return
    }

    // Validate items and total before submitting
    if (items.length === 0) {
      setError('Your cart is empty. Please add items before checkout.')
      return
    }

    // Validate that all items have valid prices (allow 0 for testing)
    const invalidItems = items.filter(item => {
      const price = Number(item.price)
      const quantity = Number(item.quantity)
      // Allow price >= 0 (including 0 for testing), but quantity must be > 0
      return isNaN(price) || isNaN(quantity) || price < 0 || quantity <= 0
    })

    if (invalidItems.length > 0) {
      setError('Some items in your cart have invalid prices or quantities. Please refresh the page and try again.')
      return
    }

    // Validate total (allow 0 for testing)
    if (total === undefined || total === null || isNaN(total) || total < 0) {
      console.error('Invalid total calculation:', { 
        subtotal, 
        vat,
        total, 
        items,
        appliedDiscount 
      })
      setError('Invalid cart total. Please refresh the page and try again.')
      return
    }

    setLoading(true)

    try {
      // Create order
      const fullPhoneNumber = customerInfo.phone ? `${customerInfo.countryCode}${customerInfo.phone.replace(/^0+/, '')}` : ''
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0
          })),
          total: total,
          payment_method: paymentMethod,
          redeem_code: appliedDiscount?.code || null,
          customer: {
            ...customerInfo,
            phone: fullPhoneNumber
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to create order'
        setError(errorMessage)
        setLoading(false)
        
        // If stock issue, refresh page to update cart
        if (errorMessage.includes('out of stock') || errorMessage.includes('Insufficient stock')) {
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
        return
      }

      // Redirect to payment page first, then clear cart after navigation
      router.push(`/payment/${data.orderId}`)
      // Clear cart after a short delay to ensure navigation has started
      setTimeout(() => {
        clearCart()
      }, 100)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemCodeError('Please enter a redeem code')
      return
    }

    setRedeemCodeError('')
    setValidatingCode(true)

    try {
      const response = await fetch('/api/redeem-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: redeemCode.trim().toUpperCase(),
          items: items
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setRedeemCodeError(data.error || 'Invalid redeem code')
        setAppliedDiscount(null)
        return
      }

      // Apply discount
      setAppliedDiscount({
        code: data.code,
        discount_percent: data.discount_percent || 0,
        discount_amount: data.discount_amount || 0
      })
      setRedeemCodeError('')
    } catch (err) {
      setRedeemCodeError('Failed to validate redeem code. Please try again.')
      setAppliedDiscount(null)
    } finally {
      setValidatingCode(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setRedeemCode('')
    setRedeemCodeError('')
  }

  if (items.length === 0) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Your cart is empty
            </h1>
            <Link
              href="/cart"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Enter your information to complete your order
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Customer Information
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wise')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'wise'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Wise</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bank Transfer</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('western_union')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'western_union'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Western Union</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Money Transfer</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        paymentMethod === 'promptpay'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100">Promptpay</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">QR Scan</div>
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="redeemCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Redeem Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="redeemCode"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleRedeemCode()
                        }
                      }}
                      disabled={validatingCode || !!appliedDiscount}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter redeem code"
                    />
                    {appliedDiscount ? (
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRedeemCode}
                        disabled={validatingCode || !redeemCode.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validatingCode ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {redeemCodeError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{redeemCodeError}</p>
                  )}
                  {appliedDiscount && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      ✓ Discount applied: {appliedDiscount.discount_percent > 0 
                        ? `${appliedDiscount.discount_percent}% off` 
                        : `฿${appliedDiscount.discount_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} off`}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (with Country Code)
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="countryCode"
                      value={customerInfo.countryCode}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, countryCode: e.target.value })}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="+1">+1 (US/Canada)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+66">+66 (Thailand)</option>
                      <option value="+65">+65 (Singapore)</option>
                      <option value="+60">+60 (Malaysia)</option>
                      <option value="+62">+62 (Indonesia)</option>
                      <option value="+63">+63 (Philippines)</option>
                      <option value="+84">+84 (Vietnam)</option>
                      <option value="+86">+86 (China)</option>
                      <option value="+81">+81 (Japan)</option>
                      <option value="+82">+82 (South Korea)</option>
                      <option value="+61">+61 (Australia)</option>
                      <option value="+64">+64 (New Zealand)</option>
                      <option value="+91">+91 (India)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+973">+973 (Bahrain)</option>
                      <option value="+974">+974 (Qatar)</option>
                      <option value="+965">+965 (Kuwait)</option>
                      <option value="+966">+966 (Saudi Arabia)</option>
                      <option value="+972">+972 (Israel)</option>
                      <option value="+27">+27 (South Africa)</option>
                      <option value="+49">+49 (Germany)</option>
                      <option value="+33">+33 (France)</option>
                      <option value="+39">+39 (Italy)</option>
                      <option value="+34">+34 (Spain)</option>
                      <option value="+31">+31 (Netherlands)</option>
                      <option value="+32">+32 (Belgium)</option>
                      <option value="+41">+41 (Switzerland)</option>
                      <option value="+46">+46 (Sweden)</option>
                      <option value="+47">+47 (Norway)</option>
                      <option value="+45">+45 (Denmark)</option>
                      <option value="+358">+358 (Finland)</option>
                      <option value="+351">+351 (Portugal)</option>
                      <option value="+353">+353 (Ireland)</option>
                      <option value="+48">+48 (Poland)</option>
                      <option value="+420">+420 (Czech Republic)</option>
                      <option value="+36">+36 (Hungary)</option>
                      <option value="+40">+40 (Romania)</option>
                      <option value="+7">+7 (Russia/Kazakhstan)</option>
                      <option value="+90">+90 (Turkey)</option>
                      <option value="+20">+20 (Egypt)</option>
                      <option value="+52">+52 (Mexico)</option>
                      <option value="+55">+55 (Brazil)</option>
                      <option value="+54">+54 (Argentina)</option>
                      <option value="+56">+56 (Chile)</option>
                      <option value="+57">+57 (Colombia)</option>
                      <option value="+51">+51 (Peru)</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="987654321"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format: {customerInfo.countryCode === '+66' ? '9XX-XXX-XXXX' : 'Enter phone number without leading 0'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      ฿{(Number(item.price) * item.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {appliedDiscount && discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-฿{discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>VAT (7%)</span>
                  <span>฿{vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span className="text-pink-600 dark:text-pink-400">
                    ฿{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

