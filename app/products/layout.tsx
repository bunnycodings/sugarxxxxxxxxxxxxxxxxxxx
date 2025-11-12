import type { Metadata } from 'next'

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

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

