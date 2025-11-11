'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  email: string
  memberId?: string
}

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  file_url?: string
}

interface Order {
  id: number
  customer_name: string
  customer_email: string
  total: number
  status: string
  created_at: string
  items?: OrderItem[]
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchOrders()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to update password')
        setPasswordLoading(false)
        return
      }

      setPasswordSuccess(true)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        setShowPasswordReset(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error) {
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            My Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Account Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Member ID:</span>
                <p className="text-gray-900 dark:text-gray-100 font-bold text-lg">{user.memberId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordReset(true)}
              className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all text-sm font-medium"
            >
              Reset Password
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Orders
            </h3>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {orders.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total orders
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/products"
                className="block px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all text-sm font-medium text-center"
              >
                Browse Products
              </Link>
              <Link
                href="/cart"
                className="block px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-pink-300 dark:border-pink-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all text-sm font-medium text-center"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Password Reset Modal */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full transition-colors">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Reset Password</h2>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  Password updated successfully!
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setPasswordError('')
                      setPasswordSuccess(false)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Order History
            </h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg mb-2">No orders yet</p>
              <p className="text-sm">Start shopping to see your orders here</p>
              <Link
                href="/products"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Order #{order.id}</span>
                          <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' || order.status === 'paid'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : order.status === 'pending' || order.status === 'payment_pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ฿{(Number(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-white dark:bg-gray-800">
                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {item.product_name} × {item.quantity}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ฿{(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                                </div>
                              </div>
                              <div>
                                {(order.status === 'paid' || order.status === 'completed') && item.file_url ? (
                                  <a
                                    href={`/api/download/product/${item.product_id}`}
                                    download
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xs rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {item.file_url ? 'Payment pending' : 'No file available'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No items found</div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href={`/payment/${order.id}`}
                          className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
                        >
                          View Order Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

