import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Details',
  description: 'View product details and add to cart',
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

