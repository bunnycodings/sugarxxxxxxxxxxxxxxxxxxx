import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlackRibbon from '@/components/BlackRibbon'
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
          <div className="relative">
            <BlackRibbon />
            <TopBar />
          </div>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toast />
        </ToastProvider>
      </CartProvider>
    </ThemeProvider>
  )
}

