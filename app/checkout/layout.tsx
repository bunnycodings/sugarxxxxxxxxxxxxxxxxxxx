import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Checkout | Sugarbunny Stores',
  description: 'Complete your order and choose your payment method',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <CartProvider>
        <ToastProvider>
          {children}
          <Toast />
        </ToastProvider>
      </CartProvider>
    </ThemeProvider>
  )
}

