'use client'

import { useState, useEffect } from 'react'

interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated?: string
}

export default function CurrencyRate() {
  const [rate, setRate] = useState<ExchangeRate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Fetch from our API route which handles daily caching
        const response = await fetch('/api/exchange-rate', {
          cache: 'no-store' // Always check for fresh data
        })
        
        if (response.ok) {
          const data = await response.json()
          setRate({
            from: 'USD',
            to: 'THB',
            rate: data.rate,
            lastUpdated: data.lastUpdated
          })
        } else {
          // Fallback to default rate
          setRate({
            from: 'USD',
            to: 'THB',
            rate: 35.5
          })
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error)
        // If API fails, use default rate
        setRate({
          from: 'USD',
          to: 'THB',
          rate: 35.5
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRate()
    
    // Check for new rate every hour (API will only update once per day)
    // This ensures if the server restarts, it will fetch the rate
    const interval = setInterval(fetchRate, 3600000) // 1 hour
    return () => clearInterval(interval)
  }, [])

  if (loading || !rate) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/80">Exchange Rate:</span>
        <span className="font-semibold text-white">
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-white/80">Exchange Rate:</span>
      <span className="font-semibold text-white">
        1 {rate.from} = {rate.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {rate.to}
      </span>
    </div>
  )
}

