import type { Metadata } from 'next'
import { Comic_Neue } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlackRibbon from '@/components/BlackRibbon'
import { Analytics } from '@vercel/analytics/next'

const comicNeue = Comic_Neue({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-comic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sugarbunny Stores',
  description: 'Premium virtual products and services',
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
            <div className="relative">
              <BlackRibbon />
              <TopBar />
            </div>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

