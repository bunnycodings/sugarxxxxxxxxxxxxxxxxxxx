'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  created_at: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentData, setPaymentData] = useState({
    mtcn_no: '',
    sender_name: '',
    transaction_date: '',
    amount: '',
    payment_proof: null as File | null
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setPaymentData(prev => ({ ...prev, amount: data.order.total.toFixed(2) }))
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentData({ ...paymentData, payment_proof: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!paymentData.mtcn_no || !paymentData.sender_name || !paymentData.transaction_date) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('mtcn_no', paymentData.mtcn_no)
      formData.append('sender_name', paymentData.sender_name)
      formData.append('transaction_date', paymentData.transaction_date)
      formData.append('amount', paymentData.amount)
      if (paymentData.payment_proof) {
        formData.append('payment_proof', paymentData.payment_proof)
      }

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit payment')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      
      // Send email with instructions
      await fetch('/api/payments/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerEmail: order?.customer_email,
          paymentData
        })
      })

    } catch (err) {
      setError('An error occurred. Please try again.')
      setSubmitting(false)
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

  if (!order) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">Order not found</div>
            <Link href="/" className="text-pink-600 dark:text-pink-400 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Payment Details Submitted!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your payment information has been received. Check your email for payment instructions.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> An email with payment instructions has been sent to <strong>{order.customer_email}</strong>. 
                Please check your inbox (and spam folder) for detailed Western Union payment instructions.
              </p>
            </div>
            <Link
              href="/"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold"
            >
              Back to Home
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
          Payment Instructions
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Order #{orderId} - Total: ฿{(Number(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Send Payment via Western Union
            </h2>
            <div className="space-y-4 mb-6">
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Recipient Information:
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">Zhong Jie Yong</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Account Number:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">1101402249826</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">098-887-0075</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Payment Amount:
                </h3>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  ฿{(Number(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2"><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Visit your nearest Western Union location</li>
                <li>Fill out the send money form with the recipient information above</li>
                <li>Send the exact amount shown</li>
                <li>Complete the payment form below with your transaction details</li>
                <li>Upload a photo of your Western Union receipt</li>
                <li>Submit the form - you will receive email confirmation</li>
              </ol>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Payment Details
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="mtcn_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  MTCN No: *
                </label>
                <input
                  type="text"
                  id="mtcn_no"
                  required
                  value={paymentData.mtcn_no}
                  onChange={(e) => setPaymentData({ ...paymentData, mtcn_no: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter MTCN number"
                />
              </div>
              <div>
                <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sender Name: *
                </label>
                <input
                  type="text"
                  id="sender_name"
                  required
                  value={paymentData.sender_name}
                  onChange={(e) => setPaymentData({ ...paymentData, sender_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter sender's full name"
                />
              </div>
              <div>
                <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Date: *
                </label>
                <input
                  type="date"
                  id="transaction_date"
                  required
                  value={paymentData.transaction_date}
                  onChange={(e) => setPaymentData({ ...paymentData, transaction_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (THB): *
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter amount sent"
                />
              </div>
              <div>
                <label htmlFor="payment_proof" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Payment Receipt (Optional)
                </label>
                <input
                  type="file"
                  id="payment_proof"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-50 dark:file:bg-pink-900/30 file:text-pink-700 dark:file:text-pink-300 file:cursor-pointer"
                />
                {paymentData.payment_proof && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {paymentData.payment_proof.name}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Payment Details'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

