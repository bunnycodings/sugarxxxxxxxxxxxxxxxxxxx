import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Sugarbunny Stores',
    template: '%s | Sugarbunny Stores',
  },
  description: 'Premium virtual products and services. Your premier destination for virtual airlines, bots, and website development services.',
  keywords: ['virtual products', 'virtual airlines', 'bots', 'website development', 'online store', 'e-commerce'],
  authors: [{ name: 'Sugarbunny Stores' }],
  creator: 'Sugarbunny Stores',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Sugarbunny Stores',
    title: 'Sugarbunny Stores - Premium Virtual Products & Services',
    description: 'Your premier destination for virtual products and services',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sugarbunny Stores',
    description: 'Premium virtual products and services',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In Next.js App Router, only one layout should render html/body
  // Since [locale]/layout.tsx and other layouts already render html/body,
  // we just return children here to avoid conflicts
  return children
}

