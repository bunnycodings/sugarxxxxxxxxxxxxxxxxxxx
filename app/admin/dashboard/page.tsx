'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

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

type Tab = 'users' | 'products' | 'redeem-codes' | 'reviews'

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
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
    is_active: true
  })
  const [generatingDescription, setGeneratingDescription] = useState(false)
  
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

  useEffect(() => {
    checkAuth()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'products') fetchProducts()
    if (activeTab === 'redeem-codes') fetchRedeemCodes()
    if (activeTab === 'reviews') fetchReviews()
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
          router.push('/admin/login')
          return
        }
        return
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
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

  const handleGenerateDescription = async () => {
    if (!productForm.image_url) {
      alert('Please enter an image URL first')
      return
    }

    setGeneratingDescription(true)
    try {
      const response = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: productForm.image_url })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to generate description')
        return
      }

      setProductForm({ ...productForm, description: data.description })
    } catch (err) {
      alert('An error occurred while generating description. Please try again.')
    } finally {
      setGeneratingDescription(false)
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

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
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
          <div className="flex space-x-1">
            {(['users', 'products', 'redeem-codes', 'reviews'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-pink-600 dark:border-pink-400 text-pink-600 dark:text-pink-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                {tab === 'users' ? 'Users' : tab === 'products' ? 'Products' : tab === 'redeem-codes' ? 'Redeem Codes' : 'Reviews'}
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <div className="relative">
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 pr-32 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Enter product description or use AI to generate one from the image..."
                          />
                          <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={!productForm.image_url || generatingDescription}
                            className="absolute top-2 right-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
                            title={!productForm.image_url ? "Please enter an image URL first" : "Generate description using AI based on the image"}
                          >
                            {generatingDescription ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>AI Generate</span>
                              </>
                            )}
                          </button>
                        </div>
                        {!productForm.image_url && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            💡 Enter an image URL above to enable AI description generation
                          </p>
                        )}
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
                            <div className="text-xs text-gray-400 dark:text-gray-500">#{product.id}</div>
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
