'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-800 dark:to-blue-800 text-white mt-auto transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-display font-bold mb-4">SUGARBUNNYSTORE</h3>
            <p className="text-white/90 mb-4">
              Your premier destination for virtual products and services.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label="Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0a12.64 12.64 0 00-.617-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057a19.9 19.9 0 005.993 3.03a.078.078 0 00.084-.028a14.09 14.09 0 001.226-1.994a.076.076 0 00-.041-.106a13.107 13.107 0 01-1.872-.892a.077.077 0 01-.008-.128a10.2 10.2 0 00.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127a12.299 12.299 0 01-1.873.892a.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028a19.839 19.839 0 006.002-3.03a.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/90 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/virtual-airlines" className="text-white/90 hover:text-white transition-colors">
                  Virtual Airlines
                </Link>
              </li>
              <li>
                <Link href="/bots" className="text-white/90 hover:text-white transition-colors">
                  Bots
                </Link>
              </li>
              <li>
                <Link href="/redeem" className="text-white/90 hover:text-white transition-colors">
                  Redeem
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-white/90 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-white/90 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/90 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/90 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/90 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/90">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Working Hours:<br />12:00 PM - 06:00 AM</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@sugarbunny.com" className="hover:text-white transition-colors">
                  support@sugarbunny.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/80 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Sugarbunny Stores. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/terms" className="text-white/80 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="text-white/80 hover:text-white transition-colors">
              Cookies
            </Link>
            <Link href="/admin/login" className="text-white/80 hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

