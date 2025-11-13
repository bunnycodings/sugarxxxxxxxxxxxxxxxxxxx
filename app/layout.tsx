import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlackRibbon from '@/components/BlackRibbon'
import Toast from '@/components/Toast'
import { Analytics } from '@vercel/analytics/react'
import { Comic_Neue } from 'next/font/google'
import './globals.css'

const comicNeue = Comic_Neue({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-comic',
  display: 'swap',
})

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (!theme) {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${comicNeue.className} flex flex-col min-h-screen`}>
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
        <Analytics />
      </body>
    </html>
  )
}

