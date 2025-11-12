import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shopping Cart | Sugarbunny Stores',
  description: 'Review your items and proceed to checkout',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

