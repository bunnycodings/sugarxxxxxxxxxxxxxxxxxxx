'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Order {
  id: number
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  payment_method?: string
  created_at: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState({
    wise_account_name: 'Zhong Jie Yong',
    wise_account_number: '1101402249826',
    wise_bank: 'Kasikorn Bank (K-Bank)',
    wise_swift: 'KASITHBK',
    western_union_name: 'Zhong Jie Yong',
    western_union_account_number: '1101402249826',
    western_union_phone: '098-887-0075'
  })
  const [paymentData, setPaymentData] = useState({
    // For Wise and Western Union
    transaction_id: '',
    sender_name: '',
    transaction_date: '',
    amount: '',
    // For Western Union only
    payer_first_name: '',
    payer_last_name: '',
    payer_phone: '',
    payer_countryCode: '+1',
    payer_address: '',
    payer_city: '',
    payer_country: '',
    // For Promptpay
    payer_name: '',
    transaction_datetime: ''
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
      fetchPaymentSettings()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        // Ensure total is a number before calling toFixed
        const totalAmount = Number(data.order.total) || 0
        setPaymentData(prev => ({ ...prev, amount: totalAmount.toFixed(2) }))
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings', {
        credentials: 'include',
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentSettings(data)
      }
    } catch (err) {
      console.error('Failed to load payment settings')
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const paymentMethod = order?.payment_method || 'wise'
    
    if (paymentMethod === 'wise') {
      if (!paymentData.transaction_id || !paymentData.sender_name || !paymentData.transaction_date) {
        setError('Please fill in all required fields')
        return
      }
    } else if (paymentMethod === 'western_union') {
      if (!paymentData.transaction_id || !paymentData.sender_name || !paymentData.transaction_date ||
          !paymentData.payer_first_name || !paymentData.payer_last_name || !paymentData.payer_phone ||
          !paymentData.payer_address || !paymentData.payer_city || !paymentData.payer_country) {
        setError('Please fill in all required fields including payer details')
        return
      }
    } else if (paymentMethod === 'promptpay') {
      if (!paymentData.transaction_id || !paymentData.amount || !paymentData.transaction_datetime || !receiptFile) {
        setError('Please fill in all required fields and upload receipt')
        return
      }
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('payment_method', paymentMethod)
      formData.append('transaction_id', paymentData.transaction_id)
      formData.append('sender_name', paymentData.sender_name)
      formData.append('transaction_date', paymentData.transaction_date)
      formData.append('amount', paymentData.amount)
      
      if (paymentMethod === 'western_union') {
        const fullPhoneNumber = paymentData.payer_phone ? `${paymentData.payer_countryCode}${paymentData.payer_phone.replace(/^0+/, '')}` : ''
        formData.append('payer_first_name', paymentData.payer_first_name)
        formData.append('payer_last_name', paymentData.payer_last_name)
        formData.append('payer_phone', fullPhoneNumber)
        formData.append('payer_address', paymentData.payer_address)
        formData.append('payer_city', paymentData.payer_city)
        formData.append('payer_country', paymentData.payer_country)
      } else if (paymentMethod === 'promptpay') {
        formData.append('transaction_datetime', paymentData.transaction_datetime)
        if (receiptFile) {
          formData.append('receipt', receiptFile)
        }
      }

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        credentials: 'include',
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
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          customerEmail: order?.customer_email,
          paymentData,
          paymentMethod
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
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your payment information has been received. Check your email for payment confirmation.
              </p>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  📋 Next Steps:
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                  <li>Contact us via Discord and open a ticket</li>
                  <li>Submit your Order #{orderId} and payment receipt (image or PDF)</li>
                  <li>Our team will verify your payment and provide your files</li>
                </ol>
              </div>
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

  const paymentMethod = order.payment_method || 'wise'

  return (
    <div className="py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
          Payment Instructions
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Order #{orderId} - Total: ฿{(Number(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {(Number(order.total) || 0) === 0 && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              🎉 This is a free product! You can proceed with Wise or Western Union for testing.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {paymentMethod === 'wise' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Send Payment via Wise
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Recipient Information:
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Account Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.wise_account_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Account Number:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.wise_account_number}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Bank:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.wise_bank}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">SWIFT/BIC:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.wise_swift}</span>
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
                    <li>Log in to your Wise account or create one at wise.com</li>
                    <li>Start a new transfer to Thailand (THB)</li>
                    <li>Enter the recipient information shown above</li>
                    <li>Send the exact amount shown</li>
                    <li>Complete the transfer and save your transaction ID</li>
                    <li>Fill out the payment form on the right with your transaction details</li>
                    <li>Submit the form - you will receive email confirmation</li>
                    <li><strong>After submitting:</strong> Contact us via Discord and open a ticket with your Order #{orderId} and payment receipt</li>
                  </ol>
                </div>
              </>
            )}

            {paymentMethod === 'western_union' && (
              <>
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
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.western_union_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Account Number:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.western_union_account_number}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{paymentSettings.western_union_phone}</span>
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
                    <li>Visit your nearest Western Union location or use their website</li>
                    <li>Fill out the send money form with the recipient information above</li>
                    <li>Send the exact amount shown</li>
                    <li>Complete the payment form below with your transaction details and payer information</li>
                    <li>Submit the form - you will receive email confirmation</li>
                    <li><strong>After submitting:</strong> Contact us via Discord and open a ticket with your Order #{orderId} and payment receipt</li>
                  </ol>
                  <p className="mt-4 text-xs text-yellow-600 dark:text-yellow-400">
                    <strong>Important:</strong> Please provide accurate payer details so the seller can claim the money.
                  </p>
                </div>
              </>
            )}

            {paymentMethod === 'promptpay' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Scan QR Code to Pay via Promptpay
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Scan this QR Code:
                    </h3>
                    <div className="flex justify-center mb-4">
                      <div className="relative max-w-xs w-full aspect-square">
                        <Image
                          src="/assets/img/payments/qr.jpg"
                          alt="Promptpay QR Code"
                          width={400}
                          height={400}
                          className="rounded-lg border-2 border-gray-300 dark:border-gray-600 object-contain"
                          onError={() => {
                            console.error('Failed to load QR image')
                          }}
                        />
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
                    <li>Open your mobile banking app or Promptpay-enabled app</li>
                    <li>Scan the QR code above</li>
                    <li>Enter the exact amount shown</li>
                    <li>Complete the payment</li>
                    <li>Fill out the payment form on the right with your transaction details</li>
                    <li>Upload your payment receipt/slip - it will be automatically sent to our Discord webhook</li>
                    <li>Submit the form - your payment information will be processed and sent to our Discord</li>
                  </ol>
                </div>
              </>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Payment Details
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {paymentMethod === 'promptpay' ? (
                    <>
                      <div>
                        <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Transaction ID *
                        </label>
                        <input
                          type="text"
                          id="transaction_id"
                          required
                          value={paymentData.transaction_id}
                          onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter transaction ID"
                        />
                      </div>
                      <div>
                        <label htmlFor="transaction_datetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Transaction Date and Time *
                        </label>
                        <input
                          type="datetime-local"
                          id="transaction_datetime"
                          required
                          value={paymentData.transaction_datetime}
                          onChange={(e) => setPaymentData({ ...paymentData, transaction_datetime: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Transaction Amount (THB) *
                        </label>
                        <input
                          type="number"
                          id="amount"
                          step="0.01"
                          required
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Enter transaction amount"
                        />
                      </div>
                      <div>
                        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Receipt/Slip *
                        </label>
                        <input
                          type="file"
                          id="receipt"
                          required
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 dark:file:bg-pink-900/30 dark:file:text-pink-300"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Accepted formats: JPG, PNG, PDF (Max 10MB)
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {paymentMethod === 'western_union' ? 'MTCN No' : 'Transaction ID'} *
                        </label>
                        <input
                          type="text"
                          id="transaction_id"
                          required
                          value={paymentData.transaction_id}
                          onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={paymentMethod === 'western_union' ? 'Enter MTCN number' : 'Enter transaction ID'}
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
                    </>
                  )}

                  {paymentMethod === 'western_union' && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Payer Details (Required for Western Union)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="payer_first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              id="payer_first_name"
                              required
                              value={paymentData.payer_first_name}
                              onChange={(e) => setPaymentData({ ...paymentData, payer_first_name: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <label htmlFor="payer_last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              id="payer_last_name"
                              required
                              value={paymentData.payer_last_name}
                              onChange={(e) => setPaymentData({ ...paymentData, payer_last_name: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label htmlFor="payer_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number *
                          </label>
                          <div className="flex gap-2">
                            <select
                              id="payer_countryCode"
                              value={paymentData.payer_countryCode}
                              onChange={(e) => setPaymentData({ ...paymentData, payer_countryCode: e.target.value })}
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
                              id="payer_phone"
                              required
                              value={paymentData.payer_phone}
                              onChange={(e) => setPaymentData({ ...paymentData, payer_phone: e.target.value })}
                              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="Enter phone number"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Format: {paymentData.payer_countryCode === '+66' ? '9XX-XXX-XXXX' : 'Enter phone number without leading 0'}
                          </p>
                        </div>
                        <div className="mt-4">
                          <label htmlFor="payer_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Address *
                          </label>
                          <input
                            type="text"
                            id="payer_address"
                            required
                            value={paymentData.payer_address}
                            onChange={(e) => setPaymentData({ ...paymentData, payer_address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label htmlFor="payer_city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              id="payer_city"
                              required
                              value={paymentData.payer_city}
                              onChange={(e) => setPaymentData({ ...paymentData, payer_city: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <label htmlFor="payer_country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Country *
                            </label>
                            <input
                              type="text"
                              id="payer_country"
                              required
                              value={paymentData.payer_country}
                              onChange={(e) => setPaymentData({ ...paymentData, payer_country: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-900/20 dark:to-pink-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💬</div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-blue-900 dark:text-blue-200 mb-2">
                          Contact Us via Discord
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                          After submitting this form, please contact us via Discord and open a ticket with:
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside ml-2">
                          <li>Your Order #{orderId}</li>
                          <li>Payment receipt (image or PDF)</li>
                        </ul>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mt-3">
                          Our team will verify your payment and provide your files.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Payment Details'}
                  </button>
                </form>
            </>
          </div>
        </div>
      </div>
    </div>
  )
}
