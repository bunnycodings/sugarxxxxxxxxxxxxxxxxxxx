'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUser, setIsUser] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const { theme, toggleTheme } = useTheme()
  const { getItemCount } = useCart()
  const pathname = usePathname()
  const cartCount = getItemCount()
  const adminCheckedRef = useRef(false)
  const prevPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // Check if admin is logged in
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          credentials: 'include'
        })
        if (!isMounted) return
        
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.authenticated === true)
          adminCheckedRef.current = true
        } else {
          setIsAdmin(false)
          adminCheckedRef.current = true
        }
      } catch (error) {
        if (!isMounted) return
        setIsAdmin(false)
        adminCheckedRef.current = true
      }
    }

    // Check if user is logged in
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
          cache: 'no-store'
        })
        if (!isMounted) return
        
        if (response.ok) {
          const data = await response.json()
          setIsUser(data.authenticated === true)
          setUserEmail(data.user?.email || '')
        } else {
          setIsUser(false)
          setUserEmail('')
        }
      } catch (error) {
        if (!isMounted) return
        // Silently handle errors - this is expected if user is not logged in
        setIsUser(false)
        setUserEmail('')
      }
    }

    // Check admin status only:
    // 1. On initial mount (first time)
    // 2. When navigating to/from admin routes
    const isAdminRoute = pathname?.startsWith('/admin')
    const wasAdminRoute = prevPathnameRef.current?.startsWith('/admin')
    const shouldCheckAdmin = !adminCheckedRef.current || isAdminRoute || wasAdminRoute

    if (shouldCheckAdmin) {
      checkAdminStatus()
    }

    // Always check user status on mount and pathname changes
    checkUserStatus()

    // Update refs
    prevPathnameRef.current = pathname || null

    // Only check user status periodically (admin check is expensive and not needed)
    // This helps detect if user logged out in another tab
    const interval = setInterval(() => {
      if (isMounted) {
        checkUserStatus()
      }
    }, 60000) // Check every 60 seconds

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [pathname]) // Re-run when pathname changes (e.g., after login/logout)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      setIsUser(false)
      setUserEmail('')
      window.location.href = '/'
    } catch (error) {
      // Silently handle logout errors
      setIsUser(false)
      setUserEmail('')
      window.location.href = '/'
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-pink-100 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-pink-600 to-blue-600 dark:from-pink-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
              SUGARBUNNYSTORE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
              Home
            </Link>
            <Link href="/virtual-airlines" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
              Virtual Airlines
            </Link>
            <Link href="/bots" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
              Bots
            </Link>
            <Link href="/website" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
              Website
            </Link>
            <Link href="/reviews" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium">
              Reviews
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </Link>
            )}
            {isUser ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium shadow-md"
                >
                  Register
                </Link>
              </>
            )}
            {/* Cart */}
            <Link
              href="/cart"
              className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium py-2">
                Home
              </Link>
              <Link href="/virtual-airlines" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium py-2">
                Virtual Airlines
              </Link>
              <Link href="/bots" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium py-2">
                Bots
              </Link>
              <Link href="/website" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium py-2">
                Website
              </Link>
              <Link href="/reviews" className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium py-2">
                Reviews
              </Link>
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {isAdmin && (
                  <Link 
                    href="/admin/dashboard" 
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium text-center flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                {isUser ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium text-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium text-center"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all font-medium text-center shadow-md"
                    >
                      Register
                    </Link>
                  </>
                )}
                <Link
                  href="/cart"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Night Mode
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Day Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

