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
import '../globals.css'

const comicNeue = Comic_Neue({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-comic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shopping Cart | Sugarbunny Stores',
  description: 'Review your items and proceed to checkout',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default function CartLayout({
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

