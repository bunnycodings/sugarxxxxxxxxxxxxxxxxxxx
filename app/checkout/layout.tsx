import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Sugarbunny Stores',
  description: 'Complete your order and choose your payment method',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

