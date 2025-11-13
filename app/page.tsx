import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Welcome to Sugarbunny Stores',
  description: 'Your premier destination for virtual products and services',
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-20 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent leading-tight">
            Welcome to Sugarbunny Stores
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Your premier destination for virtual products and services
          </p>
          <div className="flex justify-center mb-8">
            <Link 
              href="/products" 
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-semibold shadow-lg"
            >
              Explore Products
            </Link>
          </div>

          {/* Announcement Banner */}
          <div className="mt-8 mx-auto max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex items-stretch">
            {/* Green Announcement Label */}
            <div className="flex items-center gap-2 px-4 py-3 bg-green-500 rounded-l-lg flex-shrink-0">
              <p className="text-sm font-semibold text-white whitespace-nowrap">
                Announcement
              </p>
              <svg 
                stroke="currentColor" 
                fill="currentColor" 
                strokeWidth="0" 
                viewBox="0 0 512 512" 
                className="h-6 w-6 text-white flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="32" 
                  d="M407.94 52.22S321.3 160 240 160H80a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16h160c81.3 0 167.94 108.23 167.94 108.23 6.06 8 24.06 2.52 24.06-9.83V62c0-12.31-17-18.82-24.06-9.78zM64 256s-16-6-16-32 16-32 16-32m384 54s16-4.33 16-22-16-22-16-22m-192-42v128M112 160v128"
                />
                <path 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="32" 
                  d="M144 288v168a8 8 0 0 0 8 8h53a16 16 0 0 0 15.29-20.73C211.91 416.39 192 386.08 192 336h16a16 16 0 0 0 16-16v-16a16 16 0 0 0-16-16h-16"
                />
              </svg>
            </div>
            {/* Scrolling Text Area */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 flex-1">
              <div className="flex whitespace-nowrap py-3 animate-marquee">
                <p className="text-gray-900 dark:text-gray-100 px-4 text-sm">
                  Our Staff Working hours 12:00 PM - 6:00 AM Feel Free to place an Orders
                </p>
                <p className="text-gray-900 dark:text-gray-100 px-4 text-sm">
                  Our Staff Working hours 12:00 PM - 6:00 AM Feel Free to place an Orders
                </p>
                <p className="text-gray-900 dark:text-gray-100 px-4 text-sm">
                  Our Staff Working hours 12:00 PM - 6:00 AM Feel Free to place an Orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-pink-200 dark:border-pink-800/50">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold text-center mb-3 text-gray-800 dark:text-gray-200">Virtual Airlines</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Premium virtual airline services and products tailored for your needs
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-200 dark:border-blue-800/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold text-center mb-3 text-gray-800 dark:text-gray-200">Bots</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Automated solutions and bots to enhance your experience
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-pink-900/20 dark:via-gray-800 dark:to-blue-900/20 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-pink-200 dark:border-pink-800/30">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 via-pink-400 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold text-center mb-3 text-gray-800 dark:text-gray-200">Website</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Professional website development and design services for your business
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-700 dark:to-blue-700 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover our premium products today
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-3 bg-white text-pink-600 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-lg"
          >
            Create Account
          </Link>
        </div>
      </section>
    </>
  )
}
