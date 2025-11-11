'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccess() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionId && orderId) {
      verifyPayment()
    } else {
      setError('Missing payment session information')
      setLoading(false)
    }
  }, [sessionId, orderId])

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/payments/stripe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          sessionId
        })
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        setVerified(true)
      } else {
        setError(data.error || 'Payment verification failed')
      }
    } catch (err) {
      setError('An error occurred while verifying payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">Verifying payment...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {error}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/payment/${orderId}`}
                className="flex-1 text-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-semibold"
              >
                Back to Payment
              </Link>
              <Link
                href="/"
                className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verified) {
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
                Payment Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Thank you for your purchase. Your payment has been processed successfully.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{orderId}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                📦 How to get your files:
              </p>
              <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Open a ticket in our Discord server</li>
                <li>Send your Order #{orderId} and order details</li>
                <li>Our team will verify your payment and provide your files</li>
              </ol>
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

  return null
}

