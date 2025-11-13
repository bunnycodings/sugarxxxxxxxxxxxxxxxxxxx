import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  let messages
  try {
    messages = await getMessages()
  } catch (error) {
    console.error('Error loading messages:', error)
    // Fallback to empty messages if loading fails
    messages = {}
  }

  return (
    <>
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
      <NextIntlClientProvider messages={messages || {}}>
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
      </NextIntlClientProvider>
      <Analytics />
    </>
  )
}

