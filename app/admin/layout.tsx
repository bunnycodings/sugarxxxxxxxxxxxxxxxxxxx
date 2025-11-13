import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Sugarbunny Stores',
  description: 'Admin dashboard for managing products, orders, and users',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
        <Toast />
      </ToastProvider>
    </ThemeProvider>
  )
}

