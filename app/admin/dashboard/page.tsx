'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export const dynamic = 'force-dynamic'

interface User {
  id: number
  member_id?: string
  email: string
  created_at: string
}

interface Product {
  id: number
  product_code?: string
  name: string
  description?: string
  price: number
  category?: string
  image_url?: string
  file_url?: string
  stock: number
  is_active: boolean
  created_at: string
}

interface RedeemCode {
  id: number
  code: string
  product_id?: number
  product_name?: string
  discount_percent: number
  discount_amount: number
  max_uses: number
  used_count: number
  expires_at?: string
  is_active: boolean
  created_at: string
}

interface Review {
  id: number
  product_id: number
  product_name?: string
  user_id: number
  user_email?: string
  rating: number
  comment?: string
  is_approved: boolean
  created_at: string
}

type Tab = 'users' | 'products' | 'orders' | 'redeem-codes' | 'reviews' | 'payments'

export default function AdminDashboard() {
  const router = useRouter()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('users')
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    product_code: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
    is_active: true
  })
  
  // Redeem Codes state
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([])
  const [redeemCodesLoading, setRedeemCodesLoading] = useState(false)
  const [showRedeemForm, setShowRedeemForm] = useState(false)
  const [redeemForm, setRedeemForm] = useState({
    product_id: '',
    discount_percent: '',
    discount_amount: '',
    max_uses: '1',
    expires_at: '',
    count: '1'
  })
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  
  // Orders state
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // Payment Settings state
  const [paymentSettings, setPaymentSettings] = useState({
    wise_account_name: 'Zhong Jie Yong',
    wise_account_number: '1101402249826',
    wise_bank: 'Kasikorn Bank (K-Bank)',
    wise_swift: 'KASITHBK',
    western_union_name: 'Zhong Jie Yong',
    western_union_account_number: '1101402249826',
    western_union_phone: '098-887-0075'
  })
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false)
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false)
  const [paymentSettingsSuccess, setPaymentSettingsSuccess] = useState(false)



  useEffect(() => {
    checkAuth()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'orders') fetchOrders()
    if (activeTab === 'redeem-codes') fetchRedeemCodes()
    if (activeTab === 'reviews') fetchReviews()
    if (activeTab === 'payments') fetchPaymentSettings()
  }, [activeTab])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify')
      if (!response.ok) {
        router.push('/admin/login')
      }
    } catch (err) {
      router.push('/admin/login')
    }
  }

  // Users functions
  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        if (response.status === 401) {
          // Expected when not logged in - silently redirect
          router.push('/admin/login')
          return
        }
        // Only log non-401 errors
        console.error('Error fetching users:', response.status, response.statusText)
        return
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      // Only log if it's not a navigation error (expected during redirect)
      if (err instanceof Error && !err.message.includes('redirect')) {
        console.error('Error fetching users:', err)
      }
    } finally {
      setUsersLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword) return

    setResetError('')
    setResetSuccess(false)
    setResetLoading(true)

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters')
      setResetLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, newPassword }),
      })

      const data = await response.json()
      if (!response.ok) {
        setResetError(data.error || 'Failed to reset password')
        return
      }

      setResetSuccess(true)
      setNewPassword('')
      setSelectedUser(null)
      setTimeout(() => setResetSuccess(false), 3000)
    } catch (err) {
      setResetError('An error occurred. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  // Products functions
  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const response = await fetch('/api/admin/products')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        return
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        product_code: productForm.product_code || null,
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        category: productForm.category || null,
        image_url: productForm.image_url || null,
        stock: parseInt(productForm.stock) || 0,
        is_active: productForm.is_active
      }

      const url = editingProduct ? '/api/admin/products' : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct 
        ? { id: editingProduct.id, ...productData }
        : productData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to save product')
        return
      }

      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({
        product_code: '',
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock: '',
        is_active: true
      })
      fetchProducts()
    } catch (err) {
      alert('An error occurred. Please try again.')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      product_code: product.product_code || '',
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      image_url: product.image_url || '',
      stock: product.stock.toString(),
      is_active: product.is_active
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete product')
        return
      }

      fetchProducts()
    } catch (err) {
      alert('An error occurred. Please try again.')
    }
  }


  // Redeem Codes functions
  const fetchRedeemCodes = async () => {
    try {
      setRedeemCodesLoading(true)
      const response = await fetch('/api/admin/redeem-codes')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        return
      }
      const data = await response.json()
      setRedeemCodes(data.codes || [])
    } catch (err) {
      console.error('Error fetching redeem codes:', err)
    } finally {
      setRedeemCodesLoading(false)
    }
  }

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const codeData = {
        product_id: redeemForm.product_id ? parseInt(redeemForm.product_id) : null,
        discount_percent: redeemForm.discount_percent ? parseFloat(redeemForm.discount_percent) : 0,
        discount_amount: redeemForm.discount_amount ? parseFloat(redeemForm.discount_amount) : 0,
        max_uses: parseInt(redeemForm.max_uses) || 1,
        expires_at: redeemForm.expires_at || null,
        count: parseInt(redeemForm.count) || 1
      }

      const response = await fetch('/api/admin/redeem-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(codeData)
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to generate codes')
        return
      }

      const data = await response.json()
      alert(data.message)
      setShowRedeemForm(false)
      setRedeemForm({
        product_id: '',
        discount_percent: '',
        discount_amount: '',
        max_uses: '1',
        expires_at: '',
        count: '1'
      })
      fetchRedeemCodes()
    } catch (err) {
      alert('An error occurred. Please try again.')
    }
  }

  const handleDeleteCode = async (id: number) => {
    if (!confirm('Are you sure you want to delete this code?')) return

    try {
      const response = await fetch(`/api/admin/redeem-codes?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete code')
        return
      }

      fetchRedeemCodes()
    } catch (err) {
      alert('An error occurred. Please try again.')
    }
  }

  // Reviews functions
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await fetch('/api/admin/reviews')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        return
      }
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleReviewAction = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' && !confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id })
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || `Failed to ${action} review`)
        return
      }

      fetchReviews()
    } catch (err) {
      alert('An error occurred. Please try again.')
    }
  }

  // Payment Settings functions
  const fetchPaymentSettings = async () => {
    try {
      setPaymentSettingsLoading(true)
      const response = await fetch('/api/admin/payment-settings')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        return
      }
      const data = await response.json()
      if (data.settings) {
        setPaymentSettings(data.settings)
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err)
    } finally {
      setPaymentSettingsLoading(false)
    }
  }

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentSettingsSaving(true)
    setPaymentSettingsSuccess(false)

    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentSettings)
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to save payment settings')
        return
      }

      setPaymentSettingsSuccess(true)
      setTimeout(() => setPaymentSettingsSuccess(false), 3000)
    } catch (err) {
      alert('An error occurred. Please try again.')
    } finally {
      setPaymentSettingsSaving(false)
    }
  }

  // Orders functions
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await fetch('/api/admin/orders')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        return
      }
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to update order status')
      }

      // Refresh orders list
      await fetchOrders()
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }


  const formatExpiration = (expiresAt: string | null): string => {
    if (!expiresAt) {
      return 'Permanent'
    }

    const expires = new Date(expiresAt)
    const now = new Date()
    
    if (expires <= now) {
      return 'Expired'
    }

    const diff = expires.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h remaining`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`
    } else {
      return `${seconds}s remaining`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Manage products, codes, reviews, and users</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            {(['users', 'products', 'orders', 'redeem-codes', 'reviews', 'payments'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-pink-600 dark:border-pink-400 text-pink-600 dark:text-pink-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                {tab === 'users' ? 'Users' : tab === 'products' ? 'Products' : tab === 'orders' ? 'Orders' : tab === 'redeem-codes' ? 'Redeem Codes' : tab === 'reviews' ? 'Reviews' : tab === 'payments' ? 'Payment Settings' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Password Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full transition-colors">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Reset Password</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Reset password for: <strong className="text-gray-900 dark:text-gray-100">{selectedUser.email}</strong></p>
              
              {resetError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {resetError}
                </div>
              )}
              
              {resetSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  Password reset successfully!
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null)
                      setNewPassword('')
                      setResetError('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Users ({users.length})</h2>
            </div>
            {usersLoading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Member ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-pink-600 dark:text-pink-400">{user.member_id || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium text-xs"
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Products ({products.length})</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setProductForm({
                      product_code: '',
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      image_url: '',
                      stock: '',
                      is_active: true
                    })
                    setShowProductForm(true)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium"
                >
                  + Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                      {editingProduct ? 'Edit Product' : 'Add Product'}
                    </h2>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Code</label>
                          <input
                            type="text"
                            value={productForm.product_code}
                            onChange={(e) => setProductForm({ ...productForm, product_code: e.target.value.toUpperCase() })}
                            placeholder="e.g., PD000001"
                            maxLength={20}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave empty to auto-generate</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                          <input
                            type="text"
                            required
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="">Select Category</option>
                            <option value="Virtual Airlines">Virtual Airlines</option>
                            <option value="Bots">Bots</option>
                            <option value="Website">Website</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                          <input
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                        <input
                          type="url"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          rows={4}
                          placeholder="Enter product description..."
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Tip: Each line will be displayed as a bullet point on the product page
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={productForm.is_active}
                          onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowProductForm(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600"
                        >
                          {editingProduct ? 'Update' : 'Create'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {productsLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">No products found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-gray-900 dark:text-gray-100 font-mono font-semibold text-pink-600 dark:text-pink-400">
                              {product.product_code || `PD${String(product.id).padStart(6, '0')}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{product.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">฿{(Number(product.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.stock}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Orders ({orders.length})</h2>
            </div>
            {ordersLoading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.customer_email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          <div className="space-y-1">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                  {item.product_name || item.name} × {item.quantity}
                                  {item.product_code && (
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">({item.product_code})</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400">No items</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          ฿{(Number(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <span className="capitalize">{order.payment_method || 'wise'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' || order.status === 'paid'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : order.status === 'pending' || order.status === 'payment_pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Order Details - #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedOrder.customer_email}</p>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedOrder.customer_phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.product_name || item.name}</p>
                            {item.product_code && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Code: {item.product_code}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            ฿{(Number(item.price) * item.quantity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No items</p>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 capitalize">{selectedOrder.payment_method || 'wise'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="text-base font-semibold text-pink-600 dark:text-pink-400">
                        ฿{(Number(selectedOrder.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    {selectedOrder.payment && (
                      <>
                        {selectedOrder.payment.transaction_id && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedOrder.payment.transaction_id}</p>
                          </div>
                        )}
                        {selectedOrder.payment.sender_name && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sender Name</p>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedOrder.payment.sender_name}</p>
                          </div>
                        )}
                        {selectedOrder.payment.payment_proof_url && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Proof</p>
                            <a
                              href={selectedOrder.payment.payment_proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Payment Proof
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Status */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedOrder.status === 'completed' || selectedOrder.status === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : selectedOrder.status === 'pending' || selectedOrder.status === 'payment_pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {selectedOrder.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}
                </div>

                {/* Order Date */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order Date: {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Codes Tab */}
        {activeTab === 'redeem-codes' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Redeem Codes ({redeemCodes.length})</h2>
                <button
                  onClick={() => setShowRedeemForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium"
                >
                  + Generate Codes
                </button>
              </div>

              {/* Generate Codes Modal */}
              {showRedeemForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full transition-colors">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Generate Redeem Codes</h2>
                    <form onSubmit={handleGenerateCodes} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product ID (optional)</label>
                        <input
                          type="number"
                          value={redeemForm.product_id}
                          onChange={(e) => setRedeemForm({ ...redeemForm, product_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Leave empty for general codes"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount %</label>
                          <input
                            type="number"
                            step="0.01"
                            value={redeemForm.discount_percent}
                            onChange={(e) => setRedeemForm({ ...redeemForm, discount_percent: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={redeemForm.discount_amount}
                            onChange={(e) => setRedeemForm({ ...redeemForm, discount_amount: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Uses</label>
                          <input
                            type="number"
                            value={redeemForm.max_uses}
                            onChange={(e) => setRedeemForm({ ...redeemForm, max_uses: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Count</label>
                          <input
                            type="number"
                            min="1"
                            value={redeemForm.count}
                            onChange={(e) => setRedeemForm({ ...redeemForm, count: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expires At (optional)</label>
                        <input
                          type="datetime-local"
                          value={redeemForm.expires_at}
                          onChange={(e) => setRedeemForm({ ...redeemForm, expires_at: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowRedeemForm(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600"
                        >
                          Generate
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {redeemCodesLoading ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading codes...</div>
              ) : redeemCodes.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">No redeem codes found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Uses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expires</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {redeemCodes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">{code.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{code.product_name || 'General'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {code.discount_percent > 0 ? `${code.discount_percent}%` : code.discount_amount > 0 ? `฿${(Number(code.discount_amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.used_count}/{code.max_uses}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{code.expires_at ? formatDate(code.expires_at) : 'Never'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${code.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                              {code.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteCode(code.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Payment Settings</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure payment recipient information for Wise and Western Union</p>
            </div>
            {paymentSettingsLoading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading payment settings...</div>
            ) : (
              <div className="p-6">
                {paymentSettingsSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg text-sm">
                    Payment settings saved successfully!
                  </div>
                )}
                <form onSubmit={handleSavePaymentSettings} className="space-y-6">
                  {/* Wise Settings */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Wise Payment Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.wise_account_name}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, wise_account_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.wise_account_number}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, wise_account_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Name *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.wise_bank}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, wise_bank: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SWIFT/BIC Code *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.wise_swift}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, wise_swift: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Western Union Settings */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Western Union Payment Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Name *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.western_union_name}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, western_union_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.western_union_account_number}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, western_union_account_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={paymentSettings.western_union_phone}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, western_union_phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="098-887-0075"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={paymentSettingsSaving}
                      className="px-6 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentSettingsSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Reviews ({reviews.length})</h2>
            </div>
            {reviewsLoading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No reviews found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{review.product_name || `Product #${review.product_id}`}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{review.user_email || `User #${review.user_id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{review.comment || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${review.is_approved ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`}>
                            {review.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(review.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {!review.is_approved && (
                            <button
                              onClick={() => handleReviewAction(review.id, 'approve')}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                            >
                              Approve
                            </button>
                          )}
                          {review.is_approved && (
                            <button
                              onClick={() => handleReviewAction(review.id, 'reject')}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleReviewAction(review.id, 'delete')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
