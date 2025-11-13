import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'All Products | Sugarbunny Stores',
  description: 'Browse our complete catalog of virtual products and services. Find virtual airlines, bots, and website development services.',
  keywords: ['products', 'virtual products', 'catalog', 'online store'],
  openGraph: {
    title: 'All Products - Sugarbunny Stores',
    description: 'Browse our complete catalog of virtual products and services',
    type: 'website',
  },
}

export const dynamic = 'force-dynamic'

export default function ProductsLayout({
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

